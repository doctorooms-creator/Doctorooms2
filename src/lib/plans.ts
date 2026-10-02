/**
 * Plan system core (docs/PRICING-STRATEGY.md §3).
 *
 * Free = clinic ops engine (registration play). Pro = growth + money features.
 * Limits layer only — NO architectural split (clinic = 1-doctor Hospital row).
 *
 * Resolution: Subscription row (hospitalId unique) is the source of truth for
 * the EFFECTIVE plan. Points redemptions (pro_month etc.) already write there;
 * Razorpay payments + founder pricing will reuse the same table.
 *
 * Walls (§3.3) are SOFT: friendly growth-celebration framing, HTTP 402 with a
 * structured `upgrade` payload the frontend renders in UpgradeWallDialog.
 */
import { db } from '@/lib/db'
import { getWalletSummary } from '@/lib/referral'

export type PlanKey = 'free' | 'pro' | 'hospital'

export interface PlanLimits {
  aiCredits: number
  whatsappReminders: number
  receptionistSeats: number
  nurseSeats: number
  doctorSeats: number
}

export interface PlanFeatures {
  recallCampaigns: boolean
  lostRevenueReport: boolean
  clinicPage: boolean
  opdBilling: boolean
  labReports: boolean
}

export interface PlanInfo {
  key: PlanKey
  name: string
  tagline: string
  priceMonthly: number
  priceAnnual: number
  founderAnnual: number | null
  effectiveMonthly: string // display string e.g. "₹833/mo effective"
  limits: PlanLimits
  features: PlanFeatures
}

export const PLANS: Record<PlanKey, PlanInfo> = {
  free: {
    key: 'free',
    name: 'Free',
    tagline: 'Apna clinic digital karo',
    priceMonthly: 0,
    priceAnnual: 0,
    founderAnnual: null,
    effectiveMonthly: '₹0 forever',
    limits: { aiCredits: 50, whatsappReminders: 20, receptionistSeats: 1, nurseSeats: 1, doctorSeats: 1 },
    features: { recallCampaigns: false, lostRevenueReport: false, clinicPage: false, opdBilling: false, labReports: false },
  },
  pro: {
    key: 'pro',
    name: 'Pro',
    tagline: 'Practice badhao, kamai badhao',
    priceMonthly: 999,
    priceAnnual: 9999, // ₹833/mo effective (2 months free)
    founderAnnual: 4999,
    effectiveMonthly: '₹833/mo effective',
    limits: { aiCredits: 500, whatsappReminders: 1000, receptionistSeats: 3, nurseSeats: 3, doctorSeats: 3 },
    features: { recallCampaigns: true, lostRevenueReport: true, clinicPage: true, opdBilling: true, labReports: true },
  },
  hospital: {
    key: 'hospital',
    name: 'Hospital Pro',
    tagline: 'Poora hospital, ek software',
    priceMonthly: 4999,
    priceAnnual: 59999,
    founderAnnual: null,
    effectiveMonthly: '₹4,999/mo effective',
    limits: { aiCredits: 2000, whatsappReminders: 5000, receptionistSeats: 15, nurseSeats: 15, doctorSeats: 10 },
    features: { recallCampaigns: true, lostRevenueReport: true, clinicPage: true, opdBilling: true, labReports: true },
  },
}

export const FOUNDER_SEATS_TOTAL = 1000

