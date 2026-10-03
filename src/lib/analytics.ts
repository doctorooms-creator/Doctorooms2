/**
 * Conversion-funnel instrumentation (docs/PRICING-STRATEGY.md §7).
 *
 * Every upgrade moment records an AnalyticsEvent so we learn which trigger
 * earns (wall_viewed → wall_upgraded per source), then double down there.
 * All tracking is fire-and-forget: NEVER blocks or fails a user action.
 */
import { db } from '@/lib/db'

export type EventType = 'wall_viewed' | 'wall_upgraded' | 'founder_interest' | 'report_viewed'

export const EVENT_SOURCES = [
  'ai',
  'whatsapp',
  'receptionist_seats',
  'nurse_seats',
  'doctor_seats',
  'lost_revenue',
  'earnings_banner',
  'dashboard_banner',
  'billing_page',
] as const

export type EventSource = (typeof EVENT_SOURCES)[number]

export interface TrackEventInput {
  userId?: string | null
  hospitalId?: string | null
  type: EventType
  source: string
  meta?: Record<string, unknown>
}

/** Record one event. Never throws — tracking must not break product flows. */
export async function trackEvent(input: TrackEventInput): Promise<void> {
  try {
    await db.analyticsEvent.create({
      data: {
        userId: input.userId ?? null,
        hospitalId: input.hospitalId ?? null,
        type: input.type,
        source: input.source,
        meta: (input.meta ?? undefined) as never,
      },
    })
  } catch (err) {
    console.error('[analytics] trackEvent failed (ignored):', err)
  }
}

export interface FunnelStats {
  since: string
  totals: { type: string; source: string; count: number; lastAt: string }[]
  conversions: {
    source: string
    viewed: number
    upgraded: number
    ratePct: number
  }[]
  daily: { date: string; wallViewed: number; wallUpgraded: number; founderInterest: number }[]
  grandTotals: { wallViewed: number; wallUpgraded: number; founderInterest: number; reportViewed: number }
}

/** Aggregated funnel for the admin analytics endpoint (last N days). */
export async function getFunnelStats(days = 30): Promise<FunnelStats> {
  const since = new Date(Date.now() - days * 86400000)

  const [grouped, dailyGrouped] = await Promise.all([
    db.analyticsEvent.groupBy({
      by: ['type', 'source'],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      _max: { createdAt: true },
    }),
    db.analyticsEvent.groupBy({
      by: ['type', 'createdAt'],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
  ])

  // day-key map for the daily series
  const dayMap = new Map<string, { wallViewed: number; wallUpgraded: number; founderInterest: number }>()
  for (const g of dailyGrouped) {
    const key = new Date(g.createdAt).toISOString().slice(0, 10)
    const row = dayMap.get(key) ?? { wallViewed: 0, wallUpgraded: 0, founderInterest: 0 }
    if (g.type === 'wall_viewed') row.wallViewed += g._count._all
    else if (g.type === 'wall_upgraded') row.wallUpgraded += g._count._all
    else if (g.type === 'founder_interest') row.founderInterest += g._count._all
    dayMap.set(key, row)
  }
  const daily = [...dayMap.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, v]) => ({ date, ...v }))

  const totals = grouped.map((g) => ({
    type: g.type,
    source: g.source,
    count: g._count._all,
    lastAt: g._max.createdAt?.toISOString() ?? '',
  }))

  // wall_viewed → wall_upgraded conversion per source
  const sources = new Set(totals.filter((t) => t.type === 'wall_viewed' || t.type === 'wall_upgraded').map((t) => t.source))
  const conversions = [...sources]
    .map((source) => {
      const viewed = totals.find((t) => t.type === 'wall_viewed' && t.source === source)?.count ?? 0
      const upgraded = totals.find((t) => t.type === 'wall_upgraded' && t.source === source)?.count ?? 0
      return { source, viewed, upgraded, ratePct: viewed > 0 ? Math.round((upgraded / viewed) * 1000) / 10 : 0 }
    })
    .sort((a, b) => b.viewed - a.viewed)

  const grandTotals = {
    wallViewed: totals.filter((t) => t.type === 'wall_viewed').reduce((s, t) => s + t.count, 0),
    wallUpgraded: totals.filter((t) => t.type === 'wall_upgraded').reduce((s, t) => s + t.count, 0),
    founderInterest: totals.filter((t) => t.type === 'founder_interest').reduce((s, t) => s + t.count, 0),
    reportViewed: totals.filter((t) => t.type === 'report_viewed').reduce((s, t) => s + t.count, 0),
  }

  return { since: since.toISOString(), totals, conversions, daily, grandTotals }
}
