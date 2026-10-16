/**
 * Aturseva — Phase 4 SCHEDULED proactivity (diet nudges + weekly report).
 *
 * Called from /api/cron/sevika-tick (the realtime-service heartbeat fires it
 * every ~5 minutes). Deterministic, DB-idempotent:
 *
 *   1. DIET NUDGES — IST meal windows (breakfast 08:00–10:00, lunch
 *      12:30–14:30, evening 17:00–18:30, dinner 19:00–21:00). For every
 *      patient with a diet plan: ONE nudge per meal per day. Idempotency =
 *      an existing `diet_nudge` action row for (user, day, meal) blocks a
 *      re-push — a window is 2h wide and the tick runs every 5 min, so the
 *      DB check is the real guard (the 90s in-memory dedup can't cover it).
 *
 *   2. WEEKLY REPORT — Sunday evening (IST ≥ 18:00), once per ISO week, to
 *      every patient who has USED Aturseva (conversation exists) and has any
 *      activity this week (check-in / dose / booking). Same card shape as the
 *      get_my_weekly_report tool (shared builder).
 *
 * Safety rails: never throws (a failed tick logs and dies silently); pushes
 * are additive thread rows riding the pushAtursevaMessage rail (toast +
 * unread badge + live refresh); NO writes to business data.
 */

import { db } from '@/lib/db'
import { pushAtursevaMessage } from './proactive'
import { buildWeeklyReportCard } from './tools'

// ─── IST clock helpers ──────────────────────────────────────────────────────

interface IstClock {
  weekday: string
  hour: number
  minute: number
  minutesOfDay: number
  /** The instant this clock reading came from (injected for tests). */
  at: Date
}

function istNow(from: Date = new Date()): IstClock {
  // TWO separate locale calls — a combined toLocaleString("Sunday, 19:00")
  // is locale/runtime dependent (Bun emits "Sunday 19:00" with NO comma),
  // which broke weekday parsing. Keep each part unambiguous.
  const weekday = from.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', weekday: 'long' })
  const time = from.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const nums = time.match(/(\d{1,2}):(\d{2})/)
  const hour = nums ? parseInt(nums[1], 10) % 24 : 0 // %24 → guards "24:00" midnight edge
  const minute = nums ? parseInt(nums[2], 10) : 0
  return { weekday, hour, minute, minutesOfDay: hour * 60 + minute, at: from }
}

/** UTC instant of the IST midnight of the day `clock` reads. */
function istMidnightUtc(clock: IstClock): Date {
  const dayIST = clock.at.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) // YYYY-MM-DD
  return new Date(Date.parse(`${dayIST}T00:00:00+05:30`))
}

// ─── Meal windows (IST) ─────────────────────────────────────────────────────

interface MealWindow {
  meal: 'breakfast' | 'lunch' | 'evening' | 'dinner'
  label: string
  icon: string
  startMin: number
  endMin: number // inclusive end (minutes of day)
  text: (items: string) => string
}

const MEAL_WINDOWS: MealWindow[] = [
  {
    meal: 'breakfast',
    label: 'Nashta',
    icon: '🌅',
    startMin: 8 * 60,
    endMin: 9 * 60 + 59,
    text: (items) => `🌅 Nashte ka waqt ho gaya — aaj ka plan: ${items}. Halka nashta kar lijiye, dawai ke saath achha rehta hai 🙂`,
  },
  {
    meal: 'lunch',
    label: 'Lunch',
    icon: '🍛',
    startMin: 12 * 60 + 30,
    endMin: 14 * 60 + 29,
    text: (items) => `🍛 Lunch time — aaj ka plan: ${items}. Araam se khayein aur thoda walk karein 🙂`,
  },
  {
    meal: 'evening',
    label: 'Shaam snack',
    icon: '🍎',
    startMin: 17 * 60,
    endMin: 18 * 60 + 29,
    text: (items) => `🍎 Shaam ka halka snack: ${items}. Chai ke saath bhooch na ho to ye achha option hai 🙂`,
  },
  {
    meal: 'dinner',
    label: 'Dinner',
    icon: '🌙',
    startMin: 19 * 60,
    endMin: 20 * 60 + 59,
    text: (items) => `🌙 Dinner ka waqt — aaj: ${items}. 8 baje se pehle kha lijiye to behtar neend aati hai 🙂`,
  },
]

/** Diet-plan day meal keys mapped to nudge meals. days[] is Mon→Sun order. */
const DAY_KEYS: Record<string, string> = {
  breakfast: 'breakfast',
  lunch: 'lunch',
  evening: 'evening',
  dinner: 'dinner',
}

async function findActiveMealWindow(clock: IstClock): Promise<MealWindow | null> {
  return MEAL_WINDOWS.find((w) => clock.minutesOfDay >= w.startMin && clock.minutesOfDay <= w.endMin) || null
}

/** Latest diet plan per user (plan rows are append-only; latest wins). */
async function latestDietPlansPerUser(): Promise<
  Array<{ userId: string; planJson: string }>
> {
  const rows = await db.sevikaDietPlan.findMany({
    orderBy: { createdAt: 'asc' },
    select: { userId: true, planJson: true },
    take: 500,
  })
  const byUser = new Map<string, { userId: string; planJson: string }>()
  for (const r of rows) byUser.set(r.userId, r) // ascending order → last write wins
  return [...byUser.values()]
}

/** Has this (user, day, meal) nudge already been pushed? */
async function dietNudgeExists(
  userId: string,
  day: string,
  meal: string,
  sinceUtc: Date
): Promise<boolean> {
  const rows = await db.atursevaMessage.findMany({
    where: {
      actionType: 'diet_nudge',
      createdAt: { gte: sinceUtc },
      conversation: { userId },
    },
    select: { actionJson: true },
    take: 10,
  })
  return rows.some((r) => {
    try {
      const data = JSON.parse(r.actionJson || '{}')?.data as { day?: string; meal?: string } | undefined
      return data?.day === day && data?.meal === meal
    } catch {
      return false
    }
  })
}

