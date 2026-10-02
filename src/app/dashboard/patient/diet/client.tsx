'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  Utensils,
  BedDouble,
  Building2,
  Stethoscope,
  Clock,
  CalendarDays,
  Ban,
  ClipboardList,
  AlertCircle,
  RefreshCw,
  FileText,
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
import type { DietOrder } from '@/components/diet/diet-dialogs'

// ============ TYPES ============

interface PatientAdmission {
  id: string
  admissionNo: string
  status: string
  admissionDate: string
  dischargeDate: string | null
  patientName: string
  initialDiagnosis: string
  wardName: string
  wardType: string
  bedNumber: string
  bedType: string
  departmentName: string
  hospitalName: string
  attendingDoctorName: string
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

export default function PatientDietClient() {
  // 1. Fetch patient's admissions (active first)
  const {
    data: admissionsData,
    isLoading: loadingAdmissions,
    isError: admissionsError,
    refetch: refetchAdmissions,
  } = useQuery<{ admissions: PatientAdmission[] }>({
    queryKey: ['patient-admissions'],
    queryFn: () => fetch('/api/patient/admissions').then((r) => r.json()),
  })

  const admissions = admissionsData?.admissions || []
  const activeAdmission =
    admissions.find((a) => a.status === 'Admitted') || null

  // 2. Fetch diet orders for active admission
  const {
    data: dietData,
    isLoading: loadingDiets,
    isError: dietsError,
    refetch: refetchDiets,
  } = useQuery<{ diets: DietOrder[] }>({
    queryKey: ['patient-diet', activeAdmission?.id],
    queryFn: () =>
      fetch(`/api/diet-orders?admissionId=${activeAdmission!.id}`).then((r) =>
        r.json()
      ),
    enabled: !!activeAdmission,
  })

  const diets = dietData?.diets || []
  const activeDiets = diets.filter((d) => d.status === 'Active')
  const stoppedDiets = diets.filter((d) => d.status === 'Stopped')

  // ============ LOADING ============
  if (loadingAdmissions) return <PatientDietSkeleton />

  // ============ ERROR ============
  if (admissionsError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-muted-foreground">Failed to load your admission records.</p>
        <Button variant="outline" onClick={() => refetchAdmissions()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    )
  }

  // ============ NO ADMISSION ============
  if (!activeAdmission) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <BedDouble className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-center font-medium">No active admission</p>
            <p className="max-w-sm text-center text-sm text-muted-foreground">
              You do not have an active inpatient (IPD) admission at the moment.
              Your diet plan will appear here once you are admitted.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ============ DIET ERROR ============
  if (dietsError) {
    return (
      <div className="space-y-6">
        <PageHeader admission={activeAdmission} />
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-muted-foreground">Failed to load your diet plan.</p>
          <Button variant="outline" onClick={() => refetchDiets()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </div>
      </div>
    )
  }

  // ============ MAIN RENDER ============
  return (
    <div className="space-y-6">
      <PageHeader admission={activeAdmission} />

      {/* Admission context card */}
      <Card>
        <CardContent className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4">
          <InfoTile
            icon={<Building2 className="h-4 w-4 text-teal-500" />}
            label="Hospital"
            value={activeAdmission.hospitalName}
          />
          <InfoTile
            icon={<BedDouble className="h-4 w-4 text-violet-500" />}
            label="Ward / Bed"
            value={`${activeAdmission.wardName} — Bed ${activeAdmission.bedNumber}`}
          />
          <InfoTile
            icon={<Stethoscope className="h-4 w-4 text-emerald-500" />}
            label="Attending Doctor"
            value={activeAdmission.attendingDoctorName || '—'}
          />
          <InfoTile
            icon={<CalendarDays className="h-4 w-4 text-amber-500" />}
            label="Admitted On"
            value={format(new Date(activeAdmission.admissionDate), 'dd MMM yyyy')}
          />
          {activeAdmission.initialDiagnosis && (
            <div className="col-span-2 sm:col-span-3 lg:col-span-4">
              <InfoTile
                icon={<FileText className="h-4 w-4 text-slate-500" />}
                label="Diagnosis"
                value={activeAdmission.initialDiagnosis}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading state for diets */}
      {loadingDiets ? (
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active diet plan card(s) */}
          {activeDiets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Utensils className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium">No active diet plan</p>
                <p className="max-w-sm text-center text-sm text-muted-foreground">
                  Your doctor or nurse has not placed any active diet orders yet.
                  Please check with the nursing staff.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeDiets.map((diet) => (
                <motion.div
                  key={diet.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-teal-200 dark:border-teal-900">
                    <CardHeader className="pb-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Utensils className="h-5 w-5 text-teal-500" />
                          Current Diet Plan
                        </CardTitle>
                        <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-400">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <InfoTile
                          icon={<Utensils className="h-4 w-4 text-teal-500" />}
                          label="Diet Type"
                          value={
                            <Badge variant="outline" className={dietTypeBadgeClass(diet.dietType)}>
                              {diet.dietType}
                            </Badge>
                          }
                        />
                        <InfoTile
                          icon={<ClipboardList className="h-4 w-4 text-emerald-500" />}
                          label="Meal Type"
                          value={diet.mealType}
                        />
                        <InfoTile
                          icon={<Clock className="h-4 w-4 text-amber-500" />}
                          label="Started"
                          value={format(new Date(diet.startDate), 'dd MMM yyyy, HH:mm')}
                        />
                        <InfoTile
                          icon={<CalendarDays className="h-4 w-4 text-violet-500" />}
                          label="Ordered"
                          value={format(new Date(diet.createdAt), 'dd MMM yyyy')}
                        />
                      </div>
                      {diet.instructions && (
                        <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-3 dark:border-teal-900 dark:bg-teal-950/20">
                          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-teal-700 dark:text-teal-400">
                            <FileText className="h-3.5 w-3.5" /> Instructions
                          </p>
                          <p className="whitespace-pre-wrap text-sm">{diet.instructions}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Diet history */}
          {diets.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-teal-500" />
                  Diet History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Desktop table */}
                <div className="hidden max-h-96 overflow-y-auto md:block">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead>Diet Type</TableHead>
                        <TableHead>Meal</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Stopped</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {diets.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell>
                            <Badge variant="outline" className={dietTypeBadgeClass(d.dietType)}>
                              {d.dietType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{d.mealType}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(new Date(d.startDate), 'dd MMM yyyy, HH:mm')}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {d.stoppedAt
                              ? format(new Date(d.stoppedAt), 'dd MMM yyyy, HH:mm')
                              : '—'}
                          </TableCell>
                          <TableCell>
                            {d.status === 'Active' ? (
                              <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-400">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                <Ban className="mr-1 h-3 w-3" /> Stopped
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile cards */}
                <div className="space-y-3 p-4 md:hidden">
                  {diets.map((d) => (
                    <div key={d.id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="outline" className={dietTypeBadgeClass(d.dietType)}>
                          {d.dietType}
                        </Badge>
                        {d.status === 'Active' ? (
                          <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-400">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                            <Ban className="mr-1 h-3 w-3" /> Stopped
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Meal</span>
                          <span>{d.mealType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Started</span>
                          <span className="text-xs">{format(new Date(d.startDate), 'dd MMM, HH:mm')}</span>
                        </div>
                        {d.stoppedAt && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Stopped</span>
                            <span className="text-xs">{format(new Date(d.stoppedAt), 'dd MMM, HH:mm')}</span>
                          </div>
                        )}
                        {d.stoppedReason && (
                          <div className="mt-1 rounded bg-muted/50 p-2 text-xs">
                            <span className="font-medium text-muted-foreground">Reason: </span>
                            {d.stoppedReason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

// ============ SUB-COMPONENTS ============

function PageHeader({ admission }: { admission?: PatientAdmission }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Utensils className="h-5 w-5 text-teal-500" />
          My Diet Plan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {admission
            ? `Admission ${admission.admissionNo} • ${admission.hospitalName}`
            : 'View your current diet orders and history'}
        </p>
      </div>
      {admission && (
        <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-400">
          Admitted
        </Badge>
      )}
    </motion.div>
  )
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium" title={typeof value === 'string' ? value : undefined}>
        {value || '—'}
      </p>
    </div>
  )
}

function PatientDietSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
