'use client'

/**
 * Chart rail (384px, ≥1280px) — the pre-loaded brief (03 §3.3).
 * Data: /api/copilot/brief/[bookingId] (doctor-scoped, deterministic).
 * Doctor reads this during the golden window while the patient walks in.
 *
 * Phase D depth (04 §2.5): allergy flag + capture (settingsJson v1),
 * pulse/SpO₂ alongside the BP trend, this patient's recent reports with
 * values/abnormal flags/deltas, and the "Repeat last Rx" suggestion —
 * suggest + one tap into a reviewable draft, never auto-execute (D5).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { SpinnerDot } from './hero-patient-card'

interface BriefReportItem {
  id: string
  testName: string
  date: string
  value: string | null
  unit: string | null
  flag: 'normal' | 'abnormal' | null
  previousValue: string | null
  previousDate: string | null
}

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
  allergies: string | null
  alerts: string[]
  lastVisit: {
    date: string
    diagnosis: string | null
    medicines: string[]
    bp: string | null
    weight: string | null
    temperature: string | null
    pulse: string | null
    spo2: string | null
    notes: string | null
    nextVisitDue: string | null
  } | null
  vitalsTrend: { date: string; bp: string | null; weight: string | null; pulse: string | null; spo2: string | null }[]
  reports: BriefReportItem[]
  repeatRx: { eligible: boolean; reason: string | null }
}

interface ChartRailProps {
  bookingId: string | null
  /** Idle content when nobody is called: today-at-a-glance line. */
  idleSummary?: { done: number; waiting: number; firstSlot: string | null } | null
  /** True when an interrupted Draft exists for THIS booking (hides the repeat chip). */
  draftOpen?: boolean
}

