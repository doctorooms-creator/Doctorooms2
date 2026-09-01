'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { StatCard } from '@/components/dashboard/stat-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FileText, Clock, Package, ArrowRight, Stethoscope, Pill, Building2, CheckCircle2,
  Thermometer, Activity, Weight, Hash, Eye,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getAvatarDisplayUrl } from '@/lib/avatar-url'
import { mergeVitalsWithLabels } from '@/lib/prescription-labels'

interface DashMedicine {
  id: string
  medicine: string
  morning: boolean | number
  afternoon: boolean | number
  evening: boolean | number
  tab: number
  dose: string
  description: string
}

interface DashLabel {
  id: string
  label: string
  labelEn?: string
  value: string
  labelUnit: string
  showUnit?: boolean
}

interface PharmacistStats {
  isHospitalMode: boolean
  totalPrescriptions: number
  todayPrescriptions: number
  pendingFulfillments: number
  doctor: {
    id: string
    name: string
    profileImg: string | null
    specialization: string
  } | null
  hospital: {
    id: string
    name: string
    profileImg: string | null
    hospitalType: string
    address: string
    city: string
  } | null
  recentPrescriptions: {
    id: string
    patientName: string
    patientAge?: string
    patientGender?: string
    tokenNumber?: string
    disease: string
    description?: string
    weight?: string
    bp?: string
    temperature?: string
    createdAt: string
    medicineCount: number
    fulfillmentStatus: string
    doctorName?: string
    departmentName?: string | null
    medicines: DashMedicine[]
    labels: DashLabel[]
  }[]
}

