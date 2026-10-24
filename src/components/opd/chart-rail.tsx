'use client'

/**
 * Chart rail (384px, ≥1280px) — the pre-loaded brief (03 §3.3).
 * Data: /api/copilot/brief/[bookingId] (doctor-scoped, deterministic).
 * Doctor reads this during the golden window while the patient walks in.
 */

import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { SpinnerDot } from './hero-patient-card'

interface BriefData {
  booking: {
    id: string
    patientName: string
    disease: string
    description: string | null
    age: number | null
    gender: string | null
  }
  stats: { totalVisits: number; noShow: number; lastVisit: string | null } | null
  alerts: string[]
  lastVisit: {
    date: string
    diagnosis: string | null
    medicines: string[]
    bp: string | null
    weight: string | null
    temperature: string | null
    notes: string | null
    nextVisitDue: string | null
  } | null
  vitalsTrend: { date: string; bp: string | null; weight: string | null }[]
}

interface ChartRailProps {
  bookingId: string | null
  /** Idle content when nobody is called: today-at-a-glance line. */
  idleSummary?: { done: number; waiting: number; firstSlot: string | null } | null
}

export function ChartRail({ bookingId, idleSummary }: ChartRailProps) {
  // Prefetch-on-call already happens in the orchestrator; this renders it.
  const { data, isLoading, isError } = useQuery<BriefData>({
    queryKey: ['opd-brief', bookingId],
    queryFn: async () => {
      const res = await fetch(`/api/copilot/brief/${bookingId}`)
      if (!res.ok) throw new Error('Brief unavailable')
      return res.json()
    },
    enabled: Boolean(bookingId),
    staleTime: 60_000,
    retry: 1,
  })

  useEffect(() => {
    // Keep the doc honest when the patient changes.
    if (!bookingId) return
  }, [bookingId])

  return (
    <aside
      className="flex flex-col gap-3 overflow-y-auto"
      style={{ scrollbarGutter: 'stable' }}
      aria-label="Patient chart"
    >
      {!bookingId && <RailIdle summary={idleSummary} />}

      {bookingId && isLoading && <RailSkeleton />}

      {bookingId && isError && (
        <RailCard title="Chart">
          <p className="text-[12px]" style={{ color: 'var(--opd-muted)' }}>
            History unavailable right now — the consultation continues.
          </p>
          <button
            className="opd-press mt-2 rounded-[var(--opd-radius-chip)] border px-2 py-1 text-[12px] font-medium"
            style={{ borderColor: 'var(--opd-control)', color: 'var(--opd-muted)' }}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </RailCard>
      )}

      {bookingId && data && (
        <>
          {/* Alerts — one red-family mark max (02 §4) */}
          {data.alerts.filter((a) => a.includes('EMERGENCY')).length > 0 && (
            <RailCard tone="warn">
              {data.alerts
                .filter((a) => a.includes('EMERGENCY'))
                .map((a) => (
                  <p key={a} className="text-[12px] font-medium">
                    {a}
                  </p>
                ))}
            </RailCard>
          )}

          {/* Today's complaint (reception-noted) */}
          <RailCard title="Today's complaint">
            <p className="text-[13px]" style={{ color: 'var(--opd-text)' }}>
              {data.booking.disease || 'Not noted'}
            </p>
            {data.booking.description && (
              <p className="mt-1 text-[12px]" style={{ color: 'var(--opd-muted)' }}>
                {data.booking.description}
              </p>
            )}
          </RailCard>

          {/* Visit stats */}
          <RailCard title="History with you">
            <div className="opd-num flex items-baseline gap-4 text-[12px]" style={{ color: 'var(--opd-muted)' }}>
              <span>
                <span className="text-[16px] font-semibold" style={{ color: 'var(--opd-text)' }}>
                  {data.stats?.totalVisits ?? 0}
                </span>{' '}
                past visits
              </span>
              {data.stats?.lastVisit && <span>last {data.stats.lastVisit}</span>}
              {data.stats && data.stats.noShow >= 2 && (
                <span style={{ color: 'var(--opd-negative)' }}>{data.stats.noShow} no-shows</span>
              )}
            </div>
          </RailCard>

          {/* Last visit Rx */}
          {data.lastVisit ? (
            <RailCard title={`Last visit — ${data.lastVisit.date}`}>
              {data.lastVisit.diagnosis && (
                <p className="text-[13px] font-medium" style={{ color: 'var(--opd-text)' }}>
                  {data.lastVisit.diagnosis}
                </p>
              )}
              {data.lastVisit.medicines.length > 0 ? (
                <ul className="mt-1.5 space-y-1">
                  {data.lastVisit.medicines.slice(0, 3).map((m) => (
                    <li key={m} className="text-[12px]" style={{ color: 'var(--opd-muted)' }}>
                      {m}
                    </li>
                  ))}
                  {data.lastVisit.medicines.length > 3 && (
                    <li className="text-[11px]" style={{ color: 'var(--opd-faint)' }}>
                      +{data.lastVisit.medicines.length - 3} more
                    </li>
                  )}
                </ul>
              ) : (
                <p className="mt-1 text-[12px]" style={{ color: 'var(--opd-faint)' }}>
                  No prescription recorded
                </p>
              )}
              {(data.lastVisit.bp || data.lastVisit.weight) && (
                <p className="opd-num mt-2 text-[11px]" style={{ color: 'var(--opd-faint)' }}>
                  {[data.lastVisit.bp && `BP ${data.lastVisit.bp}`, data.lastVisit.weight && `Wt ${data.lastVisit.weight}`]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
              {data.lastVisit.nextVisitDue && (
                <p className="mt-1.5 text-[11px]" style={{ color: 'var(--opd-warning)' }}>
                  Follow-up was due {data.lastVisit.nextVisitDue}
                </p>
              )}
            </RailCard>
          ) : (
            <RailCard title="Last visit">
              <p className="text-[12px]" style={{ color: 'var(--opd-muted)' }}>
                First visit with you — no history to lean on.
              </p>
            </RailCard>
          )}

          {/* Vitals trend — flat line, no chrome, no legend (02 §4) */}
          {data.vitalsTrend.length >= 2 && <VitalsTrend trend={data.vitalsTrend} />}

          {/* Other alerts (non-emergency) */}
          {data.alerts
            .filter((a) => !a.includes('EMERGENCY'))
            .filter((a) => !a.includes('First visit'))
            .length > 0 && (
            <RailCard title="Notes for this visit">
              {data.alerts
                .filter((a) => !a.includes('EMERGENCY'))
                .filter((a) => !a.includes('First visit'))
                .map((a) => (
                  <p key={a} className="text-[12px]" style={{ color: 'var(--opd-muted)' }}>
                    {a}
                  </p>
                ))}
            </RailCard>
          )}
        </>
      )}
    </aside>
  )
}

function RailCard({
  title,
  children,
  tone,
}: {
  title?: string
  children: React.ReactNode
  tone?: 'warn'
}) {
  return (
    <section
      className="rounded-[var(--opd-radius-card)] border p-3.5"
      style={{
        background: tone === 'warn' ? 'var(--opd-warn-bg)' : 'var(--opd-surface)',
        borderColor: tone === 'warn' ? 'var(--opd-warn-border)' : 'var(--opd-border)',
        color: tone === 'warn' ? 'var(--opd-warn-ink)' : undefined,
      }}
    >
      {title && (
        <h2 className="mb-1.5 text-[11px] font-medium" style={{ color: 'var(--opd-faint)' }}>
          {title}
        </h2>
      )}
      {children}
    </section>
  )
}

function VitalsTrend({ trend }: { trend: { date: string; bp: string | null; weight: string | null }[] }) {
  // BP as the trend line: systolic parsed from "120/80" style values.
  const pts = trend
    .map((t) => {
      const sys = t.bp ? parseInt(t.bp.split('/')[0], 10) : null
      return { date: t.date, sys, weight: t.weight ? parseFloat(t.weight) : null }
    })
    .filter((p) => p.sys || p.weight)

  const bpPts = pts.filter((p) => p.sys)
  const last = trend[trend.length - 1]

  return (
    <RailCard title="Vitals trend">
      <svg viewBox="0 0 320 44" className="h-[44px] w-full" role="img" aria-label={`Blood pressure trend across ${bpPts.length} visits`}>
        {bpPts.length >= 2 &&
          (() => {
            const vals = bpPts.map((p) => p.sys as number)
            const min = Math.min(...vals) - 6
            const max = Math.max(...vals) + 6
            const span = Math.max(1, max - min)
            const x = (i: number) => 4 + (i * 312) / (bpPts.length - 1)
            const y = (v: number) => 40 - ((v - min) / span) * 34
            const d = bpPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.sys as number)}`).join(' ')
            return (
              <>
                <path d={d} fill="none" stroke="var(--opd-accent)" strokeWidth="1.8" strokeLinecap="round" />
                {bpPts.map((p, i) => (
                  <circle key={p.date} cx={x(i)} cy={y(p.sys as number)} r="2.6" fill="var(--opd-accent)" />
                ))}
              </>
            )
          })()}
        {bpPts.length === 1 && (
          <text x="4" y="26" fontSize="11" fill="var(--opd-muted)">
            {bpPts[0].sys} systolic — single reading
          </text>
        )}
      </svg>
      <p className="opd-num mt-1 text-[11px]" style={{ color: 'var(--opd-faint)' }}>
        {last?.bp && `BP ${last.bp}`}
        {last?.bp && last?.weight ? ' · ' : ''}
        {last?.weight && `Wt ${last.weight}kg`}
        <span className="ml-1">across {trend.length} visits</span>
      </p>
    </RailCard>
  )
}

function RailIdle({ summary }: { summary: { done: number; waiting: number; firstSlot: string | null } | null }) {
  return (
    <RailCard title="Today at a glance">
      {summary ? (
        <div className="opd-num space-y-1 text-[12px]" style={{ color: 'var(--opd-muted)' }}>
          <p>
            <span className="text-[16px] font-semibold" style={{ color: 'var(--opd-text)' }}>
              {summary.done}
            </span>{' '}
            done · {summary.waiting} waiting
          </p>
          {summary.firstSlot && <p>First slot {summary.firstSlot}</p>}
          <p style={{ color: 'var(--opd-faint)' }}>Call a patient and their chart appears here.</p>
        </div>
      ) : (
        <p className="text-[12px]" style={{ color: 'var(--opd-muted)' }}>
          Call a patient and their chart appears here.
        </p>
      )}
    </RailCard>
  )
}

function RailSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="opd-skeleton rounded-[var(--opd-radius-card)] border p-3.5"
          style={{ borderColor: 'var(--opd-border)', height: i === 0 ? 72 : 96 }}
        />
      ))}
    </div>
  )
}

export function RailSpinner() {
  return <SpinnerDot />
}
