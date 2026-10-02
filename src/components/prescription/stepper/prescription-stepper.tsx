'use client'

import { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { usePrescriptionStore } from '@/lib/prescription-store'
import { useSocket } from '@/hooks/useSocket'
import { useAuthStore } from '@/lib/auth-store'
import { useQueryClient } from '@tanstack/react-query'
import { StepIndicator } from './step-indicator'
import { Step1Complaints } from './step-1-complaints'
import { Step2Vitals } from './step-2-vitals'
import { Step3Tables } from './step-3-tables'
import { Step4Medicines } from './step-4-medicines'
import { Step5Suggestions } from './step-5-suggestions'
import { Step6Finish } from './step-6-finish'
import { Step7OrderTests } from './step-7-order-tests'
import { Step8Reports } from './step-8-reports'
import { OrderTestsDialog } from './order-tests-dialog'
import { ViewReportsDialog } from './view-reports-dialog'
import { FlaskConical, FileText, Loader2, AlertTriangle, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

interface PrescriptionStepperProps {
  bookingId: string
  onPrint: (rxId: string) => void
}

export function PrescriptionStepper({ bookingId, onPrint }: PrescriptionStepperProps) {
  const store = usePrescriptionStore()
  const [showOrderTests, setShowOrderTests] = useState(false)
  const [showViewReports, setShowViewReports] = useState(false)
  const {
    prescriptionId,
    setPrescriptionId,
    setBookingId,
    setPatientId,
    setPatientInfo,
    currentStep,
    isInitializing,
    setIsInitializing,
    initError,
    setInitError,
    initAttempt,
    retryInit,
    reset,
  } = store

  const { user } = useAuthStore()
  const socket = useSocket({
    userId: user?.id,
    role: user?.role,
    name: user?.name,
    enabled: !!user,
  })
  const qc = useQueryClient()

  // Initialize
  useEffect(() => {
    reset()
    setBookingId(bookingId)

    let cancelled = false

    // Fetch the booking's patientId (and patient info) in parallel with
    // prescription init. The lab tabs (Step 7 / Step 8) need patientId to
    // call /api/external-test-orders and /api/lab-reports/patient.
    const bookingPromise = fetch(`/api/dashboard/doctor/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const b = data?.booking
        if (b) {
          if (b.userId) setPatientId(b.userId)
          if (b.patientName) {
            setPatientInfo(
              b.patientName,
              b.age != null ? String(b.age) : '',
              b.gender || ''
            )
          }
        }
      })
      .catch((err) => {
        console.error('Booking fetch failed:', err)
      })

    // Create or find existing draft prescription.
    // CRITICAL FIX (silent data-loss): the old code logged init failures to
    // the console and let the doctor continue with a null prescriptionId —
    // every step then saved to /api/prescription/null/* (404) while toasts
    // claimed success. Now init retries with backoff, and on final failure
    // the wizard is hard-blocked behind an explicit retry screen.
    const MAX_INIT_ATTEMPTS = 3
    const initPromise = (async () => {
      for (let attempt = 1; attempt <= MAX_INIT_ATTEMPTS; attempt++) {
        try {
          const r = await fetch('/api/prescription/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId }),
          })
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          const data = await r.json()
          if (cancelled) return
          const rxId = data.prescription?.id
          if (rxId) {
            setPrescriptionId(rxId)
            setInitError(false)

            // Warm the React Query cache for the upcoming steps in parallel
            // while the doctor is still on Step 1. Each step then renders
            // instantly (no skeleton flash) because its master data is
            // already cached. Fire-and-forget; errors are swallowed by
            // prefetchQuery and the step's own useQuery will retry.
            void qc.prefetchQuery({
              queryKey: ['rx-complaints'], // Step 1
              queryFn: () =>
                fetch('/api/dashboard/doctor/prescription-settings/complaints?status=Active').then((r) => r.json()),
            })
            void qc.prefetchQuery({
              queryKey: ['rx-labels'], // Step 2 — custom vitals labels
              queryFn: () =>
                fetch('/api/dashboard/doctor/prescription-settings/labels?status=Active').then((r) => r.json()),
            })
            void qc.prefetchQuery({
              queryKey: ['rx-medicines-master'], // Step 4 — medicine master
              queryFn: () => fetch('/api/dashboard/doctor/medicines?status=Active').then((r) => r.json()),
            })
            void qc.prefetchQuery({
              queryKey: ['rx-findings'], // Step 4 — findings dropdown
              queryFn: () =>
                fetch('/api/dashboard/doctor/prescription-settings/findings?status=Active').then((r) => r.json()),
            })
            void qc.prefetchQuery({
              queryKey: ['rx-table-templates'], // Step 3 — table templates
              queryFn: () =>
                fetch('/api/dashboard/doctor/prescription-settings/table-templates?status=Active').then((r) => r.json()),
            })

            // If existing draft, load data and determine start step
            if (!data.isNew) {
              loadExistingPrescription(rxId, setPatientInfo, store.setCurrentStep, store.markStepCompleted)
            }
            return
          }
          throw new Error('Init returned no prescription id')
        } catch (err) {
          console.error(`Init attempt ${attempt}/${MAX_INIT_ATTEMPTS} failed:`, err)
          if (attempt < MAX_INIT_ATTEMPTS) {
            // Exponential backoff before the next attempt.
            await new Promise((res) => setTimeout(res, 700 * attempt))
          }
        }
      }
      // All attempts exhausted — hard-block the wizard.
      if (!cancelled) {
        setInitError(true)
        toast.error('Could not start the prescription. Nothing is saved — please retry.')
      }
    })()

    Promise.all([bookingPromise, initPromise]).finally(() => {
      if (!cancelled) setIsInitializing(false)
    })

    return () => {
      cancelled = true
      reset()
    }
  }, [bookingId, initAttempt])

  // Auto-refresh the wizard's lab tabs (Step 7 — Order Tests, Step 8 — Reports)
  // when the lab technician accepts / rejects / uploads a report or when a new
  // order is placed. Uses TanStack Query invalidation. Partial-key matching
  // means invalidating `['rx-existing-test-orders']` matches the step-7
  // component's `['rx-existing-test-orders', patientId, bookingId]` query.
  useEffect(() => {
    if (!socket) return
    const refreshLab = () => {
      qc.invalidateQueries({ queryKey: ['external-test-orders'] })
      qc.invalidateQueries({ queryKey: ['patient-lab-reports'] })
      qc.invalidateQueries({ queryKey: ['rx-existing-test-orders'] })
      qc.invalidateQueries({ queryKey: ['rx-existing-reports'] })
      qc.invalidateQueries({ queryKey: ['lab-tech-incoming-orders-count'] })
      qc.invalidateQueries({ queryKey: ['lab-tech-dashboard'] })
    }
    socket.on('external-test-accepted', refreshLab)
    socket.on('external-test-rejected', refreshLab)
    socket.on('external-report-uploaded', refreshLab)
    socket.on('external-test-ordered', refreshLab)
    return () => {
      socket.off('external-test-accepted', refreshLab)
      socket.off('external-test-rejected', refreshLab)
      socket.off('external-report-uploaded', refreshLab)
      socket.off('external-test-ordered', refreshLab)
    }
  }, [socket, qc])

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Complaints onSaveComplete={() => store.goToNext()} />
      case 2:
        return <Step2Vitals />
      case 3:
        return <Step3Tables />
      case 4:
        return <Step4Medicines />
      case 5:
        return <Step5Suggestions />
      case 6:
        return <Step6Finish onPrint={onPrint} />
      case 7:
        return <Step7OrderTests />
      case 8:
        return <Step8Reports />
      default:
        return <Step1Complaints onSaveComplete={() => store.goToNext()} />
    }
  }

  if (isInitializing) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )
  }

  // HARD BLOCK (critical data-loss fix): if init failed after retries, or no
  // prescriptionId could be secured, refuse to render the wizard steps —
  // nothing would persist and the doctor would get fake success toasts.
  if (initError || !prescriptionId) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-red-200 bg-red-50/60 p-10 text-center dark:border-red-900 dark:bg-red-950/30">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
          <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">
            Prescription could not be started
          </h3>
          <p className="max-w-md text-sm text-red-700 dark:text-red-400">
            The server did not respond after 3 attempts. For safety, the wizard is
            locked — <strong>nothing has been saved</strong> and no data will be lost.
            Please retry, or go back and reopen the patient appointment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={retryInit} className="bg-red-600 hover:bg-red-700 text-white">
            <RotateCcw className="h-4 w-4 mr-2" />
            Retry Starting
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Independent Action Buttons (top of wizard) ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowOrderTests(true)}
          className="border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-400 dark:hover:bg-teal-950/20"
        >
          <FlaskConical className="h-4 w-4 mr-1" />
          Order Tests
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowViewReports(true)}
          className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/20"
        >
          <FileText className="h-4 w-4 mr-1" />
          View Reports
        </Button>
      </div>

      {/* Independent dialogs */}
      <OrderTestsDialog
        open={showOrderTests}
        onClose={() => setShowOrderTests(false)}
        bookingId={bookingId}
      />
      <ViewReportsDialog
        open={showViewReports}
        onClose={() => setShowViewReports(false)}
        bookingId={bookingId}
      />

      <StepIndicator />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          <Card>
            <CardContent className="pt-6">{renderStep()}</CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

async function loadExistingPrescription(
  rxId: string,
  setPatientInfo: (n: string, a: string, g: string) => void,
  setCurrentStep: (s: number) => void,
  markStepCompleted: (s: number) => void
) {
  try {
    const res = await fetch(`/api/prescription/${rxId}`)
    const data = await res.json()
    const rx = data.prescription
    if (!rx) return

    // Set patient info
    setPatientInfo(
      rx.patientName || rx.booking?.patientName || '',
      rx.patientAge || rx.booking?.age?.toString() || '',
      rx.booking?.gender || ''
    )

    // Determine which steps have data
    let lastStepWithData = 0

    if (rx.chiefComplaints && rx.chiefComplaints.length > 0) {
      lastStepWithData = 1
      markStepCompleted(1)
      // Set selected complaint IDs in store
      const ids = rx.chiefComplaints.map((c: { coId: string }) => c.coId)
      usePrescriptionStore.getState().setSelectedComplaintIds(ids)
    }

    if (rx.weight || rx.bp || rx.temperature || (rx.labels && rx.labels.length > 0)) {
      lastStepWithData = 2
      markStepCompleted(2)
      // Set vitals in store
      usePrescriptionStore.getState().setVitals({
        weight: rx.weight || '',
        bp: rx.bp || '',
        temperature: rx.temperature || '',
        pulse: '',
        spo2: '',
      })
      // Set labels
      if (rx.labels && rx.labels.length > 0) {
        usePrescriptionStore.getState().setLabelValues(
          rx.labels.map((l: { label: string; labelEn: string; value: string; labelUnit: string; showUnit: boolean }) => ({
            labelId: l.label || `label-${Math.random().toString(36).substring(2, 6)}`,
            label: l.label,
            labelEn: l.labelEn,
            value: l.value,
            labelUnit: l.labelUnit,
            showUnit: l.showUnit,
          }))
        )
      }
    }

    if (rx.diagnosisTables && rx.diagnosisTables.length > 0) {
      lastStepWithData = 3
      markStepCompleted(3)
    }

    if (rx.medicines && rx.medicines.length > 0) {
      lastStepWithData = 4
      markStepCompleted(4)
    }

    if (rx.suggestions && rx.suggestions.length > 0) {
      lastStepWithData = 5
      markStepCompleted(5)
    }

    // Start at the step after last completed
    setCurrentStep(Math.min(lastStepWithData + 1, 6))
  } catch (err) {
    console.error('Load existing Rx error:', err)
  }
}
