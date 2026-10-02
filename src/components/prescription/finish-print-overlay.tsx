'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Loader2, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  PrescriptionPrintView,
  type PrintData,
} from '@/components/prescription/print-view'

// ─── Types ────────────────────────────────────────────────

interface BookingResponse {
  booking: {
    id: string
    userId: string | null
    patientName: string
    status: string
  }
}

interface FinishPrintOverlayProps {
  prescriptionId: string
  bookingId: string
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────

/**
 * Finishing overlay for the consultation wizard (Step 6 "Save & Print").
 *
 * Replaces the old new-tab behavior: renders the prescription print
 * document in-place with an explicit Print button and a "Mark Visit
 * Complete" action (Visited → Finish) — no browser tab is opened.
 */
export function FinishPrintOverlay({
  prescriptionId,
  bookingId,
  onClose,
}: FinishPrintOverlayProps) {
  const queryClient = useQueryClient()
  const router = useRouter()

  // Prescription print payload — same query key as the rx detail page's
  // print preview, so a warm cache is reused (and vice versa).
  const {
    data: printData,
    isLoading: printLoading,
    isError: printError,
    refetch: refetchPrint,
  } = useQuery<PrintData>({
    queryKey: ['rx-print-data', prescriptionId],
    queryFn: () =>
      fetch(`/api/prescription/${prescriptionId}/print`).then((r) => {
        if (!r.ok) throw new Error('Failed to load print data')
        return r.json()
      }),
    enabled: !!prescriptionId,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  // Booking status — same query key as the Order Tests / View Reports
  // dialogs, so the wizard's booking cache stays shared and fresh.
  const { data: bookingData } = useQuery<BookingResponse>({
    queryKey: ['booking', bookingId],
    queryFn: () =>
      fetch(`/api/dashboard/doctor/bookings/${bookingId}`).then((r) => {
        if (!r.ok) throw new Error('Failed to load booking')
        return r.json()
      }),
    enabled: !!bookingId,
  })

  // Mark Visit Complete: booking status Visited → Finish
  // (PUT /api/dashboard/doctor/appointments/[id]/status — the same
  // endpoint Step 7 uses for the SentForTests flow).
  const completeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/dashboard/doctor/appointments/${bookingId}/status`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Finish' }),
        }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to mark visit complete')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Visit marked as complete')
      // Refresh any booking/queue caches so the doctor dashboard reflects the
      // completed visit immediately, then redirect straight to the dashboard.
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] })
      queryClient.invalidateQueries({ queryKey: ['doctor-queue'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-stats'] })
      router.push('/dashboard/doctor')
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Failed to mark visit complete'),
  })

  const isVisitComplete =
    bookingData?.booking?.status === 'Finish' || completeMutation.isSuccess

  // Loading state
  if (printLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="flex flex-col items-center gap-3 rounded-xl bg-background px-8 py-6 shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 dark:text-teal-400" />
          <p className="text-sm text-muted-foreground">
            Preparing print preview…
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (printError || !printData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="flex flex-col items-center gap-4 rounded-xl bg-background px-8 py-6 text-center shadow-lg">
          <AlertCircle className="h-10 w-10 text-rose-500 dark:text-rose-400" />
          <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
            Could not load the prescription print preview.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetchPrint()}>
              Retry
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PrescriptionPrintView
      data={printData}
      onClose={onClose}
      onPrint={() => window.print()}
      autoPrint={false}
      extraActions={
        <>
          <Button
            size="sm"
            onClick={() => window.print()}
            className="bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          {isVisitComplete ? (
            <Button
              size="sm"
              disabled
              className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              <CheckCircle2 className="h-4 w-4" />
              Visit Completed ✓
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
              className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              {completeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {completeMutation.isPending ? 'Marking…' : 'Mark Visit Complete'}
            </Button>
          )}
        </>
      }
    />
  )
}