/** Monthly UTC bucket key, e.g. "2026-02". */
export function monthKey(d: Date = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export interface EffectivePlan {
  planKey: PlanKey
  plan: PlanInfo
  status: 'free' | 'active' | 'trialing' | 'expired'
  source: string
  currentPeriodEnd: Date | null
  trialEndsAt: Date | null
  daysLeft: number | null
}

/**
 * Resolve the hospital's effective plan from its Subscription row.
 * - active + planKey != free + period end in future (or null) → that plan
 * - trialing + trialEndsAt in future → Pro (14/30-day full trial = full Pro)
 * - anything else (expired / no row / free) → Free (data NEVER deleted)
 */
export async function getEffectivePlan(hospitalId: string): Promise<EffectivePlan> {
  const sub = await db.subscription.findUnique({ where: { hospitalId } })
  const now = new Date()

  if (!sub) {
    return { planKey: 'free', plan: PLANS.free, status: 'free', source: 'default', currentPeriodEnd: null, trialEndsAt: null, daysLeft: null }
  }

  if (sub.status === 'trialing' && sub.trialEndsAt && sub.trialEndsAt > now) {
    const daysLeft = Math.max(0, Math.ceil((sub.trialEndsAt.getTime() - now.getTime()) / 86400000))
    return { planKey: 'pro', plan: PLANS.pro, status: 'trialing', source: sub.source, currentPeriodEnd: sub.currentPeriodEnd, trialEndsAt: sub.trialEndsAt, daysLeft }
  }

  if (sub.status === 'active' && sub.planKey !== 'free' && (!sub.currentPeriodEnd || sub.currentPeriodEnd > now)) {
    const daysLeft = sub.currentPeriodEnd
      ? Math.max(0, Math.ceil((sub.currentPeriodEnd.getTime() - now.getTime()) / 86400000))
      : null
    return { planKey: sub.planKey as PlanKey, plan: PLANS[sub.planKey as PlanKey] ?? PLANS.free, status: 'active', source: sub.source, currentPeriodEnd: sub.currentPeriodEnd, trialEndsAt: sub.trialEndsAt, daysLeft }
  }

  return { planKey: 'free', plan: PLANS.free, status: 'expired', source: sub.source, currentPeriodEnd: sub.currentPeriodEnd, trialEndsAt: sub.trialEndsAt, daysLeft: 0 }
}

/**
 * Resolve the hospital a user belongs to (plan limits are per-hospital).
 * doctor → Doctor.hospitalId, fallback first active DoctorHospital link.
 * hospital → Hospital.userId.
 */
export async function getHospitalIdForUser(user: { id: string; role: string }): Promise<string | null> {
  if (user.role === 'doctor') {
    const doctor = await db.doctor.findFirst({
      where: { userId: user.id },
      select: { id: true, hospitalId: true },
    })
    if (doctor?.hospitalId) return doctor.hospitalId
    if (doctor) {
      const link = await db.doctorHospital.findFirst({
        where: { doctorId: doctor.id, isAvailable: true },
        orderBy: { createdAt: 'asc' },
        select: { hospitalId: true },
      })
      return link?.hospitalId ?? null
    }
    return null
  }
  if (user.role === 'hospital') {
    const hospital = await db.hospital.findUnique({ where: { userId: user.id }, select: { id: true } })
    return hospital?.id ?? null
  }
  return null
}

export interface PlanUsageSummary {
  ai: { used: number; limit: number }
  whatsapp: { used: number; limit: number }
  receptionistSeats: { used: number; limit: number }
  nurseSeats: { used: number; limit: number }
  doctorSeats: { used: number; limit: number }
}

/** Live usage snapshot: monthly meters + staff seat counts. */
export async function getPlanUsage(hospitalId: string, eff: EffectivePlan): Promise<PlanUsageSummary> {
  const mk = monthKey()
  const [meters, receptionists, nurses, doctorLinks, directDoctors] = await Promise.all([
    db.planUsage.findMany({ where: { hospitalId, monthKey: mk }, select: { metric: true, count: true } }),
    db.receptionist.count({ where: { hospitalId } }),
    db.staffNurse.count({ where: { hospitalId } }),
    db.doctorHospital.count({ where: { hospitalId } }),
    db.doctor.count({ where: { hospitalId } }),
  ])
  const aiUsed = meters.find((m) => m.metric === 'ai')?.count ?? 0
  const waUsed = meters.find((m) => m.metric === 'whatsapp')?.count ?? 0
  // Doctor seats: direct Doctor.hospitalId + DoctorHospital links (a doctor can
  // appear in both — count the union via max of (direct, links) to stay simple.
  const doctorSeats = Math.max(directDoctors, doctorLinks)
  return {
    ai: { used: aiUsed, limit: eff.plan.limits.aiCredits },
    whatsapp: { used: waUsed, limit: eff.plan.limits.whatsappReminders },
    receptionistSeats: { used: receptionists, limit: eff.plan.limits.receptionistSeats },
    nurseSeats: { used: nurses, limit: eff.plan.limits.nurseSeats },
    doctorSeats: { used: doctorSeats, limit: eff.plan.limits.doctorSeats },
  }
}

export type WallReason = 'ai' | 'whatsapp' | 'receptionist_seats' | 'nurse_seats' | 'doctor_seats' | 'lost_revenue'

export interface UpgradeWall {
  reason: WallReason
  used: number
  limit: number
  planKey: PlanKey
  planName: string
  message: string
}

const WALL_MESSAGES: Record<WallReason, string> = {
  ai: 'Aap Dr. Copilot ke regular user ban gaye 🎉 — Free plan ke 50 monthly credits khatam. Pro mein 500 credits/mo milte hain.',
  whatsapp: 'Is mahine ke 20 reminders bhej diye ✅ — Pro mein 1,000 auto-reminders/mo milte hain (no-show recovery engine).',
  receptionist_seats: 'Clinic badh rahi hai! 🎉 Free mein 1 receptionist seat hai — Pro mein 3 receptionist + 3 nurse seats milte hain.',
  nurse_seats: 'Clinic badh rahi hai! 🎉 Free mein 1 nurse seat hai — Pro mein 3+3 staff accounts milte hain.',
  doctor_seats: 'Practice badh rahi hai! 🎉 Free plan 1 doctor ke liye hai — Pro mein 3 doctor seats milte hain.',
  lost_revenue: 'No-shows aapka paisa le ja rahe hain. Pro ka full Lost Revenue report dates, slots aur recoverable ₹ dikhata hai — auto-reminders se 80% wapas mil sakte hain.',
}

export function buildUpgradeWall(reason: WallReason, used: number, limit: number, planKey: PlanKey): UpgradeWall {
  return {
    reason,
    used,
    limit,
    planKey,
    planName: PLANS[planKey].name,
    message: WALL_MESSAGES[reason],
  }
}

/**
 * Atomic metering + limit check for monthly metrics (ai | whatsapp).
 * Increments ONLY when under the limit; returns the wall payload otherwise.
 */
export async function checkAndIncrementMetric(
  hospitalId: string,
  metric: 'ai' | 'whatsapp'
): Promise<{ blocked: boolean; wall: UpgradeWall | null; used: number; limit: number }> {
  const eff = await getEffectivePlan(hospitalId)
  const limit = metric === 'ai' ? eff.plan.limits.aiCredits : eff.plan.limits.whatsappReminders
  const mk = monthKey()

  const result = await db.$transaction(async (tx) => {
    const existing = await tx.planUsage.findUnique({
      where: { hospitalId_metric_monthKey: { hospitalId, metric, monthKey: mk } },
    })
    const used = existing?.count ?? 0
    if (used >= limit) {
      return { blocked: true as const, used }
    }
    const row = await tx.planUsage.upsert({
      where: { hospitalId_metric_monthKey: { hospitalId, metric, monthKey: mk } },
      create: { hospitalId, metric, monthKey: mk, count: 1 },
      update: { count: { increment: 1 } },
    })
    return { blocked: false as const, used: row.count }
  })

  if (result.blocked) {
    return { blocked: true, wall: buildUpgradeWall(metric, result.used, limit, eff.planKey), used: result.used, limit }
  }
  return { blocked: false, wall: null, used: result.used, limit }
}

/**
 * Seat wall for staff creation (receptionist | nurse | doctor roles).
 * Count-based (no metering): blocks the CREATE when already at plan limit.
 */
export async function checkSeatWall(
  hospitalId: string,
  seat: 'receptionist_seats' | 'nurse_seats' | 'doctor_seats'
): Promise<{ blocked: boolean; wall: UpgradeWall | null; used: number; limit: number }> {
  const eff = await getEffectivePlan(hospitalId)
  const limit =
    seat === 'receptionist_seats'
      ? eff.plan.limits.receptionistSeats
      : seat === 'nurse_seats'
        ? eff.plan.limits.nurseSeats
        : eff.plan.limits.doctorSeats

  let used: number
  if (seat === 'receptionist_seats') {
    used = await db.receptionist.count({ where: { hospitalId } })
  } else if (seat === 'nurse_seats') {
    used = await db.staffNurse.count({ where: { hospitalId } })
  } else {
    const [links, direct] = await Promise.all([
      db.doctorHospital.count({ where: { hospitalId } }),
      db.doctor.count({ where: { hospitalId } }),
    ])
    used = Math.max(links, direct)
  }

  if (used >= limit) {
    // Grandfather rule: hospitals already OVER the limit (legacy/demo data,
    // or trial-expired with more staff) are never hard-blocked — the plan
    // promise is "data never deleted, never hard-block mid-work". The wall
    // fires only when a hospital AT the limit tries to cross it.
    if (used > limit) {
      return { blocked: false, wall: null, used, limit }
    }
    return { blocked: true, wall: buildUpgradeWall(seat, used, limit, eff.planKey), used, limit }
  }
  return { blocked: false, wall: null, used, limit }
}

/** Founder pricing scarcity: honest, verifiable seat counter. */
export async function getFounderSeats(): Promise<{ taken: number; total: number; left: number }> {
  const taken = await db.subscription.count({ where: { source: 'founder' } })
  return { taken, total: FOUNDER_SEATS_TOTAL, left: FOUNDER_SEATS_TOTAL - taken }
}

/** Full billing-page payload: plan + usage + wallet + founder seats. */
export async function getPlanOverview(user: { id: string; role: string }) {
  const hospitalId = await getHospitalIdForUser(user)
  if (!hospitalId) return null

  const eff = await getEffectivePlan(hospitalId)
  const [usage, founder, wallet] = await Promise.all([
    getPlanUsage(hospitalId, eff),
    getFounderSeats(),
    user.role === 'doctor' ? getWalletSummary(user.id) : null,
  ])

  return {
    hospitalId,
    plan: {
      key: eff.planKey,
      name: eff.plan.name,
      tagline: eff.plan.tagline,
      status: eff.status,
      source: eff.source,
      currentPeriodEnd: eff.currentPeriodEnd?.toISOString() ?? null,
      trialEndsAt: eff.trialEndsAt?.toISOString() ?? null,
      daysLeft: eff.daysLeft,
      effectiveMonthly: eff.plan.effectiveMonthly,
      priceMonthly: eff.plan.priceMonthly,
      priceAnnual: eff.plan.priceAnnual,
      founderAnnual: eff.plan.founderAnnual,
      features: eff.plan.features,
    },
    usage: {
      ai: usage.ai,
      whatsapp: usage.whatsapp,
      receptionistSeats: usage.receptionistSeats,
      nurseSeats: usage.nurseSeats,
      doctorSeats: usage.doctorSeats,
    },
    founderSeats: founder,
    wallet: wallet
      ? { total: wallet.total, spendable: wallet.spendable, pending: wallet.pending }
      : null,
  }
}
