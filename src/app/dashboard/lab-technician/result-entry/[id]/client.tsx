'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, Save, AlertTriangle, CheckCircle2, User, FlaskConical, Zap, Stethoscope, TestTube } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

// ============ Types ============

interface TestParameter {
  id: string
  paramName: string
  shortCode: string
  unit: string
  normalMaleMin: number
  normalMaleMax: number
  normalFemaleMin: number
  normalFemaleMax: number
  normalChildMin: number
  normalChildMax: number
  sortOrder: number
}

interface ParameterValue {
  id: string
  value: string
  isAbnormal: boolean
  remarks: string
  testParameter: TestParameter
}

interface LabReport {
  id: string
  reportNo: string
  patientName: string
  patientAge: number
  patientGender: string
  status: string
  urgency: string
  notes: string
  createdAt: string
  sampleCollectedAt: string | null
  testMaster: {
    id: string
    name: string
    shortCode: string
    category: string
  }
  hospital: {
    name: string
  }
  parameterValues: ParameterValue[]
}

interface FormRow {
  parameterValueId: string
  parameterId: string
  paramName: string
  shortCode: string
  unit: string
  value: string
  remarks: string
  normalMin: number
  normalMax: number
}

function getNormalRange(param: TestParameter, gender: string, age: number) {
  let min = 0
  let max = 0
  if (gender?.toLowerCase() === 'female') {
    min = param.normalFemaleMin
    max = param.normalFemaleMax
  } else if (age < 14) {
    min = param.normalChildMin
    max = param.normalChildMax
  } else {
    min = param.normalMaleMin
    max = param.normalMaleMax
  }
  return { min, max }
}

function isValueAbnormal(value: string, min: number, max: number): boolean {
  const num = parseFloat(value)
  if (isNaN(num)) return false
  if (min === 0 && max === 0) return false
  return num < min || num > max
}

// ============ Component ============

