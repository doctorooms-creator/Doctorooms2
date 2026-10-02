'use client'

import { useState } from 'react'
import { useQuery, useQueries } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  Utensils,
  Plus,
  BedDouble,
  User,
  Clock,
  Ban,
  AlertCircle,
  RefreshCw,
  ClipboardList,
  Building2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  DietOrderDialog,
  StopDietDialog,
  type DietOrder,
  type PatientOption,
} from '@/components/diet/diet-dialogs'

// ============ TYPES ============

interface AdmittedPatient {
  admissionId: string
  admissionNo: string
  patientName: string
  age: number
  gender: string
  bedNumber: string
  bedType: string
  diagnosis: string
  doctorName: string
  departmentName: string
}

interface WardData {
  hasWard: boolean
  hospitalName?: string
  ward?: {
    id: string
    name: string
    wardType: string
    floorNo: number
    hospitalName: string
  }
  beds?: Array<{
    id: string
    bedNumber: string
    bedType: string
    status: string
    patient: {
      admissionId: string
      admissionNo: string
      patientName: string
      age: number
      gender: string
      diagnosis: string
      doctorName: string
      departmentName: string
      status: string
      admissionDate: string
    } | null
  }>
  stats?: { totalBeds: number; occupied: number; available: number }
  wards?: Array<{
    id: string
    name: string
    wardType: string
    floorNo: number
    totalBeds: number
    occupied: number
    available: number
  }>
}

// ============ HELPERS ============

function dietTypeBadgeClass(dietType: string): string {
  switch (dietType) {
    case 'NPO':
      return 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400'
    case 'Diabetic':
      return 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
    case 'Liquid':
    case 'Clear Liquid':
      return 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400'
    case 'Renal':
    case 'Hepatic':
      return 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-400'
    default:
      return 'border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-400'
  }
}

// ============ MAIN COMPONENT ============

