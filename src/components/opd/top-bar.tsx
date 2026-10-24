'use client'

/**
 * Top bar (48px, ground-tinted, hairline bottom rule) — 03 §3.1.
 * Identity (mark + doctor + scope) · search · video countdown ·
 * pause · fullscreen · exit. The only "chrome" the cockpit has.
 */

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, FastForward, Maximize2, Minimize2, Pause, Play, Video } from 'lucide-react'
import { waitLabel } from './types'

interface TopBarProps {
  doctorName: string
  specialization: string
  scopeLabel: string | null
  queuePaused: boolean
  onPauseToggle: () => void
  pausePending: boolean
  videoUpcoming: { patientName: string; timeSlot: string; minutesUntil: number } | null
  onSearchOpen: () => void
  autoAdvance: boolean
  onAutoAdvanceToggle: (on: boolean) => void
}

export function OpdTopBar({
  doctorName,
  specialization,
  scopeLabel,
  queuePaused,
  onPauseToggle,
  pausePending,
  videoUpcoming,
  onSearchOpen,
  autoAdvance,
  onAutoAdvanceToggle,
}: TopBarProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const searchRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      /* iframe policy or user gesture issue — feature-detect, move on */
    }
  }

  return (
    <header
      className="flex h-12 shrink-0 items-center gap-3 border-b px-4"
      style={{
        background: 'var(--opd-surface)',
        borderColor: 'var(--opd-rule)',
      }}
      role="banner"
    >
      {/* Exit affordance — always reachable, no confirm needed (03 §1) */}
      <a
        href="/dashboard/doctor"
        className="opd-press flex items-center gap-1.5 rounded-[var(--opd-radius-chip)] px-2 py-1.5 text-[13px] font-medium"
        style={{ color: 'var(--opd-muted)' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--opd-raised)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        title="Back to the classic dashboard"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Classic view</span>
      </a>

      {/* Identity: the screen must be nameable from a screenshot (02 §7) */}
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-[13px] font-bold"
          style={{ background: 'var(--opd-accent)', color: 'var(--opd-accent-ink)' }}
          aria-hidden="true"
        >
          D
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[13px] font-semibold" style={{ color: 'var(--opd-text)' }}>
            OPD Cockpit
            <span className="mx-1.5 font-normal" style={{ color: 'var(--opd-faint)' }}>
              ·
            </span>
            <span className="font-normal" style={{ color: 'var(--opd-muted)' }}>
              {doctorName}
              {specialization ? `, ${specialization}` : ''}
            </span>
          </p>
          {scopeLabel && (
            <p className="truncate text-[11px]" style={{ color: 'var(--opd-faint)' }}>
              {scopeLabel}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1" />

      {/* Search trigger — "/" also focuses it via keyboard map */}
      <button
        ref={searchRef}
        onClick={onSearchOpen}
        className="opd-press hidden items-center gap-2 rounded-[var(--opd-radius-control)] border px-3 text-[12px] md:flex"
        style={{
          borderColor: 'var(--opd-control)',
          color: 'var(--opd-faint)',
          height: 'var(--opd-control-h)',
        }}
        title="Search patients (press / )"
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--opd-raised)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span>Search</span>
        <kbd
          className="opd-num rounded-[3px] border px-1 text-[10px]"
          style={{ borderColor: 'var(--opd-border)', color: 'var(--opd-faint)' }}
        >
          /
        </kbd>
      </button>

      {/* Video countdown chip — appears from T-10min (03 §3.1) */}
      {videoUpcoming && (
        <div
          className="opd-press flex items-center gap-1.5 rounded-[var(--opd-radius-chip)] px-2 py-1 text-[11px] font-medium"
          style={{ background: 'var(--opd-accent-pale)', color: 'var(--opd-accent-deep)' }}
          title={`Video consultation at ${videoUpcoming.timeSlot}`}
        >
          <Video className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="truncate max-w-[120px]">{videoUpcoming.patientName}</span>
          <span className="opd-num">in {waitLabel(videoUpcoming.minutesUntil * 60)}</span>
        </div>
      )}

      {/* Pause — sacred control (S12) */}
      <button
        onClick={onPauseToggle}
        disabled={pausePending}
        className="opd-press flex items-center gap-1.5 rounded-[var(--opd-radius-control)] border px-2.5 text-[12px] font-medium"
        style={{
          borderColor: queuePaused ? 'var(--opd-warn-border)' : 'var(--opd-control)',
          color: queuePaused ? 'var(--opd-warning)' : 'var(--opd-muted)',
          background: queuePaused ? 'var(--opd-warn-bg)' : 'transparent',
          height: 'var(--opd-control-h)',
        }}
        title={queuePaused ? 'Resume the queue (P)' : 'Pause — stop calling new patients (P)'}
        aria-pressed={queuePaused}
      >
        {queuePaused ? (
          <Play className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Pause className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        <span className="hidden sm:inline">{queuePaused ? 'Resume' : 'Pause'}</span>
        {queuePaused && (
          <span
            className="rounded-[3px] px-1 text-[10px] font-semibold"
            style={{ background: 'var(--opd-warn-border)', color: 'var(--opd-warn-ink)' }}
          >
            PAUSED
          </span>
        )}
      </button>

      {/* Fullscreen toggle — enhancement, not dependency (04 §5) */}
      <button
        onClick={toggleFullscreen}
        className="opd-press flex h-8 w-8 items-center justify-center rounded-[var(--opd-radius-control)]"
        style={{ color: 'var(--opd-muted)' }}
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen — hides browser bars'}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--opd-raised)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        {isFullscreen ? (
          <Minimize2 className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        )}
      </button>

      {/* Auto-advance toggle (Phase C) — ON by default; cookie persists. */}
      <button
        onClick={() => onAutoAdvanceToggle(!autoAdvance)}
        className="opd-press flex items-center gap-1.5 rounded-[var(--opd-radius-control)] border px-2.5 text-[12px] font-medium"
        style={{
          borderColor: autoAdvance ? 'var(--opd-accent)' : 'var(--opd-control)',
          color: autoAdvance ? 'var(--opd-accent-deep)' : 'var(--opd-muted)',
          background: autoAdvance ? 'var(--opd-accent-pale)' : 'transparent',
          height: 'var(--opd-control-h)',
        }}
        title={
          autoAdvance
            ? 'Auto-advance is ON — the next patient is called automatically when you Save & Print. Click to turn off.'
            : 'Auto-advance is OFF — you call each patient manually. Click to turn on.'
        }
        aria-pressed={autoAdvance}
      >
        <FastForward className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Auto</span>
      </button>
    </header>
  )
}
