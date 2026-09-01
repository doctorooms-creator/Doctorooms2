'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
  Printer,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn, doctorDisplayName } from '@/lib/utils'

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

interface HospitalTestParameter {
  paramName: string
  shortCode: string
  unit: string
  normalMaleMin: number
  normalMaleMax: number
  normalFemaleMin: number
  normalFemaleMax: number
  normalChildMin: number
  normalChildMax: number
}

interface HospitalParameterValue {
  id: string
  value: string
  isAbnormal: boolean
  remarks: string
  testParameter: HospitalTestParameter
}

// Internal hospital LabReport (ordered by a doctor, processed by the
// hospital's own lab). See /api/lab-reports/patient → `hospitalReports`.
interface HospitalLabReport {
  id: string
  reportNo: string
  status: string
  urgency: string
  notes: string
  patientName: string
  patientAge: number
  patientGender: string
  createdAt: string
  verifiedAt: string | null
  testMaster: { name: string; shortCode: string; category: string } | null
  parameterValues: HospitalParameterValue[]
  hospital: { hospitalName: string; name: string } | null
  verifiedBy: { user: { name: string } } | null
}

interface PatientReportsResponse {
  reports: LabReportItem[]
  hospitalReports?: HospitalLabReport[]
}

type FilterTab = 'all' | 'ready' | 'pending'

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
        <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-0">
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

// ──────────────────────────────────────────────────────────────────────
// Hospital (internal) lab report helpers
// ──────────────────────────────────────────────────────────────────────

function isHospitalVerified(status: string) {
  return status === 'Verified'
}

function isHospitalPending(status: string) {
  return (
    status === 'Ordered' ||
    status === 'SampleCollected' ||
    status === 'ResultEntered'
  )
}

function hospitalStatusBadge(status: string) {
  switch (status) {
    case 'Verified':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 dark:bg-emerald-900/40 dark:text-emerald-400">
          Verified
        </Badge>
      )
    case 'ResultEntered':
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 dark:bg-amber-900/40 dark:text-amber-400">
          Result Entered
        </Badge>
      )
    case 'SampleCollected':
      return (
        <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 border-0 dark:bg-teal-900/40 dark:text-teal-400">
          Sample Collected
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="border-0">
          {status === 'Ordered' ? 'Ordered' : status}
        </Badge>
      )
  }
}

