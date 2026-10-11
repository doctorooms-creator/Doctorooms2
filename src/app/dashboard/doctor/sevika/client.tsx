'use client'

/**
 * Sevika — Patient Adherence board (doctor side). AI-NURSE-PLAN.md §2.5 + P2:
 * every patient who has booked with this doctor, with their medicine
 * adherence from the Sevika nurse app. Worst-first sort + escalation flags:
 *   🔴 critical  — ≥3 missed doses in last 48h (3-consecutive-miss rule)
 *   🟡 attention — week score < 50%
 */

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  Clock,
  Flame,
  Loader2,
  Pill,
  RefreshCw,
  Search,
  ShieldAlert,
  Stethoscope,
  Users,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// ============ TYPES ============

interface AdherencePatient {
  patientId: string
  patientName: string
  mobileNo: string | null
  profileImg: string | null
  activeMeds: number
  medicineNames: string[]
  weekTotal: number
  weekTaken: number
  weekMissed: number
  weekSkipped: number
  scorePct: number
  missedLast48h: number
  lastTakenAt: string | null
  flag: 'none' | 'attention' | 'critical'
}

interface AdherenceResponse {
  patients: AdherencePatient[]
  summary: {
    totalPatients: number
    onSevika: number
    critical: number
    attention: number
    avgScore: number
  }
}

type FilterMode = 'all' | 'critical' | 'attention' | 'on-sevika'

// ============ COMPONENT ============

