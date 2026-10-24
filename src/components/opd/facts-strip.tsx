'use client'

/**
 * Facts strip (03 §3.5) — the honest KPI line.
 * ONE container, 1px dividers, NO tiles/icons/sparklines.
 * Every figure comes from the aggregate payload — zero hardcoded trends.
 *
 * Phase E motion: numbers crossfade on change (160ms, tabular-nums — no
 * odometer theatrics); the reports-ready count gets ONE soft emphasis
 * pulse when it changes (02 §5.4) so an arriving lab report is felt
 * without a sound.
 */

import { AnimatePresence, motion } from 'framer-motion'
import type { OpdCockpitData } from './types'

interface FactsStripProps {
  stats: OpdCockpitData['stats']
  pendingApprovals: number
  reportsCount: number
  scope: OpdCockpitData['scope']
  dateLabel: string
  /** Phase D: opens the reports-review inbox dialog. */
  onReportsOpen?: () => void
}

export function FactsStrip({ stats, pendingApprovals, reportsCount, scope, dateLabel, onReportsOpen }: FactsStripProps) {
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
          onClick={onReportsOpen}
          disabled={!onReportsOpen}
          className="opd-press flex items-center gap-1.5 border-l px-3.5 py-2 text-[12px] font-medium"
          style={{ borderColor: 'var(--opd-rule)', color: 'var(--opd-accent-deep)' }}
          title="Reports ready to review — open the inbox"
        >
          {/* One soft pulse when the count changes (arrival felt, not heard) */}
          <PulseOnChange value={reportsCount}>
            <span className="opd-num text-[14px] font-semibold">{reportsCount}</span>
          </PulseOnChange>
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
      {/* Crossfade on change — keyed by value so each new number fades in
          over the old one, 160ms, tabular digits aligned (no shift). */}
      <span className="opd-num relative inline-flex items-baseline">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={String(value)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="text-[15px] font-semibold"
            style={{ color: tone === 'warn' ? 'var(--opd-warning)' : 'var(--opd-text)' }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="text-[12px]" style={{ color: 'var(--opd-muted)' }}>
        {label}
      </span>
    </div>
  )
}

/** Wraps a value display; remounts (key=value) so each change pulses once —
 *  scale 1.14 → 1 in 220ms. Feels like the count landed, not blinked. */
function PulseOnChange({ value, children }: { value: number; children: React.ReactNode }) {
  return (
    <motion.span
      key={value}
      initial={{ scale: 1.14 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="inline-flex"
    >
      {children}
    </motion.span>
  )
}
