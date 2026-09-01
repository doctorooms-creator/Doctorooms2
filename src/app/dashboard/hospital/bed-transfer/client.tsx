'use client'

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowRight,
  ArrowRightLeft,
  Bed,
  BedDouble,
  CalendarClock,
  CircleCheck,
  Loader2,
  RefreshCw,
  Stethoscope,
  User,
  Users,
  Wrench,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { StatCard } from '@/components/dashboard/stat-card'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────

interface AdmittedPatient {
  id: string
  admissionNo: string
  patientName: string
  patientAge: number
  patientGender: string
  wardName: string
  bedNumber: string
  doctorName: string
  departmentName: string
  admissionDate: string
  status: string
}

interface BedInfo {
  id: string
  bedNumber: string
  bedType: string
  status: string
  dailyRate: number
  wardId: string
  wardName: string
  wardType: string
  floorNo: number
}

interface TransferRow {
  id: string
  fromBedNumber: string
  fromWardName: string
  toBedNumber: string
  toWardName: string
  transferDate: string
  transferReason: string
  transferredByName: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function formatBedType(t: string) {
  return t.replace(/_/g, ' ')
}

/** Soft pill for bed type (teal/emerald/amber/rose palette only). */
const bedTypeChip: Record<string, string> = {
  General: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  SemiPrivate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Private: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  ICU_Ventilator: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  ICU_NonVentilator: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
}

/** Chip colors for the ward·bed map: green=Available, rose=Occupied, amber=Maintenance/Reserved. */
const bedStatusChip: Record<string, string> = {
  Available: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:border-emerald-600',
  Occupied: 'border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-400 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:border-rose-600',
  Maintenance: 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-400 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:border-amber-600',
  Reserved: 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-400 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:border-amber-600',
}

const bedStatusDot: Record<string, string> = {
  Available: 'bg-emerald-500',
  Occupied: 'bg-rose-500',
  Maintenance: 'bg-amber-500',
  Reserved: 'bg-amber-500',
}

// ─── Component ───────────────────────────────────────────────────────────

export default function BedTransferClient() {
  const queryClient = useQueryClient()
  const [admissionId, setAdmissionId] = useState('')
  const [toWardId, setToWardId] = useState('')
  const [toBedId, setToBedId] = useState('')
  const [transferReason, setTransferReason] = useState('')

  // Admitted patients for the picker (works for hospital + receptionist + nurse)
  const { data: admittedData, isLoading: admittedLoading, error: admittedError } = useQuery<{
    admissions: AdmittedPatient[]
  }>({
    queryKey: ['bed-transfer-admissions'],
    queryFn: () =>
      fetch('/api/ipd-admissions?status=Admitted&limit=200').then((r) => {
        if (!r.ok) throw new Error('Failed to load admitted patients')
        return r.json()
      }),
  })

  // Beds (available + full ward·bed map) — endpoint allows receptionist + hospital
  const { data: bedsData, isLoading: bedsLoading } = useQuery<{
    beds: BedInfo[]
    allBeds: BedInfo[]
  }>({
    queryKey: ['available-beds'],
    queryFn: () =>
      fetch('/api/dashboard/receptionist/ipd/available-beds').then((r) => {
        if (!r.ok) throw new Error('Failed to load beds')
        return r.json()
      }),
    refetchInterval: 30000,
  })

  // Transfer history for the selected admission
  const { data: transfersData, isLoading: transfersLoading } = useQuery<{
    transfers: TransferRow[]
  }>({
    queryKey: ['bed-transfers', admissionId],
    queryFn: () =>
      fetch(`/api/bed-transfers?admissionId=${admissionId}`).then((r) => {
        if (!r.ok) throw new Error('Failed to load transfer history')
        return r.json()
      }),
    enabled: !!admissionId,
  })

  const admissions = admittedData?.admissions ?? []
  const selectedAdmission = admissions.find((a) => a.id === admissionId) ?? null
  const allBeds = bedsData?.allBeds ?? []
  const availableBeds = bedsData?.beds ?? []
  const transfers = transfersData?.transfers ?? []

  // Unique wards (with at least one bed) for the "Transfer To" ward picker
  const wards = useMemo(() => {
    const byId = new Map<string, { wardId: string; wardName: string }>()
    for (const b of allBeds) {
      if (!byId.has(b.wardId)) byId.set(b.wardId, { wardId: b.wardId, wardName: b.wardName })
    }
    return [...byId.values()].sort((a, b) => a.wardName.localeCompare(b.wardName))
  }, [allBeds])

  // Beds of the chosen target ward — Available are selectable, others disabled
  const targetWardBeds = useMemo(
    () =>
      allBeds
        .filter((b) => b.wardId === toWardId)
        .sort((a, b) => a.bedNumber.localeCompare(b.bedNumber)),
    [allBeds, toWardId]
  )

  // Stats
  const stats = useMemo(
    () => ({
      admitted: admissions.length,
      available: allBeds.filter((b) => b.status === 'Available').length,
      occupied: allBeds.filter((b) => b.status === 'Occupied').length,
      maintenance: allBeds.filter((b) => b.status === 'Maintenance' || b.status === 'Reserved').length,
    }),
    [admissions, allBeds]
  )

  // Transfer mutation — POST /api/bed-transfers { admissionId, toBedId, transferReason }
  const transferMutation = useMutation({
    mutationFn: async (body: { admissionId: string; toBedId: string; transferReason: string }) => {
      const res = await fetch('/api/bed-transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || `Transfer failed (${res.status})`)
      }
      return data
    },
    onSuccess: () => {
      toast.success('Patient transferred successfully')
      setToWardId('')
      setToBedId('')
      setTransferReason('')
      // Refresh current-location card, picker, beds grid + history
      queryClient.invalidateQueries({ queryKey: ['bed-transfer-admissions'] })
      queryClient.invalidateQueries({ queryKey: ['available-beds'] })
      queryClient.invalidateQueries({ queryKey: ['bed-transfers'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Transfer failed')
    },
  })

  function handlePatientChange(value: string) {
    setAdmissionId(value)
    setToWardId('')
    setToBedId('')
    setTransferReason('')
  }

  function handleSubmit() {
    if (!selectedAdmission || !toBedId || !transferReason.trim()) return
    transferMutation.mutate({
      admissionId: selectedAdmission.id,
      toBedId,
      transferReason: transferReason.trim(),
    })
  }

  // Beds grouped by ward for the map
  const bedsByWard = useMemo(() => {
    const grouped: Record<string, BedInfo[]> = {}
    for (const b of allBeds) {
      if (!grouped[b.wardName]) grouped[b.wardName] = []
      grouped[b.wardName].push(b)
    }
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
  }, [allBeds])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bed Transfer</h1>
          <p className="text-sm text-muted-foreground">
            Move an admitted patient to another bed and track every transfer.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['available-beds'] })
            queryClient.invalidateQueries({ queryKey: ['bed-transfer-admissions'] })
          }}
          className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 dark:border-teal-800/60 dark:text-teal-300 dark:hover:bg-teal-950/40"
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Admitted Patients"
          value={stats.admitted}
          icon={Users}
          gradient="from-teal-500 to-teal-600"
          iconBg="bg-teal-100 dark:bg-teal-900/50"
        />
        <StatCard
          title="Available Beds"
          value={stats.available}
          icon={BedDouble}
          gradient="from-emerald-500 to-emerald-600"
          iconBg="bg-emerald-100 dark:bg-emerald-900/50"
        />
        <StatCard
          title="Occupied Beds"
          value={stats.occupied}
          icon={Bed}
          gradient="from-rose-500 to-rose-600"
          iconBg="bg-rose-100 dark:bg-rose-900/50"
        />
        <StatCard
          title="Maintenance / Reserved"
          value={stats.maintenance}
          icon={Wrench}
          gradient="from-amber-500 to-amber-600"
          iconBg="bg-amber-100 dark:bg-amber-900/50"
        />
      </div>

