'use client'

import { useEffect, useRef } from 'react'
import { useAuthSocket } from '@/hooks/useSocket'
import { useAuthStore } from '@/lib/auth-store'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { playChime } from '@/lib/play-chime'
import {
  BedDouble,
  Activity,
  TestTube2,
  FlaskConical,
  Receipt,
  CreditCard,
  LogOut,
  Cross,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  IndianRupee,
  ListOrdered,
  Stethoscope,
  Play,
} from 'lucide-react'

// Event → toast configuration per role
interface EventConfig {
  title: string
  icon: React.ElementType
  color: string
  roles: string[] // which roles should see this toast
  critical?: boolean // if true, plays a chime (subject to user preferences)
  isAbnormalCheck?: boolean // if true, "critical" only when payload.isAbnormal is true
}

export const EVENT_CONFIG: Record<string, EventConfig> = {
  // ── Original 9 events ──────────────────────────────────────────────────
  'new-admission': {
    title: 'New Admission',
    icon: BedDouble,
    color: 'text-teal-600',
    roles: ['receptionist', 'hospital', 'nurse', 'admin'],
  },
  'vital-recorded': {
    title: 'Vitals Updated',
    icon: Activity,
    color: 'text-rose-500',
    roles: ['doctor', 'nurse', 'hospital'],
  },
  'sample-ordered': {
    title: 'Sample Ordered',
    icon: TestTube2,
    color: 'text-amber-600',
    roles: ['nurse', 'lab_technician', 'doctor'],
  },
  'lab-result-ready': {
    title: 'Lab Result Ready',
    icon: FlaskConical,
    color: 'text-emerald-600',
    roles: ['doctor', 'hospital', 'lab_technician'],
  },
  'bill-generated': {
    title: 'Bill Generated',
    icon: Receipt,
    color: 'text-violet-600',
    roles: ['receptionist', 'hospital', 'admin'],
  },
  'payment-received': {
    title: 'Payment Received',
    icon: CreditCard,
    color: 'text-emerald-600',
    roles: ['receptionist', 'hospital', 'admin'],
  },
  'discharge-advised': {
    title: 'Discharge Advised',
    icon: LogOut,
    color: 'text-sky-600',
    roles: ['receptionist', 'hospital', 'nurse', 'admin'],
  },
  'ot-scheduled': {
    title: 'OT Scheduled',
    icon: Cross,
    color: 'text-rose-600',
    roles: ['doctor', 'nurse', 'hospital', 'admin', 'receptionist', 'patient'],
    critical: true,
  },
  'ot-started': {
    title: 'Surgery Started',
    icon: Play,
    color: 'text-amber-600',
    roles: ['doctor', 'hospital', 'admin', 'receptionist', 'patient'],
    critical: true,
  },
  'ot-completed': {
    title: 'Surgery Completed',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    roles: ['doctor', 'hospital', 'admin', 'receptionist', 'patient'],
    critical: true,
  },
  'ot-cancelled': {
    title: 'Surgery Cancelled',
    icon: XCircle,
    color: 'text-rose-600',
    roles: ['doctor', 'hospital', 'admin', 'receptionist', 'patient'],
    critical: true,
  },
  'low-stock-alert': {
    title: 'Low Stock Alert',
    icon: AlertTriangle,
    color: 'text-red-500',
    roles: ['hospital', 'admin', 'pharmacist'],
  },

  // ── Lab Module events (5) ───────────────────────────────────────────────
  'external-test-ordered': {
    title: 'New Lab Test Order',
    icon: FlaskConical,
    color: 'text-amber-600',
    roles: ['lab_technician'],
  },
  'external-test-accepted': {
    title: 'Lab Order Accepted',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    roles: ['doctor'],
  },
  'external-test-rejected': {
    title: 'Lab Order Rejected',
    icon: XCircle,
    color: 'text-rose-600',
    roles: ['doctor'],
  },
  'external-report-uploaded': {
    title: 'Lab Report Ready',
    icon: FileText,
    color: 'text-teal-600',
    roles: ['doctor', 'patient', 'lab_technician'],
    critical: true,
    isAbnormalCheck: true,
  },
  'commission-paid': {
    title: 'Commission Paid',
    icon: IndianRupee,
    color: 'text-emerald-600',
    roles: ['doctor'],
  },

  // ── General system events (5) ───────────────────────────────────────────
  'queue-updated': {
    title: 'Queue Updated',
    icon: ListOrdered,
    color: 'text-violet-600',
    roles: ['receptionist', 'doctor', 'hospital'],
  },
  'bed-status-changed': {
    title: 'Bed Status Changed',
    icon: BedDouble,
    color: 'text-teal-600',
    roles: ['receptionist', 'nurse', 'hospital'],
  },
  'prescription-shared': {
    title: 'Prescription Shared',
    icon: FileText,
    color: 'text-violet-600',
    roles: ['patient'],
  },
  'doctor-online': {
    title: 'Doctor Online',
    icon: Stethoscope,
    color: 'text-emerald-600',
    roles: ['patient'],
  },
  'doctor-offline': {
    title: 'Doctor Offline',
    icon: Stethoscope,
    color: 'text-muted-foreground',
    roles: ['patient'],
  },
}

