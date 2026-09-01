'use client'

import { useMemo, useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FileText,
  Image as ImageIcon,
  Download,
  File,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  Stethoscope,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn, doctorDisplayName } from '@/lib/utils'
import { usePrescriptionStore } from '@/lib/prescription-store'

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

interface LabPartnerSummary {
  id: string
  labName: string
  city: string
  mobile: string
}

interface DoctorSummary {
  id: string
  specialization?: string | null
  user: {
    id: string
    name: string
  }
}

interface ExternalOrderSummary {
  id: string
  orderNo: string
  testName: string
  testType: string
  testFee: number
  status: string
  urgency: string
  orderedAt: string
  completedAt: string | null
  notes: string
  doctor: DoctorSummary | null
}

interface LabReportItem {
  id: string
  externalTestOrderId: string
  labPartnerId: string
  fileProxyUrl: string | null
  fileDownloadUrl: string | null
  fileName: string
  fileType: string
  fileSize: number
  reportData: string
  uploadedAt: string
  uploadedBy: string
  verifiedByDoctor: boolean
  verifiedAt: string | null
  notes: string
  externalOrder: ExternalOrderSummary
  labPartner: LabPartnerSummary | null
}

interface PatientReportsResponse {
  reports: LabReportItem[]
}

/** Row shape of GET /api/external-test-orders?patientId=… (doctor-scoped) */
interface ExternalOrderRow {
  id: string
  orderNo: string
  testName: string
  testType: string
  testFee: number
  status: string
  urgency: string
  orderedAt: string
  notes: string
  labPartner: { id: string; labName: string; city?: string; mobile?: string } | null
  doctor?: { user?: { name?: string } } | null
  reportUploads?: { id: string }[]
}

/** Unified row rendered in the Pending Tests table (from orders + re-uploads) */
interface PendingTestRow {
  key: string
  testName: string
  labName?: string
  labCity?: string
  doctorName?: string
  testType: string
  urgency: string
  status: string
  orderedAt: string
  fee: number
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

function isCompleted(status: string) {
  return status === 'Completed'
}

function isPending(status: string) {
  return status === 'Ordered' || status === 'InProgress'
}

function isAbnormal(report: LabReportItem) {
  const n = (report.notes || '').trim()
  if (!n) return false
  return /abnormal/i.test(n) || n.startsWith('⚠️')
}

function renderFileIcon(fileType: string, className?: string) {
  const cls = className
  if (fileType === 'application/pdf') return <FileText className={cls} />
  if (fileType.startsWith('image/')) return <ImageIcon className={cls} />
  return <File className={cls} />
}

function statusBadge(status: string) {
  switch (status) {
    case 'Completed':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
          Completed
        </Badge>
      )
    case 'InProgress':
      return (
        <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 border-0">
          In Progress
        </Badge>
      )
    case 'Ordered':
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">
          Ordered
        </Badge>
      )
    case 'Cancelled':
      return (
        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0">
          Cancelled
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="border-0">
          {status}
        </Badge>
      )
  }
}

function urgencyBadge(urgency: string) {
  if (urgency === 'Urgent') {
    return (
      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0">
        Urgent
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="border-0 text-muted-foreground">
      Normal
    </Badge>
  )
}

function testTypeBadge(testType: string) {
  switch (testType) {
    case 'Blood':
      return (
        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0">
          Blood
        </Badge>
      )
    case 'Radiology':
      return (
        <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-0">
          Radiology
        </Badge>
      )
    case 'Pathology':
      return (
        <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 border-0">
          Pathology
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="border-0">
          {testType || 'Other'}
        </Badge>
      )
  }
}

function formatDate(value: string | null) {
  if (!value) return '—'
  try {
    return format(new Date(value), 'MMM d, yyyy')
  } catch {
    return '—'
  }
}

function formatDateTime(value: string) {
  try {
    return format(new Date(value), "MMM d, yyyy 'at' h:mm a")
  } catch {
    return value
  }
}

function inrAmount(n: number) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '₹0'
  return '₹' + n.toLocaleString('en-IN')
}

// ──────────────────────────────────────────────────────────────────────────
// Report Viewer Dialog (mirrors patient reports page)
// ──────────────────────────────────────────────────────────────────────────

interface ReportViewerDialogProps {
  report: LabReportItem | null
  open: boolean
  onClose: () => void
}

