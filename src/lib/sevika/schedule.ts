/**
 * Sevika — AI Nurse: deterministic schedule engine (AI-NURSE-PLAN.md §2.2).
 *
 * Server-only. Generates dose instances from a medicine schedule and computes
 * adherence stats. Pure code — no AI in here by design (safety rail: the
 * nurse's clock is quartz, not a language model).
 */

import { db } from '@/lib/db'
import { nowIST, todayISTRange } from '@/lib/date-utils'
import { quickTone, reminderTitle, reminderMessage, missedMessage, type NudgeTone } from '@/lib/sevika/nudge'

// ─── Slot times ────────────────────────────────────────────────────────────

export interface SevikaSlotTimes {
  morning: string // "08:00"
  afternoon: string // "14:00"
  evening: string // "21:00"
}

export const DEFAULT_SLOT_TIMES: SevikaSlotTimes = {
  morning: '08:00',
  afternoon: '14:00',
  evening: '21:00',
}

export const SLOT_LABELS: Record<string, { en: string; hi: string; icon: string }> = {
  morning: { en: 'Morning', hi: 'सुबह', icon: '🌅' },
  afternoon: { en: 'Afternoon', hi: 'दोपहर', icon: '☀️' },
  evening: { en: 'Night', hi: 'रात', icon: '🌙' },
}

/** Reads the patient's personalised slot times from User.settingsJson.sevika. */
export async function getSlotTimes(userId: string): Promise<SevikaSlotTimes> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { settingsJson: true },
    })
    const parsed = JSON.parse(user?.settingsJson || '{}') as {
      sevika?: Partial<SevikaSlotTimes>
    }
    return { ...DEFAULT_SLOT_TIMES, ...(parsed.sevika || {}) }
  } catch {
    return { ...DEFAULT_SLOT_TIMES }
  }
}

/** Persist slot times into User.settingsJson.sevika (merge-safe). */
export async function saveSlotTimes(
  userId: string,
  times: Partial<SevikaSlotTimes>
): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { settingsJson: true },
  })
  const parsed = JSON.parse(user?.settingsJson || '{}') as Record<string, unknown>
  parsed.sevika = { ...DEFAULT_SLOT_TIMES, ...(parsed.sevika as object | undefined), ...times }
  await db.user.update({
    where: { id: userId },
    data: { settingsJson: JSON.stringify(parsed) },
  })
}

// ─── Dose generation ───────────────────────────────────────────────────────

export interface ScheduleInput {
  userId: string
  medicineName: string
  dose?: string
  instructions?: string
  morning: number
  afternoon: number
  evening: number
  durationDays: number
  startDate?: Date
  source?: string
  prescriptionId?: string | null
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000 // +5:30

function slotDateTime(dayIST: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(':').map((v) => parseInt(v, 10) || 0)
  // Build IST wall-clock as UTC instant: (IST parts) − 5:30
  return new Date(
    Date.UTC(dayIST.getUTCFullYear(), dayIST.getUTCMonth(), dayIST.getUTCDate(), h, m, 0, 0) -
      IST_OFFSET_MS
  )
}

/**
 * Creates the schedule row and pre-generates EVERY dose instance for it
 * (AI-NURSE-PLAN.md: the ticker only ever READS rows — generation happens
 * once, up front). Cap: 90 days per schedule (long courses can be renewed).
 */
export async function generateDoses(input: ScheduleInput): Promise<{ scheduleId: string; doses: number }> {
  const slotTimes = await getSlotTimes(input.userId)
  const duration = Math.min(Math.max(input.durationDays, 1), 90)
  const start =
    input.startDate && input.startDate.getTime() > Date.now() - 24 * 60 * 60 * 1000
      ? new Date(input.startDate)
      : nowIST()

  const slots: Array<{ slot: string; time: string }> = [
    { slot: 'morning', time: slotTimes.morning },
    { slot: 'afternoon', time: slotTimes.afternoon },
    { slot: 'evening', time: slotTimes.evening },
  ].filter((s, i) => [input.morning, input.afternoon, input.evening][i] === 1)

  if (slots.length === 0) return { scheduleId: '', doses: 0 }

  const schedule = await db.sevikaSchedule.create({
    data: {
      userId: input.userId,
      medicineName: input.medicineName.trim(),
      dose: input.dose?.trim() || '',
      instructions: input.instructions?.trim() || '',
      morning: input.morning,
      afternoon: input.afternoon,
      evening: input.evening,
      durationDays: duration,
      startDate: start,
      source: input.source || 'Manual',
      prescriptionId: input.prescriptionId || null,
    },
  })

  const rows: Array<{
    scheduleId: string
    userId: string
    slot: string
    dueAt: Date
    windowMinutes: number
  }> = []

  for (let day = 0; day < duration; day++) {
    const dayIST = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + day)
    )
    for (const s of slots) {
      const dueAt = slotDateTime(dayIST, s.time)
      // Skip slots already well in the past on day 0 (no retro reminders)
      if (dueAt.getTime() < Date.now() - 5 * 60 * 1000) continue
      rows.push({
        scheduleId: schedule.id,
        userId: input.userId,
        slot: s.slot,
        dueAt,
        windowMinutes: 45,
      })
    }
  }

  if (rows.length > 0) {
    await db.sevikaDose.createMany({ data: rows })
  }
  return { scheduleId: schedule.id, doses: rows.length }
}

