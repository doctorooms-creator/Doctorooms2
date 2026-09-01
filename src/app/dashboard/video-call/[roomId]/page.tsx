'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PhoneOff,
  Video,
  Shield,
  Timer,
  ExternalLink,
  Clock,
  Hash,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  profileImg: string | null
}

/** GET /api/video-call/[roomId] contract (server-authorized room context) */
interface VideoCallBooking {
  id: string
  status: string
  bookingMode: string
  timeSlot: string
  bookingDate: string
  tokenNumber: string | null
  patientName: string
  patientImg: string | null
  doctorName: string
  specialization: string | null
  videoRoomId: string
}

interface VideoCallContext {
  success: boolean
  viewerRole: 'doctor' | 'patient' | 'receptionist'
  booking: VideoCallBooking
}

interface JoinError {
  status: number
  title: string
  message: string
}

function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

/** Strip a leading "Dr." so we never render "Dr. Dr. …" */
function stripDrPrefix(name: string): string {
  return name.replace(/^Dr\.?\s+/i, '')
}

export default function VideoCallPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string

  const [user, setUser] = useState<AuthUser | null>(null)
  const [context, setContext] = useState<VideoCallContext | null>(null)
  const [joinError, setJoinError] = useState<JoinError | null>(null)
  const [loading, setLoading] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [iframeReady, setIframeReady] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Server-authorized room context + user identity, fetched in parallel.
  // The room context is the source of truth: if the API says we can't join,
  // the iframe is never rendered.
  useEffect(() => {
    let cancelled = false

    async function load() {
      let meData: { success?: boolean; user?: AuthUser } | null = null
      try {
        const meRes = await fetch('/api/auth/me')
        meData = await meRes.json()
      } catch {
        // Non-fatal — viewerRole from the room API still drives everything.
      }
      if (meData?.success && meData.user && !cancelled) {
        setUser(meData.user)
      }

      try {
        const res = await fetch(`/api/video-call/${roomId}`)
        if (res.status === 200) {
          const data: VideoCallContext = await res.json()
          if (data.success && data.booking) {
            if (!cancelled) setContext(data)
          } else {
            if (!cancelled) {
              setJoinError({
                status: 404,
                title: 'Unable to Join Consultation',
                message: "This consultation room doesn't exist or hasn't been started yet.",
              })
            }
          }
        } else if (res.status === 401 || res.status === 403) {
          if (!cancelled) {
            setJoinError({
              status: res.status,
              title: 'Unable to Join Consultation',
              message: 'You are not authorized to join this consultation.',
            })
          }
        } else if (res.status === 404) {
          if (!cancelled) {
            setJoinError({
              status: 404,
              title: 'Unable to Join Consultation',
              message: "This consultation room doesn't exist or hasn't been started yet.",
            })
          }
        } else {
          if (!cancelled) {
            setJoinError({
              status: res.status,
              title: 'Unable to Join Consultation',
              message: 'We could not load this consultation. Please try again in a moment.',
            })
          }
        }
      } catch {
        if (!cancelled) {
          setJoinError({
            status: 0,
            title: 'Unable to Join Consultation',
            message: 'We could not load this consultation. Please check your connection and try again.',
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [roomId])

  // Timer — only runs once the room is authorized
  useEffect(() => {
    if (!context) return
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [context])

  // Iframe readiness fallback: a cross-origin frame may never fire onLoad
  // (ad blockers, network filtering) — force-complete the overlay after 12s.
  useEffect(() => {
    if (!context) return
    const t = setTimeout(() => setIframeReady(true), 12000)
    return () => clearTimeout(t)
  }, [context])

  const handleEndCall = useCallback(() => {
    setShowEndDialog(true)
  }, [])

  const confirmEndCall = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setShowEndDialog(false)
    // Redirect based on the server-authorized viewer role
    const role = context?.viewerRole
    if (role === 'doctor' || role === 'receptionist' || user?.role === 'admin') {
      router.replace('/dashboard/doctor/appointments')
    } else {
      router.replace('/dashboard/patient/appointments')
    }
  }, [router, context, user])

  if (loading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Connecting...</p>
        </div>
      </div>
    )
  }

  // Error state — room missing, not started, or viewer not authorized.
  // The Jitsi iframe is deliberately NOT rendered in this branch.
  if (joinError || !context) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center space-y-4"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
            <Video className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {joinError?.title || 'Unable to Join Consultation'}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {joinError?.message || "This consultation room doesn't exist or hasn't been started yet."}
          </p>
          <Button
            variant="outline"
            className="mt-4 border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-400 dark:hover:bg-teal-950/40"
            onClick={confirmEndCall}
          >
            ← Back to Appointments
          </Button>
        </motion.div>
      </div>
    )
  }

  const { booking, viewerRole } = context

  const jitsiUrl = `https://meet.jit.si/${roomId}?config.startWithAudioMuted=false&config.startWithVideoMuted=true&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false&config.prejoinPageEnabled=false&config.disableDeepLinking=true`

  // Header subtitle = the counterpart of whoever is viewing
  const counterpartLabel =
    viewerRole === 'patient'
      ? `Dr. ${stripDrPrefix(booking.doctorName)}${booking.specialization ? ` · ${booking.specialization}` : ''}`
      : viewerRole === 'doctor'
        ? `Patient: ${booking.patientName}`
        : `${booking.patientName} · Dr. ${stripDrPrefix(booking.doctorName)}`

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-6 overflow-hidden">
      {/* Header Bar */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-gray-900 text-white shrink-0 z-10"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-teal-600 shrink-0">
            <Video className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Video Consultation</p>
            <p className="text-[11px] text-gray-400 truncate" title={counterpartLabel}>
              {counterpartLabel}
            </p>
          </div>
        </div>

        {/* Timer + connection status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 shrink-0">
          {!iframeReady && (
            <span
              className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-teal-300"
              title="Connecting to room…"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
              </span>
              <span className="hidden sm:inline">Connecting…</span>
            </span>
          )}
          <Timer className="h-3.5 w-3.5 text-teal-400" />
          <span className="text-sm font-mono font-medium text-teal-400">
            {formatTimer(elapsed)}
          </span>
        </div>

        {/* Room info + End Call */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-400">
            <Shield className="h-3 w-3" />
            <span className="truncate max-w-[120px]">{roomId}</span>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleEndCall}
              className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-600/30"
              size="sm"
            >
              <PhoneOff className="h-4 w-4" />
              <span className="hidden sm:inline">End Call</span>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Booking context strip — token, slot, participant, escape hatch */}
      <div className="flex items-center gap-2 sm:gap-3 h-11 px-3 sm:px-4 bg-gray-800/70 border-b border-gray-700 shrink-0">
        {booking.tokenNumber ? (
          <span className="flex shrink-0 items-center gap-1 rounded-md bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 text-[11px] font-mono font-semibold text-emerald-300">
            <Hash className="h-3 w-3" aria-hidden="true" />
            {booking.tokenNumber}
          </span>
        ) : null}
        <span className="flex shrink-0 items-center gap-1 rounded-md bg-gray-900/60 border border-gray-700 px-2 py-0.5 text-[11px] font-mono text-gray-300">
          <Clock className="h-3 w-3 text-teal-400" aria-hidden="true" />
          {booking.timeSlot || 'Walk-in'}
        </span>
        <p className="flex-1 min-w-0 truncate text-[11px] text-gray-400">
          {viewerRole === 'doctor' || viewerRole === 'receptionist'
            ? `Patient: ${booking.patientName}`
            : `${booking.doctorName}${booking.specialization ? ` · ${booking.specialization}` : ''}`}
        </p>
        <a
          href={jitsiUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open the video room in a new window"
          className="flex shrink-0 items-center gap-1 rounded-md border border-gray-700 px-2 py-1 text-[11px] text-gray-400 hover:text-teal-300 hover:border-teal-700 transition-colors"
        >
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
          <span className="hidden sm:inline">Open in new window</span>
        </a>
      </div>

      {/* Jitsi iframe — fills the remaining viewport.
          No `sandbox` attribute: Jitsi needs its cross-frame scripts. */}
      <div className="relative flex-1 w-full bg-gray-900 min-h-0">
        <iframe
          src={jitsiUrl}
          allow="camera; microphone; display-capture; autoplay; clipboard-write; fullscreen"
          allowFullScreen
          onLoad={() => setIframeReady(true)}
          className="h-full w-full border-0 bg-gray-900"
          title="Video consultation room"
        />
        <AnimatePresence>
          {!iframeReady && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900"
            >
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
              <p className="text-sm text-gray-400">Starting secure video room...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* End Call Confirmation Dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End this consultation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will end the video call for both you and the patient. The consultation
              will remain in your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmEndCall}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              End Call
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
