/**
 * Dr. Copilot — SCOPED REPOSITORY (L2 of the isolation stack)
 *
 * The ONLY data layer the copilot agents are allowed to touch. Rules:
 *   1. READ-ONLY — no create/update/delete functions exist here.
 *   2. Every function takes `ctx: CopilotCtx` and filters by
 *      `doctorId: ctx.doctorId` — the doctor scope is COMPILED into the
 *      query, not bolted on by the caller. An agent physically cannot
 *      fetch another doctor's rows through this module.
 *   3. No free-form SQL / no raw Prisma client handoff to the LLM. The
 *      LLM only ever chooses WHICH of these functions to call and the
 *      plain arguments (a mobile number, a token, a limit).
 *
 * Patient identity lookups (by mobile) resolve a global User — that is not
 * a leak — but every subsequent booking/prescription query is scoped to
 * this doctor, so a patient this doctor never treated returns empty
 * ("not found"), exactly like the existing search-prescriptions API.
 */

import { db } from '@/lib/db'
import type { CopilotCtx } from './guard'
import { todayISTRange, istDateRange } from '@/lib/date-utils'

// ─── Queue / today ─────────────────────────────────────────────────────

export async function todayQueue(ctx: CopilotCtx) {
  const { start, end } = todayISTRange()
  const bookings = await db.booking.findMany({
    where: {
      doctorId: ctx.doctorId,
      bookingDate: { gte: start, lte: end },
      status: { notIn: ['Canceled'] },
    },
    select: {
      id: true,
      tokenNumber: true,
      appointmentNo: true,
      patientName: true,
      status: true,
      isEmergency: true,
      tokenOrder: true,
      disease: true,
      age: true,
      gender: true,
      bookingMode: true,
      bookingType: true,
    },
    orderBy: [{ tokenOrder: 'asc' }],
    take: 100,
  })
  return bookings
}

export async function todayStats(ctx: CopilotCtx) {
  const { start, end } = todayISTRange()
  const groupBy = await db.booking.groupBy({
    by: ['status'],
    where: {
      doctorId: ctx.doctorId,
      bookingDate: { gte: start, lte: end },
    },
    _count: { _all: true },
  })
  const counts: Record<string, number> = {}
  let total = 0
  for (const g of groupBy) {
    counts[g.status] = g._count._all
    total += g._count._all
  }
  return { total, counts }
}

// ─── Lookups by token / appointment no ─────────────────────────────────

export async function findBookingByToken(ctx: CopilotCtx, token: string) {
  const { start, end } = todayISTRange()
  return db.booking.findFirst({
    where: {
      doctorId: ctx.doctorId,
      tokenNumber: token.trim().toUpperCase(),
      bookingDate: { gte: start, lte: end },
    },
    select: bookingSelect,
  })
}

export async function findBookingByAppointmentNo(ctx: CopilotCtx, appointmentNo: string) {
  return db.booking.findFirst({
    where: {
      doctorId: ctx.doctorId,
      appointmentNo: { contains: appointmentNo.trim() },
    },
    select: bookingSelect,
    orderBy: { createdAt: 'desc' },
  })
}

const bookingSelect = {
  id: true,
  userId: true,
  appointmentNo: true,
  tokenNumber: true,
  patientName: true,
  disease: true,
  description: true,
  status: true,
  isEmergency: true,
  age: true,
  gender: true,
  bookingDate: true,
  bookingMode: true,
  bookingType: true,
  createdAt: true,
} as const

// ─── Patient search + history (mobile-first identity) ─────────────────

export interface PatientHistory {
  patient: { id: string; name: string; mobileNo: string; gender: string | null }
  /** Visits to THIS doctor only (isolation). */
  visits: {
    bookingId: string
    appointmentNo: string
    tokenNumber: string
    date: Date
    status: string
    disease: string
    age: number | null
    prescription: {
      id: string
      disease: string
      weight: string
      bp: string
      temperature: string
      description: string
      nextVisit: Date | null
      createdAt: Date
      medicines: { medicine: string; dose: string; morning: number; afternoon: number; evening: number; tab: number }[]
    } | null
  }[]
}

export async function patientHistoryByMobile(ctx: CopilotCtx, mobile: string): Promise<PatientHistory | null> {
  const m = mobile.replace(/\D/g, '')
  if (m.length < 4) return null
  const user = await db.user.findFirst({
    where: { mobileNo: { contains: m }, role: 'patient' },
    select: { id: true, name: true, mobileNo: true, gender: true },
  })
  if (!user) return null
  return patientHistoryForUser(ctx, user)
}