// Event → list of TanStack Query keys to invalidate when the event fires
// (after the role check passes). This keeps list/detail pages in sync with
// real-time changes — e.g. when a lab tech uploads a report, the doctor's
// wizard "Reports" tab auto-refreshes.
const QUERY_INVALIDATION: Record<string, string[][]> = {
  'external-test-ordered': [['lab-tech-incoming-orders'], ['lab-tech-dashboard']],
  'external-test-accepted': [['external-test-orders'], ['doctor-prescription-wizard']],
  'external-test-rejected': [['external-test-orders'], ['doctor-prescription-wizard']],
  'external-report-uploaded': [
    ['patient-lab-reports'],
    ['doctor-commission'],
    ['external-test-orders'],
    ['lab-billing'],
  ],
  'commission-paid': [['doctor-commission'], ['admin-commission-report'], ['lab-billing']],
  'queue-updated': [['receptionist-queue'], ['doctor-appointments']],
  'bed-status-changed': [['ipd-admissions'], ['wards'], ['beds']],
  'prescription-shared': [['patient-rx-access']],
}

// Dedup: avoid showing duplicate toasts for same event within 5 seconds
const shownEvents = new Map<string, number>()
const DEDUP_WINDOW = 5000

export function RealtimeNotification() {
  const socket = useAuthSocket()
  const role = useAuthStore((s) => s.user?.role)
  const queryClient = useQueryClient()

  // Fetch the user's notification preferences (muted events, sound toggles)
  const { data: prefsData } = useQuery<{
    preferences: {
      mutedEvents: string[]
      soundEnabled: boolean
      criticalChimeEnabled: boolean
      emailDigest: string
    }
  }>({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const r = await fetch('/api/notification-preferences')
      if (!r.ok) return { preferences: { mutedEvents: [], soundEnabled: true, criticalChimeEnabled: true, emailDigest: 'never' } }
      return r.json()
    },
    // Don't refetch too often — prefs change rarely
    staleTime: 60_000,
  })

  // Keep a ref to the latest prefs so the socket handler (registered once) sees updates
  const prefsRef = useRef(prefsData?.preferences)
  useEffect(() => {
    prefsRef.current = prefsData?.preferences
  }, [prefsData])

  useEffect(() => {
    if (!socket) return

    const handler = (eventName: string, payload: Record<string, unknown>) => {
      // Check role filter using Zustand store (works with httpOnly cookies)
      const config = EVENT_CONFIG[eventName]
      if (!config) return
      if (role && !config.roles.includes(role)) return

      // Invalidate relevant TanStack Query caches so list/detail pages
      // re-fetch in real time. Happens AFTER the role check passes so we
      // don't waste refetches for users who wouldn't see the toast.
      // NOTE: query invalidation always happens — even if the user muted the
      // event — so live data still refreshes; only the toast/sound is suppressed.
      const queriesToInvalidate = QUERY_INVALIDATION[eventName]
      if (queriesToInvalidate) {
        for (const queryKey of queriesToInvalidate) {
          queryClient.invalidateQueries({ queryKey })
        }
      }

      // ─── User preferences: mute check ─────────────────────────────────
      const prefs = prefsRef.current
      const mutedEvents = prefs?.mutedEvents || []
      const isMuted = mutedEvents.includes(eventName)

      // ─── Determine if this event is "critical" for chime purposes ───
      // Either config.critical=true directly, OR config.critical=true +
      // isAbnormalCheck=true AND payload.isAbnormal=true.
      const isCritical = config.critical && (
        !config.isAbnormalCheck || payload.isAbnormal === true || payload.isAbnormal === 'true'
      )

      // Dedup check (only matters for toast display)
      const dedupKey = `${eventName}:${JSON.stringify(payload)}`
      const now = Date.now()
      const lastShown = shownEvents.get(dedupKey)
      const isDuplicate = lastShown && now - lastShown < DEDUP_WINDOW
      if (!isDuplicate) {
        shownEvents.set(dedupKey, now)
        // Clean old entries
        for (const [key, ts] of shownEvents) {
          if (now - ts > DEDUP_WINDOW * 2) shownEvents.delete(key)
        }
      }

      // ─── Show toast (unless muted OR duplicate within dedup window) ─
      if (!isMuted && !isDuplicate) {
        const Icon = config.icon
        const message =
          (payload.message as string) ||
          `${config.title} — ${(payload.patientName as string) || ''}`.trim()
        toast(message || config.title, {
          icon: <Icon className={`h-4 w-4 ${config.color}`} />,
          duration: 4000,
        })
      }

      // ─── Play chime for critical events (subject to prefs) ─────────────
      if (isCritical && !isMuted) {
        const soundOn = prefs?.soundEnabled !== false // default true if undefined
        const criticalChimeOn = prefs?.criticalChimeEnabled !== false // default true
        if (soundOn && criticalChimeOn) {
          playChime()
        }
      }
    }

    // Listen for all valid events
    const events = Object.keys(EVENT_CONFIG)
    for (const event of events) {
      socket.on(event, (payload: Record<string, unknown>) => {
        handler(event, payload)
      })
    }

    return () => {
      for (const event of events) {
        socket.off(event)
      }
    }
  }, [socket, role, queryClient])

  // This component renders nothing visible
  return null
}
