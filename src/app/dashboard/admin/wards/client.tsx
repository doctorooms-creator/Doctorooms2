'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowRight,
  Bed,
  BedDouble,
  Building2,
  Gauge,
  LayoutGrid,
  MapPin,
  Pencil,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────────────────────────────────────
// Types — mirrors GET /api/admin/wards
// ──────────────────────────────────────────────────────────────────────────

interface BedInfo {
  id: string
  bedNumber: string
  bedType: string
  dailyRate: number
  status: string
  currentPatientName: string | null
  admissionNo: string | null
}

interface WardInfo {
  id: string
  name: string
  wardType: string
  floorNo: string
  status: string
  dailyRate: number
  totalBeds: number
  occupiedBeds: number
  availableBeds: number
  maintenanceBeds: number
  beds: BedInfo[]
}

interface HospitalInfo {
  id: string
  hospitalName: string
  city: string
  wards: WardInfo[]
}

interface WardsData {
  hospitals: HospitalInfo[]
  summary: {
    totalHospitals: number
    totalWards: number
    totalBeds: number
    occupiedBeds: number
    availableBeds: number
    occupancyPercent: number
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Palette helpers — teal / emerald / amber / rose only
// ──────────────────────────────────────────────────────────────────────────

const WARD_TYPE_BADGES: Record<string, string> = {
  ICU: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
  Emergency: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
  General: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400',
  Private: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  SemiPrivate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  PostOp: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  Maternity: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
}

// Bed square colors: Available = emerald · Occupied = rose ·
// Maintenance / Housekeeping / anything else = amber.
const BED_SQUARE_COLORS: Record<string, string> = {
  Available:
    'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50',
  Occupied:
    'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50',
}

function bedSquareClass(status: string): string {
  return (
    BED_SQUARE_COLORS[status] ??
    'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50'
  )
}

const formatINR = (value: number) => `₹${value.toLocaleString('en-IN')}`

const fadeUp = (index: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.4, delay: Math.min(index, 8) * 0.05, ease: 'easeOut' as const },
})

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

function BedSquare({ bed }: { bed: BedInfo }) {
  const isOccupied = bed.status === 'Occupied'
  const isAvailable = bed.status === 'Available'
  const tooltip = isOccupied && bed.currentPatientName
    ? `Bed ${bed.bedNumber} · ${bed.currentPatientName} (${bed.admissionNo ?? '—'}) · ${formatINR(bed.dailyRate)}/day`
    : `Bed ${bed.bedNumber} · ${bed.status} · ${formatINR(bed.dailyRate)}/day`

  return (
    <div
      title={tooltip}
      aria-label={tooltip}
      className={cn(
        'flex aspect-square items-center justify-center rounded-lg border transition-colors',
        bedSquareClass(bed.status)
      )}
    >
      <span className="px-1 text-center text-[11px] font-semibold leading-tight sm:text-xs">
        {bed.bedNumber || '—'}
      </span>
    </div>
  )
}