export async function patientHistoryByUserId(ctx: CopilotCtx, userId: string): Promise<PatientHistory | null> {
  const user = await db.user.findFirst({
    where: { id: userId, role: 'patient' },
    select: { id: true, name: true, mobileNo: true, gender: true },
  })
  if (!user) return null
  return patientHistoryForUser(ctx, user)
}

export async function patientHistoryByName(ctx: CopilotCtx, name: string): Promise<PatientHistory[]> {
  const users = await db.user.findMany({
    where: {
      role: 'patient',
      name: { contains: name.trim() },
      bookings: { some: { doctorId: ctx.doctorId } }, // only patients THIS doctor saw
    },
    select: { id: true, name: true, mobileNo: true, gender: true },
    take: 5,
  })
  const results: PatientHistory[] = []
  for (const u of users) {
    const h = await patientHistoryForUser(ctx, u)
    if (h) results.push(h)
  }
  return results
}

async function patientHistoryForUser(
  ctx: CopilotCtx,
  user: { id: string; name: string; mobileNo: string; gender: string | null }
): Promise<PatientHistory | null> {
  const bookings = await db.booking.findMany({
    where: { doctorId: ctx.doctorId, userId: user.id },
    select: {
      id: true,
      appointmentNo: true,
      tokenNumber: true,
      bookingDate: true,
      status: true,
      disease: true,
      age: true,
      prescriptions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          disease: true,
          weight: true,
          bp: true,
          temperature: true,
          description: true,
          nextVisit: true,
          createdAt: true,
          medicines: {
            select: { medicine: true, dose: true, morning: true, afternoon: true, evening: true, tab: true },
          },
        },
      },
    },
    orderBy: { bookingDate: 'desc' },
    take: 20,
  })
  if (bookings.length === 0) return null // never visited this doctor → not found
  return {
    patient: { id: user.id, name: user.name, mobileNo: user.mobileNo || '', gender: user.gender },
    visits: bookings.map((b) => ({
      bookingId: b.id,
      appointmentNo: b.appointmentNo,
      tokenNumber: b.tokenNumber,
      date: b.bookingDate,
      status: b.status,
      disease: b.disease,
      age: b.age,
      prescription: b.prescriptions[0] || null,
    })),
  }
}

// ─── Recent prescriptions / medicines ──────────────────────────────────

