/**
 * Sevika — AI Nurse: weekly report card (AI-NURSE-PLAN.md §2.5).
 *
 * Server-only. Deterministic per-day adherence breakdown for the last 7 days
 * (pure SQL counts — zero AI), plus ONE LLM call that turns the numbers into
 * a warm 3-line Hinglish nurse summary. The narrative is cached per-user in
 * memory for 12h (and regenerates on ?refresh=1) so the main screen never
 * pays LLM latency on every load.
 *
 * Safety rails: the LLM only receives the stats block and medicine names —
 * it narrates, it never prescribes. Numbers themselves are computed in code.
 */

import { db } from '@/lib/db'
import { todayISTRange } from '@/lib/date-utils'
import { computeAdherence } from './schedule'

export interface WeekDayStat {
  date: string // "Mon 12" style label (IST)
  dateISO: string
  total: number
  taken: number
  missed: number
  skipped: number
  pct: number // 0-100, 100 when total=0
}

export interface WeeklyReport {
  generatedAt: string
  weekTotal: number
  weekTaken: number
  weekMissed: number
  weekSkipped: number
  scorePct: number
  streakDays: number
  bestDay: string | null
  worstDay: string | null
  days: WeekDayStat[]
  medicines: string[]
  narrative: string
  narrativeAI: boolean
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ─── Deterministic stats ───────────────────────────────────────────────────

async function computeWeekBreakdown(userId: string): Promise<WeekDayStat[]> {
  const { start } = todayISTRange()
  const weekStart = new Date(start.getTime() - 6 * 24 * 60 * 60 * 1000)
  const weekEnd = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1)

  const doses = await db.sevikaDose.findMany({
    where: {
      userId,
      dueAt: { gte: weekStart, lte: weekEnd },
      status: { in: ['Taken', 'Missed', 'Skipped'] },
    },
    select: { dueAt: true, status: true },
  })

  // Bucket by IST calendar day
  const buckets = new Map<string, WeekDayStat>()
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(start.getTime() - i * 24 * 60 * 60 * 1000)
    const ist = new Date(dayStart.getTime() + 5.5 * 60 * 60 * 1000)
    const dateISO = ist.toISOString().slice(0, 10)
    buckets.set(dateISO, {
      date: `${DAY_LABELS[ist.getUTCDay()]} ${ist.getUTCDate()}`,
      dateISO,
      total: 0,
      taken: 0,
      missed: 0,
      skipped: 0,
      pct: 100,
    })
  }

  for (const d of doses) {
    const ist = new Date(d.dueAt.getTime() + 5.5 * 60 * 60 * 1000)
    const dateISO = ist.toISOString().slice(0, 10)
    const b = buckets.get(dateISO)
    if (!b) continue
    b.total++
    if (d.status === 'Taken') b.taken++
    else if (d.status === 'Missed') b.missed++
    else if (d.status === 'Skipped') b.skipped++
  }

  const days = [...buckets.values()]
  for (const d of days) {
    d.pct = d.total === 0 ? 100 : Math.round((d.taken / d.total) * 100)
  }
  return days
}

// ─── LLM narrative (1 call, in-memory cache 12h) ──────────────────────────

interface NarrativeCacheEntry {
  narrative: string
  ai: boolean
  at: number
}
const narrativeCache = new Map<string, NarrativeCacheEntry>()
const CACHE_TTL_MS = 12 * 60 * 60 * 1000

const FALLBACK_NARRATIVES = (score: number, name: string): string => {
  const firstName = name.split(' ')[0] || 'ji'
  if (score >= 90) return `${firstName}, is hafte aapki dawai adhaigat bahut acchi rahi — aise hi jaari rakhiye! 🌟`
  if (score >= 70) return `${firstName}, kaafi doses time pe li — bas kuch bhatak gayi thi. Agli hafte 100% ki taraf chalte hain! 💪`
  return `${firstName}, is hafte kai doses miss ho gayi. Chinta mat kijiye — main roz yaad dilati rahungi, hum sudhar lenge. 🩺`
}

let zaiPromise: Promise<typeof import('z-ai-web-dev-sdk').default> | null = null

