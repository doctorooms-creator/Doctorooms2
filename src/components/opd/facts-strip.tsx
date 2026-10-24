'use client'

/**
 * Facts strip (03 §3.5) — the honest KPI line.
 * ONE container, 1px dividers, NO tiles/icons/sparklines.
 * Every figure comes from the aggregate payload — zero hardcoded trends.
 */

import type { OpdCockpitData } from './types'

interface FactsStripProps {
  stats: OpdCockpitData['stats']
  pendingApprovals: number
  reportsCount: number
  scope: OpdCockpitData['scope']
  dateLabel: string
}

export function FactsStrip({ stats, pendingApprovals, reportsCount, scope, dateLabel }: FactsStripProps) {
  return (
    <footer
      className="flex flex-wrap items-center gap-x-0 gap-y-1 rounded-[var(--opd-radius-card)] border"
      style={{ background: 'var(--opd-surface)', borderColor: 'var(--opd-border)' }}
      role="contentinfo"
    >
      <Fact label="done today" value={stats.done} />
      <Fact label="waiting" value={stats.waiting} />
      {stats.backlogMinutes > 0 && <Fact label="backlog" value={`~${stats.backlogMinutes} min`} />}
      {stats.noShows > 0 && <Fact label="no-shows" value={stats.noShows} tone="warn" />}

      {reportsCount > 0 && (
        <button
          className="opd-press flex items-center gap-1.5 border-l px-3.5 py-2 text-[12px] font-medium"
          style={{ borderColor: 'var(--opd-rule)', color: 'var(--opd-accent-deep)' }}
          title="Reports ready to review"
        >
          <span className="opd-num text-[14px] font-semibold">{reportsCount}</span>
          reports ready
        </button>
      )}

      {pendingApprovals > 0 && (
        <button
          className="opd-press flex items-center gap-1.5 border-l px-3.5 py-2 text-[12px] font-medium"
          style={{ borderColor: 'var(--opd-rule)', color: 'var(--opd-warning)' }}
          title="Bookings waiting for reception approval — the queue is not complete"
        >
          <span className="opd-num text-[14px] font-semibold">{pendingApprovals}</span>
          pending approvals
        </button>
      )}

      {/* Right side: scope truth */}
      <div className="ml-auto flex items-center gap-3 px-3.5 py-2 text-[11px]" style={{ color: 'var(--opd-faint)' }}>
        {scope.closesAt && (
          <span className="opd-num">
            closes {scope.closesAt}
          </span>
        )}
        <span>{dateLabel}</span>
      </div>
    </footer>
  )
}

function Fact({
  label,
  value,
  tone,
}: {
  label: string
  value: number | string
  tone?: 'warn'
}) {
  return (
    <div
      className="flex items-baseline gap-1.5 border-l px-3.5 py-2 first:border-l-0"
      style={{ borderColor: 'var(--opd-rule)' }}
    >
      <span
        className="opd-num text-[15px] font-semibold"
        style={{ color: tone === 'warn' ? 'var(--opd-warning)' : 'var(--opd-text)' }}
      >
        {value}
      </span>
      <span className="text-[12px]" style={{ color: 'var(--opd-muted)' }}>
        {label}
      </span>
    </div>
  )
}
