'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { PrescriptionStepper } from '@/components/prescription/stepper/prescription-stepper'
import { FinishPrintOverlay } from '@/components/prescription/finish-print-overlay'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function NewPrescriptionPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId') || ''

  // When set, the in-place finishing overlay (print preview + Mark Visit
  // Complete) is shown on top of the wizard — no new browser tab.
  const [finishingRxId, setFinishingRxId] = useState<string | null>(null)

  const handlePrint = useCallback((rxId: string) => {
    setFinishingRxId(rxId)
    toast.success('Prescription saved!')
  }, [])

  if (!bookingId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground mb-4">No appointment selected. Please select an appointment first.</p>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <>
      <PrescriptionStepper bookingId={bookingId} onPrint={handlePrint} />
      {finishingRxId && bookingId && (
        <FinishPrintOverlay
          prescriptionId={finishingRxId}
          bookingId={bookingId}
          onClose={() => setFinishingRxId(null)}
        />
      )}
    </>
  )
}