async function getLLM() {
  if (!zaiPromise) {
    zaiPromise = (async () => {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      return ZAI.create()
    })()
  }
  return zaiPromise
}

async function generateNarrative(
  userId: string,
  patientName: string,
  days: WeekDayStat[],
  stats: { weekTaken: number; weekTotal: number; scorePct: number; streakDays: number },
  medicines: string[]
): Promise<{ narrative: string; ai: boolean }> {
  const statsBlock = [
    `PATIENT: ${patientName}`,
    `LAST 7 DAYS: taken ${stats.weekTaken}/${stats.weekTotal} doses, score ${stats.scorePct}%, current streak ${stats.streakDays} perfect day(s)`,
    `DAY-WISE: ${days.map((d) => `${d.date} ${d.taken}/${d.total}`).join(' | ')}`,
    `MEDICINES: ${medicines.slice(0, 10).join(', ') || 'none'}`,
  ].join('\n')

  try {
    const zai = await getLLM()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are Sevika, a warm Indian nurse writing a patient\'s weekly medicine report card. You narrate ONLY the given numbers in caring Hinglish (2-3 short lines, max 45 words). You NEVER suggest dose changes, new medicines, or medical advice. No emojis other than one at most. Output plain text only.',
        },
        { role: 'user', content: `Write the weekly report card narration from this data:\n${statsBlock}` },
      ],
      thinking: { type: 'disabled' },
    })
    const text = completion.choices[0]?.message?.content
    if (typeof text === 'string' && text.trim().length > 10) {
      return { narrative: text.trim().slice(0, 400), ai: true }
    }
  } catch {
    // fall through to deterministic fallback
  }
  return { narrative: FALLBACK_NARRATIVES(stats.scorePct, patientName), ai: false }
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Build the full weekly report for a patient.
 * @param forceRefresh  true → regenerate the LLM narrative even if cached.
 */
export async function buildWeeklyReport(
  userId: string,
  forceRefresh = false
): Promise<WeeklyReport> {
  const [days, stats, user, activeSchedules] = await Promise.all([
    computeWeekBreakdown(userId),
    computeAdherence(userId),
    db.user.findUnique({ where: { id: userId }, select: { name: true } }),
    db.sevikaSchedule.findMany({
      where: { userId, status: 'Active' },
      select: { medicineName: true },
      take: 15,
    }),
  ])

  const patientName = user?.name || 'Patient'
  const medicines = activeSchedules.map((s) => s.medicineName)

  const weekMissed = days.reduce((a, d) => a + d.missed, 0)
  const weekSkipped = days.reduce((a, d) => a + d.skipped, 0)
  const activeDays = days.filter((d) => d.total > 0)
  const bestDay =
    activeDays.length > 0
      ? activeDays.reduce((a, b) => (b.pct > a.pct ? b : a)).date
      : null
  const worstDay =
    activeDays.length > 1 ? activeDays.reduce((a, b) => (b.pct < a.pct ? b : a)).date : null

  // Narrative: serve from cache when fresh (unless refresh forced)
  const cached = narrativeCache.get(userId)
  let narrative: string
  let narrativeAI: boolean
  if (
    !forceRefresh &&
    cached &&
    Date.now() - cached.at < CACHE_TTL_MS &&
    cached.narrative
  ) {
    narrative = cached.narrative
    narrativeAI = cached.ai
  } else {
    const gen = await generateNarrative(
      userId,
      patientName,
      days,
      { weekTaken: stats.weekTaken, weekTotal: stats.weekTotal, scorePct: stats.scorePct, streakDays: stats.streakDays },
      medicines
    )
    narrative = gen.narrative
    narrativeAI = gen.ai
    narrativeCache.set(userId, { narrative, ai: gen.ai, at: Date.now() })
  }

  return {
    generatedAt: new Date().toISOString(),
    weekTotal: stats.weekTotal,
    weekTaken: stats.weekTaken,
    weekMissed,
    weekSkipped,
    scorePct: stats.scorePct,
    streakDays: stats.streakDays,
    bestDay,
    worstDay,
    days,
    medicines,
    narrative,
    narrativeAI,
  }
}