export default function NurseDietOrdersClient() {
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [stopTarget, setStopTarget] = useState<DietOrder | null>(null)

  // Fetch ward patients
  const {
    data: wardData,
    isLoading,
    isError,
    refetch,
  } = useQuery<WardData>({
    queryKey: ['nurse-ward-patients'],
    queryFn: () =>
      fetch('/api/dashboard/nurse/ward-patients').then((r) => r.json()),
  })

  // Extract admitted patients from beds
  const admittedPatients: AdmittedPatient[] =
    wardData?.beds
      ?.filter((b) => b.patient && b.status === 'Occupied')
      .map((b) => ({
        admissionId: b.patient!.admissionId,
        admissionNo: b.patient!.admissionNo,
        patientName: b.patient!.patientName,
        age: b.patient!.age,
        gender: b.patient!.gender,
        bedNumber: b.bedNumber,
        bedType: b.bedType,
        diagnosis: b.patient!.diagnosis,
        doctorName: b.patient!.doctorName,
        departmentName: b.patient!.departmentName,
      })) || []

  // Fetch active diet orders for each admitted patient (in parallel)
  const dietQueries = useQueries({
    queries: admittedPatients.map((p) => ({
      queryKey: ['diet-orders', 'active', p.admissionId],
      queryFn: async () => {
        const res = await fetch(
          `/api/diet-orders?admissionId=${p.admissionId}&status=Active`
        )
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load diet orders')
        return data.diets as DietOrder[]
      },
      enabled: admittedPatients.length > 0,
    })),
  })

  // Build a flat list of { patient, diet } rows for active diet orders
  type DietRow = { patient: AdmittedPatient; diet: DietOrder }
  const activeDietRows: DietRow[] = []
  admittedPatients.forEach((patient, idx) => {
    const diets = dietQueries[idx]?.data || []
    if (diets.length === 0) {
      // patient without any active diet order — include as a row with no diet
      activeDietRows.push({ patient, diet: {} as DietOrder })
    } else {
      diets.forEach((diet) => activeDietRows.push({ patient, diet }))
    }
  })

  const patientOptions: PatientOption[] = admittedPatients.map((p) => ({
    admissionId: p.admissionId,
    patientName: p.patientName,
    bedNumber: p.bedNumber,
    admissionNo: p.admissionNo,
  }))

  // ============ LOADING STATE ============
  if (isLoading) return <DietOrdersSkeleton />

  // ============ ERROR STATE ============
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-muted-foreground">Failed to load ward patients.</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    )
  }

  // ============ NO WARD ASSIGNED ============
  if (wardData && !wardData.hasWard) {
    return (
      <div className="space-y-6">
        <PageHeader
          wardName={wardData.hospitalName || 'Hospital'}
          onNew={() => setNewDialogOpen(true)}
          disabledNew
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
            <Building2 className="h-10 w-10 text-muted-foreground" />
            <p className="text-center text-sm text-muted-foreground">
              You are not assigned to a specific ward.
              <br />
              Please ask your administrator to assign you a ward to manage diet orders.
            </p>
          </CardContent>
        </Card>
        <DietOrderDialog
          open={newDialogOpen}
          onOpenChange={setNewDialogOpen}
          patients={patientOptions}
        />
      </div>
    )
  }

  // ============ MAIN RENDER ============
  return (
    <div className="space-y-6">
      <PageHeader
        wardName={wardData?.ward?.name || 'Ward'}
        wardType={wardData?.ward?.wardType}
        onNew={() => setNewDialogOpen(true)}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={<BedDouble className="h-4 w-4" />}
          label="Admitted Patients"
          value={admittedPatients.length}
          tone="teal"
        />
        <StatCard
          icon={<Utensils className="h-4 w-4" />}
          label="Active Diet Orders"
          value={activeDietRows.filter((r) => r.diet?.id).length}
          tone="emerald"
        />
        <StatCard
          icon={<User className="h-4 w-4" />}
          label="Without Diet Order"
          value={
            admittedPatients.length -
            new Set(
              activeDietRows
                .filter((r) => r.diet?.id)
                .map((r) => r.patient.admissionId)
            ).size
          }
          tone="amber"
        />
        <StatCard
          icon={<ClipboardList className="h-4 w-4" />}
          label="Total Beds"
          value={wardData?.stats?.totalBeds ?? 0}
          tone="slate"
        />
      </div>

      {admittedPatients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
            <BedDouble className="h-10 w-10 text-muted-foreground" />
            <p className="text-center text-sm text-muted-foreground">
              No admitted patients in your ward right now.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden md:block">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Utensils className="h-4 w-4 text-teal-500" />
                Active Diet Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[60vh] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Bed</TableHead>
                      <TableHead>Diet Type</TableHead>
                      <TableHead>Meal</TableHead>
                      <TableHead>Instructions</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeDietRows.map((row) => (
                      <TableRow key={row.diet?.id || row.patient.admissionId}>
                        <TableCell>
                          <div className="font-medium">{row.patient.patientName}</div>
                          <div className="text-xs text-muted-foreground">
                            {row.patient.age}y / {row.patient.gender} • {row.patient.admissionNo}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-violet-300 text-violet-700 dark:border-violet-700 dark:text-violet-400">
                            <BedDouble className="mr-1 h-3 w-3" />
                            {row.patient.bedNumber}
                          </Badge>
                          <div className="mt-1 text-xs text-muted-foreground">{row.patient.bedType}</div>
                        </TableCell>
                        <TableCell>
                          {row.diet?.dietType ? (
                            <Badge variant="outline" className={dietTypeBadgeClass(row.diet.dietType)}>
                              {row.diet.dietType}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {row.diet?.mealType || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="max-w-[220px]">
                          {row.diet?.instructions ? (
                            <p className="truncate text-sm" title={row.diet.instructions}>
                              {row.diet.instructions}
                            </p>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {row.diet?.startDate
                            ? format(new Date(row.diet.startDate), 'dd MMM yyyy, HH:mm')
                            : '—'}
                        </TableCell>
                        <TableCell>
                          {row.diet?.id ? (
                            <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-400">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                              No Order
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.diet?.id ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/40"
                              onClick={() => setStopTarget(row.diet)}
                            >
                              <Ban className="mr-1 h-3.5 w-3.5" /> Stop
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-teal-700 hover:bg-teal-50 dark:text-teal-400"
                              onClick={() => setNewDialogOpen(true)}
                            >
                              <Plus className="mr-1 h-3.5 w-3.5" /> Order
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {activeDietRows.map((row) => (
              <motion.div
                key={row.diet?.id || row.patient.admissionId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{row.patient.patientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.patient.age}y / {row.patient.gender} • {row.patient.admissionNo}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 border-violet-300 text-violet-700 dark:border-violet-700 dark:text-violet-400">
                        <BedDouble className="mr-1 h-3 w-3" />
                        {row.patient.bedNumber}
                      </Badge>
                    </div>

                    <div className="mt-3 space-y-2 border-t pt-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Diet Type</span>
                        {row.diet?.dietType ? (
                          <Badge variant="outline" className={dietTypeBadgeClass(row.diet.dietType)}>
                            {row.diet.dietType}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Meal</span>
                        <span className="text-right">{row.diet?.mealType || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Started</span>
                        <span className="flex items-center gap-1 text-xs">
                          <Clock className="h-3 w-3" />
                          {row.diet?.startDate
                            ? format(new Date(row.diet.startDate), 'dd MMM, HH:mm')
                            : '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Status</span>
                        {row.diet?.id ? (
                          <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-400">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                            No Order
                          </Badge>
                        )}
                      </div>
                      {row.diet?.instructions && (
                        <div className="rounded-md bg-muted/50 p-2 text-xs">
                          <p className="font-medium text-muted-foreground">Instructions</p>
                          <p className="mt-0.5 whitespace-pre-wrap">{row.diet.instructions}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex justify-end">
                      {row.diet?.id ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400"
                          onClick={() => setStopTarget(row.diet)}
                        >
                          <Ban className="mr-1 h-3.5 w-3.5" /> Stop Diet
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-teal-600 hover:bg-teal-700"
                          onClick={() => setNewDialogOpen(true)}
                        >
                          <Plus className="mr-1 h-3.5 w-3.5" /> New Order
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}

      <DietOrderDialog
        open={newDialogOpen}
        onOpenChange={setNewDialogOpen}
        patients={patientOptions}
      />
      <StopDietDialog diet={stopTarget} onOpenChange={(open) => !open && setStopTarget(null)} />
    </div>
  )
}

// ============ SUB-COMPONENTS ============

function PageHeader({
  wardName,
  wardType,
  onNew,
  disabledNew,
}: {
  wardName: string
  wardType?: string
  onNew: () => void
  disabledNew?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Utensils className="h-5 w-5 text-teal-500" />
          Diet Orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {wardName}
          {wardType ? ` • ${wardType}` : ''}
        </p>
      </div>
      <Button
        onClick={onNew}
        disabled={disabledNew}
        className="bg-teal-600 hover:bg-teal-700"
      >
        <Plus className="mr-2 h-4 w-4" /> New Diet Order
      </Button>
    </motion.div>
  )
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: number
  tone: 'teal' | 'emerald' | 'amber' | 'slate'
}) {
  const toneClasses: Record<typeof tone, string> = {
    teal: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300',
  }
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', toneClasses[tone])}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function DietOrdersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
