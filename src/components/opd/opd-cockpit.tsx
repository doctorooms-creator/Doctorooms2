'use client'

/**
 * OPD Cockpit — the orchestrator (03 §2 zone map).
 * One query (/api/opd/cockpit) feeds every zone. Day-state derivation,
 * actions (call / no-show / send-in / pause / start-Rx), keyboard map,
 * and the golden-window chart prefetch all live here.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { toast } from 'sonner'
import { AlertCircle, FileText } from 'lucide-react'
import { OpdTopBar } from './top-bar'
import { HeroPatientCard, type HeroAction } from './hero-patient-card'
import { ChartRail } from './chart-rail'
import { QueueStrip } from './queue-strip'
import { FactsStrip } from './facts-strip'
import { MorningState, BreakState, DayEndState, ReportsReturnState } from './day-states'
import { ReportsDialog } from './reports-dialog'
import { OpdSearch } from './search'
import { useOpdData, useInvalidateOpd, useOpdRealtimeNudge } from './use-opd-data'
import { useOpdKeyboard } from './use-keyboard'
import type { OpdCockpitData, OpdQueueItem } from './types'

/** OPD close-time threshold for day-end (IST); used only for display honesty. */
const IST_TZ = 'Asia/Kolkata'

function istNow(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: IST_TZ }))
}

function deriveDayState(data: OpdCockpitData): 'morning' | 'midday' | 'break' | 'day-end' | 'empty' {
  if (data.doctor.queuePaused) return 'break'
  if (data.currentServing) return 'midday'
  if (data.stats.waiting > 0) return 'morning'
  // Queue drained: day-end if any activity happened or it's late in the day
  const hour = istNow().getHours()
  if (data.stats.done > 0 || data.stats.noShows > 0 || hour >= 14) return 'day-end'
  return 'empty'
}

