'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, Clock, Stethoscope, MapPin, RefreshCw, Home, Printer, Pause, XCircle } from 'lucide-react'

export default function KioskStatusPage({ params }: { params: Promise<{ hospitalId: string; bookingId: string }> }) {
  const { hospitalId, bookingId } = use(params)
  const router = useRouter()

  // Poll every 3 seconds for status updates
  const { data, isLoading } = useQuery({
    queryKey: ['kiosk-status', hospitalId, bookingId],
    queryFn: async () => {
      const res = await fetch(`/api/public/hospital/${hospitalId}/kiosk-status/${bookingId}`)
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    refetchInterval: 3000, // poll every 3 seconds
  })

  const booking = data?.booking
  const department = data?.department
  const doctor = data?.doctor

  // Defensive optional reads (Phase 4): the backend may expose the doctor's
  // pause flag top-level or on the doctor object — treat both as optional.
  const isQueuePaused =
    data?.queuePaused === true || data?.doctor?.queuePaused === true

  const isApproved = booking?.status === 'Approve'
  const isPending = booking?.status === 'Pending'
  const isDeclined = booking?.status === 'Rejected' || booking?.status === 'Canceled'

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-teal-950/20">
      {/* Header */}
      <div className="bg-teal-600 text-white py-6 px-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Stethoscope className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Check-in Status</h1>
            <p className="text-sm text-teal-100">Track your request in real-time</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 mx-auto text-teal-600 animate-spin mb-4" />
              <p className="text-muted-foreground">Loading your status...</p>
            </CardContent>
          </Card>
        ) : !booking ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Booking not found</p>
              <Button className="mt-4" onClick={() => router.push(`/kiosk/${hospitalId}`)}>
                <Home className="h-4 w-4 mr-2" /> Back to Kiosk
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence mode="wait">
            {isPending && (
              <motion.div key="pending" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-2 border-amber-300 dark:border-amber-700">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      className="inline-flex mb-4"
                    >
                      <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Clock className="h-10 w-10 text-amber-600" />
                      </div>
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-2">Waiting for Approval</h2>
                    <p className="text-muted-foreground mb-4">
                      Your request has been sent to the reception desk.<br />
                      Please wait here — you'll be called shortly.
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 inline-block">
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        <RefreshCw className="h-4 w-4 inline mr-1 animate-spin" />
                        Checking every 3 seconds...
                      </p>
                    </div>
                    {isQueuePaused && (
                      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-400">
                        <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                        Doctor&apos;s queue is paused — approval may be delayed
                      </div>
                    )}
                    <div className="mt-6 text-left bg-muted/30 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Patient</span>
                        <span className="font-medium">{booking.patientName}</span>
                      </div>
                      {doctor && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Doctor</span>
                          <span>{doctor.name}</span>
                        </div>
                      )}
                      {department && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Department</span>
                          <span>{department.name}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {isApproved && (
              <motion.div key="approved" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="border-2 border-teal-300 dark:border-teal-700">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        className="inline-flex mb-4"
                      >
                        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                        </div>
                      </motion.div>
                      <h2 className="text-2xl font-bold mb-2 text-emerald-600">Approved!</h2>
                      <p className="text-muted-foreground">Your token has been assigned</p>
                    </div>

                    {/* Token Number — HUGE */}
                    <div className="text-center py-6 bg-teal-50 dark:bg-teal-950/30 rounded-xl mb-6">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Your Token Number</p>
                      <p className="text-5xl font-bold font-mono text-teal-700 dark:text-teal-300 mt-2">
                        {booking.tokenNumber}
                      </p>
                      <Badge className="mt-3 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 text-base px-4 py-1">
                        Queue Position: #{booking.queuePosition}
                      </Badge>
                    </div>

                    {/* Doctor + Room info */}
                    <div className="space-y-3 bg-muted/30 rounded-lg p-4 mb-6">
                      {doctor && (
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-5 w-5 text-teal-600" />
                          <span className="font-medium">{doctor.name}</span>
                          <span className="text-sm text-muted-foreground">{doctor.specialization}</span>
                        </div>
                      )}
                      {department && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-teal-600" />
                          <span>{department.name}</span>
                          {department.opdRoom && <span className="text-sm text-muted-foreground">· Room: {department.opdRoom}</span>}
                          {department.floorNo && <span className="text-sm text-muted-foreground">· {department.floorNo}</span>}
                        </div>
                      )}
                    </div>

                    {/* Instructions */}
                    <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 mb-6">
                      <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">Please proceed to the waiting area</p>
                      <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                        Your token will be called on the display screen. Keep this page open to track your position.
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={() => window.print()}
                      >
                        <Printer className="h-4 w-4 mr-2" /> Print Token
                      </Button>
                      <Button
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                        onClick={() => router.push(`/kiosk/${hospitalId}`)}
                      >
                        <Home className="h-4 w-4 mr-2" /> Done
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {isDeclined && (
              <motion.div key="rejected" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="border-2 border-rose-300 dark:border-rose-700">
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-4">
                      <XCircle className="h-10 w-10 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-rose-600 dark:text-rose-400">Booking not approved</h2>
                    <p className="text-muted-foreground mb-4">
                      We&apos;re sorry, your request could not be processed.
                      Please see the reception desk for assistance.
                    </p>
                    <Button onClick={() => router.push(`/kiosk/${hospitalId}`)}>
                      <Home className="h-4 w-4 mr-2" /> Back to Kiosk
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