// Gender/age-appropriate reference range. Same precedence as
// /api/lab-reports/[id]/enter-result: female → child (<14 yrs) → male.
function hospitalNormalRange(
  param: HospitalTestParameter,
  gender: string,
  age: number
) {
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
  // Range unset (schema defaults are 0/0)
  if (!min && !max) return '—'
  return `${min} – ${max}${param.unit ? ` ${param.unit}` : ''}`
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Print-friendly popup (stylesheet-free approach): build a minimal HTML
// document in a new window and trigger the browser print dialog.
function printHospitalReport(report: HospitalLabReport) {
  const testName = report.testMaster?.name || 'Lab Test'
  const category = report.testMaster?.category || ''
  const hospitalName =
    report.hospital?.name || report.hospital?.hospitalName || 'Hospital Lab'
  const techName = report.verifiedBy?.user?.name || ''

  const rows = report.parameterValues
    .map((pv) => {
      const range = hospitalNormalRange(
        pv.testParameter,
        report.patientGender,
        report.patientAge
      )
      return `<tr${pv.isAbnormal ? ' style="background:#fee2e2"' : ''}>
<td>${escapeHtml(pv.testParameter.paramName)}${pv.testParameter.shortCode ? ` <span style="color:#6b7280;font-size:10px">(${escapeHtml(pv.testParameter.shortCode)})</span>` : ''}</td>
<td style="font-weight:700;${pv.isAbnormal ? 'color:#b91c1c;' : ''}">${escapeHtml(pv.value || '—')}</td>
<td>${escapeHtml(range)}</td>
<td>${pv.isAbnormal ? 'Abnormal' : 'Normal'}</td>
<td>${escapeHtml(pv.remarks || '—')}</td>
</tr>`
    })
    .join('')

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Lab Report ${escapeHtml(report.reportNo || '')}</title>
<style>
  body { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; color: #111827; margin: 28px; }
  h1 { font-size: 18px; margin: 0 0 2px; }
  .sub { color: #4b5563; font-size: 12px; margin: 0; }
  .meta { display: flex; justify-content: space-between; gap: 16px; font-size: 12px; line-height: 1.6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; margin: 14px 0 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f0fdfa; font-weight: 600; }
  .notes { font-size: 11px; color: #4b5563; margin-top: 10px; }
  footer { display: flex; justify-content: space-between; margin-top: 48px; font-size: 11px; color: #4b5563; }
  .sig { border-top: 1px solid #9ca3af; padding-top: 4px; width: 190px; text-align: center; }
  @media print { body { margin: 12px; } }
</style>
</head>
<body>
<h1>${escapeHtml(hospitalName)}</h1>
<p class="sub">Lab Report <strong>${escapeHtml(report.reportNo || '—')}</strong> · ${escapeHtml(testName)}${category ? ` · ${escapeHtml(category)}` : ''}</p>
<div class="meta">
  <div>
    <strong>Patient:</strong> ${escapeHtml(report.patientName || '—')}<br />
    <strong>Age / Gender:</strong> ${report.patientAge || '—'} yrs / ${escapeHtml(report.patientGender || '—')}<br />
    <strong>Ordered:</strong> ${escapeHtml(formatDate(report.createdAt))}
  </div>
  <div style="text-align:right">
    <strong>Status:</strong> ${escapeHtml(report.status)}<br />
    <strong>Verified:</strong> ${escapeHtml(report.verifiedAt ? formatDate(report.verifiedAt) : '—')}${techName ? `<br /><strong>Verified By:</strong> ${escapeHtml(techName)}` : ''}
  </div>
</div>
<table>
  <thead>
    <tr><th>Parameter</th><th>Result</th><th>Normal Range</th><th>Flag</th><th>Remarks</th></tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
${report.notes ? `<p class="notes"><strong>Notes:</strong> ${escapeHtml(report.notes)}</p>` : ''}
<footer>
  <div class="sig">Lab Technician</div>
  <div class="sig">Pathologist</div>
</footer>
</body>
</html>`

  const w = window.open('', '_blank', 'width=900,height=960')
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 300)
}

// ──────────────────────────────────────────────────────────────────────────
// Report Viewer Dialog
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
          className="max-h-[70vh] w-auto mx-auto rounded-lg border border-border shadow-sm"
        />
      )
    }
    if (fileType === 'application/pdf') {
      return (
        <iframe
          src={fileProxyUrl || undefined}
          title={order.testName}
          className="w-full h-[70vh] rounded-lg border border-border bg-white"
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
        <Button asChild size="sm" className="bg-teal-500 hover:bg-teal-600 text-white">
          <a href={fileDownloadUrl || fileProxyUrl || undefined} target="_blank" rel="noopener noreferrer" download={fileName || undefined}>
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
              <span className="text-muted-foreground">
                {labPartner.city}
              </span>
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
            <Button asChild className="bg-teal-500 hover:bg-teal-600 text-white">
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
// Hospital Lab Report Dialog (internal LabReport with parameter values)
// ──────────────────────────────────────────────────────────────────────────

interface HospitalReportDialogProps {
  report: HospitalLabReport | null
  open: boolean
  onClose: () => void
}

function HospitalReportDialog({
  report,
  open,
  onClose,
}: HospitalReportDialogProps) {
  if (!report) return null

  const testName = report.testMaster?.name || 'Lab Test'
  const category = report.testMaster?.category || ''
  const hospitalName =
    report.hospital?.name || report.hospital?.hospitalName || 'Hospital Lab'
  const techName = report.verifiedBy?.user?.name
  const abnormalCount =
    report.parameterValues.filter((pv) => pv.isAbnormal).length || 0

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2 text-lg sm:text-xl pr-8">
            <span>{testName}</span>
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-normal">
              {report.reportNo || '—'}
            </code>
            {abnormalCount > 0 && (
              <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0 dark:bg-rose-900/40 dark:text-rose-400">
                <AlertTriangle className="mr-1 h-3 w-3" />
                {abnormalCount} abnormal
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="font-medium text-foreground/80">
              {hospitalName}
            </span>
            <span className="text-muted-foreground">·</span>
            <span>Verified {formatDate(report.verifiedAt)}</span>
            {techName && (
              <>
                <span className="text-muted-foreground">·</span>
                <span>By {techName}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
          {/* Patient summary */}
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border bg-muted/30 px-3 py-2.5 text-xs">
            <span className="font-semibold text-foreground/80">
              {report.patientName || 'Patient'}
            </span>
            <span className="text-muted-foreground">
              {report.patientGender || '—'}
              {report.patientAge ? `, ${report.patientAge} yrs` : ''}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">
              Ordered {formatDate(report.createdAt)}
            </span>
            {category && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{category}</span>
              </>
            )}
          </div>

          {report.notes && (
            <div className="mb-4 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm dark:border-teal-900 dark:bg-teal-950/40">
              <div className="flex items-start gap-2">
                <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground/80">
                    Clinical Notes
                  </p>
                  <p className="whitespace-pre-wrap text-xs text-foreground/70">
                    {report.notes}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Parameters table */}
          {report.parameterValues.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 py-16 text-center">
              <FlaskConical className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                No parameters recorded for this test.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="min-w-[170px]">Parameter</TableHead>
                    <TableHead className="min-w-[110px]">Result</TableHead>
                    <TableHead className="min-w-[130px]">
                      Normal Range
                    </TableHead>
                    <TableHead className="min-w-[95px]">Flag</TableHead>
                    <TableHead className="min-w-[110px]">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.parameterValues.map((pv) => {
                    const range = hospitalNormalRange(
                      pv.testParameter,
                      report.patientGender,
                      report.patientAge
                    )
                    return (
                      <TableRow
                        key={pv.id}
                        className={cn(
                          'hover:bg-muted/30',
                          pv.isAbnormal && 'bg-rose-50/70 dark:bg-rose-950/20'
                        )}
                      >
                        <TableCell>
                          <p className="text-sm font-medium">
                            {pv.testParameter.paramName}
                          </p>
                          {pv.testParameter.shortCode && (
                            <span className="mt-0.5 inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                              {pv.testParameter.shortCode}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'text-sm font-bold',
                              pv.isAbnormal &&
                                'text-rose-600 dark:text-rose-400'
                            )}
                          >
                            {pv.value || '—'}
                          </span>
                          {pv.testParameter.unit && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              {pv.testParameter.unit}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {range}
                        </TableCell>
                        <TableCell>
                          {pv.isAbnormal ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Abnormal
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Normal
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[180px] text-xs text-muted-foreground">
                          {pv.remarks ? (
                            <span className="whitespace-pre-wrap">
                              {pv.remarks}
                            </span>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            className="bg-teal-500 hover:bg-teal-600 text-white"
            onClick={() => printHospitalReport(report)}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Hospital Report Card (mobile)
// ──────────────────────────────────────────────────────────────────────────

interface HospitalReportCardProps {
  report: HospitalLabReport
  onView: () => void
}

function HospitalReportCard({ report, onView }: HospitalReportCardProps) {
  const verified = isHospitalVerified(report.status)
  const testName = report.testMaster?.name || 'Lab Test'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              {report.reportNo || '—'}
            </code>
            {hospitalStatusBadge(report.status)}
          </div>

          <div>
            <p className="text-sm font-semibold leading-snug">{testName}</p>
            {report.testMaster?.category && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {report.testMaster.category}
              </p>
            )}
          </div>

          <div className="space-y-1 text-xs text-muted-foreground">
            <p>Ordered {formatDate(report.createdAt)}</p>
            {report.verifiedAt && (
              <p className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                Verified {formatDate(report.verifiedAt)}
              </p>
            )}
          </div>

          {verified ? (
            <Button
              size="sm"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white"
              onClick={onView}
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              View Results
            </Button>
          ) : (
            <p className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2.5 text-xs italic text-muted-foreground">
              <Clock className="h-3 w-3" />
              Results in progress — check back later
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Stat Card (inline, simple)
// ──────────────────────────────────────────────────────────────────────────

interface MiniStatProps {
  title: string
  value: number
  icon: React.ElementType
  gradient: string
  iconBg: string
  iconColor: string
}

function MiniStat({ title, value, icon: Icon, gradient, iconBg, iconColor }: MiniStatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md'
      )}
    >
      <div
        className={cn(
          'absolute inset-y-0 right-0 w-1 bg-gradient-to-b',
          gradient
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            iconBg
          )}
        >
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
      </div>
    </motion.div>
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
  const { externalOrder: order, labPartner, fileProxyUrl, fileDownloadUrl, fileName, fileType, uploadedAt, notes } = report
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
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <a
                href={`/print/lab-report/${report.externalOrder.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span className="sr-only">Print</span>
              </a>
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
// Main Page Client
// ──────────────────────────────────────────────────────────────────────────

export default function PatientReportsClient() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [viewerReport, setViewerReport] = useState<LabReportItem | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [hospitalViewerReport, setHospitalViewerReport] =
    useState<HospitalLabReport | null>(null)
  const [hospitalViewerOpen, setHospitalViewerOpen] = useState(false)

  const { data, isLoading, isError, refetch } = useQuery<PatientReportsResponse>({
    queryKey: ['patient-lab-reports'],
    queryFn: () =>
      fetch('/api/lab-reports/patient').then((r) => {
        if (!r.ok) throw new Error('Failed to load')
        return r.json()
      }),
  })

  const allReports: LabReportItem[] = data?.reports || []
  const hospitalReports: HospitalLabReport[] = data?.hospitalReports || []

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

  const hospitalVerifiedReports = useMemo(
    () => hospitalReports.filter((r) => isHospitalVerified(r.status)),
    [hospitalReports]
  )
  const hospitalPendingReports = useMemo(
    () => hospitalReports.filter((r) => isHospitalPending(r.status)),
    [hospitalReports]
  )

  const stats = {
    total: allReports.length,
    ready: readyReports.length,
    pending: pendingReports.length,
  }

  const hospitalStats = {
    total: hospitalReports.length,
    verified: hospitalVerifiedReports.length,
    pending: hospitalPendingReports.length,
  }

  const openViewer = (report: LabReportItem) => {
    setViewerReport(report)
    setViewerOpen(true)
  }

  const closeViewer = () => {
    setViewerOpen(false)
  }

  const openHospitalViewer = (report: HospitalLabReport) => {
    setHospitalViewerReport(report)
    setHospitalViewerOpen(true)
  }

  const closeHospitalViewer = () => {
    setHospitalViewerOpen(false)
  }

  const showReady = activeTab === 'all' || activeTab === 'ready'
  const showPending = activeTab === 'all' || activeTab === 'pending'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-1"
      >
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          My Lab Reports
        </h1>
        <p className="text-sm text-muted-foreground">
          View your hospital lab results and test reports referred by your
          doctor.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[104px] rounded-xl border border-border bg-card"
            >
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
          ))
        ) : (
          <>
            <MiniStat
              title="Total Reports"
              value={stats.total}
              icon={FlaskConical}
              gradient="from-teal-400 to-teal-600"
              iconBg="bg-teal-100 dark:bg-teal-900/50"
              iconColor="text-teal-600 dark:text-teal-400"
            />
            <MiniStat
              title="Reports Ready"
              value={stats.ready}
              icon={CheckCircle2}
              gradient="from-emerald-400 to-emerald-600"
              iconBg="bg-emerald-100 dark:bg-emerald-900/50"
              iconColor="text-emerald-600 dark:text-emerald-400"
            />
            <MiniStat
              title="Pending Tests"
              value={stats.pending}
              icon={Clock}
              gradient="from-amber-400 to-amber-600"
              iconBg="bg-amber-100 dark:bg-amber-900/50"
              iconColor="text-amber-600 dark:text-amber-400"
            />
          </>
        )}
      </section>

      {/* SECTION 0: HOSPITAL LAB REPORTS (internal — ordered during visits) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-lg font-semibold">Hospital Lab Reports</h2>
          {hospitalReports.length > 0 && (
            <Badge
              variant="secondary"
              className="border-0 bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400"
            >
              {hospitalReports.length}
            </Badge>
          )}
          <span className="ml-auto hidden text-xs text-muted-foreground sm:block">
            Tests ordered by your doctor during your visit
          </span>
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
        ) : hospitalReports.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/40">
                <FlaskConical className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                No hospital lab reports yet
              </p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Results will appear here when your doctor orders tests during
                your visit.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stat counters */}
            <div className="grid gap-4 sm:grid-cols-3">
              <MiniStat
                title="Hospital Reports"
                value={hospitalStats.total}
                icon={FlaskConical}
                gradient="from-teal-400 to-teal-600"
                iconBg="bg-teal-100 dark:bg-teal-900/50"
                iconColor="text-teal-600 dark:text-teal-400"
              />
              <MiniStat
                title="Verified Results"
                value={hospitalStats.verified}
                icon={CheckCircle2}
                gradient="from-emerald-400 to-emerald-600"
                iconBg="bg-emerald-100 dark:bg-emerald-900/50"
                iconColor="text-emerald-600 dark:text-emerald-400"
              />
              <MiniStat
                title="In Progress"
                value={hospitalStats.pending}
                icon={Clock}
                gradient="from-amber-400 to-amber-600"
                iconBg="bg-amber-100 dark:bg-amber-900/50"
                iconColor="text-amber-600 dark:text-amber-400"
              />
            </div>

            {/* Desktop table */}
            <Card className="hidden md:block">
              <CardContent className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="min-w-[110px]">Report No</TableHead>
                        <TableHead className="min-w-[200px]">Test</TableHead>
                        <TableHead className="min-w-[130px]">Status</TableHead>
                        <TableHead className="min-w-[110px]">Ordered</TableHead>
                        <TableHead className="min-w-[110px]">Verified</TableHead>
                        <TableHead className="min-w-[120px] text-right">
                          Results
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hospitalReports.map((report) => (
                        <TableRow key={report.id} className="hover:bg-muted/30">
                          <TableCell>
                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                              {report.reportNo || '—'}
                            </code>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-medium">
                              {report.testMaster?.name || 'Lab Test'}
                            </p>
                            {report.testMaster?.category && (
                              <p className="text-xs text-muted-foreground">
                                {report.testMaster.category}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>{hospitalStatusBadge(report.status)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(report.createdAt)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(report.verifiedAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            {isHospitalVerified(report.status) ? (
                              <Button
                                size="sm"
                                className="bg-teal-500 hover:bg-teal-600 text-white"
                                onClick={() => openHospitalViewer(report)}
                              >
                                <FileText className="mr-1.5 h-3.5 w-3.5" />
                                View Results
                              </Button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs italic text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                In progress
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Mobile stacked cards */}
            <div className="grid gap-3 md:hidden">
              {hospitalReports.map((report) => (
                <HospitalReportCard
                  key={report.id}
                  report={report}
                  onView={() => openHospitalViewer(report)}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {([
          { key: 'all', label: 'All', count: stats.total },
          { key: 'ready', label: 'Ready', count: stats.ready },
          { key: 'pending', label: 'Pending', count: stats.pending },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {tab.label}
            <span
              className={cn(
                'inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold',
                activeTab === tab.key
                  ? 'bg-teal-200/70 dark:bg-teal-800/70'
                  : 'bg-background/60'
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Error state */}
      {isError && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40">
              <AlertTriangle className="h-7 w-7 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Couldn&apos;t load your lab reports.
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

      {/* SECTION 1: REPORTS READY */}
      {showReady && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-semibold">Reports Ready</h2>
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
          ) : readyReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="mt-4 text-sm font-medium text-muted-foreground">
                  No lab reports yet
                </p>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  Reports will appear here when your doctor orders tests and labs
                  upload results.
                </p>
              </CardContent>
            </Card>
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
      {showPending && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-lg font-semibold">Pending Tests</h2>
            {pendingReports.length > 0 && (
              <Badge
                variant="secondary"
                className="border-0 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
              >
                {pendingReports.length}
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
          ) : pendingReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <CheckCircle2 className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="mt-4 text-sm font-medium text-muted-foreground">
                  No pending tests
                </p>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  You have no lab tests waiting for results right now.
                </p>
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
                        <TableHead className="min-w-[120px]">Ordered At</TableHead>
                        <TableHead className="min-w-[110px]">Status</TableHead>
                        <TableHead className="min-w-[90px] text-right">Fee</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingReports.map((report) => {
                        const order = report.externalOrder
                        return (
                          <TableRow key={report.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">
                              {order.testName}
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                <p className="font-medium text-foreground/80">
                                  {report.labPartner?.labName || '—'}
                                </p>
                                {report.labPartner?.city && (
                                  <p className="text-muted-foreground">
                                    {report.labPartner.city}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs">
                              {order.doctor?.user?.name
                                ? doctorDisplayName(order.doctor.user.name)
                                : '—'}
                            </TableCell>
                            <TableCell>
                              {testTypeBadge(order.testType)}
                            </TableCell>
                            <TableCell>
                              {urgencyBadge(order.urgency)}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {formatDate(order.orderedAt)}
                            </TableCell>
                            <TableCell>
                              {statusBadge(order.status)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-xs">
                              {inrAmount(order.testFee)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
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

      {/* Hospital Report Viewer Dialog */}
      <HospitalReportDialog
        report={hospitalViewerReport}
        open={hospitalViewerOpen}
        onClose={closeHospitalViewer}
      />
    </div>
  )
}
