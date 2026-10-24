'use client'

/**
 * Day-state hero variants (03 §4) — the screen morphs by time + queue state.
 * Morning (pre-first-call) · Break (paused) · Day-end (queue drained past close).
 * All content computed from the aggregate payload — no fake numbers.
 */

import { Coffee } from 'lucide-react'
import type { OpdCockpitData } from './types'
import { SpinnerDot } from './hero-patient-card'

interface DayStateProps {
  data: OpdCockpitData
  onPrimary: () => void
  primaryPending?: boolean
}

/** Morning: queue has patients, nobody called yet. */
export function MorningState({ data, onPrimary, primaryPending }: DayStateProps) {
  const first = data.queue.find((q) => q.status === 'Approve')
  return (
    <section
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
        <p className="mt-2 text-[13px]" style={{ color: 'var(--opd-accent-deep)' }}>
          {data.reportsInbox.length} {data.reportsInbox.length === 1 ? 'report' : 'reports'} ready to review
          {data.reportsInbox[0] ? ` — ${data.reportsInbox[0].patientName} (${data.reportsInbox[0].testName})` : ''}
        </p>
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
    </section>
  )
}

/** Break: queue paused — auto-advance sleeps (S12). */
export function BreakState({ data, onResume, resumePending }: DayStateProps & { onResume: () => void; resumePending?: boolean }) {
  const next = data.queue.find((q) => q.status === 'Approve')
  return (
    <section
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
    </section>
  )
}

/** Day-end: queue drained + past close (or queue simply empty late). */
export function DayEndState({ data, onDone, donePending }: DayStateProps & { onDone: () => void; donePending?: boolean }) {
  const tomorrow = null as { patientName: string; timeSlot: string } | null // Phase F: tomorrow preview
  return (
    <section
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
      {tomorrow && (
        <p className="mt-2 text-[13px]" style={{ color: 'var(--opd-muted)' }}>
          Tomorrow starts with {tomorrow.patientName} at {tomorrow.timeSlot}
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
    </section>
  )
}