async function pushDietNudges(clock: IstClock): Promise<number> {
  const window = await findActiveMealWindow(clock)
  if (!window) return 0

  const day = clock.at.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  const plans = await latestDietPlansPerUser()
  let result = 0

  for (const { userId, planJson } of plans) {
    try {
      if (await dietNudgeExists(userId, day, window.meal, istMidnightUtc(clock))) continue

      // Pick today's meals from the Mon→Sun days array
      const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(clock.weekday)
      const plan = JSON.parse(planJson) as { days?: Array<Record<string, string>> }
      const meals = Array.isArray(plan.days)
        ? plan.days[Math.max(0, Math.min(dayIndex, plan.days.length - 1))] || {}
        : {}
      const key = DAY_KEYS[window.meal]
      const items = String(meals[key] || '').trim()
      if (!items) continue // plan has no line for this meal — nothing to say

      const pushed = await pushAtursevaMessage({
        userId,
        kind: 'diet-nudge',
        refId: `${day}:${window.meal}`,
        text: window.text(items),
        card: {
          type: 'diet_nudge',
          title: `${window.icon} Aaj ka ${window.label.toLowerCase()}`,
          data: { day, meal: window.meal, label: window.label, icon: window.icon, items },
        },
        toastMessage: `${window.icon} ${window.label} ka waqt — diet plan dekhein`,
      })
      if (pushed) result++
    } catch (err) {
      console.error(`[aturseva/scheduler] diet nudge failed for user:`, err)
    }
  }
  return result
}

// ─── Weekly report (Sunday evening IST) ─────────────────────────────────────

/** Monday of the IST week `clock` reads, as "YYYY-MM-DD". */
function weekStartIST(clock: IstClock): string {
  const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(clock.weekday)
  const shift = dayIndex <= 0 ? 0 : dayIndex // Monday itself → 0
  const dayIST = clock.at.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  return new Date(Date.parse(`${dayIST}T00:00:00.000Z`) - shift * 86400000)
    .toISOString()
    .slice(0, 10)
}

async function weeklyReportExists(userId: string, weekStart: string): Promise<boolean> {
  const rows = await db.atursevaMessage.findMany({
    where: {
      actionType: 'get_my_weekly_report',
      createdAt: { gte: new Date(Date.parse(`${weekStart}T00:00:00+05:30`)) },
      conversation: { userId },
    },
    select: { actionJson: true },
    take: 10,
  })
  return rows.some((r) => {
    try {
      const data = JSON.parse(r.actionJson || '{}')?.data as { weekStart?: string } | undefined
      return data?.weekStart === weekStart
    } catch {
      return false
    }
  })
}

async function pushWeeklyReports(clock: IstClock): Promise<number> {
  if (clock.weekday !== 'Sunday' || clock.hour < 18) return 0

  const weekStart = weekStartIST(clock)
  const weekStartUtc = new Date(Date.parse(`${weekStart}T00:00:00+05:30`))
  const weekStartStr = weekStart

  // Patients with activity this week (check-in / dose / booking) AND an
  // existing Aturseva thread (they've used the chat — no cold-spam).
  const [checkUsers, doseUsers, bookingUsers, conversations] = await Promise.all([
    db.atursevaCheckIn
      .findMany({ where: { day: { gte: weekStartStr } }, distinct: ['userId'], select: { userId: true } }),
    db.sevikaDose
      .findMany({ where: { dueAt: { gte: weekStartUtc } }, distinct: ['userId'], select: { userId: true } }),
    db.booking
      .findMany({ where: { bookingDate: { gte: weekStartUtc } }, distinct: ['userId'], select: { userId: true } }),
    db.atursevaConversation.findMany({ select: { userId: true } }),
  ])
  const active = new Set([...checkUsers, ...doseUsers, ...bookingUsers].map((u) => u.userId))
  const hasThread = new Set(conversations.map((c) => c.userId))

  let pushed = 0
  for (const userId of active) {
    if (!hasThread.has(userId)) continue // never used Aturseva → skip
    try {
      if (await weeklyReportExists(userId, weekStart)) continue

      const { result } = await buildWeeklyReportCard(userId)
      const data = result.data as Record<string, unknown>
      const ok = await pushAtursevaMessage({
        userId,
        kind: 'weekly-report',
        refId: weekStart,
        text: '📋 Aapki is hafte ki report taiyar hai — mood, dawai, appointments — sab ka summary. Dekh lijiye, agli hafte bhi aapke saath rahungi 🙂',
        card: { type: result.type, title: result.title, data: { ...data, weekStart } },
        toastMessage: '📋 Aapki weekly report taiyar hai',
      })
      if (ok) pushed++
    } catch (err) {
      console.error(`[aturseva/scheduler] weekly report failed for user:`, err)
    }
  }
  return pushed
}

// ─── Entry point (called by /api/cron/sevika-tick) ──────────────────────────

export interface AtursevaTickResult {
  dietNudges: number
  weeklyReports: number
}

export async function runAtursevaProactiveTick(
  opts: { now?: Date } = {}
): Promise<AtursevaTickResult> {
  const clock = istNow(opts.now)
  try {
    const [dietNudges, weeklyReports] = await Promise.all([
      pushDietNudges(clock),
      pushWeeklyReports(clock),
    ])
    return { dietNudges, weeklyReports }
  } catch (err) {
    // NEVER break the sevika tick because of us.
    console.error('[aturseva/scheduler] tick failed:', err)
    return { dietNudges: 0, weeklyReports: 0 }
  }
}
