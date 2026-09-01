'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BedDouble,
  CalendarCheck,
  FlaskConical,
  GitCommitVertical,
  History,
  LogOut,
  Pill,
  RefreshCw,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

type EventType = 'appointment' | 'prescription' | 'lab_report' | 'ipd_admission'

interface TimelineEvent {
  id: string
  type: EventType
  title: string
  description: string
  date: string
  status: string
}

interface MedicalHistoryData {
  events: TimelineEvent[]
  summary: {
    total: number
    appointments: number
    prescriptions: number
    labReports: number
    admissions: number
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Config — filters, per-type dots/icons, status colors
// ──────────────────────────────────────────────────────────────────────────

type FilterKey = 'all' | EventType

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'appointment', label: 'Appointments' },
  { key: 'prescription', label: 'Prescriptions' },
  { key: 'lab_report', label: 'Lab Reports' },
  { key: 'ipd_admission', label: 'Hospital Stays' },
]

const TYPE_CONFIG: Record<
  EventType,
  { icon: typeof CalendarCheck; label: string; dot: string }
> = {
  appointment: {
    icon: CalendarCheck,
    label: 'Appointment',
    dot: 'bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-300',
  },
  prescription: {
    icon: Pill,
    label: 'Prescription',
    dot: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300',
  },
  lab_report: {
    icon: FlaskConical,
    label: 'Lab Report',
    dot: 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-300',
  },
  ipd_admission: {
    icon: BedDouble,
    label: 'Hospital Stay',
    dot: 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300',
  },
}

// Status → badge color. Completed/Verified/Discharged (and their siblings
// Visited/Dispensed) = emerald · Confirmed/Admitted (+ Approve/Active) = teal ·
// Pending/Ordered (+ in-progress lab states, Packed) = amber ·
// Canceled/Rejected = rose · everything else = secondary.
const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400',
  verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400',
  discharged: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400',
  dispensed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400',
  visited: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400',
  confirmed: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400',
  admitted: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400',
  approve: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400',
  active: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
  ordered: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
  samplecollected: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
  resultentered: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
  packed: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
  canceled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400',
  cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400',
  rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400',
}

// Friendlier display labels for a few raw API statuses.
const STATUS_LABELS: Record<string, string> = {
  approve: 'Approved',
  samplecollected: 'Sample Collected',
  resultentered: 'Result Entered',
}