function getFulfillmentBadge(status: string) {
  switch (status) {
    case 'Pending':
      return (
        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
          Pending
        </Badge>
      )
    case 'Packed':
      return (
        <Badge variant="outline" className="border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
          Packed
        </Badge>
      )
    case 'Dispensed':
      return (
        <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Dispensed
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function PharmacistDashboardPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  // Popup state — clicking a patient row opens the instant dispensing dialog
  const [viewRx, setViewRx] = useState<PharmacistStats['recentPrescriptions'][number] | null>(null)

  const { data: stats, isLoading } = useQuery<PharmacistStats>({
    queryKey: ['pharmacist-stats'],
    queryFn: () => fetch('/api/dashboard/pharmacist/stats').then((r) => r.json()),
  })

  const fulfillMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/dashboard/pharmacist/prescriptions/${id}/fulfill`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update')
      }
      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pharmacist-stats'] })
      toast.success(`Prescription marked as ${variables.status}`)
      // Keep the popup open and reflect the new status instantly
      if (viewRx && viewRx.id === variables.id) {
        setViewRx({ ...viewRx, fulfillmentStatus: variables.status })
      }
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  // Merged vitals for the popup (same merge logic as the Rx print)
  const mergedViewVitals = viewRx
    ? mergeVitalsWithLabels(
        { weight: viewRx.weight || '', bp: viewRx.bp || '', temperature: viewRx.temperature || '' },
        viewRx.labels || []
      )
    : null
  const viewExtras = (mergedViewVitals?.extraLabels || []).filter(
    (l) => l.value && String(l.value).trim() !== ''
  )

  if (isLoading) {
    return <PharmacistDashboardSkeleton />
  }

  const isHospitalMode = stats?.isHospitalMode ?? false

  return (
    <div className="space-y-6">
      {/* Hospital info banner (hospital mode) */}
      {isHospitalMode && stats?.hospital && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 rounded-xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-900 dark:bg-teal-950/30"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/50">
            <Building2 className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">Hospital Pharmacy</p>
              <Badge variant="outline" className="border-teal-300 text-teal-700 dark:border-teal-700 dark:text-teal-400">
                {stats.hospital.hospitalType}
              </Badge>
            </div>
            <p className="truncate text-lg font-semibold">{stats.hospital.name}</p>
            {(stats.hospital.city || stats.hospital.address) && (
              <p className="truncate text-sm text-muted-foreground">
                {[stats.hospital.address, stats.hospital.city].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Doctor info banner (clinic mode) */}
      {!isHospitalMode && stats?.doctor && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 rounded-xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-900 dark:bg-teal-950/30"
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src={getAvatarDisplayUrl(stats.doctor.profileImg)} />
            <AvatarFallback className="bg-teal-100 text-lg dark:bg-teal-900/50">
              {stats.doctor.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <p className="text-sm font-medium text-muted-foreground">Working with</p>
            </div>
            <p className="text-lg font-semibold">{stats.doctor.name}</p>
            {stats.doctor.specialization && (
              <p className="text-sm text-muted-foreground">{stats.doctor.specialization}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Stat cards */}
      <div className={cn(
        'grid gap-4',
        isHospitalMode ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'
      )}>
        <StatCard
          title="Total Prescriptions"
          value={stats?.totalPrescriptions ?? 0}
          icon={FileText}
          gradient="from-teal-500 to-teal-600"
          iconBg="bg-teal-100 dark:bg-teal-900/50"
        />
        <StatCard
          title="Today's Prescriptions"
          value={stats?.todayPrescriptions ?? 0}
          icon={Clock}
          gradient="from-amber-500 to-amber-600"
          iconBg="bg-amber-100 dark:bg-amber-900/50"
        />
        <StatCard
          title="Pending Fulfillments"
          value={stats?.pendingFulfillments ?? 0}
          icon={Package}
          gradient="from-violet-500 to-violet-600"
          iconBg="bg-violet-100 dark:bg-violet-900/50"
        />
        {isHospitalMode && (
          <StatCard
            title="Hospital Mode"
            value="All Depts"
            icon={Building2}
            gradient="from-sky-500 to-sky-600"
            iconBg="bg-sky-100 dark:bg-sky-900/50"
          />
        )}
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Button
          onClick={() => router.push('/dashboard/pharmacist/prescriptions')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          View Prescriptions
        </Button>
        <Button
          onClick={() => router.push('/dashboard/pharmacist/medicines')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Pill className="h-4 w-4" />
          Medicine Inventory
        </Button>
        <Button
          onClick={() => router.push('/dashboard/pharmacist/prescriptions')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Package className="h-4 w-4" />
          Pending Orders
        </Button>
      </div>

      {/* Recent prescriptions — click any row to open the instant dispensing popup */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">
            Recent Prescriptions
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              Click a patient to view &amp; dispense instantly
            </span>
          </CardTitle>
          <Link href="/dashboard/pharmacist/prescriptions">
            <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 dark:text-teal-400">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>ID</TableHead>
                {isHospitalMode && <TableHead>Doctor</TableHead>}
                <TableHead>Disease</TableHead>
                <TableHead>Medicines</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.recentPrescriptions?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isHospitalMode ? 8 : 7} className="py-8 text-center text-muted-foreground">
                    No prescriptions yet
                  </TableCell>
                </TableRow>
              )}
              {stats?.recentPrescriptions?.map((rx, i) => (
                <motion.tr
                  key={rx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group cursor-pointer border-b border-border transition-colors hover:bg-muted/50"
                  onClick={() => setViewRx(rx)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {rx.patientName}
                      {rx.patientAge && (
                        <span className="text-xs text-muted-foreground">({rx.patientAge})</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {rx.tokenNumber ? (
                      <Badge
                        variant="outline"
                        className="border-teal-300 bg-teal-50 font-mono text-[11px] text-teal-700 dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-400"
                      >
                        <Hash className="mr-0.5 h-3 w-3" />
                        {rx.tokenNumber}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  {isHospitalMode && (
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{rx.doctorName}</span>
                        {rx.departmentName && (
                          <span className="text-xs text-muted-foreground">{rx.departmentName}</span>
                        )}
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    {rx.disease ? (
                      <Badge variant="secondary" className="text-xs">{rx.disease}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Pill className="h-3.5 w-3.5 text-teal-500" />
                      <span className="text-sm text-muted-foreground">{rx.medicineCount} medicine{rx.medicineCount !== 1 ? 's' : ''}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getFulfillmentBadge(rx.fulfillmentStatus)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(rx.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-teal-600 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        setViewRx(rx)
                      }}
                      aria-label={`View medicines for ${rx.patientName}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Instant dispensing popup ── */}
      <Dialog open={!!viewRx} onOpenChange={(open) => !open && setViewRx(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-teal-500" />
              Prescription Details
            </DialogTitle>
          </DialogHeader>
          {viewRx && (
            <div className="space-y-5 pt-2">
              {/* Patient header */}
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-lg">{viewRx.patientName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(viewRx.createdAt), 'MMMM d, yyyy · h:mm a')}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {viewRx.tokenNumber && (
                        <Badge
                          variant="outline"
                          className="border-teal-300 bg-teal-50 font-mono text-xs text-teal-700 dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-400"
                        >
                          <Hash className="mr-1 h-3 w-3" />
                          {viewRx.tokenNumber}
                        </Badge>
                      )}
                      {viewRx.patientAge && (
                        <Badge variant="outline">Age: {viewRx.patientAge}</Badge>
                      )}
                      {viewRx.patientGender && (
                        <Badge variant="outline">{viewRx.patientGender}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getFulfillmentBadge(viewRx.fulfillmentStatus)}
                    {isHospitalMode && viewRx.doctorName && (
                      <span className="text-xs text-muted-foreground">{viewRx.doctorName}</span>
                    )}
                  </div>
                </div>

                {viewRx.disease && (
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground">Diagnosis</p>
                    <p className="text-sm font-medium">{viewRx.disease}</p>
                  </div>
                )}

                {/* Vitals */}
                {(mergedViewVitals?.vitals.weight || mergedViewVitals?.vitals.bp || mergedViewVitals?.vitals.temperature || mergedViewVitals?.vitals.pulse || mergedViewVitals?.vitals.spo2 || viewExtras.length > 0) && (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {mergedViewVitals?.vitals.weight && (
                      <div className="rounded-md bg-muted p-2.5 text-center">
                        <Weight className="mx-auto h-4 w-4 text-teal-500" />
                        <p className="mt-1 text-[10px] text-muted-foreground">Weight</p>
                        <p className="text-sm font-semibold">{mergedViewVitals.vitals.weight} kg</p>
                      </div>
                    )}
                    {mergedViewVitals?.vitals.bp && (
                      <div className="rounded-md bg-muted p-2.5 text-center">
                        <Activity className="mx-auto h-4 w-4 text-teal-500" />
                        <p className="mt-1 text-[10px] text-muted-foreground">BP</p>
                        <p className="text-sm font-semibold">{mergedViewVitals.vitals.bp}</p>
                      </div>
                    )}
                    {mergedViewVitals?.vitals.temperature && (
                      <div className="rounded-md bg-muted p-2.5 text-center">
                        <Thermometer className="mx-auto h-4 w-4 text-teal-500" />
                        <p className="mt-1 text-[10px] text-muted-foreground">Temp</p>
                        <p className="text-sm font-semibold">{mergedViewVitals.vitals.temperature}°F</p>
                      </div>
                    )}
                    {mergedViewVitals?.vitals.pulse && (
                      <div className="rounded-md bg-muted p-2.5 text-center">
                        <Activity className="mx-auto h-4 w-4 text-teal-500" />
                        <p className="mt-1 text-[10px] text-muted-foreground">Pulse</p>
                        <p className="text-sm font-semibold">{mergedViewVitals.vitals.pulse} bpm</p>
                      </div>
                    )}
                    {mergedViewVitals?.vitals.spo2 && (
                      <div className="rounded-md bg-muted p-2.5 text-center">
                        <Activity className="mx-auto h-4 w-4 text-teal-500" />
                        <p className="mt-1 text-[10px] text-muted-foreground">SpO2</p>
                        <p className="text-sm font-semibold">{mergedViewVitals.vitals.spo2}%</p>
                      </div>
                    )}
                    {viewExtras.map((l, i) => (
                      <div key={`x-${i}`} className="rounded-md bg-muted p-2.5 text-center">
                        <Activity className="mx-auto h-4 w-4 text-teal-500" />
                        <p className="mt-1 text-[10px] text-muted-foreground">{l.labelEn || l.label}</p>
                        <p className="text-sm font-semibold">
                          {l.value}{l.showUnit !== false && l.labelUnit ? ` ${l.labelUnit}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {viewRx.description && (
                  <p className="mt-3 rounded-lg bg-muted p-3 text-sm text-muted-foreground">{viewRx.description}</p>
                )}
              </div>

              {/* Medicines */}
              {viewRx.medicines?.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    Medicines ({viewRx.medicines.length})
                  </p>
                  <div className="space-y-2">
                    {viewRx.medicines.map((m) => (
                      <div key={m.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium">{m.medicine}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{m.tab} tab{m.tab !== 1 ? 's' : ''}</span>
                              {m.dose && (
                                <Badge variant="outline" className="text-[10px]">{m.dose}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {!!m.morning && (
                              <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-medium text-teal-700 dark:bg-teal-900/50 dark:text-teal-400">M</span>
                            )}
                            {!!m.afternoon && (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">A</span>
                            )}
                            {!!m.evening && (
                              <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-900/50 dark:text-violet-400">E</span>
                            )}
                          </div>
                        </div>
                        {m.description && (
                          <p className="mt-1.5 text-xs text-muted-foreground">{m.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dispatch actions — instant dispensing from the popup */}
              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                {viewRx.fulfillmentStatus === 'Dispensed' ? (
                  <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Dispensed — medicines handed over to the patient
                  </div>
                ) : (
                  <>
                    {viewRx.fulfillmentStatus !== 'Packed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-teal-600 border-teal-300 hover:bg-teal-50 dark:text-teal-400 dark:border-teal-700"
                        onClick={() => fulfillMutation.mutate({ id: viewRx.id, status: 'Packed' })}
                        disabled={fulfillMutation.isPending}
                      >
                        <Package className="mr-1.5 h-3.5 w-3.5" />
                        Mark as Packed
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                      onClick={() => fulfillMutation.mutate({ id: viewRx.id, status: 'Dispensed' })}
                      disabled={fulfillMutation.isPending}
                    >
                      {fulfillMutation.isPending ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      )}
                      Dispatch / Dispense
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PharmacistDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-6 w-40 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 animate-pulse rounded-xl bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
            <div className="mt-3 h-8 w-20 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="h-5 w-44 animate-pulse rounded bg-muted" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 space-y-1">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