function ReportViewerDialog({
  report,
  open,
  onClose,
}: ReportViewerDialogProps) {
  if (!report) return null

  const { externalOrder: order, labPartner, fileProxyUrl, fileDownloadUrl, fileName, fileType, notes } =
    report

  const doctorName = order.doctor?.user?.name || 'Unknown Doctor'
  const completedAt = order.completedAt ? formatDateTime(order.completedAt) : '—'

  const renderBody = () => {
    if (!fileProxyUrl) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 py-16 text-center">
          <File className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            No file attached to this report.
          </p>
        </div>
      )
    }
    if (fileType.startsWith('image/')) {
      return (
        <img
          src={fileProxyUrl || undefined}
          alt={fileName || order.testName}
          className="max-h-[60vh] w-auto mx-auto rounded-lg border border-border shadow-sm"
        />
      )
    }
    if (fileType === 'application/pdf') {
      return (
        <iframe
          src={fileProxyUrl || undefined}
          title={order.testName}
          className="w-full h-[60vh] rounded-lg border border-border bg-white"
        />
      )
    }
    // DOC, DOCX, DICOM, unknown
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-muted/30 py-16 text-center">
        <File className="h-10 w-10 text-muted-foreground/40" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Cannot preview this file type inline.
          </p>
          <p className="text-xs text-muted-foreground">
            Click Download to view the file.
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="bg-teal-500 hover:bg-teal-600 text-white"
        >
          <a
            href={fileDownloadUrl || fileProxyUrl || undefined}
            target="_blank"
            rel="noopener noreferrer"
            download={fileName || undefined}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </a>
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl pr-8">
            {order.testName}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="font-medium text-foreground/80">
              {labPartner?.labName || 'Unknown Lab'}
            </span>
            {labPartner?.city && (
              <span className="text-muted-foreground">{labPartner.city}</span>
            )}
            <span className="text-muted-foreground">·</span>
            <span>Referred by Dr. {doctorName}</span>
            <span className="text-muted-foreground">·</span>
            <span>Completed {completedAt}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
          {notes && (
            <div
              className={cn(
                'mb-4 rounded-lg border p-3 text-sm',
                isAbnormal(report)
                  ? 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40'
                  : 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40'
              )}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle
                  className={cn(
                    'h-4 w-4 mt-0.5 shrink-0',
                    isAbnormal(report)
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-amber-600 dark:text-amber-400'
                  )}
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground/80">
                    Lab Remarks
                  </p>
                  <p className="text-xs text-foreground/70 whitespace-pre-wrap">
                    {notes}
                  </p>
                </div>
              </div>
            </div>
          )}

          {renderBody()}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {fileProxyUrl && (
            <Button
              asChild
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              <a
                href={fileDownloadUrl || fileProxyUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                download={fileName || undefined}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Ready Report Card
// ──────────────────────────────────────────────────────────────────────────

interface ReadyReportCardProps {
  report: LabReportItem
  onView: () => void
}

function ReadyReportCard({ report, onView }: ReadyReportCardProps) {
  const {
    externalOrder: order,
    labPartner,
    fileProxyUrl,
    fileDownloadUrl,
    fileName,
    fileType,
  } = report
  const doctorName = order.doctor?.user?.name || 'Unknown'
  const abnormal = isAbnormal(report)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
    >
      <Card
        className={cn(
          'h-full overflow-hidden border-border transition-shadow hover:shadow-md',
          abnormal && 'border-rose-200 dark:border-rose-900'
        )}
      >
        <CardContent className="flex h-full flex-col p-5">
          {/* Header row: file icon + abnormal badge */}
          <div className="flex items-start justify-between gap-2">
            <div
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl',
                fileType === 'application/pdf'
                  ? 'bg-rose-100 dark:bg-rose-900/40'
                  : fileType.startsWith('image/')
                    ? 'bg-violet-100 dark:bg-violet-900/40'
                    : 'bg-teal-100 dark:bg-teal-900/40'
              )}
            >
              {renderFileIcon(
                fileType,
                cn(
                  'h-5 w-5',
                  fileType === 'application/pdf'
                    ? 'text-rose-600 dark:text-rose-400'
                    : fileType.startsWith('image/')
                      ? 'text-violet-600 dark:text-violet-400'
                      : 'text-teal-600 dark:text-teal-400'
                )
              )}
            </div>
            {abnormal && (
              <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Abnormal
              </Badge>
            )}
          </div>

          {/* Test name */}
          <h3 className="mt-3 text-base font-semibold leading-snug line-clamp-2">
            {order.testName}
          </h3>

          {/* Lab + city */}
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <p className="font-medium text-foreground/80">
              {labPartner?.labName || 'Unknown Lab'}
              {labPartner?.city ? ` · ${labPartner.city}` : ''}
            </p>
            <p className="flex items-center gap-1">
              <Stethoscope className="h-3 w-3" />
              Referred by Dr. {doctorName}
            </p>
            {order.completedAt && (
              <p className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                Completed {formatDate(order.completedAt)}
              </p>
            )}
          </div>

          {/* File name */}
          {fileName && (
            <p className="mt-2 truncate text-[11px] text-muted-foreground/70">
              {fileName}
            </p>
          )}

          {/* Footer actions */}
          <div className="mt-auto flex items-center gap-2 pt-4">
            <Button
              size="sm"
              onClick={onView}
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              View Report
            </Button>
            {fileProxyUrl && (
              <Button
                size="sm"
                variant="outline"
                asChild
                className="border-border"
              >
                <a
                  href={fileDownloadUrl || fileProxyUrl || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={fileName || undefined}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="sr-only">Download</span>
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────────

export function Step8Reports() {
  const patientId = usePrescriptionStore((s) => s.patientId)
  const patientName = usePrescriptionStore((s) => s.patientName)
  const goToPrev = usePrescriptionStore((s) => s.goToPrev)

  const [viewerReport, setViewerReport] = useState<LabReportItem | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)

  const { data, isLoading, isError, refetch } = useQuery<PatientReportsResponse>({
    queryKey: ['rx-patient-lab-reports', patientId],
    queryFn: () =>
      fetch(
        `/api/lab-reports/patient?patientId=${encodeURIComponent(patientId)}`
      ).then((r) => {
        if (!r.ok) throw new Error('Failed to load')
        return r.json()
      }),
    enabled: !!patientId,
    retry: false,
    // Keep the current reports visible while a background refetch (socket
    // invalidation) runs — no skeleton flash.
    placeholderData: keepPreviousData,
  })

  // Freshly ordered tests (status Ordered/InProgress, no upload yet) only
  // exist in the ExternalTestOrder table — the reports endpoint returns
  // LabReportUpload rows. Fetch the doctor's orders for this patient so the
  // "Pending Tests" table also shows tests the labs haven't reported on yet.
  const { data: ordersData } = useQuery<{ orders: ExternalOrderRow[] }>({
    queryKey: ['rx-patient-test-orders', patientId],
    queryFn: () =>
      fetch(
        `/api/external-test-orders?patientId=${encodeURIComponent(patientId)}`
      ).then((r) => {
        if (!r.ok) throw new Error('Failed to load orders')
        return r.json()
      }),
    enabled: !!patientId,
    retry: false,
    placeholderData: keepPreviousData,
  })

  const allReports: LabReportItem[] = data?.reports || []

  const readyReports = useMemo(
    () => allReports.filter((r) => isCompleted(r.externalOrder.status)),
    [allReports]
  )
  const pendingReports = useMemo(
    () =>
      allReports
        .filter((r) => isPending(r.externalOrder.status))
        .sort(
          (a, b) =>
            new Date(b.externalOrder.orderedAt).getTime() -
            new Date(a.externalOrder.orderedAt).getTime()
        ),
    [allReports]
  )

  // Unified pending rows: (a) orders with no upload yet + (b) uploads whose
  // order is still pending (e.g. awaiting a re-upload). Deduped by order id.
  const pendingRows = useMemo<PendingTestRow[]>(() => {
    const rows: PendingTestRow[] = []
    const seen = new Set<string>()
    for (const o of ordersData?.orders || []) {
      if (!isPending(o.status)) continue
      // Skip orders that already have an upload — they surface via pendingReports
      if ((o.reportUploads?.length ?? 0) > 0) {
        seen.add(o.id)
        continue
      }
      seen.add(o.id)
      rows.push({
        key: `order-${o.id}`,
        testName: o.testName,
        labName: o.labPartner?.labName,
        labCity: o.labPartner?.city,
        doctorName: o.doctor?.user?.name,
        testType: o.testType,
        urgency: o.urgency,
        status: o.status,
        orderedAt: o.orderedAt,
        fee: o.testFee,
      })
    }
    for (const r of pendingReports) {
      if (seen.has(r.externalOrder.id)) continue
      seen.add(r.externalOrder.id)
      rows.push({
        key: `upload-${r.id}`,
        testName: r.externalOrder.testName,
        labName: r.labPartner?.labName,
        labCity: r.labPartner?.city,
        doctorName: r.externalOrder.doctor?.user?.name,
        testType: r.externalOrder.testType,
        urgency: r.externalOrder.urgency,
        status: r.externalOrder.status,
        orderedAt: r.externalOrder.orderedAt,
        fee: r.externalOrder.testFee,
      })
    }
    return rows.sort(
      (a, b) =>
        new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime()
    )
  }, [ordersData, pendingReports])

  const openViewer = (report: LabReportItem) => {
    setViewerReport(report)
    setViewerOpen(true)
  }

  const closeViewer = () => {
    setViewerOpen(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <FlaskConical className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0" />
        <h2 className="text-lg font-semibold">
          Lab Reports
          {patientName && (
            <span className="text-muted-foreground font-normal">
              {' '}— {patientName}
            </span>
          )}
        </h2>
      </div>

      {/* Empty state — no patientId yet (init still loading) */}
      {!patientId && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FlaskConical className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              Loading patient information…
            </p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Reports will appear here once the patient is identified.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty state — no reports at all */}
      {patientId && !isLoading && !isError && allReports.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              No lab reports for this patient yet.
            </p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Use the <span className="font-medium text-foreground">Order Tests</span>{' '}
              tab to request tests — uploaded results will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {isError && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40">
              <AlertTriangle className="h-7 w-7 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Couldn&apos;t load lab reports for this patient.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/50"
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* SECTION 1: READY REPORTS */}
      {patientId && (isLoading || readyReports.length > 0) && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-semibold">Ready Reports</h3>
            {readyReports.length > 0 && (
              <Badge
                variant="secondary"
                className="border-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
              >
                {readyReports.length}
              </Badge>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 rounded-xl border border-border bg-card"
                >
                  <Skeleton className="h-full w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              layout
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {readyReports.map((report) => (
                <ReadyReportCard
                  key={report.id}
                  report={report}
                  onView={() => openViewer(report)}
                />
              ))}
            </motion.div>
          )}
        </section>
      )}

      {/* SECTION 2: PENDING TESTS */}
      {patientId && (isLoading || pendingRows.length > 0) && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-base font-semibold">Pending Tests</h3>
            {pendingRows.length > 0 && (
              <Badge
                variant="secondary"
                className="border-0 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
              >
                {pendingRows.length}
              </Badge>
            )}
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-0">
                <div className="space-y-2 p-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="min-w-[180px]">Test Name</TableHead>
                        <TableHead className="min-w-[160px]">Lab</TableHead>
                        <TableHead className="min-w-[140px]">Doctor</TableHead>
                        <TableHead className="min-w-[110px]">Test Type</TableHead>
                        <TableHead className="min-w-[90px]">Urgency</TableHead>
                        <TableHead className="min-w-[110px]">Status</TableHead>
                        <TableHead className="min-w-[120px]">Ordered At</TableHead>
                        <TableHead className="min-w-[90px] text-right">Fee</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRows.map((row) => (
                        <TableRow key={row.key} className="hover:bg-muted/30">
                          <TableCell className="font-medium">
                            {row.testName}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <p className="font-medium text-foreground/80">
                                {row.labName || '—'}
                              </p>
                              {row.labCity && (
                                <p className="text-muted-foreground">
                                  {row.labCity}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {row.doctorName
                              ? doctorDisplayName(row.doctorName)
                              : '—'}
                          </TableCell>
                          <TableCell>
                            {testTypeBadge(row.testType)}
                          </TableCell>
                          <TableCell>{urgencyBadge(row.urgency)}</TableCell>
                          <TableCell>{statusBadge(row.status)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(row.orderedAt)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-xs">
                            {inrAmount(row.fee)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {/* Viewer Dialog */}
      <ReportViewerDialog
        report={viewerReport}
        open={viewerOpen}
        onClose={closeViewer}
      />

      {/* Navigation */}
      <div className="flex pt-4 border-t">
        <Button variant="outline" onClick={goToPrev}>
          Back
        </Button>
      </div>
    </motion.div>
  )
}