export default function DoctorSevikaClient() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterMode>('all')

  const { data, isLoading, refetch, isRefetching } = useQuery<AdherenceResponse>({
    queryKey: ['doctor-sevika-adherence'],
    queryFn: () =>
      fetch('/api/dashboard/doctor/sevika/adherence').then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || 'Failed')
        return r.json()
      }),
    refetchInterval: 120_000,
  })

  const patients = data?.patients || []
  const summary = data?.summary

  const filtered = useMemo(() => {
    let list = patients
    if (filter === 'critical') list = list.filter((p) => p.flag === 'critical')
    else if (filter === 'attention') list = list.filter((p) => p.flag === 'attention')
    else if (filter === 'on-sevika') list = list.filter((p) => p.activeMeds > 0)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.patientName.toLowerCase().includes(q) ||
          (p.mobileNo || '').includes(q) ||
          p.medicineNames.some((m) => m.toLowerCase().includes(q))
      )
    }
    return list
  }, [patients, filter, search])

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
              <Activity className="h-5 w-5" />
            </span>
            Patient Adherence
            <Badge className="border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-400">
              Sevika Nurse Board
            </Badge>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aapke patients ki dawai adherence — 48 ghante me 3 miss = turant dhyan dena. 🩺
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={cn('mr-1 h-4 w-4', isRefetching && 'animate-spin')} /> Refresh
        </Button>
      </motion.div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <SummaryStat
              icon={<Users className="h-4 w-4" />}
              label="Total Patients"
              value={`${summary?.totalPatients ?? 0}`}
              sub="booked with you"
              tone="teal"
            />
            <SummaryStat
              icon={<Pill className="h-4 w-4" />}
              label="On Sevika"
              value={`${summary?.onSevika ?? 0}`}
              sub="active medicine course"
              tone="emerald"
            />
            <SummaryStat
              icon={<ShieldAlert className="h-4 w-4" />}
              label="Critical Alerts"
              value={`${summary?.critical ?? 0}`}
              sub="3+ miss in 48h"
              tone={(summary?.critical ?? 0) > 0 ? 'rose' : 'slate'}
            />
            <SummaryStat
              icon={<Activity className="h-4 w-4" />}
              label="Avg Week Score"
              value={`${summary?.avgScore ?? 0}%`}
              sub="adherence"
              tone="amber"
            />
          </>
        )}
      </div>

      {/* ── Search + filters ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Patient ya dawai search karein…"
            className="pl-9"
            aria-label="Search patients"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['all', `Sab (${patients.length})`],
              ['critical', `🔴 Critical (${summary?.critical ?? 0})`],
              ['attention', `🟡 Attention (${summary?.attention ?? 0})`],
              ['on-sevika', `Pill on (${summary?.onSevika ?? 0})`],
            ] as Array<[FilterMode, string]>
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                filter === mode
                  ? 'bg-teal-600 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Patient list ── */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center">
          <span className="text-4xl">🩺</span>
          <div>
            <p className="font-semibold">Koi patient nahi mila</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {patients.length === 0
                ? 'Jab aapke patients Sevika app me dawai add karenge, unka adherence yahan dikhega.'
                : 'Filter ya search badal kar dekhein.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => (
            <PatientAdherenceCard key={p.patientId} patient={p} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

// ============ SUB-COMPONENTS ============

function SummaryStat({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  tone: 'teal' | 'emerald' | 'amber' | 'rose' | 'slate'
}) {
  const tones: Record<string, string> = {
    teal: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
    slate: 'bg-muted text-muted-foreground',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card p-4"
    >
      <div className="flex items-center gap-2">
        <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', tones[tone])}>
          {icon}
        </span>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </motion.div>
  )
}

function PatientAdherenceCard({ patient, index }: { patient: AdherencePatient; index: number }) {
  const [expanded, setExpanded] = useState(
    patient.flag === 'critical' // critical rows start expanded
  )
  const initials = patient.patientName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const scoreTone =
    patient.activeMeds === 0
      ? 'text-muted-foreground'
      : patient.scorePct >= 90
        ? 'text-emerald-600 dark:text-emerald-400'
        : patient.scorePct >= 70
          ? 'text-teal-600 dark:text-teal-400'
          : patient.scorePct >= 50
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-rose-600 dark:text-rose-400'

  const barTone =
    patient.scorePct >= 90
      ? 'bg-emerald-500'
      : patient.scorePct >= 70
        ? 'bg-teal-500'
        : patient.scorePct >= 50
          ? 'bg-amber-500'
          : 'bg-rose-500'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className={cn(
        'rounded-xl border bg-card p-4 transition-colors',
        patient.flag === 'critical' &&
          'border-rose-200 bg-rose-50/40 dark:border-rose-900 dark:bg-rose-950/20',
        patient.flag === 'attention' &&
          'border-amber-200 bg-amber-50/30 dark:border-amber-900 dark:bg-amber-950/10'
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Avatar + name */}
        <Avatar className="h-10 w-10 border">
          {patient.profileImg ? (
            <AvatarImage src={patient.profileImg} alt={patient.patientName} />
          ) : null}
          <AvatarFallback className="bg-teal-100 text-xs font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-400">
            {initials || 'P'}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold">{patient.patientName}</p>
            {patient.flag === 'critical' && (
              <Badge variant="destructive" className="gap-1 text-[10px]">
                <AlertTriangle className="h-3 w-3" /> 3+ miss (48h)
              </Badge>
            )}
            {patient.flag === 'attention' && (
              <Badge className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                Low adherence
              </Badge>
            )}
            {patient.activeMeds === 0 && (
              <Badge variant="secondary" className="text-[10px]">
                Sevika pe nahi
              </Badge>
            )}
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            {patient.mobileNo && <span>{patient.mobileNo}</span>}
            <span className="flex items-center gap-1">
              <Pill className="h-3 w-3" /> {patient.activeMeds} active medicine
              {patient.activeMeds === 1 ? '' : 's'}
            </span>
            {patient.lastTakenAt && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                aakhri dose {formatDistanceToNow(new Date(patient.lastTakenAt))} pe
              </span>
            )}
          </p>
        </div>

        {/* Score block */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={cn('text-xl font-bold tracking-tight', scoreTone)}>
              {patient.activeMeds === 0 || patient.weekTotal === 0 ? '—' : `${patient.scorePct}%`}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {patient.weekTotal > 0 ? `${patient.weekTaken}/${patient.weekTotal} hafte me` : 'koi log nahi'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
          </Button>
        </div>
      </div>

      {/* Week bar */}
      {patient.weekTotal > 0 && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${patient.scorePct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={cn('h-full rounded-full', barTone)}
          />
        </div>
      )}

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-3 text-xs sm:grid-cols-4 dark:bg-muted/20">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">48h Missed</p>
            <p
              className={cn(
                'mt-0.5 font-semibold',
                patient.missedLast48h >= 3
                  ? 'text-rose-600 dark:text-rose-400'
                  : patient.missedLast48h > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
              )}
            >
              {patient.missedLast48h} doses
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Hafta Missed</p>
            <p className="mt-0.5 font-semibold">{patient.weekMissed} doses</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Skip kiya</p>
            <p className="mt-0.5 font-semibold">{patient.weekSkipped} doses</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Streak Risk</p>
            <p className="mt-0.5 flex items-center gap-1 font-semibold">
              <Flame
                className={cn(
                  'h-3 w-3',
                  patient.scorePct >= 90 ? 'text-amber-500' : 'text-muted-foreground'
                )}
              />
              {patient.scorePct >= 90 ? 'accha ja raha hai' : 'improve karna hai'}
            </p>
          </div>
          {patient.medicineNames.length > 0 && (
            <div className="col-span-2 sm:col-span-4">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Active Medicines
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {patient.medicineNames.map((m) => (
                  <Badge key={m} variant="secondary" className="text-[10px] font-normal">
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {patient.flag === 'critical' && (
            <div className="col-span-2 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] leading-relaxed text-rose-800 sm:col-span-4 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              <Stethoscope className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Rule-based alert: 48 ghante me {patient.missedLast48h} doses miss —
              patient ko call karke doses confirm karna behtar hoga.
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
