'use client'

/**
 * Day-state hero variants (03 §4) — the screen morphs by time + queue state.
 * Morning (pre-first-call) · Break (paused) · Reports-return (idle + reports
 * waiting) · Day-end (queue drained). All content computed from the aggregate
 * payload — no fake numbers.
 *
 * Every variant is a motion.section with matching enter/exit so the
 * orchestrator's AnimatePresence can crossfade state changes (02 §5.4:
 * quiet, ≤240ms — only the patient-card swap is the authored moment).
 */

import { motion } from 'framer-motion'
import { Coffee, FileStack } from 'lucide-react'
import type { OpdCockpitData } from './types'
import { SpinnerDot } from './hero-patient-card'

/** Quiet state-change motion (not the authored moment — 02 §5.4). */
const stateMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
}

interface DayStateProps {
  data: OpdCockpitData
  onPrimary: () => void
  primaryPending?: boolean
}

/** Morning: queue has patients, nobody called yet. */
export function MorningState({
  data,
  onPrimary,
  primaryPending,
  onReviewReports,
}: DayStateProps & { onReviewReports?: () => void }) {
  const first = data.queue.find((q) => q.status === 'Approve')
  return (
    <motion.section
      key="morning"
      {...stateMotion}
      className="flex h-full flex-col justify-center rounded-[var(--opd-radius-card)] border p-[var(--opd-card-pad)]"
      style={{ background: 'var(--opd-surface)', borderColor: 'var(--opd-border)' }}
    >
      <p className="text-[12px]" style={{ color: 'var(--opd-faint)' }}>
        OPD opens
      </p>
      <h1 className="mt-1 text-[22px] font-semibold leading-tight" style={{ color: 'var(--opd-text)' }}>
        {data.stats.waiting} waiting{first ? ` — first ${first.tokenNumber || 'patient'} ${first.patientName}` : ''}
        {first?.timeSlot ? ` at ${first.timeSlot}` : ''}
      </h1>

      {data.reportsInbox.length > 0 && (
        <button
          onClick={onReviewReports}
          className="opd-press mt-2 flex items-center gap-2 self-start rounded-[var(--opd-radius-chip)] px-1.5 py-0.5 text-left text-[13px] font-medium"
          style={{ color: 'var(--opd-accent-deep)' }}
          title="Review reports that arrived before OPD"
        >
          {data.reportsInbox.length} {data.reportsInbox.length === 1 ? 'report' : 'reports'} ready to review
          {data.reportsInbox[0] ? ` — ${data.reportsInbox[0].patientName} (${data.reportsInbox[0].testName})` : ''} →
        </button>
      )}
      {data.pendingApprovals > 0 && (
        <p className="mt-2 text-[13px]" style={{ color: 'var(--opd-warning)' }}>
          {data.pendingApprovals} bookings still pending approval — reception has been notified
        </p>
      )}

      {first && (
        <div className="mt-5">
          <button
            onClick={onPrimary}
            disabled={primaryPending}
            className="opd-press flex h-10 items-center gap-2 rounded-[var(--opd-radius-control)] px-5 text-[14px] font-semibold"
            style={{ background: 'var(--opd-primary)', color: 'var(--opd-primary-ink)' }}
            onMouseEnter={(e) => !primaryPending && (e.currentTarget.style.background = 'var(--opd-primary-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--opd-primary)')}
            title="Call First Patient (Enter)"
          >
            {primaryPending ? (
              <>
                <SpinnerDot /> Calling…
              </>
            ) : (
              <>Call First Patient{first.tokenNumber ? ` (${first.tokenNumber})` : ''}</>
            )}
          </button>
        </div>
      )}
    </motion.section>
  )
}

/** Break: queue paused — auto-advance sleeps (S12). */
export function BreakState({ data, onResume, resumePending }: DayStateProps & { onResume: () => void; resumePending?: boolean }) {
  const next = data.queue.find((q) => q.status === 'Approve')
  return (
    <motion.section
      key="break"
      {...stateMotion}
      className="flex h-full flex-col items-center justify-center rounded-[var(--opd-radius-card)] border p-[var(--opd-card-pad)] text-center"
      style={{ background: 'var(--opd-warn-bg)', borderColor: 'var(--opd-warn-border)' }}
    >
      <div
        className="mb-3 flex h-11 w-11 items-center justify-center rounded-full"
        style={{ background: '#ffffff' }}
        aria-hidden="true"
      >
        <Coffee className="h-5 w-5" style={{ color: 'var(--opd-warning)' }} />
      </div>
      <h1 className="text-[22px] font-semibold" style={{ color: 'var(--opd-warn-ink)' }}>
        Break — the queue is paused
      </h1>
      <p className="mt-1.5 text-[13px]" style={{ color: 'var(--opd-warning)' }}>
        {next
          ? `${next.tokenNumber || 'Next'} ${next.patientName} ready when you are.`
          : 'No one waiting right now.'}{' '}
        {data.stats.done > 0 && <span className="opd-num">{data.stats.done} seen so far today.</span>}
      </p>
      <button
        onClick={onResume}
        disabled={resumePending}
        className="opd-press mt-5 flex h-10 items-center gap-2 rounded-[var(--opd-radius-control)] px-5 text-[14px] font-semibold"
        style={{ background: 'var(--opd-primary)', color: 'var(--opd-primary-ink)' }}
        onMouseEnter={(e) => !resumePending && (e.currentTarget.style.background = 'var(--opd-primary-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--opd-primary)')}
        title="Resume Queue (P)"
      >
        {resumePending ? (
          <>
            <SpinnerDot /> Resuming…
          </>
        ) : (
          <>Resume Queue</>
        )}
      </button>
    </motion.section>
  )
}