// ─── Adherence stats ───────────────────────────────────────────────────────

export interface AdherenceStats {
  todayTotal: number
  todayTaken: number
  todayPending: number
  todayMissed: number
  weekTotal: number
  weekTaken: number
  streakDays: number // consecutive days with ≥1 taken and 0 missed/skipped
  scorePct: number // last 7 days adherence %
}

export async function computeAdherence(userId: string): Promise<AdherenceStats> {
  const { start, end } = todayISTRange()
  const weekStart = new Date(start.getTime() - 6 * 24 * 60 * 60 * 1000)

  const [todayDoses, weekDoses] = await Promise.all([
    db.sevikaDose.findMany({
      where: { userId, dueAt: { gte: start, lte: end }, status: { not: 'Snoozed' } },
      select: { status: true },
    }),
    db.sevikaDose.findMany({
      where: {
        userId,
        dueAt: { gte: weekStart, lte: end },
        status: { in: ['Taken', 'Skipped', 'Missed'] },
      },
      select: { status: true },
    }),
  ])

  const todayTaken = todayDoses.filter((d) => d.status === 'Taken').length
  const todayMissed = todayDoses.filter((d) => d.status === 'Missed').length
  const weekTaken = weekDoses.filter((d) => d.status === 'Taken').length
  const weekTotal = weekDoses.length
  const scorePct = weekTotal === 0 ? 100 : Math.round((weekTaken / weekTotal) * 100)

  // Streak: walk back day-by-day (max 30); a day counts only if ≥1 Taken AND 0 Missed/Skipped.
  let streakDays = 0
  for (let day = 0; day < 30; day++) {
    const dayStart = new Date(start.getTime() - day * 24 * 60 * 60 * 1000)
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1)
    const dayDoses = await db.sevikaDose.findMany({
      where: {
        userId,
        dueAt: { gte: dayStart, lte: dayEnd },
        status: { in: ['Taken', 'Missed', 'Skipped'] },
      },
      select: { status: true },
    })
    if (dayDoses.length === 0) break // no data for this day — stop
    const hasTaken = dayDoses.some((d) => d.status === 'Taken')
    const hasMissed = dayDoses.some((d) => d.status !== 'Taken')
    if (hasTaken && !hasMissed) streakDays++
    else break
  }

  return {
    todayTotal: todayDoses.length,
    todayTaken,
    todayPending: todayDoses.filter(
      (d) => d.status === 'Pending' || d.status === 'Reminded'
    ).length,
    todayMissed,
    weekTotal,
    weekTaken,
    streakDays,
    scorePct,
  }
}

// ─── Ticker (called by /api/cron/sevika-tick every ~5 min) ────────────────

/**
 * P3 (adaptive): next future occurrence of an "HH:mm" IST wall-clock time —
 * today if that time is still ahead, else tomorrow. Used by the reschedule
 * action to shift a dose to the patient's personalised slot time.
 */