      {/* Transfer form */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/50">
              <ArrowRightLeft className="h-4 w-4 text-teal-600 dark:text-teal-300" />
            </span>
            Transfer Patient
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Admitted patient picker */}
          <div>
            <Label>Admitted Patient</Label>
            {admittedLoading ? (
              <Skeleton className="mt-1.5 h-10 w-full" />
            ) : admissions.length === 0 ? (
              <div className="mt-1.5 rounded-lg border border-dashed border-teal-200 bg-teal-50/50 px-4 py-6 text-center dark:border-teal-800/60 dark:bg-teal-950/20">
                <User className="mx-auto mb-2 h-6 w-6 text-teal-500" />
                <p className="text-sm text-muted-foreground">
                  {admittedError
                    ? 'Could not load admitted patients — try refreshing.'
                    : 'No admitted patients right now.'}
                </p>
              </div>
            ) : (
              <Select value={admissionId} onValueChange={handlePatientChange}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select admitted patient…" />
                </SelectTrigger>
                <SelectContent>
                  {admissions.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.patientName} — {a.admissionNo} ({a.wardName} · {a.bedNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Current location card */}
          {selectedAdmission && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-teal-200 bg-teal-50/60 p-4 dark:border-teal-800/60 dark:bg-teal-950/30"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">
                Current Location
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-900">
                    <User className="h-4 w-4 text-teal-600 dark:text-teal-300" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{selectedAdmission.patientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedAdmission.patientGender}, {selectedAdmission.patientAge}y ·{' '}
                      <span className="font-mono">{selectedAdmission.admissionNo}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-900">
                    <BedDouble className="h-4 w-4 text-teal-600 dark:text-teal-300" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {selectedAdmission.wardName} · Bed {selectedAdmission.bedNumber}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Stethoscope className="h-3 w-3" />
                      {selectedAdmission.doctorName
                        ? `Attending: ${selectedAdmission.doctorName}`
                        : 'No attending doctor'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Transfer To */}
          {selectedAdmission && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 rounded-xl border p-4 dark:border-slate-800"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Transfer To — Ward</Label>
                  <Select
                    value={toWardId}
                    onValueChange={(v) => {
                      setToWardId(v)
                      setToBedId('')
                    }}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select ward…" />
                    </SelectTrigger>
                    <SelectContent>
                      {wards.map((w) => (
                        <SelectItem key={w.wardId} value={w.wardId}>
                          {w.wardName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Transfer To — Bed</Label>
                  <Select
                    value={toBedId}
                    onValueChange={setToBedId}
                    disabled={!toWardId}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder={toWardId ? 'Select bed…' : 'Select a ward first'} />
                    </SelectTrigger>
                    <SelectContent>
                      {targetWardBeds.map((b) => {
                        const isCurrent = b.id && selectedAdmission && b.bedNumber === selectedAdmission.bedNumber && b.wardName === selectedAdmission.wardName
                        const selectable = b.status === 'Available' && !isCurrent
                        return (
                          <SelectItem key={b.id} value={b.id} disabled={!selectable}>
                            {b.bedNumber} — {formatBedType(b.bedType)}
                            {b.status !== 'Available' ? ` (${b.status})` : isCurrent ? ' (current bed)' : ` · ₹${b.dailyRate}/day`}
                          </SelectItem>
                        )
                      })}
                      {targetWardBeds.length === 0 && (
                        <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                          No beds in this ward
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {toWardId && targetWardBeds.filter((b) => b.status === 'Available').length === 0 && (
                    <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                      No available beds in this ward right now.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label>
                  Reason for Transfer <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  placeholder="e.g., Patient condition requires closer monitoring in ICU"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="mt-1.5"
                  rows={3}
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={handleSubmit}
                  disabled={!toBedId || !transferReason.trim() || transferMutation.isPending}
                  className="bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
                >
                  {transferMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                  )}
                  Transfer Patient
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAdmissionId('')
                    setToWardId('')
                    setToBedId('')
                    setTransferReason('')
                  }}
                >
                  Clear
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Ward & bed map */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/50">
                <Bed className="h-4 w-4 text-teal-600 dark:text-teal-300" />
              </span>
              Ward &amp; Bed Map
            </span>
            <span className="flex flex-wrap items-center gap-3 text-xs font-normal text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Available
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Occupied
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Maintenance
              </span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bedsLoading ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : bedsByWard.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-muted-foreground">
              <Bed className="mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No beds found</p>
            </div>
          ) : (
            <TooltipProvider delayDuration={150}>
              <div className="space-y-4">
                {bedsByWard.map(([wardName, wardBeds]) => (
                  <div key={wardName}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium">{wardName}</p>
                      <Badge className="bg-teal-100 text-[10px] text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                        {wardBeds.filter((b) => b.status === 'Available').length}/{wardBeds.length} free
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {wardBeds.map((b) => (
                        <Tooltip key={b.id}>
                          <TooltipTrigger asChild>
                            <span
                              className={cn(
                                'flex min-w-14 cursor-default items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                                bedStatusChip[b.status] ||
                                  'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                              )}
                            >
                              <span
                                className={cn('h-1.5 w-1.5 rounded-full', bedStatusDot[b.status] || 'bg-slate-400')}
                                aria-hidden="true"
                              />
                              {b.bedNumber}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="font-medium">
                              Bed {b.bedNumber} · {formatBedType(b.bedType)}
                            </p>
                            <p className="text-xs opacity-80">
                              {wardName} · ₹{b.dailyRate}/day · {b.status}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>

      {/* Transfer history */}
      {selectedAdmission && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/50">
                <CalendarClock className="h-4 w-4 text-teal-600 dark:text-teal-300" />
              </span>
              Transfer History — {selectedAdmission.patientName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transfersLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : transfers.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-teal-200 bg-teal-50/50 px-4 py-8 text-center dark:border-teal-800/60 dark:bg-teal-950/20">
                <ArrowRightLeft className="mx-auto mb-2 h-6 w-6 text-teal-500" />
                <p className="text-sm font-medium text-teal-800 dark:text-teal-200">
                  No transfers recorded yet
                </p>
                <p className="text-xs text-muted-foreground">
                  This patient hasn&apos;t been moved since admission.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead className="w-10" aria-hidden="true" />
                      <TableHead>To</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(t.transferDate).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{t.fromBedNumber}</p>
                            <p className="text-xs text-muted-foreground">{t.fromWardName}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <ArrowRight className="mx-auto h-4 w-4 text-emerald-500" />
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{t.toBedNumber}</p>
                            <p className="text-xs text-muted-foreground">{t.toWardName}</p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs text-sm">
                          <span className="line-clamp-2">{t.transferReason || '—'}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {t.transferredByName || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available-beds quick summary (kept from the original page) */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
              <CircleCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
            </span>
            Available Beds ({availableBeds.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bedsLoading ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : availableBeds.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-muted-foreground">
              <Bed className="mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No available beds right now</p>
            </div>
          ) : (
            <div className="grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
              {availableBeds.map((bed) => (
                <div
                  key={bed.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800"
                >
                  <div>
                    <p className="font-medium">{bed.bedNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {bed.wardName} · ₹{bed.dailyRate}/day
                    </p>
                  </div>
                  <Badge
                    className={cn('text-[10px]', bedTypeChip[bed.bedType] || 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300')}
                  >
                    {formatBedType(bed.bedType)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