function WardCard({ ward, index }: { ward: WardInfo; index: number }) {
  const occupancy =
    ward.totalBeds > 0 ? Math.min(100, Math.round((ward.occupiedBeds / ward.totalBeds) * 100)) : 0
  const wardBadge = WARD_TYPE_BADGES[ward.wardType]

  return (
    <motion.div {...fadeUp(index)}>
      <Card className="h-full border-border/70 transition-shadow hover:shadow-md">
        <CardContent className="flex h-full flex-col gap-3 p-4">
          {/* Ward header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{ward.name || 'Unnamed Ward'}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {ward.floorNo ? `${ward.floorNo} · ` : ''}
                {ward.totalBeds} {ward.totalBeds === 1 ? 'bed' : 'beds'}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {wardBadge ? (
                <Badge className={cn('border-0', wardBadge)}>{ward.wardType}</Badge>
              ) : (
                <Badge variant="secondary" className="border-0">{ward.wardType}</Badge>
              )}
              {ward.status !== 'Active' && (
                <Badge className="border-0 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                  {ward.status}
                </Badge>
              )}
            </div>
          </div>

          {/* Rate + occupancy summary */}
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs">
            <span className="font-medium text-muted-foreground">
              {ward.dailyRate > 0 ? `From ${formatINR(ward.dailyRate)}/day` : 'Rate not set'}
            </span>
            <span className="tabular-nums text-muted-foreground">
              <span className="font-semibold text-rose-600 dark:text-rose-400">{ward.occupiedBeds}</span>
              {' occupied · '}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{ward.availableBeds}</span>
              {' available'}
            </span>
          </div>

          {/* Occupancy bar */}
          {ward.totalBeds > 0 && (
            <div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-rose-500 transition-all duration-700 dark:from-teal-600 dark:to-rose-600"
                  style={{ width: `${occupancy}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] font-medium tabular-nums text-muted-foreground">
                {occupancy}% of {ward.totalBeds} {ward.totalBeds === 1 ? 'bed' : 'beds'} occupied
              </p>
            </div>
          )}

          {/* Bed grid */}
          {ward.beds.length > 0 ? (
            <div className="mt-auto grid grid-cols-4 gap-1.5 sm:grid-cols-5 lg:grid-cols-6">
              {ward.beds.map((bed) => (
                <BedSquare key={bed.id} bed={bed} />
              ))}
            </div>
          ) : (
            <div className="mt-auto rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-3 py-4 text-center text-xs text-muted-foreground">
              No beds created in this ward yet
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function HospitalSection({
  hospital,
  index,
}: {
  hospital: HospitalInfo
  index: number
}) {
  const totalBeds = hospital.wards.reduce((sum, w) => sum + w.totalBeds, 0)
  const occupiedBeds = hospital.wards.reduce((sum, w) => sum + w.occupiedBeds, 0)
  const availableBeds = hospital.wards.reduce((sum, w) => sum + w.availableBeds, 0)
  const occupancy =
    totalBeds > 0 ? Math.min(100, Math.round((occupiedBeds / totalBeds) * 100)) : 0

  const miniStats = [
    { label: 'Wards', value: hospital.wards.length, className: 'text-teal-700 dark:text-teal-300' },
    { label: 'Beds', value: totalBeds, className: 'text-amber-700 dark:text-amber-300' },
    { label: 'Occupied', value: occupiedBeds, className: 'text-rose-700 dark:text-rose-300' },
    { label: 'Available', value: availableBeds, className: 'text-emerald-700 dark:text-emerald-300' },
  ]

  return (
    <motion.div {...fadeUp(index)}>
      <Card className="border-border/70 bg-gradient-to-br from-teal-50/40 to-transparent dark:from-teal-950/15">
        <CardContent className="space-y-4 p-4 sm:p-5">
          {/* Hospital header + mini stats */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/50">
                <Building2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold">{hospital.hospitalName}</h2>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{hospital.city || 'Location not set'}</span>
                  {totalBeds > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{occupancy}% occupancy</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="grid shrink-0 grid-cols-4 gap-3 sm:gap-4">
              {miniStats.map((stat) => (
                <div key={stat.label} className="text-center sm:text-right">
                  <p className={cn('text-lg font-bold tabular-nums leading-tight', stat.className)}>
                    {stat.value}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ward cards */}
          {hospital.wards.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {hospital.wards.map((ward, wardIndex) => (
                <WardCard key={ward.id} ward={ward} index={wardIndex} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-teal-300 bg-teal-50/40 p-8 text-center dark:border-teal-800 dark:bg-teal-950/20">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-300">
                <BedDouble className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold">No wards yet</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                Wards and beds created for {hospital.hospitalName} will appear here once
                configured.
              </p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-4 h-11 gap-1.5 border-teal-300 text-teal-700 hover:bg-teal-50 hover:text-teal-800 dark:border-teal-800 dark:text-teal-300 dark:hover:bg-teal-950/40 sm:h-9"
              >
                <a href="/dashboard/admin/wards/manage">
                  Set up wards
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function WardsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stat card skeletons */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="flex items-center gap-3 p-4">
              <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-7 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Hospital section skeletons */}
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="space-y-4 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="space-y-3 rounded-xl border p-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-1.5 w-full" />
                  <div className="grid grid-cols-5 gap-1.5">
                    {Array.from({ length: 10 }).map((_, k) => (
                      <Skeleton key={k} className="aspect-square rounded-lg" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────────

export default function WardsClient() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<WardsData>({
    queryKey: ['admin-wards-overview'],
    queryFn: () =>
      fetch('/api/admin/wards').then((r) => {
        if (!r.ok) throw new Error('Failed to load wards and beds')
        return r.json()
      }),
  })

  const summary = data?.summary
  const hospitals = data?.hospitals ?? []

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/20">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">Wards &amp; Beds</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Monitor ward capacity and bed availability across hospitals
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-11 w-11 gap-2 p-0 sm:h-9 sm:w-auto sm:p-4"
            aria-label="Refresh wards and beds"
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            asChild
            className="h-11 gap-1.5 bg-teal-600 hover:bg-teal-700 sm:h-9"
          >
            <a href="/dashboard/admin/wards/manage">
              <Pencil className="h-4 w-4" />
              Manage
            </a>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <WardsSkeleton />
      ) : isError ? (
        <Card className="border-rose-200/70 bg-gradient-to-br from-rose-50/60 to-transparent dark:border-rose-900/50 dark:from-rose-950/20">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/50">
              <BedDouble className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="font-semibold">Could not load wards and beds</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Something went wrong while fetching hospital ward data. Please try again.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-11 gap-2 border-rose-300 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40 sm:h-9"
            >
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Summary stat cards ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {/* Total Hospitals — teal */}
            <motion.div {...fadeUp(0)}>
              <Card className="h-full overflow-hidden border-teal-200/70 bg-gradient-to-br from-teal-50/80 to-transparent dark:border-teal-900/50 dark:from-teal-950/25">
                <CardContent className="relative p-4">
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-teal-400 to-emerald-400 dark:from-teal-700 dark:to-emerald-700" />
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/50">
                      <Building2 className="size-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">Total Hospitals</p>
                      <div className="text-2xl font-bold tabular-nums leading-tight text-teal-700 dark:text-teal-300">
                        {summary?.totalHospitals ?? 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Total Wards — emerald */}
            <motion.div {...fadeUp(1)}>
              <Card className="h-full overflow-hidden border-emerald-200/70 bg-gradient-to-br from-emerald-50/80 to-transparent dark:border-emerald-900/50 dark:from-emerald-950/25">
                <CardContent className="relative p-4">
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 dark:from-emerald-700 dark:to-teal-700" />
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                      <LayoutGrid className="size-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">Total Wards</p>
                      <div className="text-2xl font-bold tabular-nums leading-tight text-emerald-700 dark:text-emerald-300">
                        {summary?.totalWards ?? 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Total Beds — amber */}
            <motion.div {...fadeUp(2)}>
              <Card className="h-full overflow-hidden border-amber-200/70 bg-gradient-to-br from-amber-50/80 to-transparent dark:border-amber-900/50 dark:from-amber-950/25">
                <CardContent className="relative p-4">
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400 dark:from-amber-700 dark:to-orange-700" />
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                      <BedDouble className="size-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">Total Beds</p>
                      <div className="text-2xl font-bold tabular-nums leading-tight text-amber-700 dark:text-amber-300">
                        {summary?.totalBeds ?? 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Occupied — rose */}
            <motion.div {...fadeUp(3)}>
              <Card className="h-full overflow-hidden border-rose-200/70 bg-gradient-to-br from-rose-50/80 to-transparent dark:border-rose-900/50 dark:from-rose-950/25">
                <CardContent className="relative p-4">
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-rose-400 to-orange-400 dark:from-rose-700 dark:to-orange-700" />
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/50">
                      <Bed className="size-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">Occupied</p>
                      <div className="text-2xl font-bold tabular-nums leading-tight text-rose-700 dark:text-rose-300">
                        {summary?.occupiedBeds ?? 0}
                        <span className="text-sm font-medium text-muted-foreground">
                          {' '}
                          / {summary?.totalBeds ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Occupancy % — teal + mini progress bar */}
            <motion.div {...fadeUp(4)}>
              <Card className="h-full overflow-hidden border-teal-200/70 bg-gradient-to-br from-teal-50/80 to-transparent dark:border-teal-900/50 dark:from-teal-950/25">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/50">
                      <Gauge className="size-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">Occupancy</p>
                      <div className="text-2xl font-bold tabular-nums leading-tight text-teal-700 dark:text-teal-300">
                        {summary?.occupancyPercent ?? 0}%
                      </div>
                    </div>
                  </div>
                  {(summary?.totalBeds ?? 0) > 0 && (
                    <div className="mt-3">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-teal-100 dark:bg-teal-950/60">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-rose-500 transition-all duration-700 dark:from-teal-600 dark:to-rose-600"
                          style={{ width: `${Math.min(100, summary?.occupancyPercent ?? 0)}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[10px] font-medium tabular-nums text-muted-foreground">
                        {summary?.occupancyPercent ?? 0}% of {summary?.totalBeds ?? 0} beds occupied
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* ── Legend ────────────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full border border-emerald-300 bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/60" />
              Available
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full border border-rose-300 bg-rose-100 dark:border-rose-800 dark:bg-rose-900/60" />
              Occupied
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full border border-amber-300 bg-amber-100 dark:border-amber-800 dark:bg-amber-900/60" />
              Maintenance
            </span>
            <span className="hidden text-muted-foreground/70 sm:inline">
              Hover a bed for patient details
            </span>
          </div>

          {/* ── Hospital sections ─────────────────────────────────────────── */}
          {hospitals.length > 0 ? (
            <div className="space-y-6">
              {hospitals.map((hospital, index) => (
                <HospitalSection key={hospital.id} hospital={hospital} index={index} />
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-teal-300 bg-teal-50/40 dark:border-teal-800 dark:bg-teal-950/20">
              <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-300">
                  <Building2 className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-semibold">No hospitals found</p>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                    Hospitals registered on the platform will appear here with their
                    wards and beds.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