export async function recentPrescriptions(ctx: CopilotCtx, limit = 10) {
  return db.prescription.findMany({
    where: { doctorId: ctx.doctorId },
    select: {
      id: true,
      patientName: true,
      disease: true,
      description: true,
      createdAt: true,
      booking: { select: { appointmentNo: true, tokenNumber: true } },
      medicines: { select: { medicine: true, dose: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: Math.min(limit, 25),
  })
}

export async function topMedicines(ctx: CopilotCtx, limit = 10) {
  const rows = await db.pMedicine.findMany({
    where: { prescription: { doctorId: ctx.doctorId } },
    select: { medicine: true },
    take: 2000,
  })
  const counts = new Map<string, number>()
  for (const r of rows) {
    const key = r.medicine.trim()
    if (!key) continue
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([medicine, count]) => ({ medicine, count }))
}

// ─── Aggregates ────────────────────────────────────────────────────────

export async function rxCountRange(ctx: CopilotCtx, days: number) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const count = await db.prescription.count({
    where: { doctorId: ctx.doctorId, createdAt: { gte: since } },
  })
  return { days, count }
}

export async function earningsThisMonth(ctx: CopilotCtx) {
  const now = new Date()
  const istStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`
  const { start } = istDateRange(istStr)
  const agg = await db.booking.aggregate({
    where: {
      doctorId: ctx.doctorId,
      bookingDate: { gte: start },
      status: { in: ['Approve', 'Visited', 'Finish'] },
    },
    _sum: { appointmentCharge: true },
    _count: { _all: true },
  })
  return { monthStart: start, bookings: agg._count._all, revenue: agg._sum.appointmentCharge || 0 }
}

export async function diseaseSplitThisMonth(ctx: CopilotCtx) {
  const now = new Date()
  const istStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`
  const { start } = istDateRange(istStr)
  const rows = await db.booking.findMany({
    where: {
      doctorId: ctx.doctorId,
      bookingDate: { gte: start },
      status: { notIn: ['Canceled'] },
    },
    select: { disease: true },
    take: 2000,
  })
  const counts = new Map<string, number>()
  for (const r of rows) {
    const key = (r.disease || 'Not stated').trim() || 'Not stated'
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([disease, count]) => ({ disease, count }))
}

export async function upcomingFollowups(ctx: CopilotCtx, withinDays = 7) {
  const from = new Date()
  const to = new Date(Date.now() + withinDays * 24 * 60 * 60 * 1000)
  return db.prescription.findMany({
    where: {
      doctorId: ctx.doctorId,
      nextVisit: { gte: from, lte: to },
    },
    select: {
      id: true,
      patientName: true,
      disease: true,
      nextVisit: true,
      booking: { select: { appointmentNo: true } },
    },
    orderBy: { nextVisit: 'asc' },
    take: 25,
  })
}

// ─── Pre-visit brief (Phase D1) ────────────────────────────────────────

export interface WaitingBooking {
  id: string
  userId: string | null
  appointmentNo: string
  tokenNumber: string
  patientName: string
  disease: string
  description: string
  status: string
  isEmergency: boolean
  age: number | null
  gender: string | null
  bookingDate: Date
  createdAt: Date
  bookingMode: string
  bookingType: string
}

/** Next patient waiting in TODAY's queue (emergencies first, then token order). */
export async function nextWaitingBooking(ctx: CopilotCtx): Promise<WaitingBooking | null> {
  const { start, end } = todayISTRange()
  return db.booking.findFirst({
    where: {
      doctorId: ctx.doctorId,
      bookingDate: { gte: start, lte: end },
      status: { in: ['Pending', 'Approve'] },
    },
    select: {
      id: true, userId: true, appointmentNo: true, tokenNumber: true, patientName: true,
      disease: true, description: true, status: true, isEmergency: true, age: true,
      gender: true, bookingDate: true, createdAt: true, bookingMode: true, bookingType: true,
    },
    orderBy: [{ isEmergency: 'desc' }, { tokenOrder: 'asc' }],
  })
}

/** A specific today-booking by id (doctor-scoped) — for the brief API. */
export async function findBookingById(ctx: CopilotCtx, bookingId: string): Promise<WaitingBooking | null> {
  return db.booking.findFirst({
    where: { id: bookingId, doctorId: ctx.doctorId },
    select: {
      id: true, userId: true, appointmentNo: true, tokenNumber: true, patientName: true,
      disease: true, description: true, status: true, isEmergency: true, age: true,
      gender: true, bookingDate: true, createdAt: true, bookingMode: true, bookingType: true,
    },
  })
}

/** Visit/no-show stats for a patient WITH THIS DOCTOR (isolation). */
export async function patientVisitStats(ctx: CopilotCtx, userId: string) {
  const rows = await db.booking.findMany({
    where: { doctorId: ctx.doctorId, userId, status: { notIn: ['Canceled'] } },
    select: { bookingDate: true, status: true },
    orderBy: { bookingDate: 'desc' },
    take: 200,
  })
  return {
    totalVisits: rows.length,
    noShow: rows.filter((r) => r.status === 'NoShow').length,
    lastVisit: rows[0]?.bookingDate ?? null,
    firstVisit: rows.length ? rows[rows.length - 1].bookingDate : null,
  }
}

// ─── Analytics aggregates (Phase D2) ───────────────────────────────────

export interface MonthPoint {
  month: string // 'YYYY-MM'
  label: string // 'Aug'
  bookings: number
  finished: number
  noShow: number
  revenue: number
  rx: number
}

/** Last N months series — fetched in 2 queries, aggregated in code. */
export async function monthlySeries(ctx: CopilotCtx, months = 6): Promise<MonthPoint[]> {
  const now = new Date()
  const since = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1))

  const [bookings, prescriptions] = await Promise.all([
    db.booking.findMany({
      where: { doctorId: ctx.doctorId, bookingDate: { gte: since }, status: { notIn: ['Canceled'] } },
      select: { bookingDate: true, status: true, appointmentCharge: true },
      take: 5000,
    }),
    db.prescription.findMany({
      where: { doctorId: ctx.doctorId, createdAt: { gte: since } },
      select: { createdAt: true },
      take: 5000,
    }),
  ])

  const points: MonthPoint[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    const key = d.toISOString().slice(0, 7)
    const inMonth = (dt: Date) => dt.toISOString().slice(0, 7) === key
    const bs = bookings.filter((b) => inMonth(b.bookingDate))
    points.push({
      month: key,
      label: d.toLocaleString('en-IN', { month: 'short', timeZone: 'UTC' }),
      bookings: bs.length,
      finished: bs.filter((b) => b.status === 'Finish').length,
      noShow: bs.filter((b) => b.status === 'NoShow').length,
      revenue: bs
        .filter((b) => ['Approve', 'Visited', 'Finish'].includes(b.status))
        .reduce((s, b) => s + (b.appointmentCharge || 0), 0),
      rx: prescriptions.filter((p) => inMonth(p.createdAt)).length,
    })
  }
  return points
}