export default function ResultEntryClient() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const reportId = params.id as string

  const [formRows, setFormRows] = useState<FormRow[]>([])

  // Fetch report detail
  const { data, isLoading, error } = useQuery<{ labReport: LabReport }>({
    queryKey: ['lab-report-detail', reportId],
    queryFn: () => fetch(`/api/lab-reports/${reportId}`).then((r) => r.json()),
    enabled: !!reportId,
  })

  const report = data?.labReport

  // Initialize form rows when data loads
  useEffect(() => {
    if (report?.parameterValues) {
      const rows: FormRow[] = report.parameterValues.map((pv) => {
        const { min, max } = getNormalRange(pv.testParameter, report.patientGender, report.patientAge)
        return {
          parameterValueId: pv.id,
          parameterId: pv.testParameter.id,
          paramName: pv.testParameter.paramName,
          shortCode: pv.testParameter.shortCode,
          unit: pv.testParameter.unit,
          value: pv.value || '',
          remarks: pv.remarks || '',
          normalMin: min,
          normalMax: max,
        }
      })
      setFormRows(rows)
    }
  }, [report])

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      // Server contract (enterResultSchema): { parameters: [{ parameterId (LabParameterValue id), resultValue, notes }] }
      const parameters = formRows.map((row) => ({
        parameterId: row.parameterValueId,
        resultValue: row.value,
        notes: row.remarks,
      }))
      const res = await fetch(`/api/lab-reports/${reportId}/enter-result`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parameters }),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed') }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Results saved successfully')
      queryClient.invalidateQueries({ queryKey: ['lab-report-detail', reportId] })
      queryClient.invalidateQueries({ queryKey: ['lab-worklist'] })
      router.push('/dashboard/lab-technician/worklist')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  function updateRow(index: number, field: 'value' | 'remarks', val: string) {
    const updated = [...formRows]
    updated[index] = { ...updated[index], [field]: val }
    setFormRows(updated)
  }

  function hasAbnormalValues() {
    return formRows.some(
      (row) => row.value && isValueAbnormal(row.value, row.normalMin, row.normalMax)
    )
  }

  function hasEmptyValues() {
    return formRows.some((row) => !row.value.trim())
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertTriangle className="mb-3 h-12 w-12 text-red-400" />
        <p className="text-sm text-muted-foreground">Report not found or error loading</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/lab-technician/worklist')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Worklist
        </Button>
      </div>
    )
  }

  if (report.status === 'Verified') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <CheckCircle2 className="mb-3 h-12 w-12 text-emerald-500" />
        <p className="font-medium">This report has already been verified</p>
        <p className="text-sm text-muted-foreground">Report: {report.reportNo}</p>
      </div>
    )
  }

  if (report.status === 'ResultEntered') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/lab-technician/worklist')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">{report.reportNo} — Results Already Entered</h1>
        </div>
        <p className="text-sm text-muted-foreground">This report is awaiting verification.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/lab-technician/worklist')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{report.reportNo} — Result Entry</h1>
            <p className="text-sm text-muted-foreground">{report.testMaster.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {report.urgency === 'STAT' && (
            <Badge className="animate-pulse bg-red-600 text-white hover:bg-red-600">
              <Zap className="mr-1 h-3 w-3" /> STAT
            </Badge>
          )}
          {report.urgency === 'Urgent' && (
            <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-400">
              <AlertTriangle className="mr-1 h-3 w-3" /> Urgent
            </Badge>
          )}
          <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-400">
            <TestTube className="mr-1 h-3 w-3" /> Sample Collected
          </Badge>
        </div>
      </motion.div>

      {/* Patient & Test Info — gradient summary banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 p-5 text-white shadow-lg"
      >
        {/* Decorative blurred circles */}
        <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 right-1/3 h-36 w-36 rounded-full bg-emerald-300/20 blur-2xl" />

        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-teal-100">Patient</p>
            <p className="flex items-center gap-1.5 font-semibold">
              <User className="h-4 w-4 text-teal-100" />
              {report.patientName}
            </p>
            <p className="text-xs text-teal-100">{report.patientAge}y / {report.patientGender}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-teal-100">Test</p>
            <p className="flex items-center gap-1.5 font-semibold">
              <FlaskConical className="h-4 w-4 text-teal-100" />
              {report.testMaster.name}
            </p>
            <p className="text-xs text-teal-100">{report.testMaster.category}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-teal-100">Hospital</p>
            <p className="font-semibold">{report.hospital.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-teal-100">Sample Collected</p>
            <p className="font-semibold">
              {report.sampleCollectedAt ? format(new Date(report.sampleCollectedAt), 'dd MMM yyyy, hh:mm a') : '—'}
            </p>
          </div>
        </div>

        {report.notes && (
          <div className="relative mt-4 flex items-start gap-2 rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm">
            <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-teal-100" />
            <p className="text-sm leading-relaxed text-teal-50">
              <span className="font-semibold">Clinical note: </span>{report.notes}
            </p>
          </div>
        )}
      </motion.div>

      {/* Parameters Result Entry */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Parameter Results</CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground">
                {formRows.filter((r) => r.value.trim()).length} / {formRows.length} entered
              </span>
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${formRows.length ? (formRows.filter((r) => r.value.trim()).length / formRows.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {formRows.map((row, idx) => {
            const abnormal = row.value ? isValueAbnormal(row.value, row.normalMin, row.normalMax) : false
            return (
              <motion.div
                key={row.parameterValueId}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={abnormal
                  ? 'rounded-lg border-2 border-red-300 bg-red-50/50 p-3 dark:border-red-800 dark:bg-red-950/20'
                  : 'rounded-lg border p-3'
                }
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {/* Parameter Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{row.paramName}</span>
                      {row.shortCode && (
                        <code className="rounded bg-muted px-1 py-0.5 text-xs">{row.shortCode}</code>
                      )}
                      {abnormal && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Normal: {row.normalMin} – {row.normalMax} {row.unit}</span>
                      {row.unit && <span>({report.patientGender === 'Female' ? 'Female' : report.patientAge < 14 ? 'Child' : 'Male'} range)</span>}
                    </div>
                  </div>

                  {/* Value Input */}
                  <div className="flex items-center gap-2">
                    <div className="w-28">
                      <Input
                        type="text"
                        value={row.value}
                        onChange={(e) => updateRow(idx, 'value', e.target.value)}
                        placeholder="Value"
                        className={abnormal ? 'border-red-400 focus-visible:ring-red-400 h-9 text-sm' : 'h-9 text-sm'}
                      />
                    </div>
                    {row.unit && (
                      <span className="text-sm text-muted-foreground w-16">{row.unit}</span>
                    )}
                    {abnormal && (
                      <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-400">
                        {parseFloat(row.value) > row.normalMax ? 'High' : 'Low'}
                      </span>
                    )}
                  </div>

                  {/* Remarks */}
                  <div className="w-full sm:w-36">
                    <Input
                      type="text"
                      value={row.remarks}
                      onChange={(e) => updateRow(idx, 'remarks', e.target.value)}
                      placeholder="Remarks"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          {hasAbnormalValues() && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              {formRows.filter((r) => r.value && isValueAbnormal(r.value, r.normalMin, r.normalMax)).length} value{formRows.filter((r) => r.value && isValueAbnormal(r.value, r.normalMin, r.normalMax)).length === 1 ? '' : 's'} outside normal range
            </p>
          )}
          {hasEmptyValues() && (
            <p className="text-sm text-muted-foreground">Some parameters have no value entered</p>
          )}
          {!hasEmptyValues() && !hasAbnormalValues() && (
            <p className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              All parameters entered and within normal range
            </p>
          )}
        </div>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="bg-teal-600 hover:bg-teal-700"
        >
          {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" /> Save Results
        </Button>
      </div>
    </div>
  )
}
