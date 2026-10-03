/**
 * Recall campaigns core (roadmap: dormant-patient WhatsApp recall, $0/mo).
 *
 * FREE approach — no paid WhatsApp Business API:
 *   1. Build the dormant audience (patients whose LAST real visit with this
 *      doctor is older than N days) from Booking rows.
 *   2. Render one message per patient ({{patient_name}} / {{doctor_name}} /
 *      {{clinic_name}} placeholders).
 *   3. Freeze wa.me/<digits>?text=<urlencoded> deep links as
 *      RecallCampaignRecipient rows + create DB Notifications.
 *   4. Doctor/staff clicks "Open WhatsApp" per patient (or copies numbers /
 *      downloads CSV) and sends manually via WhatsApp Web.
 *
 * Plan gate (PRICING-STRATEGY §3.3 style): Free/Expired = max 1 SENT campaign
 * (the first one is the free taste of the growth engine); Trialing + Pro +
 * Hospital = unlimited. Audience preview is capped for Free (teaser — the
 * count is always visible, the list is not).
 */
import { db } from '@/lib/db'
import { getEffectivePlan, getHospitalIdForUser, buildUpgradeWall } from '@/lib/plans'
import { doctorDisplayName } from '@/lib/utils'

/** Booking statuses that represent a REAL completed/confirmed encounter. */
const VISIT_STATUSES = ['Approve', 'Visited', 'Finish', 'Completed'] as const

/** Free-plan SENT campaign allowance (lifetime). */
export const FREE_SENT_CAMPAIGN_LIMIT = 1

/** Template placeholders supported in campaign messages. */
export const TEMPLATE_PLACEHOLDERS = ['{{patient_name}}', '{{doctor_name}}', '{{clinic_name}}'] as const

/** Validation bounds (mirrored client-side). */
export const TEMPLATE_MIN = 10
export const TEMPLATE_MAX = 600
export const DORMANT_MIN = 7
export const DORMANT_MAX = 365

// ─── In-memory audience cache (60s TTL, per doctor+window) ─────────────────
interface CacheEntry {
  audience: DormantPatient[]
  withoutPhone: number
  expiresAt: number
}
const audienceCache = new Map<string, CacheEntry>()
const AUDIENCE_CACHE_TTL_MS = 60_000

export interface DormantPatient {
  patientId: string
  name: string
  phone: string
  lastVisit: string // ISO date of latest booking
  daysSince: number
  totalVisits: number
}

/**
 * Patients of this doctor whose LATEST real booking (Approve/Visited/Finish/
 * Completed) is older than `dormantDays`. Bookings without a linked patient
 * User are ignored (recall needs a phone + a Notification recipient).
 * Patients without a phone are counted (withoutPhone) but excluded from the
 * audience — wa.me needs digits.
 */
export async function getDormantAudience(
  doctorId: string,
  dormantDays: number
): Promise<{ audience: DormantPatient[]; withoutPhone: number; cached: boolean }> {
  const key = `${doctorId}:${dormantDays}`
  const hit = audienceCache.get(key)
  if (hit && hit.expiresAt > Date.now()) {
    return { audience: hit.audience, withoutPhone: hit.withoutPhone, cached: true }
  }

  const cutoff = new Date(Date.now() - dormantDays * 86_400_000)

  // Latest real visit per patient (max over ALL their bookings with this
  // doctor — a patient with ANY visit newer than the cutoff is NOT dormant).
  const [grouped, visitCounts] = await Promise.all([
    db.booking.groupBy({
      by: ['userId'],
      where: { doctorId, userId: { not: null }, status: { in: [...VISIT_STATUSES] } },
      _max: { bookingDate: true },
    }),
    db.booking.groupBy({
      by: ['userId'],
      where: { doctorId, userId: { not: null }, status: { in: [...VISIT_STATUSES] } },
      _count: { _all: true },
    }),
  ])

  const countMap = new Map(visitCounts.map((v) => [v.userId ?? '', v._count._all]))
  const dormantIds = grouped
    .filter((g) => g.userId && g._max.bookingDate && g._max.bookingDate < cutoff)
    .map((g) => g.userId as string)

  if (dormantIds.length === 0) {
    const entry: CacheEntry = { audience: [], withoutPhone: 0, expiresAt: Date.now() + AUDIENCE_CACHE_TTL_MS }
    audienceCache.set(key, entry)
    return { audience: [], withoutPhone: 0, cached: false }
  }

  const users = await db.user.findMany({
    where: { id: { in: dormantIds } },
    select: { id: true, name: true, mobileNo: true },
  })

  const lastVisitMap = new Map(grouped.map((g) => [g.userId ?? '', g._max.bookingDate as Date]))
  const now = Date.now()
  const withPhone: DormantPatient[] = []
  let withoutPhone = 0
  for (const u of users) {
    const digits = (u.mobileNo || '').replace(/\D/g, '')
    if (!digits) {
      withoutPhone += 1
      continue
    }
    const lastVisit = lastVisitMap.get(u.id)
    if (!lastVisit) continue
    withPhone.push({
      patientId: u.id,
      name: u.name,
      phone: u.mobileNo || digits,
      lastVisit: lastVisit.toISOString(),
      daysSince: Math.floor((now - lastVisit.getTime()) / 86_400_000),
      totalVisits: countMap.get(u.id) || 1,
    })
  }
  // Most-dormant first — the longest-lost patients are the recall priority.
  withPhone.sort((a, b) => b.daysSince - a.daysSince)

  const entry: CacheEntry = { audience: withPhone, withoutPhone, expiresAt: Date.now() + AUDIENCE_CACHE_TTL_MS }
  audienceCache.set(key, entry)
  return { audience: withPhone, withoutPhone, cached: false }
}