/** New (first-ever visit with this doctor) vs repeat patients in range. */
export async function newVsRepeatSplit(ctx: CopilotCtx, days = 90) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const [recent, allTime] = await Promise.all([
    db.booking.findMany({
      where: { doctorId: ctx.doctorId, bookingDate: { gte: since }, status: { notIn: ['Canceled'] } },
      select: { userId: true },
      take: 5000,
    }),
    db.booking.findMany({
      where: { doctorId: ctx.doctorId, status: { notIn: ['Canceled'] } },
      select: { userId: true, bookingDate: true },
      take: 10000,
    }),
  ])

  const firstVisit = new Map<string, Date>()
  for (const b of allTime) {
    if (!b.userId) continue
    const prev = firstVisit.get(b.userId)
    if (!prev || b.bookingDate < prev) firstVisit.set(b.userId, b.bookingDate)
  }
  let fresh = 0
  let repeat = 0
  const seen = new Set<string>()
  for (const b of recent) {
    if (!b.userId || seen.has(b.userId)) continue
    seen.add(b.userId)
    const first = firstVisit.get(b.userId)
    if (first && first >= since) fresh++
    else repeat++
  }
  return { days, fresh, repeat, total: fresh + repeat }
}

/** Busiest weekdays in range (Mon–Sun). */
export async function weekdayLoad(ctx: CopilotCtx, days = 90) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const rows = await db.booking.findMany({
    where: { doctorId: ctx.doctorId, bookingDate: { gte: since }, status: { notIn: ['Canceled'] } },
    select: { bookingDate: true },
    take: 5000,
  })
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const counts = new Array(7).fill(0)
  for (const r of rows) counts[r.bookingDate.getUTCDay()]++
  return names.map((label, i) => ({ label, count: counts[i] }))
}

// ─── RX pattern mining (Phase D3) ──────────────────────────────────────

export interface MedCombo {
  /** Medicine names, alphabetical, Title-ish case as written. */
  medicines: string[]
  count: number
  /** Most common diagnosis seen with this combo. */
  diagnosis: string
  lastUsed: Date
}

/** Recurring exact-set medicine combos across the doctor's own prescriptions. */
export async function medicineCombos(ctx: CopilotCtx, lookbackDays = 180, minCount = 2): Promise<MedCombo[]> {
  const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000)
  const rows = await db.prescription.findMany({
    where: { doctorId: ctx.doctorId, createdAt: { gte: since } },
    select: {
      disease: true,
      createdAt: true,
      medicines: { select: { medicine: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 500,
  })

  const combos = new Map<
    string,
    { medicines: string[]; count: number; diseases: Map<string, number>; lastUsed: Date }
  >()
  for (const r of rows) {
    const names = [...new Set(r.medicines.map((m) => m.medicine.trim()).filter(Boolean))].sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    )
    if (names.length < 2 || names.length > 6) continue // single-med "combos" are not patterns
    const key = names.map((n) => n.toLowerCase()).join('|')
    const entry = combos.get(key) || { medicines: names, count: 0, diseases: new Map<string, number>(), lastUsed: r.createdAt }
    entry.count++
    const dx = (r.disease || '').trim()
    if (dx) entry.diseases.set(dx, (entry.diseases.get(dx) || 0) + 1)
    if (r.createdAt > entry.lastUsed) entry.lastUsed = r.createdAt
    combos.set(key, entry)
  }

  return [...combos.values()]
    .filter((e) => e.count >= minCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((e) => ({
      medicines: e.medicines,
      count: e.count,
      diagnosis: [...e.diseases.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '',
      lastUsed: e.lastUsed,
    }))
}

/** The doctor's existing Rx templates (to avoid proposing duplicates). */
export async function existingTemplates(ctx: CopilotCtx) {
  const rows = await db.prescriptionTemplate.findMany({
    where: { doctorId: ctx.doctorId },
    select: { id: true, name: true, medicines: true },
    take: 200,
  })
  return rows.map((t) => {
    let meds: { name?: string }[] = []
    try {
      meds = JSON.parse(t.medicines || '[]')
    } catch {
      meds = []
    }
    return { id: t.id, name: t.name, medicineNames: meds.map((m) => (m?.name || '').toLowerCase()).filter(Boolean) }
  })
}

// ─── Chat history persistence (also doctor-scoped) ─────────────────────

export async function saveChatMessage(
  ctx: CopilotCtx,
  role: 'user' | 'assistant',
  content: string,
  agentName: string,
  metaJson: string
) {
  return db.copilotChat.create({
    data: {
      doctorId: ctx.doctorId,
      role,
      content,
      agentName,
      metaJson,
    },
  })
}

export async function chatHistory(ctx: CopilotCtx, limit = 40) {
  const rows = await db.copilotChat.findMany({
    where: { doctorId: ctx.doctorId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return rows.reverse()
}