export function nextOccurrence(hhmm: string, from: Date = nowIST()): Date {
  const [h, m] = hhmm.split(':').map((v) => parseInt(v, 10) || 0)
  const day = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()))
  let target = slotDateTime(day, `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  if (target.getTime() <= from.getTime()) {
    const tomorrow = new Date(day.getTime() + 24 * 60 * 60 * 1000)
    target = slotDateTime(tomorrow, `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }
  return target
}

export interface TickResult {
  reminded: number
  missed: number
  completedSchedules: number
}

export interface NotifyPayload {
  userId: string
  event: 'med-reminder' | 'dose-missed'
  title: string
  message: string
  doseId: string
}
export type NotifyFn = (p: NotifyPayload) => Promise<void>

/**
 * The nurse's heartbeat — deterministic, idempotent:
 *  1. due doses (Pending, dueAt ≤ now, within last 15 min) → notify + Reminded
 *  2. overdue doses past their grace window → one gentle follow-up + Missed
 *  3. schedules with no unfinished doses left → status Completed
 *
 * P3: reminder/missed messages are tone-adaptive (celebrate / gentle / warm)
 * via the deterministic nudge engine — one extra lookup per DISTINCT patient
 * per tick (memoised in a local Map).
 */
export async function runSevikaTick(notify: NotifyFn): Promise<TickResult> {
  const now = new Date()
  const result: TickResult = { reminded: 0, missed: 0, completedSchedules: 0 }
  const toneCache = new Map<string, NudgeTone>()
  const toneFor = async (userId: string): Promise<NudgeTone> => {
    let tone = toneCache.get(userId)
    if (!tone) {
      tone = await quickTone(userId)
      toneCache.set(userId, tone)
    }
    return tone
  }

  // 1) FIRE reminders: due within the last 15 minutes, still Pending
  const dueDoses = await db.sevikaDose.findMany({
    where: {
      status: 'Pending',
      dueAt: { lte: now, gte: new Date(now.getTime() - 15 * 60 * 1000) },
    },
    include: { schedule: true },
    take: 200,
  })
  for (const dose of dueDoses) {
    const tone = await toneFor(dose.userId)
    await db.sevikaDose.update({
      where: { id: dose.id },
      data: { status: 'Reminded', remindedAt: now },
    })
    const med = {
      medicine: dose.schedule.medicineName,
      dose: dose.schedule.dose,
      instructions: dose.schedule.instructions,
      slotHi: SLOT_LABELS[dose.slot]?.hi || dose.slot,
    }
    await notify({
      userId: dose.userId,
      event: 'med-reminder',
      title: reminderTitle(tone, med),
      message: reminderMessage(tone, med),
      doseId: dose.id,
    })
    result.reminded++
  }

  // 2) MISS follow-up: Reminded doses past their grace window.
  //    Only ONE follow-up per dose — spam cap from the safety rails.
  const overdue = await db.sevikaDose.findMany({
    where: {
      status: 'Reminded',
      dueAt: { lt: new Date(now.getTime() - 50 * 60 * 1000) }, // dueAt + ~45min window
    },
    include: { schedule: true },
    take: 200,
  })
  for (const dose of overdue) {
    const tone = await toneFor(dose.userId)
    await db.sevikaDose.update({
      where: { id: dose.id },
      data: { status: 'Missed', actionAt: now },
    })
    await notify({
      userId: dose.userId,
      event: 'dose-missed',
      title: `😔 ${dose.schedule.medicineName} miss ho gayi`,
      message: missedMessage(tone, dose.schedule.medicineName),
      doseId: dose.id,
    })
    result.missed++
  }

  // 3) COMPLETE schedules with no unfinished doses left
  const activeSchedules = await db.sevikaSchedule.findMany({
    where: { status: 'Active' },
    select: { id: true },
    take: 500,
  })
  for (const s of activeSchedules) {
    const unfinished = await db.sevikaDose.count({
      where: { scheduleId: s.id, status: { in: ['Pending', 'Reminded', 'Snoozed'] } },
    })
    if (unfinished === 0) {
      await db.sevikaSchedule.update({ where: { id: s.id }, data: { status: 'Completed' } })
      result.completedSchedules++
    }
  }

  return result
}