// ─── Doctor context (name + clinic for template rendering) ─────────────────
export interface DoctorRecallContext {
  doctorRowId: string
  doctorName: string // "Dr. X" form
  clinicName: string
}

export async function getDoctorRecallContext(userId: string): Promise<DoctorRecallContext | null> {
  const doctor = await db.doctor.findUnique({
    where: { userId },
    select: {
      id: true,
      address: true,
      city: true,
      hospitalAddress: true,
      hospitalId: true,
      user: { select: { name: true } },
    },
  })
  if (!doctor) return null

  // Clinic name: direct hospital link first, then an active DoctorHospital
  // link (multi-hospital doctors — same resolution order as the plan gate's
  // getHospitalIdForUser), then address/city fallbacks.
  let hospitalName = ''
  if (doctor.hospitalId) {
    const hospital = await db.hospital.findUnique({
      where: { id: doctor.hospitalId },
      select: { hospitalName: true },
    })
    hospitalName = hospital?.hospitalName || ''
  }
  if (!hospitalName) {
    const link = await db.doctorHospital.findFirst({
      where: { doctorId: doctor.id, isAvailable: true },
      orderBy: { createdAt: 'asc' },
      select: { hospital: { select: { hospitalName: true } } },
    })
    hospitalName = link?.hospital?.hospitalName || ''
  }
  const clinicName =
    hospitalName ||
    doctor.hospitalAddress?.trim() ||
    doctor.address?.trim() ||
    (doctor.city?.trim() ? `${doctor.city.trim()} clinic` : 'our clinic')

  return {
    doctorRowId: doctor.id,
    doctorName: doctorDisplayName(doctor.user?.name),
    clinicName,
  }
}

// ─── Template rendering + wa.me link building ──────────────────────────────
export function renderRecallTemplate(
  template: string,
  vars: { patientName: string; doctorName: string; clinicName: string }
): string {
  return template
    .replace(/\{\{\s*patient_name\s*\}\}/gi, vars.patientName)
    .replace(/\{\{\s*doctor_name\s*\}\}/gi, vars.doctorName)
    .replace(/\{\{\s*clinic_name\s*\}\}/gi, vars.clinicName)
}

/**
 * Normalize an Indian phone number to wa.me digits:
 * strip non-digits → 10 digits get the 91 prefix → anything else kept as-is
 * (11+ digit numbers with a leading 0 drop the trunk prefix).
 */
export function normalizeIndianPhone(raw: string): string {
  let digits = (raw || '').replace(/\D/g, '')
  if (digits.length === 10) digits = `91${digits}`
  if (digits.length === 11 && digits.startsWith('0')) digits = `91${digits.slice(1)}`
  return digits
}

/** wa.me deep link with the message pre-filled (URL-encoded). */
export function buildWhatsappUrl(rawPhone: string, message: string): string {
  const digits = normalizeIndianPhone(rawPhone)
  if (!digits) return ''
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

// ─── Plan gate ─────────────────────────────────────────────────────────────
export interface RecallPlanGate {
  planKey: 'free' | 'pro' | 'hospital'
  status: 'free' | 'active' | 'trialing' | 'expired'
  planName: string
  gated: boolean // true = Free/Expired limits apply
  sentCampaignCount: number
  canSend: boolean
  upgrade: ReturnType<typeof buildUpgradeWall> | null
}

/** Resolve the recall plan gate for a doctor's hospital (Free if none). */
export async function getRecallPlanGate(doctorUserId: string): Promise<RecallPlanGate> {
  const hospitalId = await getHospitalIdForUser({ id: doctorUserId, role: 'doctor' })
  const eff = hospitalId
    ? await getEffectivePlan(hospitalId)
    : {
        planKey: 'free' as const,
        plan: { name: 'Free', features: { recallCampaigns: false } },
        status: 'free' as const,
      }

  const doctor = await db.doctor.findUnique({
    where: { userId: doctorUserId },
    select: { id: true },
  })
  const sentCampaignCount = doctor
    ? await db.recallCampaign.count({ where: { doctorId: doctor.id, status: 'SENT' } })
    : 0

  // features.recallCampaigns is true for Pro/Hospital; trialing resolves to
  // Pro in getEffectivePlan. Free + Expired → gated.
  const gated = !(eff as { plan?: { features?: { recallCampaigns?: boolean } } }).plan?.features?.recallCampaigns
  const canSend = !gated || sentCampaignCount < FREE_SENT_CAMPAIGN_LIMIT

  return {
    planKey: eff.planKey,
    status: eff.status,
    planName: (eff as { plan?: { name?: string } }).plan?.name || 'Free',
    gated: !!gated,
    sentCampaignCount,
    canSend,
    upgrade:
      gated && !canSend
        ? buildUpgradeWall('recall_campaigns', sentCampaignCount, FREE_SENT_CAMPAIGN_LIMIT, 'free')
        : null,
  }
}
