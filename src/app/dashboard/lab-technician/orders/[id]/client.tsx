'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Loader2,
  Upload,
  FileText,
  User as UserIcon,
  Stethoscope,
  IndianRupee,
  Percent,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  FileCheck2,
  Calendar,
  Phone,
  Mail,
  BadgeCheck,
  Printer,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

// ─── Types ───────────────────────────────────────────────────────────────

interface Patient {
  id: string
  name: string
  gender?: string
  mobileNo?: string
  email?: string
}

interface DoctorUser {
  id: string
  name: string
  specialization?: string
  mobileNo?: string
}

interface Doctor {
  user: DoctorUser
}

interface LabPartner {
  id: string
  labName?: string
  city?: string
}

interface ReportUpload {
  id: string

  fileName: string
  fileType: string
  fileSize: number
  reportData?: string
  uploadedAt: string
  uploadedBy: string
  verifiedByDoctor: boolean
  verifiedAt: string | null
  notes: string
}

interface Billing {
  id: string
  amount: number
  commissionAmount: number
  commissionPercent: number
  paymentStatus: string
}

interface Order {
  id: string
  orderNo: string
  testName: string
  testType: string
  testFee: number
  commissionPercent: number
  status: string
  urgency: string
  notes: string
  orderedAt: string
  completedAt: string | null
  patient: Patient
  doctor: Doctor
  labPartner: LabPartner
  reportUploads: ReportUpload[]
  billing: Billing | null
}

type OrderResponse = { order: Order }