function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase()

  // Discharged hospital stays get the emerald LogOut badge.
  if (key === 'discharged') {
    return (
      <Badge className="gap-1 border-0 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-400">
        <LogOut className="h-3 w-3" />
        Discharged
      </Badge>
    )
  }

  const cls = STATUS_STYLES[key]
  if (cls) {
    return (
      <Badge className={cn('border-0 hover:opacity-90', cls)}>
        {STATUS_LABELS[key] || status}
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="border-0">
      {status}
    </Badge>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────

export default function MedicalHistoryClient() {
  const [filter, setFilter] = useState<FilterKey>('all')

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<MedicalHistoryData>({
    queryKey: ['patient-medical-history'],
    queryFn: () => fetch('/api/patient/medical-history').then((r) => r.json()),
  })

  const events = data?.events || []
  const summary = data?.summary

  const filteredEvents = useMemo(
    () => (filter === 'all' ? events : events.filter((e) => e.type === filter)),
    [events, filter]
  )

  const filterCounts = useMemo(() => {
    const counts: Record<FilterKey, number> = {
      all: events.length,
      appointment: 0,
      prescription: 0,
      lab_report: 0,
      ipd_admission: 0,
    }
    for (const e of events) counts[e.type] = (counts[e.type] || 0) + 1
    return counts
  }, [events])

  const statCards = [
    {
      label: 'Total Events',
      value: summary?.total ?? 0,
      icon: History,
      circle: 'bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-300',
      accent: 'from-teal-400 to-teal-600',
    },
    {
      label: 'Appointments',
      value: summary?.appointments ?? 0,
      icon: CalendarCheck,
      circle: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300',
      accent: 'from-amber-400 to-amber-600',
    },
    {
      label: 'Prescriptions',
      value: summary?.prescriptions ?? 0,
      icon: Pill,
      circle: 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-300',
      accent: 'from-violet-400 to-violet-600',
    },
    {
      label: 'Lab Reports',
      value: summary?.labReports ?? 0,
      icon: FlaskConical,
      circle: 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300',
      accent: 'from-rose-400 to-rose-600',
    },
    {
      label: 'Hospital Stays',
      value: summary?.admissions ?? 0,
      icon: BedDouble,
      circle: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300',
      accent: 'from-emerald-400 to-emerald-600',
    },
  ]

  const formatDate = (value: string) => {
    try {
      return format(new Date(value), 'dd MMM yyyy')
    } catch {
      return value
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/20">
          <History className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Medical History</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Your complete care journey in one timeline
          </p>
        </div>
      </div>

      {isLoading ? (
        <MedicalHistorySkeleton />
      ) : isError ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Could not load your medical history.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Summary stat cards ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {statCards.map((card) => {
              const Icon = card.icon
              return (
                <Card key={card.label} className="min-w-0 overflow-hidden">
                  <CardContent className="relative flex flex-col gap-2.5 p-4 pb-5">
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full',
                        card.circle
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold tabular-nums leading-none">
                        {card.value}
                      </p>
                      <p className="mt-1 text-xs font-medium text-muted-foreground">
                        {card.label}
                      </p>
                    </div>
                    <div
                      aria-hidden="true"
                      className={cn(
                        'absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r',
                        card.accent
                      )}
                    />
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* ── Filter chips ───────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => {
              const isActive = filter === f.key
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  aria-pressed={isActive}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-teal-600 bg-teal-600 text-white hover:bg-teal-700'
                      : 'border-border bg-background text-muted-foreground hover:border-teal-300 hover:text-teal-700 dark:hover:border-teal-700 dark:hover:text-teal-300'
                  )}
                >
                  {f.label}
                  <span
                    className={cn(
                      'rounded-full px-1.5 text-xs tabular-nums',
                      isActive
                        ? 'bg-white/20'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {filterCounts[f.key]}
                  </span>
                </button>
              )
            })}
          </div>

          {/* ── Timeline ───────────────────────────────────────────────── */}
          {filteredEvents.length === 0 ? (
            <Card className="border-2 border-dashed border-teal-300 bg-teal-50/40 dark:border-teal-800 dark:bg-teal-950/20">
              <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-300">
                  <GitCommitVertical className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-semibold">
                    {events.length === 0
                      ? 'No medical events yet'
                      : `No ${FILTERS.find((f) => f.key === filter)?.label.toLowerCase() ?? ''} yet`}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {events.length === 0
                      ? 'Your appointments, prescriptions and lab results will appear here as you visit.'
                      : 'Events of this type will appear here as they happen.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="relative">
              {/* Vertical gradient line */}
              <div
                aria-hidden="true"
                className="absolute bottom-5 left-[19px] top-5 w-0.5 rounded-full bg-gradient-to-b from-teal-400 via-emerald-400 to-emerald-500 sm:left-[23px]"
              />
              <div className="space-y-4 sm:space-y-5">
                {filteredEvents.map((event, index) => {
                  const config = TYPE_CONFIG[event.type]
                  const Icon = config.icon
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{
                        duration: 0.45,
                        delay: Math.min(index, 6) * 0.07,
                        ease: 'easeOut',
                      }}
                      className="relative flex items-start gap-2.5 sm:gap-4"
                    >
                      {/* Dot with type icon */}
                      <div
                        className={cn(
                          'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-background sm:h-12 sm:w-12',
                          config.dot
                        )}
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>

                      {/* Event card */}
                      <Card className="min-w-0 flex-1 transition-colors hover:bg-muted/30">
                        <CardContent className="p-3.5 sm:p-4">
                          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
                            <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                              <p className="truncate text-sm font-semibold">
                                {event.title}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {formatDate(event.date)}
                              </p>
                            </div>
                            <StatusBadge status={event.status} />
                          </div>
                          {event.description ? (
                            <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
                              {event.description}
                            </p>
                          ) : null}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Loading skeleton — header + stat cards + placeholder timeline rows
// ──────────────────────────────────────────────────────────────────────────

function MedicalHistorySkeleton() {
  return (
    <div className="space-y-6">
      {/* Stat card skeletons */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col gap-2.5 p-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter chip skeletons */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      {/* Timeline row skeletons */}
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute bottom-5 left-[19px] top-5 w-0.5 rounded-full bg-muted sm:left-[23px]"
        />
        <div className="space-y-4 sm:space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 sm:gap-4">
              <Skeleton className="relative z-10 h-10 w-10 shrink-0 rounded-full sm:h-12 sm:w-12" />
              <Card className="min-w-0 flex-1">
                <CardContent className="space-y-2.5 p-4">
                  <Skeleton className="h-4 w-2/5" />
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-3 w-3/4" />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
