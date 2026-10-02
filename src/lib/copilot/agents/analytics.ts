/**
 * Dr. Copilot — ANALYTICS AGENT (Phase D2)
 *
 * Read-only practice analytics: monthly booking/revenue/RX series, no-show
 * behaviour, new-vs-repeat mix, weekday load. All aggregates come from the
 * scoped repo (L2) and are ALSO shipped to the panel as a structured chart
 * payload (SSE event `chart`) — the LLM narrates insights, the chart shows
 * the real numbers. No LLM-invented figures anywhere.
 */

import * as repo from '../repo'
import type { CopilotCtx } from '../guard'
import type { CopilotChart } from '../action-card'

export interface AnalyticsData {
  agentName: 'analytics'
  dataBlock: string
  citations: string[]
  chart: CopilotChart | null
}

export async function buildAnalytics(ctx: CopilotCtx): Promise<AnalyticsData> {
  const [series, split, weekdays, followups] = await Promise.all([
    repo.monthlySeries(ctx, 6),
    repo.newVsRepeatSplit(ctx, 90),
    repo.weekdayLoad(ctx, 90),
    repo.upcomingFollowups(ctx, 7),
  ])

  const totalBookings = series.reduce((s, p) => s + p.bookings, 0)
  if (totalBookings === 0) {
    return {
      agentName: 'analytics',
      dataBlock: [
        'NO DATA YET.',
        'This doctor has no bookings in the last 6 months, so there is nothing to analyse.',
        'Reply briefly that analytics will light up once patient visits start appearing in their records.',
      ].join('\n'),
      citations: [],
      chart: null,
    }
  }

  const last = series[series.length - 1]
  const prev = series.length >= 2 ? series[series.length - 2] : null
  const noShowTotal = series.reduce((s, p) => s + p.noShow, 0)
  const noShowRate = totalBookings > 0 ? Math.round((noShowTotal / totalBookings) * 100) : 0
  const busiestDay = [...weekdays].sort((a, b) => b.count - a.count)[0]

  const lines: string[] = []
  lines.push(`PRACTICE ANALYTICS for ${ctx.doctorName} (last 6 months, own records only):`)
  lines.push('')
  lines.push('Month | Bookings | Finished | NoShow | RX written | Revenue (₹)')
  for (const p of series) {
    lines.push(
      `${p.month} | ${p.bookings} | ${p.finished} | ${p.noShow} | ${p.rx} | ${p.revenue.toLocaleString('en-IN')}`
    )
  }
  lines.push('')
  if (prev) {
    const delta = last.bookings - prev.bookings
    const dir = delta > 0 ? `up ${delta}` : delta < 0 ? `down ${-delta}` : 'flat'
    lines.push(`Latest month (${last.month}) vs previous: bookings ${dir}.`)
  }
  lines.push(
    `New vs repeat patients (last 90 days): ${split.fresh} new · ${split.repeat} repeat${split.total ? ` (${Math.round((split.repeat / split.total) * 100)}% repeat rate)` : ''}.`
  )
  lines.push(`Overall no-show rate: ${noShowRate}% (${noShowTotal}/${totalBookings}).`)
  lines.push(`Busiest weekday (90 days): ${busiestDay?.label ?? '—'} with ${busiestDay?.count ?? 0} bookings.`)
  lines.push(`Follow-ups due in next 7 days: ${followups.length}.`)
  lines.push('')
  lines.push(
    'Narrate the key takeaways conversationally (Hinglish ok): the month-over-month direction, repeat-patient loyalty, no-show rate (flag if >15%), busiest day, and follow-ups due. Reference exact numbers from the data only. Keep it under ~140 words; the chart below the message already shows the monthly trend.'
  )

  const chart: CopilotChart = {
    title: 'Monthly bookings — last 6 months',
    labels: series.map((p) => p.label),
    values: series.map((p) => p.bookings),
    unit: '',
    note:
      prev && last.bookings !== prev.bookings
        ? `${last.label}: ${last.bookings} bookings (${last.bookings > prev.bookings ? '+' : ''}${last.bookings - prev.bookings} vs ${prev.label})`
        : `${last.label}: ${last.bookings} bookings`,
  }

  return { agentName: 'analytics', dataBlock: lines.join('\n'), citations: [], chart }
}