// ─── Helpers ──────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  switch (status) {
    case 'Ordered':
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 dark:bg-amber-950/50 dark:text-amber-400">
          Ordered
        </Badge>
      )
    case 'InProgress':
      return (
        <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-0 dark:bg-violet-950/50 dark:text-violet-400">
          In Progress
        </Badge>
      )
    case 'Completed':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 dark:bg-emerald-950/50 dark:text-emerald-400">
          Completed
        </Badge>
      )
    case 'Cancelled':
      return (
        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0 dark:bg-rose-950/50 dark:text-rose-400">
          Cancelled
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function urgencyBadge(urgency: string) {
  if (urgency === 'Urgent') {
    return (
      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0 dark:bg-rose-950/50 dark:text-rose-400">
        <AlertTriangle className="mr-1 h-3 w-3" />
        Urgent
      </Badge>
    )
  }
  return <Badge variant="outline">Normal</Badge>
}

function formatDateTime(d: string | null) {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatFileSize(bytes: number) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

// ─── Component ────────────────────────────────────────────────────────────

export default function OrderDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [testFee, setTestFee] = useState<number>(0)
  const [file, setFile] = useState<File | null>(null)
  const [remarks, setRemarks] = useState('')
  const [isAbnormal, setIsAbnormal] = useState(false)
  const [reportData, setReportData] = useState(
    '[\n  {"param":"Hb","value":"8.5","unit":"g/dL","normal":"13-17","abnormal":true}\n]'
  )

  const { data, isLoading, isError } = useQuery<OrderResponse>({
    queryKey: ['lab-order', id],
    queryFn: async () => {
      const res = await fetch(`/api/external-test-orders/${id}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to load order')
      }
      return res.json()
    },
  })

  const order = data?.order

  // Hydrate local testFee once the order loads
  useEffect(() => {
    if (order && !testFee) setTestFee(order.testFee || 0)
  }, [order, testFee])

  const commissionAmount = useMemo(() => {
    const pct = order?.commissionPercent ?? 0
    return Math.round(testFee * pct) / 100
  }, [testFee, order?.commissionPercent])

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Please choose a file to upload')
      const formData = new FormData()
      formData.append('file', file)
      formData.append('remarks', remarks)
      formData.append('isAbnormal', String(isAbnormal))
      formData.append('reportData', reportData)
      formData.append('testFee', String(testFee))

      const res = await fetch(`/api/external-test-orders/${id}/upload-report`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to upload report')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Report uploaded. Lab billing auto-generated.')
      queryClient.invalidateQueries({ queryKey: ['lab-order', id] })
      queryClient.invalidateQueries({ queryKey: ['lab-incoming-orders'] })
      router.push('/dashboard/lab-technician/incoming-orders')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null
    setFile(f)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-full" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertTriangle className="mb-3 h-12 w-12 text-rose-400" />
        <p className="text-sm font-medium text-muted-foreground">Order not found</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => router.push('/dashboard/lab-technician/incoming-orders')}
        >
          <ArrowLeft className="mr-1 h-3 w-3" /> Back to Incoming Orders
        </Button>
      </div>
    )
  }

  const isCompleted = order.status === 'Completed'
  const isCancelled = order.status === 'Cancelled'

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-slate-200 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:mx-0 sm:rounded-lg sm:border">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/lab-technician/incoming-orders')}
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Incoming Orders
            </Button>
            <Separator orientation="vertical" className="hidden h-6 sm:block" />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-muted-foreground">Order</span>
              <code className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                {order.orderNo}
              </code>
              {statusBadge(order.status)}
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <UserIcon className="h-3 w-3 text-muted-foreground" />
                {order.patient?.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {urgencyBadge(order.urgency)}
            <Badge variant="outline" className="text-xs">
              {order.testType}
            </Badge>
            {isCompleted ? (
              <Button asChild variant="default" size="sm" className="bg-teal-600 hover:bg-teal-700">
                <a
                  href={`/print/lab-report/${order.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Printer className="mr-1 h-4 w-4" /> Print Report
                </a>
              </Button>
            ) : (
              <Button variant="default" size="sm" className="bg-teal-600 hover:bg-teal-700" disabled>
                <Printer className="mr-1 h-4 w-4" /> Print Report
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Patient Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserIcon className="h-4 w-4 text-teal-600" />
                Patient
              </CardTitle>
              <CardDescription>Read-only patient details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="text-sm font-medium">{order.patient?.name || '—'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Gender</Label>
                  <p className="text-sm font-medium">{order.patient?.gender || '—'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Mobile
                  </Label>
                  <p className="text-sm font-medium">{order.patient?.mobileNo || '—'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </Label>
                  <p className="text-sm font-medium break-words">
                    {order.patient?.email || '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="h-4 w-4 text-violet-600" />
                Order Details
              </CardTitle>
              <CardDescription>Test and doctor information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Test Name</Label>
                  <p className="text-sm font-medium">{order.testName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Test Type</Label>
                  <p className="text-sm font-medium">{order.testType}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Ordered At
                  </Label>
                  <p className="text-sm font-medium">{formatDateTime(order.orderedAt)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Completed At</Label>
                  <p className="text-sm font-medium">{formatDateTime(order.completedAt)}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">Doctor</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {order.doctor?.user?.name || '—'}
                    </p>
                    {order.doctor?.specialization && (
                      <Badge variant="outline" className="text-xs">
                        {order.doctor.specialization}
                      </Badge>
                    )}
                  </div>
                </div>
                {order.notes && (
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Doctor Notes</Label>
                    <p className="text-sm text-foreground whitespace-pre-wrap rounded-md bg-muted/50 p-2">
                      {order.notes}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Test Fee & Commission Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <IndianRupee className="h-4 w-4 text-emerald-600" />
              Test Fee &amp; Commission
            </CardTitle>
            <CardDescription>
              Final test fee used to compute billing. Commission amount auto-calculated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="testFee" className="text-xs">
                  Test Fee (₹)
                </Label>
                <Input
                  id="testFee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={testFee}
                  onChange={(e) => setTestFee(parseFloat(e.target.value) || 0)}
                  disabled={isCompleted || isCancelled}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <Percent className="h-3 w-3" /> Commission %
                </Label>
                <Input
                  type="text"
                  value={`${order.commissionPercent}%`}
                  disabled
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Commission Amount</Label>
                <div className="flex h-9 items-center rounded-md border border-input bg-muted/50 px-3">
                  <span className="text-sm font-mono text-amber-700">
                    {fmt(commissionAmount)}
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Lab revenue after commission:{' '}
              <span className="font-semibold text-emerald-700">
                {fmt(testFee - commissionAmount)}
              </span>
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upload Report Card */}
      {!isCompleted && !isCancelled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Upload className="h-4 w-4 text-violet-600" />
                Upload Report
              </CardTitle>
              <CardDescription>
                Upload the test report file and mark this order as completed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File input */}
              <div className="space-y-1.5">
                <Label htmlFor="report-file" className="text-xs">
                  Report File
                </Label>
                <label
                  htmlFor="report-file"
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-slate-300 bg-muted/30 p-6 text-center transition hover:border-violet-400 hover:bg-violet-50/50"
                >
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  {file ? (
                    <div>
                      <p className="text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {file.type || 'unknown type'}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium">Click to choose a file</p>
                      <p className="text-xs text-muted-foreground">
                        PDF, JPG, PNG, DOCX, DICOM — up to 25 MB
                      </p>
                    </div>
                  )}
                  <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white">
                    <Upload className="h-3 w-3" /> Browse File
                  </span>
                </label>
                <input
                  id="report-file"
                  type="file"
                  accept="*/*"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </div>

              {/* Remarks */}
              <div className="space-y-1.5">
                <Label htmlFor="remarks" className="text-xs">
                  Remarks
                </Label>
                <Textarea
                  id="remarks"
                  placeholder="Lab tech notes about the report..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Flag abnormal */}
              <div className="flex items-center space-x-2 rounded-md border border-rose-200 bg-rose-50/50 p-3">
                <Checkbox
                  id="abnormal"
                  checked={isAbnormal}
                  onCheckedChange={(v) => setIsAbnormal(v === true)}
                  className="border-rose-400 data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                />
                <Label htmlFor="abnormal" className="text-sm font-medium text-rose-700 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Flag as Abnormal
                </Label>
              </div>

              {/* reportData */}
              <div className="space-y-1.5">
                <Label htmlFor="reportData" className="text-xs">
                  Report Data (optional, JSON)
                </Label>
                <p className="text-xs text-muted-foreground">
                  For typed blood-test results as JSON string. Example:{' '}
                  <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
                    {`[{"param":"Hb","value":"8.5","unit":"g/dL","normal":"13-17","abnormal":true}]`}
                  </code>
                </p>
                <Textarea
                  id="reportData"
                  placeholder='[{"param":"Hb","value":"8.5","unit":"g/dL","normal":"13-17","abnormal":true}]'
                  value={reportData}
                  onChange={(e) => setReportData(e.target.value)}
                  rows={4}
                  className="resize-y font-mono text-xs"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-violet-600 hover:bg-violet-700"
                  disabled={uploadMutation.isPending || !file}
                  onClick={() => uploadMutation.mutate()}
                >
                  {uploadMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileCheck2 className="mr-2 h-4 w-4" />
                  )}
                  Upload Report &amp; Mark Complete
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Existing Reports Card */}
      {order.reportUploads && order.reportUploads.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-teal-600" />
                Existing Reports
              </CardTitle>
              <CardDescription>
                {order.reportUploads.length} upload(s) on this order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.reportUploads.map((up) => (
                <div
                  key={up.id}
                  className="flex flex-col gap-3 rounded-md border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <FileText className="h-4 w-4 text-teal-600" />
                      <p className="text-sm font-medium">{up.fileName || 'Unnamed file'}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {up.fileType || 'unknown'}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {formatFileSize(up.fileSize)}
                      </Badge>
                      {up.verifiedByDoctor && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">
                          <BadgeCheck className="mr-1 h-3 w-3" />
                          Verified by Doctor
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>Uploaded {formatDateTime(up.uploadedAt)}</span>
                      <span>•</span>
                      <span>By: {up.uploadedBy?.slice(-6) || '—'}</span>
                      {up.notes && (
                        <>
                          <span>•</span>
                          <span className="italic">{up.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-teal-200 text-teal-700 hover:bg-teal-50"
                    asChild
                  >
                    <a href={`/api/lab-reports/${up.id}/file?download=true`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1 h-3 w-3" /> View File
                    </a>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Completed / Cancelled banner */}
      {(isCompleted || isCancelled) && (
        <Card className={`border ${isCompleted ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-200 bg-rose-50/50'}`}>
          <CardContent className="flex items-center gap-3 p-4">
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 text-rose-600" />
            )}
            <div>
              <p className="text-sm font-medium">
                This order is {isCompleted ? 'completed' : 'cancelled'}.
              </p>
              <p className="text-xs text-muted-foreground">
                {isCompleted
                  ? 'Lab billing has been auto-generated. You can review the uploaded reports above.'
                  : 'No further action required.'}
              </p>
            </div>
            {order.billing && (
              <Badge variant="outline" className="ml-auto text-xs">
                {order.billing.paymentStatus === 'Paid' ? 'Paid' : 'Pending'} •{' '}
                {fmt(order.billing.amount)}
              </Badge>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
