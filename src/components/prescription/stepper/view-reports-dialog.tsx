'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, FileCheck2, AlertCircle, Download, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

interface ViewReportsDialogProps {
  open: boolean
  onClose: () => void
  bookingId: string
}

interface ReportItem {
  id: string
  fileName: string
  fileType: string
  uploadedAt: string
  notes: string
  verifiedByDoctor: boolean
  // API /api/lab-reports/patient returns labPartner at the TOP level of each
  // report row (not nested inside externalOrder) — keep both typed for safety.
  labPartner?: { labName: string; city?: string } | null
  externalOrder: {
    testName: string
    testType: string
    status: string
    labPartner?: { labName: string } | null
  }
}

export function ViewReportsDialog({ open, onClose, bookingId }: ViewReportsDialogProps) {
  // Fetch the booking to get patientId
  const { data: bookingData } = useQuery<{ booking: { userId: string; patientName: string } }>({
    queryKey: ['booking', bookingId],
    queryFn: () => fetch(`/api/dashboard/doctor/bookings/${bookingId}`).then((r) => r.json()),
    enabled: open && !!bookingId,
  })

  const patientId = bookingData?.booking?.userId || ''
  const patientName = bookingData?.booking?.patientName || 'Patient'

  // Fetch lab reports for this patient
  const { data, isLoading } = useQuery<{ reports: ReportItem[] }>({
    queryKey: ['view-reports', patientId],
    queryFn: () =>
      fetch(`/api/lab-reports/patient?patientId=${patientId}`).then((r) => {
        if (!r.ok) throw new Error('Failed to load reports')
        return r.json()
      }),
    enabled: open && !!patientId,
  })

  const reports = data?.reports || []

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            Lab Reports for {patientName}
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {!isLoading && reports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">No lab reports available yet.</p>
            <p className="text-xs mt-1">When the lab uploads reports, they will appear here.</p>
          </div>
        )}

        {!isLoading && reports.length > 0 && (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {reports.map((report, i) => {
              const isAbnormal = report.notes?.toLowerCase().includes('abnormal') || report.notes?.startsWith('⚠️')
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${
                    isAbnormal
                      ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400'
                      : report.verifiedByDoctor
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                      : 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400'
                  }`}>
                    {isAbnormal ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : report.verifiedByDoctor ? (
                      <FileCheck2 className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {report.externalOrder?.testName || 'Unknown Test'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {report.labPartner?.labName ||
                        report.externalOrder?.labPartner?.labName ||
                        'Unknown Lab'}
                      {report.labPartner?.city ? ` · ${report.labPartner.city}` : ''} ·{' '}
                      {format(new Date(report.uploadedAt), 'dd MMM yyyy, h:mm a')}
                    </p>
                    {report.notes && (
                      <p className="text-xs text-amber-600 mt-0.5 truncate">{report.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isAbnormal && (
                      <Badge className="text-[10px] px-1.5 py-0 bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
                        ⚠ Abnormal
                      </Badge>
                    )}
                    {report.verifiedByDoctor && (
                      <Badge className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                        ✓ Verified
                      </Badge>
                    )}
                    <a
                      href={`/api/lab-reports/${report.id}/file`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md p-1.5 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/20"
                      title="View Report"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {!patientId && !isLoading && (
          <p className="text-xs text-amber-600 text-center py-4">
            ⚠ This patient doesn&apos;t have a registered account. Reports can only be viewed for registered patients.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