/** Reports-return (S7): doctor idle mid-day, reports waiting — review is the action. */
export function ReportsReturnState({
  data,
  onReview,
  onDone,
}: {
  data: OpdCockpitData
  onReview: () => void
  onDone: () => void
}) {
  const abnormal = data.reportsInbox.filter((r) => r.flag === 'abnormal').length
  return (
    <motion.section
      key="reports-return"
      {...stateMotion}
      className="flex h-full flex-col justify-center rounded-[var(--opd-radius-card)] border p-[var(--opd-card-pad)]"
      style={{ background: 'var(--opd-surface)', borderColor: 'var(--opd-border)' }}
    >
      <div className="flex items-center gap-2.5">
        <FileStack className="h-[18px] w-[18px]" style={{ color: 'var(--opd-accent-deep)' }} aria-hidden="true" />
        <p className="text-[12px]" style={{ color: 'var(--opd-faint)' }}>
          Lab reports in
        </p>
      </div>
      <h1 className="mt-1 text-[22px] font-semibold leading-tight" style={{ color: 'var(--opd-text)' }}>
        {data.reportsInbox.length} {data.reportsInbox.length === 1 ? 'report' : 'reports'} ready — review now
        {abnormal > 0 && (
          <span className="ml-1.5 text-[15px] font-normal" style={{ color: 'var(--opd-negative)' }}>
            · {abnormal} flagged abnormal
          </span>
        )}
      </h1>

      {data.reportsInbox[0] && (
        <p className="mt-2 text-[13px]" style={{ color: 'var(--opd-muted)' }}>
          Latest: {data.reportsInbox[0].patientName} — {data.reportsInbox[0].testName}
          {data.reportsInbox[0].value ? ` (${data.reportsInbox[0].value}${data.reportsInbox[0].unit ? ` ${data.reportsInbox[0].unit}` : ''})` : ''}
          {data.reportsInbox.length > 1 && ` · +${data.reportsInbox.length - 1} more`}
        </p>
      )}

      <div className="mt-5 flex items-center gap-2.5">
        <button
          onClick={onReview}
          className="opd-press flex h-10 items-center gap-2 rounded-[var(--opd-radius-control)] px-5 text-[14px] font-semibold"
          style={{ background: 'var(--opd-primary)', color: 'var(--opd-primary-ink)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--opd-primary-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--opd-primary)')}
          title="Open the reports inbox (Enter)"
        >
          Review reports
        </button>
        <button
          onClick={onDone}
          className="opd-press h-10 rounded-[var(--opd-radius-control)] border px-4 text-[13px] font-medium"
          style={{ borderColor: 'var(--opd-control)', color: 'var(--opd-muted)' }}
          title="Done for today — back to the classic dashboard"
        >
          Done for today
        </button>
      </div>
    </motion.section>
  )
}

/** Day-end: queue drained + past close (or queue simply empty late). */
export function DayEndState({ data, onDone, donePending }: DayStateProps & { onDone: () => void; donePending?: boolean }) {
  return (
    <motion.section
      key="day-end"
      {...stateMotion}
      className="flex h-full flex-col justify-center rounded-[var(--opd-radius-card)] border p-[var(--opd-card-pad)]"
      style={{ background: 'var(--opd-surface)', borderColor: 'var(--opd-border)' }}
    >
      <p className="text-[12px]" style={{ color: 'var(--opd-faint)' }}>
        Queue is clear
      </p>
      <h1 className="mt-1 text-[22px] font-semibold leading-tight" style={{ color: 'var(--opd-text)' }}>
        {data.stats.done > 0 ? `${data.stats.done} patients seen today` : 'No patients were called today'}
        {data.stats.noShows > 0 && <span className="text-[15px] font-normal" style={{ color: 'var(--opd-muted)' }}> · {data.stats.noShows} no-shows</span>}
      </h1>

      {data.reportsInbox.length > 0 && (
        <p className="mt-2 text-[13px]" style={{ color: 'var(--opd-accent-deep)' }}>
          {data.reportsInbox.length} {data.reportsInbox.length === 1 ? 'report' : 'reports'} to review tomorrow morning
        </p>
      )}
      {data.tomorrowFirst && (
        <p className="mt-2 text-[13px]" style={{ color: 'var(--opd-muted)' }}>
          Tomorrow starts with {data.tomorrowFirst.patientName}
          {data.tomorrowFirst.timeSlot ? ` at ${data.tomorrowFirst.timeSlot}` : ''}
        </p>
      )}

      <div className="mt-5">
        <button
          onClick={onDone}
          disabled={donePending}
          className="opd-press flex h-10 items-center gap-2 rounded-[var(--opd-radius-control)] border px-5 text-[14px] font-semibold"
          style={{ borderColor: 'var(--opd-control)', color: 'var(--opd-muted)', background: 'var(--opd-surface)' }}
          title="Done for today — back to the classic dashboard"
        >
          Done for today
        </button>
      </div>
    </motion.section>
  )
}
