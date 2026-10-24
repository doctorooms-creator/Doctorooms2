'use client'

/**
 * Hero patient card — the screen's heart (03 §3.2).
 * States: morning → called (golden window) → in-opd → break → day-end → empty-queue.
 * The ONE primary action sits here; Enter triggers it (keyboard map).
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Video, UserX } from 'lucide-react'
import { statusWords, waitLabel, type OpdQueueItem } from './types'

export interface HeroAction {
  label: string
  onRun: () => void
  pending?: boolean
  title?: string
}

interface HeroCardProps {
  /** The patient this card is about (called, next-up, or last context). */
  patient: OpdQueueItem | null
  mode: 'called' | 'next-up' | 'in-opd' | 'empty'
  /** One-line context built from real facts (03 §3.2 context line). */
  contextLine?: string | null
  primary: HeroAction | null
  secondary?: HeroAction | null
  /** Phase C: true right after auto-advance (drives the authored swap). */
  justAdvanced?: boolean
}

export function HeroPatientCard({ patient, mode, contextLine, primary, secondary, justAdvanced }: HeroCardProps) {
  if (!patient) {
    return <EmptyHero mode={mode} />
  }

  const isCalled = mode === 'called' || mode === 'in-opd'
  const statusLine =
    mode === 'in-opd'
      ? 'In OPD — consultation under way'
      : mode === 'called'
        ? 'Called — walking in'
        : 'Next up'

  return (
    <motion.section
      key={patient.id}
      initial={justAdvanced ? { opacity: 0, y: 20 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{
        duration: justAdvanced ? 0.32 : 0.2,
        ease: [0.16, 1, 0.3, 1],
      }}
      aria-live="polite"
      className="flex h-full flex-col justify-between rounded-[var(--opd-radius-card)] border p-[var(--opd-card-pad)]"
      style={{ background: 'var(--opd-surface)', borderColor: 'var(--opd-border)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {/* Token — the board motif: tabular ink, the product's own object */}
          <div className="flex items-baseline gap-3">
            {patient.tokenNumber && (
              <span className="opd-num text-[28px] font-semibold leading-none" style={{ color: 'var(--opd-text)' }}>
                {patient.tokenNumber}
              </span>
            )}
            {patient.isEmergency && (
              <span
                className="rounded-[var(--opd-radius-chip)] px-1.5 py-0.5 text-[10px] font-semibold"
                style={{ background: 'var(--opd-neg-bg)', color: 'var(--opd-neg-ink)' }}
              >
                EMERGENCY
              </span>
            )}
            {patient.bookingMode === 'VideoCall' && (
              <span
                className="flex items-center gap-1 rounded-[var(--opd-radius-chip)] px-1.5 py-0.5 text-[10px] font-medium"
                style={{ background: 'var(--opd-accent-pale)', color: 'var(--opd-accent-deep)' }}
              >
                <Video className="h-3 w-3" aria-hidden="true" />
                Video
              </span>
            )}
          </div>

          {/* Name · age · gender — wraps cleanly on phones (no hard truncation) */}
          <h1 className="mt-2 text-[19px] font-semibold leading-tight sm:text-[22px]" style={{ color: 'var(--opd-text)' }}>
            <span className="break-words">{patient.patientName}</span>
            {(patient.age || patient.gender) && (
              <span className="ml-1.5 whitespace-nowrap text-[13px] font-normal sm:text-[14px]" style={{ color: 'var(--opd-muted)' }}>
                {[patient.age ? `${patient.age}y` : null, patient.gender].filter(Boolean).join(' · ')}
              </span>
            )}
          </h1>

          {/* Status line — words of the trade (wraps on phones) */}
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]" style={{ color: 'var(--opd-muted)' }}>
            <span
              className="rounded-[var(--opd-radius-chip)] px-1.5 py-0.5 text-[11px] font-medium"
              style={
                isCalled
                  ? { background: 'var(--opd-accent-pale)', color: 'var(--opd-accent-deep)' }
                  : { background: 'var(--opd-raised)', color: 'var(--opd-muted)' }
              }
            >
              {statusLine}
            </span>
            {patient.disease && <span className="truncate sm:max-w-none">{patient.disease}</span>}
            {mode === 'next-up' && patient.waitingSeconds > 0 && (
              <span className="opd-num shrink-0">waiting {waitLabel(patient.waitingSeconds)}</span>
            )}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="opd-num text-[11px]" style={{ color: 'var(--opd-faint)' }}>
            {statusWords(patient.status)}
          </p>
        </div>
      </div>

      {/* Context line — one line of real facts (chart rail holds the depth) */}
      {contextLine && (
        <p className="mt-4 truncate text-[13px]" style={{ color: 'var(--opd-muted)' }}>
          {contextLine}
        </p>
      )}

      {/* Actions — ONE primary, Enter-bound; secondary ghosted */}
      <div className="mt-5 flex items-center gap-2.5">
        {primary && (
          <button
            onClick={primary.onRun}
            disabled={primary.pending}
            className="opd-press flex h-10 items-center gap-2 rounded-[var(--opd-radius-control)] px-5 text-[14px] font-semibold"
            style={{ background: 'var(--opd-primary)', color: 'var(--opd-primary-ink)' }}
            onMouseEnter={(e) => !primary.pending && (e.currentTarget.style.background = 'var(--opd-primary-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--opd-primary)')}
            title={primary.title || `${primary.label} (Enter)`}
          >
            {primary.pending ? (
              <>
                <SpinnerDot /> Calling…
              </>
            ) : (
              <>{primary.label}</>
            )}
          </button>
        )}
        {secondary && (
          <button
            onClick={secondary.onRun}
            disabled={secondary.pending}
            className="opd-press flex h-10 items-center gap-1.5 rounded-[var(--opd-radius-control)] border px-3.5 text-[13px] font-medium"
            style={{ borderColor: 'var(--opd-control)', color: 'var(--opd-muted)' }}
            title={secondary.title || secondary.label}
            onMouseEnter={(e) => !secondary.pending && (e.currentTarget.style.background = 'var(--opd-raised)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {secondary.pending ? <SpinnerDot /> : <UserX className="h-4 w-4" aria-hidden="true" />}
            {secondary.label}
          </button>
        )}
        <p className="ml-auto hidden text-[11px] sm:block" style={{ color: 'var(--opd-faint)' }}>
          <kbd className="rounded-[3px] border px-1" style={{ borderColor: 'var(--opd-border)' }}>Enter</kbd> ={' '}
          {primary?.label ?? 'primary action'}
        </p>
      </div>
    </motion.section>
  )
}

function EmptyHero({ mode }: { mode: 'called' | 'next-up' | 'in-opd' | 'empty' }) {
  return (
    <section
      className="flex h-full flex-col items-center justify-center rounded-[var(--opd-radius-card)] border p-[var(--opd-card-pad)] text-center"
      style={{ background: 'var(--opd-surface)', borderColor: 'var(--opd-border)' }}
    >
      <div
        className="mb-3 flex h-10 w-10 items-center justify-center rounded-full"
        style={{ background: 'var(--opd-raised)' }}
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--opd-faint)" strokeWidth="1.8" strokeLinecap="round">
          <path d="M8 7h8M8 11h8M9 15h6" />
          <rect x="4" y="3" width="16" height="18" rx="2" />
        </svg>
      </div>
      <p className="text-[14px] font-medium" style={{ color: 'var(--opd-muted)' }}>
        No patient card right now
      </p>
      <p className="mt-1 max-w-[420px] text-[12px]" style={{ color: 'var(--opd-faint)' }}>
        {mode === 'empty'
          ? 'The queue fills as reception books — the next patient appears here the moment they are called.'
          : 'Waiting for the next call.'}
      </p>
    </section>
  )
}

/** 14px inline spinner — inside control bounds, no layout shift (02 §5.2). */
export function SpinnerDot() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