export function OpdCockpit() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const invalidate = useInvalidateOpd()
  const { data, isLoading, isError, error, refetch } = useOpdData()
  useOpdRealtimeNudge()

  const [searchOpen, setSearchOpen] = useState(false)
  const [reportsOpen, setReportsOpen] = useState(false)
  const [callPendingId, setCallPendingId] = useState<string | null>(null)
  const [noShowPendingId, setNoShowPendingId] = useState<string | null>(null)
  const [sendInPendingId, setSendInPendingId] = useState<string | null>(null)
  const [pausePending, setPausePending] = useState(false)
  const [exitArmed, setExitArmed] = useState(false)
  // Local echo of the cookie while the toggle round-trips.
  const [autoAdvance, setAutoAdvance] = useState<boolean | null>(null)

  // The authored swap fires once when arriving via auto-advance (?advanced=1)
  const justAdvanced = searchParams.get('advanced') === '1'
  useEffect(() => {
    if (justAdvanced) {
      void refetch() // fresh truth for the swapped-in patient
      // Clean the param without remounting
      window.history.replaceState({}, '', '/opd')
    }
  }, [justAdvanced])

  const dayState = useMemo(() => (data ? deriveDayState(data) : 'empty'), [data])

  // ── S7 reports-return: idle doctor + reports waiting + day still open →
  // reviewing reports IS the next action (03 §4 day-state table).
  const reportsReviewActive = useMemo(() => {
    if (!data || dayState !== 'day-end') return false
    if (data.reportsInbox.length === 0) return false
    const closeHour = parseInt((data.scope.closesAt || '14:00').split(':')[0], 10) || 14
    return istNow().getHours() < closeHour
  }, [data, dayState])

  // ── Core actions (all reuse existing APIs — no new server surfaces) ──

  const statusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const res = await fetch(`/api/dashboard/doctor/appointments/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || body?.success === false) {
        throw new Error(body?.error || 'Update failed')
      }
      return body
    },
    onMutate: ({ bookingId, status }) => {
      if (status === 'Visited') setCallPendingId(bookingId)
    },
    onSuccess: (_res, { status }) => {
      if (status === 'Visited') toast.success('Patient called — consultation started')
      if (status === 'NoShow') toast.success('Marked as no-show')
      invalidate()
    },
    onError: (err: Error) => toast.error(err.message || 'Could not update'),
    onSettled: () => {
      setCallPendingId(null)
      setNoShowPendingId(null)
      setSendInPendingId(null)
    },
  })

  const callPatient = useCallback(
    (bookingId: string) => {
      // Golden-window prefetch: warm the brief while the patient walks in.
      void queryClient.prefetchQuery({
        queryKey: ['opd-brief', bookingId],
        queryFn: async () => {
          const res = await fetch(`/api/copilot/brief/${bookingId}`)
          if (!res.ok) throw new Error('Brief unavailable')
          return res.json()
        },
        staleTime: 60_000,
      })
      statusMutation.mutate({ bookingId, status: 'Visited' })
    },
    [queryClient, statusMutation]
  )

  /** Phase C: auto-advance toggle — cookie v1 (server reads it in finalize). */
  const toggleAutoAdvance = useCallback(
    (on: boolean) => {
      document.cookie = `opd_autoadvance=${on ? 'on' : 'off'}; path=/; max-age=31536000; samesite=lax`
      setAutoAdvance(on)
      toast.success(
        on
          ? 'Auto-advance on — next patient is called when you Save & Print'
          : 'Auto-advance off — you call each patient manually'
      )
      invalidate()
    },
    [invalidate]
  )

  const effectiveAutoAdvance = autoAdvance ?? data?.autoAdvance ?? true

  const pauseMutation = useMutation({
    mutationFn: async (paused: boolean) => {
      const res = await fetch('/api/dashboard/doctor/queue-pause', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paused }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || body?.success !== true) throw new Error(body?.error || 'Pause failed')
      return body
    },
    onMutate: () => setPausePending(true),
    onSuccess: (_d, paused) => {
      toast.success(paused ? 'Queue paused — take your break' : 'Queue resumed')
      invalidate()
    },
    onError: (err: Error) => toast.error(err.message || 'Could not update pause'),
    onSettled: () => setPausePending(false),
  })

  const startRx = useCallback(
    (bookingId: string) => {
      router.push(`/dashboard/doctor/prescriptions/new?bookingId=${bookingId}&returnTo=/opd`)
    },
    [router]
  )

  // ── Hero derivation (the screen's heart decides what it is about) ──

  const current = data?.currentServing
    ? data.queue.find((q) => q.id === data.currentServing?.id) || null
    : null
  const nextUp = data?.queue.find((q) => q.status === 'Approve') || null

  const heroPatient: OpdQueueItem | null =
    dayState === 'midday' && current ? current : nextUp
  const heroMode: 'called' | 'next-up' | 'in-opd' | 'empty' =
    dayState === 'midday' && current ? 'in-opd' : nextUp ? 'next-up' : 'empty'

  const briefBookingId =
    dayState === 'midday' && current ? current.id : nextUp ? nextUp.id : null

  // Context line — real facts only (03 §3.2)
  const contextLine = useMemo(() => {
    if (!data || !heroPatient) return null
    const parts: string[] = []
    const b = data.queue.find((q) => q.id === heroPatient.id)
    if (b?.bookingType && b.bookingType !== 'By Self') parts.push(`booked ${b.bookingType.toLowerCase()}`)
    if (b?.timeSlot) parts.push(`slot ${b.timeSlot}`)
    const vi = data.reportsInbox.find((r) => r.patientName === heroPatient.patientName)
    if (vi) parts.push(`${vi.testName} report ready`)
    return parts.length ? parts.join(' · ') : null
  }, [data, heroPatient])

  const heroPrimary: HeroAction | null = (() => {
    if (!heroPatient) return null
    if (heroMode === 'in-opd') {
      return {
        label: 'Start Rx',
        title: 'Open the prescription wizard (Enter)',
        onRun: () => startRx(heroPatient.id),
      }
    }
    if (heroMode === 'next-up') {
      return {
        label: heroPatient.isEmergency
          ? `See ${heroPatient.patientName.split(' ')[0]} now`
          : `Call ${heroPatient.tokenNumber || heroPatient.patientName.split(' ')[0]}`,
        title: 'Call this patient in (Enter)',
        onRun: () => callPatient(heroPatient.id),
        pending: callPendingId === heroPatient.id,
      }
    }
    return null
  })()

  const heroSecondary: HeroAction | null =
    heroPatient && heroMode === 'next-up'
      ? {
          label: 'No-show',
          title: 'Mark as no-show (two-step)',
          onRun: () => statusMutation.mutate({ bookingId: heroPatient.id, status: 'NoShow' }),
          pending: noShowPendingId === heroPatient.id,
        }
      : null

  // ── Keyboard map (03 §5) ──
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useOpdKeyboard({
    onEnter: () => heroPrimary?.onRun(),
    onCallNext: () => {
      if (nextUp) callPatient(nextUp.id)
    },
    onTogglePause: () => {
      if (data) pauseMutation.mutate(!data.doctor.queuePaused)
    },
    onSearch: () => setSearchOpen(true),
    onEscape: () => {
      if (searchOpen) {
        setSearchOpen(false)
        return
      }
      if (exitArmed) {
        router.push('/dashboard/doctor')
        return
      }
      setExitArmed(true)
      exitTimer.current = setTimeout(() => setExitArmed(false), 2500)
    },
  })

  useEffect(() => () => {
    if (exitTimer.current) clearTimeout(exitTimer.current)
  }, [])

  // ── Render ──

  if (isError) {
    return (
      <div className="opd-root flex h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertCircle className="h-10 w-10" style={{ color: 'var(--opd-negative)' }} aria-hidden="true" />
        <div>
          <p className="text-[16px] font-semibold">Cockpit unavailable</p>
          <p className="mt-1 text-[13px]" style={{ color: 'var(--opd-muted)' }}>
            {error instanceof Error ? error.message : 'Something went wrong.'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="opd-press rounded-[var(--opd-radius-control)] px-4 py-2 text-[13px] font-semibold"
            style={{ background: 'var(--opd-primary)', color: 'var(--opd-primary-ink)' }}
          >
            Retry
          </button>
          <a
            href="/dashboard/doctor"
            className="opd-press rounded-[var(--opd-radius-control)] border px-4 py-2 text-[13px] font-medium"
            style={{ borderColor: 'var(--opd-control)', color: 'var(--opd-muted)' }}
          >
            Classic view still works →
          </a>
        </div>
      </div>
    )
  }

  if (isLoading || !data) return <CockpitSkeleton />

  const scopeLabel = [data.scope.hospitalName, data.scope.departmentName, data.scope.opdRoom]
    .filter(Boolean)
    .join(' · ')

  return (
    <MotionConfig reducedMotion="user">
      <div className="opd-root flex h-screen flex-col overflow-hidden">
      <OpdTopBar
        doctorName={data.doctor.name}
        specialization={data.doctor.specialization}
        scopeLabel={scopeLabel || null}
        queuePaused={data.doctor.queuePaused}
        onPauseToggle={() => pauseMutation.mutate(!data.doctor.queuePaused)}
        pausePending={pausePending}
        videoUpcoming={data.videoUpcoming}
        onSearchOpen={() => setSearchOpen(true)}
        autoAdvance={effectiveAutoAdvance}
        onAutoAdvanceToggle={toggleAutoAdvance}
      />

      {/* Esc-exit ladder: one press arms, second press leaves */}
      {exitArmed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed left-1/2 top-14 z-40 -translate-x-1/2 rounded-[var(--opd-radius-control)] border px-3.5 py-2 text-[12px] font-medium shadow-sm"
          style={{ background: 'var(--opd-surface)', borderColor: 'var(--opd-border)', color: 'var(--opd-muted)' }}
          role="status"
        >
          Press Esc again to leave the cockpit
        </motion.div>
      )}

      {/* Hero + rail grid — arithmetic: 1fr + 384px + 16px gap (03 §6) */}
      <div
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-[var(--opd-pad)] xl:flex-row xl:overflow-hidden"
        style={{ scrollbarGutter: 'stable' }}
      >
        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-4" aria-live="polite">
          <div className="relative flex min-h-[240px] flex-1 flex-col">
            {/* AnimatePresence mode="wait" — the authored swap sequence
                (02 §5.3): old card exits 180ms ease-in, THEN the new chart
                enters. Nothing else on screen moves during it. */}
            <AnimatePresence mode="wait" initial={false}>
              {dayState === 'morning' ? (
                <MorningState
                  key="morning"
                  data={data}
                  onPrimary={() => nextUp && callPatient(nextUp.id)}
                  primaryPending={callPendingId === nextUp?.id}
                  onReviewReports={data.reportsInbox.length > 0 ? () => setReportsOpen(true) : undefined}
                />
              ) : dayState === 'break' ? (
                <BreakState
                  key="break"
                  data={data}
                  onResume={() => pauseMutation.mutate(false)}
                  resumePending={pausePending}
                  onPrimary={() => pauseMutation.mutate(false)}
                />
              ) : dayState === 'day-end' && reportsReviewActive ? (
                <ReportsReturnState
                  key="reports-return"
                  data={data}
                  onReview={() => setReportsOpen(true)}
                  onDone={() => router.push('/dashboard/doctor')}
                />
              ) : dayState === 'day-end' ? (
                <DayEndState
                  key="day-end"
                  data={data}
                  onPrimary={() => router.push('/dashboard/doctor')}
                  onDone={() => router.push('/dashboard/doctor')}
                />
              ) : (
                <HeroPatientCard
                  key={heroPatient?.id || 'empty'}
                  patient={heroPatient}
                  mode={heroMode}
                  contextLine={contextLine}
                  primary={heroPrimary}
                  secondary={heroSecondary}
                  justAdvanced={justAdvanced}
                />
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Chart rail — right column ≥1280px; below that it collapses under hero */}
        <div className="w-full shrink-0 xl:w-[384px]">
          <ChartRail
            bookingId={briefBookingId}
            draftOpen={data.draftsOpen.some((d) => d.bookingId === briefBookingId)}
            idleSummary={{
              done: data.stats.done,
              waiting: data.stats.waiting,
              firstSlot: data.queue[0]?.timeSlot || null,
            }}
          />
        </div>
      </div>

      {/* Queue + facts — the bottom rail (mobile: drawer-ish stack) */}
      <div className="shrink-0 space-y-2 px-[var(--opd-pad)] pb-[var(--opd-pad)]">
        {/* S9 draft-resume strip — interrupted consults surface with one-tap
            resume (the wizard auto-opens the saved draft). */}
        <AnimatePresence initial={false}>
          {data.draftsOpen.length > 0 && (
            <motion.div
              key="drafts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 rounded-[var(--opd-radius-card)] border px-4 py-2"
              style={{ background: 'var(--opd-warn-bg)', borderColor: 'var(--opd-warn-border)' }}
              role="status"
            >
              <FileText className="h-4 w-4 shrink-0" style={{ color: 'var(--opd-warning)' }} aria-hidden="true" />
              <p className="min-w-0 flex-1 truncate text-[12px]" style={{ color: 'var(--opd-warn-ink)' }}>
                Interrupted consult — <span className="font-semibold">{data.draftsOpen[0].patientName}</span>, saved{' '}
                {new Date(data.draftsOpen[0].updatedAt).toLocaleTimeString('en-IN', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
                {data.draftsOpen.length > 1 && (
                  <span className="opd-num ml-1">· +{data.draftsOpen.length - 1} more</span>
                )}
              </p>
              <button
                onClick={() =>
                  router.push(
                    `/dashboard/doctor/prescriptions/new?bookingId=${data.draftsOpen[0].bookingId}&returnTo=/opd`
                  )
                }
                className="opd-press shrink-0 rounded-[var(--opd-radius-chip)] px-2.5 py-1 text-[12px] font-semibold"
                style={{ background: 'var(--opd-primary)', color: 'var(--opd-primary-ink)' }}
                title="Resume the saved draft — the wizard opens where you left off"
              >
                Resume
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <QueueStrip
          queue={data.queue}
          currentId={data.currentServing?.id || null}
          onNoShow={(id) => statusMutation.mutate({ bookingId: id, status: 'NoShow' })}
          noShowPendingId={noShowPendingId}
          onSendIn={(id) => statusMutation.mutate({ bookingId: id, status: 'Visited' })}
          sendInPendingId={sendInPendingId}
        />
        <FactsStrip
          stats={data.stats}
          pendingApprovals={data.pendingApprovals}
          reportsCount={data.reportsInbox.length}
          scope={data.scope}
          dateLabel={new Date(data.date + 'T12:00:00').toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          })}
          onReportsOpen={data.reportsInbox.length > 0 ? () => setReportsOpen(true) : undefined}
        />
      </div>

      <OpdSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ReportsDialog open={reportsOpen} onOpenChange={setReportsOpen} reports={data.reportsInbox} />
      </div>
    </MotionConfig>
  )
}

/** Full-page skeleton preserving zone geometry (02 §7 — no spinner over content). */
function CockpitSkeleton() {
  return (
    <div className="opd-root flex h-screen flex-col overflow-hidden">
      <div className="h-12 shrink-0 border-b" style={{ background: 'var(--opd-surface)', borderColor: 'var(--opd-rule)' }} />
      <div className="flex flex-1 flex-col gap-4 p-[var(--opd-pad)] xl:flex-row">
        <div className="flex-1 space-y-4">
          <div className="opd-skeleton h-52 rounded-[var(--opd-radius-card)]" />
          <div className="opd-skeleton h-24 rounded-[var(--opd-radius-card)]" />
        </div>
        <div className="hidden w-[384px] shrink-0 space-y-3 xl:block">
          <div className="opd-skeleton h-20 rounded-[var(--opd-radius-card)]" />
          <div className="opd-skeleton h-28 rounded-[var(--opd-radius-card)]" />
          <div className="opd-skeleton h-24 rounded-[var(--opd-radius-card)]" />
        </div>
      </div>
      <div className="space-y-2 p-[var(--opd-pad)]">
        <div className="opd-skeleton h-40 rounded-[var(--opd-radius-card)]" />
        <div className="opd-skeleton h-10 rounded-[var(--opd-radius-card)]" />
      </div>
    </div>
  )
}