export function ChartRail({ bookingId, idleSummary, draftOpen = false }: ChartRailProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

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

  // ── Allergy capture (settingsJson v1) — quiet inline, saves on its own ──
  const [allergyEditing, setAllergyEditing] = useState(false)
  const [allergyDraft, setAllergyDraft] = useState('')
  useEffect(() => {
    // New patient walks in → the editor resets.
    setAllergyEditing(false)
    setAllergyDraft('')
  }, [bookingId])

  const allergySave = useMutation({
    mutationFn: async (value: string) => {
      const res = await fetch('/api/opd/allergies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, allergies: value }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || 'Could not save')
      return body as { allergies: string | null }
    },
    onSuccess: (res) => {
      toast.success(res.allergies ? 'Allergy noted — it shows on every future visit' : 'Allergy cleared')
      setAllergyEditing(false)
      void queryClient.invalidateQueries({ queryKey: ['opd-brief', bookingId] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // ── Repeat last Rx — clone into a reviewable draft, then open the wizard ──
  const repeatRx = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/opd/repeat-rx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || 'Could not create the repeat draft')
      return body as { prescriptionId: string; created: boolean; medicineCount: number | null }
    },
    onSuccess: (res) => {
      if (!res.created) {
        toast.info('A draft already exists for this consult — opening it')
      } else if (res.medicineCount) {
        toast.success(`${res.medicineCount} medicines copied into a reviewable draft`)
      }
      router.push(`/dashboard/doctor/prescriptions/new?bookingId=${bookingId}&returnTo=/opd`)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const hasAllergy = Boolean(data?.allergies)

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
        <motion.div
          key={bookingId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.16 }}
          className="flex flex-col gap-3"
        >
          {/* Allergies — THE safety flag. The rail's one red-family mark. */}
          {hasAllergy ? (
            <section
              className="rounded-[var(--opd-radius-card)] border p-3.5"
              style={{ background: 'var(--opd-neg-bg)', borderColor: 'var(--opd-neg-ink)', color: 'var(--opd-neg-ink)' }}
              aria-label="Allergies"
            >
              <h2 className="mb-1 text-[11px] font-semibold uppercase">Allergies</h2>
              <p className="text-[13px] font-semibold">{data.allergies}</p>
              <p className="mt-0.5 text-[11px] opacity-80">Verify before prescribing</p>
            </section>
          ) : (
            !allergyEditing && (
              <button
                onClick={() => {
                  setAllergyDraft('')
                  setAllergyEditing(true)
                }}
                className="opd-press flex items-center justify-between rounded-[var(--opd-radius-card)] border border-dashed px-3.5 py-2.5 text-left"
                style={{ borderColor: 'var(--opd-control)', color: 'var(--opd-muted)' }}
                title="Record known drug allergies — they persist on the chart"
              >
                <span className="text-[12px]">No allergies on file</span>
                <span className="text-[11px] font-medium" style={{ color: 'var(--opd-faint)' }}>
                  Note one →
                </span>
              </button>
            )
          )}
          {allergyEditing && (
            <section
              className="rounded-[var(--opd-radius-card)] border p-3.5"
              style={{ background: 'var(--opd-surface)', borderColor: 'var(--opd-control)' }}
            >
              <h2 className="mb-1.5 text-[11px] font-medium" style={{ color: 'var(--opd-faint)' }}>
                Drug allergies
              </h2>
              <input
                autoFocus
                value={allergyDraft}
                onChange={(e) => setAllergyDraft(e.target.value)}
                placeholder="e.g. Penicillin, Sulfa drugs"
                maxLength={200}
                className="opd-searchinput w-full rounded-[var(--opd-radius-control)] border px-2.5 py-1.5 text-[13px] outline-none"
                style={{ borderColor: 'var(--opd-control)', color: 'var(--opd-text)', background: 'var(--opd-surface)' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && allergyDraft.trim()) allergySave.mutate(allergyDraft)
                  if (e.key === 'Escape') setAllergyEditing(false)
                }}
              />
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => allergyDraft.trim() && allergySave.mutate(allergyDraft)}
                  disabled={!allergyDraft.trim() || allergySave.isPending}
                  className="opd-press rounded-[var(--opd-radius-chip)] px-2.5 py-1 text-[12px] font-semibold"
                  style={{ background: 'var(--opd-primary)', color: 'var(--opd-primary-ink)' }}
                >
                  {allergySave.isPending ? <SpinnerDot /> : 'Save'}
                </button>
                <button
                  onClick={() => setAllergyEditing(false)}
                  className="opd-press rounded-[var(--opd-radius-chip)] border px-2.5 py-1 text-[12px] font-medium"
                  style={{ borderColor: 'var(--opd-control)', color: 'var(--opd-muted)' }}
                >
                  Cancel
                </button>
                <span className="ml-auto text-[11px]" style={{ color: 'var(--opd-faint)' }}>
                  ⏎ save · Esc cancel
                </span>
              </div>
            </section>
          )}

          {/* Emergency alert — amber family (red is reserved for allergies) */}
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
              {(data.lastVisit.bp || data.lastVisit.weight || data.lastVisit.pulse || data.lastVisit.spo2) && (
                <p className="opd-num mt-2 text-[11px]" style={{ color: 'var(--opd-faint)' }}>
                  {[
                    data.lastVisit.bp && `BP ${data.lastVisit.bp}`,
                    data.lastVisit.pulse && `Pulse ${data.lastVisit.pulse}`,
                    data.lastVisit.spo2 && `SpO₂ ${data.lastVisit.spo2}%`,
                    data.lastVisit.weight && `Wt ${data.lastVisit.weight}`,
                  ]
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

          {/* Repeat-last-Rx suggestion (D5: suggest + one tap, never auto-execute) */}
          {data.repeatRx.eligible && !draftOpen && data.lastVisit && data.lastVisit.medicines.length > 0 && (
            <section
              className="rounded-[var(--opd-radius-card)] border p-3.5"
              style={{ background: 'var(--opd-accent-pale)', borderColor: 'var(--opd-accent)', color: 'var(--opd-text)' }}
              aria-label="Repeat last prescription suggestion"
            >
              <h2 className="mb-1 text-[11px] font-medium" style={{ color: 'var(--opd-accent-deep)' }}>
                Repeat last Rx?
              </h2>
              <p className="text-[12px]" style={{ color: 'var(--opd-muted)' }}>
                {data.repeatRx.reason} — {data.lastVisit.medicines.length}{' '}
                {data.lastVisit.medicines.length === 1 ? 'medicine' : 'medicines'} from {data.lastVisit.date}.
              </p>
              <button
                onClick={() => repeatRx.mutate()}
                disabled={repeatRx.isPending}
                className="opd-press mt-2 flex h-8 items-center gap-2 rounded-[var(--opd-radius-control)] px-3 text-[12px] font-semibold"
                style={{ background: 'var(--opd-primary)', color: 'var(--opd-primary-ink)' }}
                title="Copies the last prescription into a reviewable draft — you confirm everything before printing"
              >
                {repeatRx.isPending ? (
                  <>
                    <SpinnerDot /> Copying…
                  </>
                ) : (
                  "Repeat into today's Rx →"
                )}
              </button>
              <p className="mt-1.5 text-[11px]" style={{ color: 'var(--opd-faint)' }}>
                Creates a draft you review — nothing prints without you.
              </p>
            </section>
          )}

          {/* This patient's recent reports — values, flags, deltas */}
          {data.reports.length > 0 && (
            <RailCard title="Reports — this patient">
              <ul className="space-y-2">
                {data.reports.map((r) => (
                  <li key={r.id} className="text-[12px]">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-medium" style={{ color: 'var(--opd-text)' }}>
                        {r.testName}
                      </span>
                      <span className="opd-num shrink-0 font-semibold" style={{ color: 'var(--opd-text)' }}>
                        {r.value ?? '—'}
                        {r.unit ? <span style={{ color: 'var(--opd-faint)' }}> {r.unit}</span> : null}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      {r.flag === 'abnormal' ? (
                        <span
                          className="rounded-[var(--opd-radius-chip)] px-1.5 py-px text-[10px] font-semibold"
                          style={{ background: 'var(--opd-neg-bg)', color: 'var(--opd-neg-ink)' }}
                        >
                          ABNORMAL
                        </span>
                      ) : (
                        <span className="text-[11px]" style={{ color: 'var(--opd-faint)' }}>
                          {r.date}
                        </span>
                      )}
                      {r.previousValue && (
                        <span className="opd-num truncate text-[11px]" style={{ color: 'var(--opd-muted)' }}>
                          was {r.previousValue}
                          {r.previousDate ? ` (${r.previousDate.slice(5)})` : ''}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <a
                href={`/print/lab-report/${data.reports[0].id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="opd-press mt-2 inline-block text-[11px] font-medium"
                style={{ color: 'var(--opd-accent-deep)' }}
                title="Open the full report"
              >
                Full report →
              </a>
            </RailCard>
          )}

          {/* Vitals trend — flat line, no chrome, no legend (02 §4) */}
          {data.vitalsTrend.length >= 2 && <VitalsTrend trend={data.vitalsTrend} />}

          {/* Other alerts (non-emergency, non-allergy) */}
          {data.alerts
            .filter((a) => !a.includes('EMERGENCY'))
            .filter((a) => !a.startsWith('Allergies:'))
            .filter((a) => !a.includes('First visit'))
            .length > 0 && (
            <RailCard title="Notes for this visit">
              {data.alerts
                .filter((a) => !a.includes('EMERGENCY'))
                .filter((a) => !a.startsWith('Allergies:'))
                .filter((a) => !a.includes('First visit'))
                .map((a) => (
                  <p key={a} className="text-[12px]" style={{ color: 'var(--opd-muted)' }}>
                    {a}
                  </p>
                ))}
            </RailCard>
          )}
        </motion.div>
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

function VitalsTrend({
  trend,
}: {
  trend: { date: string; bp: string | null; weight: string | null; pulse: string | null; spo2: string | null }[]
}) {
  // BP as the trend line: systolic parsed from "120/80" style values.
  const pts = trend
    .map((t) => {
      const sys = t.bp ? parseInt(t.bp.split('/')[0], 10) : null
      return {
        date: t.date,
        sys,
        weight: t.weight ? parseFloat(t.weight) : null,
        pulse: t.pulse ? parseFloat(t.pulse) : null,
        spo2: t.spo2 ? parseFloat(t.spo2) : null,
      }
    })
    .filter((p) => p.sys || p.weight || p.pulse || p.spo2)

  const bpPts = pts.filter((p) => p.sys)
  const last = pts[pts.length - 1]
  const prev = pts[pts.length - 2]

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

      {/* Pulse / SpO₂ — latest with the change vs the previous visit, neutral
          ink (direction semantics are clinical, not universal). */}
      {(last?.pulse || last?.spo2) && (
        <p className="opd-num mt-1.5 text-[11px]" style={{ color: 'var(--opd-muted)' }}>
          {last.pulse && (
            <>
              Pulse{' '}
              {prev?.pulse && prev.pulse !== last.pulse ? (
                <span>
                  {prev.pulse} → <span style={{ color: 'var(--opd-text)' }}>{last.pulse}</span>
                </span>
              ) : (
                <span style={{ color: 'var(--opd-text)' }}>{last.pulse}</span>
              )}
            </>
          )}
          {last.pulse && last.spo2 ? ' · ' : ''}
          {last.spo2 && (
            <>
              SpO₂{' '}
              {prev?.spo2 && prev.spo2 !== last.spo2 ? (
                <span>
                  {prev.spo2}% → <span style={{ color: 'var(--opd-text)' }}>{last.spo2}%</span>
                </span>
              ) : (
                <span style={{ color: 'var(--opd-text)' }}>{last.spo2}%</span>
              )}
            </>
          )}
        </p>
      )}

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
