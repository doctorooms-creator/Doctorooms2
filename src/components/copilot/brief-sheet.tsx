'use client'

/**
 * Dr. Copilot — PRE-VISIT BRIEF SHEET (Call-Next hook, plan §API-5 consumer)
 *
 * Auto-opens when the doctor clicks "Call Next Patient". Renders the
 * deterministic brief from GET /api/copilot/brief/[bookingId] — every number
 * comes from the doctor-scoped repo, no LLM involved. The doctor scans this
 * in ~10 seconds while the patient walks in.
 *
 * Palette: teal/emerald/amber/rose only (no blue/indigo). Dark-mode variants.
 */

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  Siren,
  History,
  Pill,
  Activity,
  ClipboardList,
  CalendarClock,
  ArrowRight,
  Stethoscope,
  UserRound,
  TrendingUp,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface BriefResponse {
  booking: {
    id: string
    appointmentNo: string
    tokenNumber: string | null
    patientName: string
    disease: string | null
    description: string | null
    status: string
    isEmergency: boolean
    age: number | null
    gender: string | null
    bookingType: string
  }
  stats: { totalVisits: number; noShow: number; lastVisit: string | null } | null
  alerts: string[]
  lastVisit: {
    date: string
    appointmentNo: string
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

export function PreVisitBriefSheet({
  bookingId,
  onClose,
}: {
  bookingId: string | null
  onClose: () => void
}) {
  const open = !!bookingId

  const { data, isLoading, isError } = useQuery<BriefResponse>({
    queryKey: ['copilot-brief', bookingId],
    enabled: open,
    staleTime: 60_000,
    queryFn: async () => {
      const res = await fetch(`/api/copilot/brief/${bookingId}`)
      if (!res.ok) throw new Error('Brief not available')
      return res.json()
    },
  })

  const b = data?.booking

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-md copilot-scroll"
        aria-describedby={undefined}
      >
        {/* ── Header (teal gradient) ─────────────────────────────── */}
        <SheetHeader className="gap-0 border-b border-teal-100 bg-gradient-to-br from-teal-600 via-teal-600 to-emerald-600 p-5 text-white dark:border-teal-800 dark:from-teal-900 dark:via-teal-900 dark:to-emerald-950">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-50">
              Dr. Copilot · Pre-Visit Brief
            </p>
          </div>
          <SheetTitle asChild>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {isLoading || !b ? (
                <Skeleton className="h-7 w-40 bg-white/20" />
              ) : (
                <>
                  <span className="text-lg font-bold leading-tight">{b.patientName}</span>
                  {b.tokenNumber && (
                    <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-mono text-sm font-semibold">
                      {b.tokenNumber}
                    </span>
                  )}
                  {b.isEmergency && (
                    <Badge className="gap-1 border-0 bg-rose-500 text-[10px] font-bold uppercase tracking-wide text-white">
                      <Siren className="h-3 w-3" aria-hidden="true" /> Emergency
                    </Badge>
                  )}
                </>
              )}
            </div>
          </SheetTitle>
          <SheetDescription asChild>
            <p className="text-xs text-teal-100 dark:text-teal-200/80">
              {b ? (
                <>
                  {b.appointmentNo} · {b.bookingType} booking
                  {typeof b.age === 'number' && ` · ${b.age}y`}
                  {b.gender ? ` · ${b.gender}` : ''}
                </>
              ) : (
                'Loading patient snapshot…'
              )}
            </p>
          </SheetDescription>
        </SheetHeader>

        {/* ── Body ───────────────────────────────────────────────── */}
        <div className="flex-1 space-y-4 p-5">
          {isLoading && (
            <div className="space-y-4" aria-busy="true" aria-label="Loading brief">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-16 w-full" />
              </div>
              <Skeleton className="h-14 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-800 dark:bg-rose-950/30">
              <AlertTriangle className="h-6 w-6 text-rose-500" aria-hidden="true" />
              <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                Brief not available
              </p>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
                Could not load the pre-visit brief for this patient.
              </p>
            </div>
          )}

          {data && b && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Today's complaint */}
              <section aria-labelledby="brief-today">
                <h4 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Stethoscope className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                  <span id="brief-today">Today&apos;s Complaint</span>
                </h4>
                <div className="rounded-xl border border-teal-200/70 bg-teal-50/60 p-3.5 dark:border-teal-800/60 dark:bg-teal-950/30">
                  <p className="text-sm font-semibold text-teal-900 dark:text-teal-100">
                    {b.disease || 'Not stated'}
                  </p>
                  {b.description && (
                    <p className="mt-1 line-clamp-4 text-xs leading-relaxed text-teal-800/80 dark:text-teal-200/70">
                      “{b.description}”
                    </p>
                  )}
                </div>
              </section>

              {/* Alerts */}
              {data.alerts.length > 0 && (
                <section aria-labelledby="brief-alerts">
                  <h4 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                    <span id="brief-alerts">Alerts ({data.alerts.length})</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {data.alerts.map((a, i) => (
                      <li
                        key={i}
                        className={cn(
                          'flex items-start gap-2 rounded-lg border p-2.5 text-xs font-medium',
                          a.startsWith('EMERGENCY')
                            ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                            : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                        )}
                      >
                        <span aria-hidden="true">⚠</span>
                        <span className="leading-snug">{a}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* History snapshot */}
              {data.stats && (
                <section aria-labelledby="brief-history">
                  <h4 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <History className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <span id="brief-history">History With You</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-border bg-card p-2.5 text-center">
                      <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                        {data.stats.totalVisits}
                      </p>
                      <p className="text-[10px] leading-none text-muted-foreground">Past visits</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-2.5 text-center">
                      <p
                        className={cn(
                          'text-lg font-bold',
                          data.stats.noShow >= 2
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-amber-700 dark:text-amber-300'
                        )}
                      >
                        {data.stats.noShow}
                      </p>
                      <p className="text-[10px] leading-none text-muted-foreground">No-shows</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-2.5 text-center">
                      <p className="text-sm font-bold leading-7 text-muted-foreground">
                        {data.stats.lastVisit || '—'}
                      </p>
                      <p className="text-[10px] leading-none text-muted-foreground">Last visit</p>
                    </div>
                  </div>
                </section>
              )}

              {/* Last visit details */}
              {data.lastVisit ? (
                <section aria-labelledby="brief-last">
                  <h4 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <ClipboardList className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                    <span id="brief-last">Last Visit — {data.lastVisit.date}</span>
                  </h4>
                  <div className="space-y-2.5 rounded-xl border border-border bg-card p-3.5">
                    {data.lastVisit.diagnosis && (
                      <p className="text-xs text-muted-foreground">
                        Diagnosis:{' '}
                        <span className="font-semibold text-foreground">
                          {data.lastVisit.diagnosis}
                        </span>
                      </p>
                    )}

                    {data.lastVisit.medicines.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Pill className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                        <div className="flex flex-wrap gap-1">
                          {data.lastVisit.medicines.map((m, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-800 dark:bg-teal-900/40 dark:text-teal-200"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(data.lastVisit.bp || data.lastVisit.weight || data.lastVisit.temperature) && (
                      <div className="flex items-start gap-2">
                        <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {data.lastVisit.bp && (
                            <span>BP <b className="text-foreground">{data.lastVisit.bp}</b></span>
                          )}
                          {data.lastVisit.weight && (
                            <span>Wt <b className="text-foreground">{data.lastVisit.weight}kg</b></span>
                          )}
                          {data.lastVisit.temperature && (
                            <span>Temp <b className="text-foreground">{data.lastVisit.temperature}</b></span>
                          )}
                        </div>
                      </div>
                    )}

                    {data.lastVisit.notes && (
                      <p className="border-l-2 border-border pl-2.5 text-xs italic leading-relaxed text-muted-foreground">
                        “{data.lastVisit.notes}”
                      </p>
                    )}

                    {data.lastVisit.nextVisitDue && (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarClock className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                        Follow-up was due:{' '}
                        <b className="text-foreground">{data.lastVisit.nextVisitDue}</b>
                      </p>
                    )}
                  </div>
                </section>
              ) : (
                <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 p-3.5 dark:border-emerald-800 dark:bg-emerald-950/20">
                  <UserRound className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    <b>First visit</b> with this doctor — no past records to lean on.
                  </p>
                </div>
              )}

              {/* Vitals trend */}
              {data.vitalsTrend.length >= 2 && (
                <section aria-labelledby="brief-trend">
                  <h4 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <span id="brief-trend">Vitals Trend</span>
                  </h4>
                  <div className="flex items-stretch gap-1.5">
                    {data.vitalsTrend.map((v, i) => (
                      <div
                        key={v.date}
                        className={cn(
                          'flex-1 rounded-lg border p-2 text-center',
                          i === data.vitalsTrend.length - 1
                            ? 'border-teal-300 bg-teal-50 dark:border-teal-700 dark:bg-teal-950/40'
                            : 'border-border bg-card'
                        )}
                      >
                        <p className="text-[10px] text-muted-foreground">{v.date.slice(5)}</p>
                        <p className="mt-0.5 text-xs font-bold text-foreground">{v.bp || '—'}</p>
                        <p className="text-[10px] text-muted-foreground">{v.weight ? `${v.weight}kg` : '—'}</p>
                      </div>
                    ))}
                    <div className="flex items-center px-1 text-muted-foreground" aria-hidden="true">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </section>
              )}
            </motion.div>
          )}
        </div>

        {/* ── Footer CTA ─────────────────────────────────────────── */}
        {b && (
          <div className="sticky bottom-0 mt-auto border-t border-border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="flex gap-2">
              <Button asChild className="flex-1 bg-teal-600 font-semibold hover:bg-teal-700">
                <Link href={`/dashboard/doctor/prescriptions/new?bookingId=${b.id}`}>
                  <ClipboardList className="h-4 w-4" aria-hidden="true" />
                  Start Prescription
                </Link>
              </Button>
              <Button variant="outline" onClick={onClose} className="border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-300 dark:hover:bg-teal-950/40">
                Dismiss
              </Button>
            </div>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              AI-assisted brief · data visible only from your own practice
            </p>
          </div>
        )}

        {isLoading && (
          <div className="mt-auto flex items-center justify-center gap-2 border-t border-border p-4 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Preparing brief…
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
