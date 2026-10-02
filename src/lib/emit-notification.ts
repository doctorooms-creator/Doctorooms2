/**
 * Fire-and-forget WebSocket notification emitter.
 * Sends events to the notification mini-service (port 3005).
 * Never throws — failures are silently swallowed.
 */

import { db } from '@/lib/db'
import { doctorDisplayName } from '@/lib/utils'

type EventType =
  // Original 9 events
  | 'new-admission'
  | 'vital-recorded'
  | 'sample-ordered'
  | 'lab-result-ready'
  | 'bill-generated'
  | 'payment-received'
  | 'discharge-advised'
  | 'ot-scheduled'
  | 'low-stock-alert'
  // Lab Module events (5)
  | 'external-test-ordered'
  | 'external-test-accepted'
  | 'external-test-rejected'
  | 'external-report-uploaded'
  | 'commission-paid'
  // General system events (5)
  | 'queue-updated'
  | 'bed-status-changed'
  | 'prescription-shared'
  | 'doctor-online'
  | 'doctor-offline'
  // Video consultation events (Phase 3) — 'video-call-ended' is whitelisted
  // for future use; nothing emits it yet.
  | 'video-call-started'
  | 'video-call-ended'
  // Operation Theater events (4)
  | 'ot-scheduled'
  | 'ot-started'
  | 'ot-completed'
  | 'ot-cancelled'
  // Queue resilience events (Phase 4) — doctor paused/resumed their queue.
  | 'queue-paused'

const VALID_EVENTS: EventType[] = [
  'new-admission',
  'vital-recorded',
  'sample-ordered',
  'lab-result-ready',
  'bill-generated',
  'payment-received',
  'discharge-advised',
  'ot-scheduled',
  'low-stock-alert',
  'external-test-ordered',
  'external-test-accepted',
  'external-test-rejected',
  'external-report-uploaded',
  'commission-paid',
  'queue-updated',
  'bed-status-changed',
  'prescription-shared',
  'doctor-online',
  'doctor-offline',
  'video-call-started',
  'video-call-ended',
  'ot-scheduled',
  'ot-started',
  'ot-completed',
  'ot-cancelled',
  'queue-paused',
]

const EMIT_URL = 'http://localhost:3005/emit'

interface EmitPayload {
  id?: string
  title?: string
  message: string
  timestamp?: string
  admissionId?: string
  patientName?: string
  doctorId?: string
  hospitalId?: string
  [key: string]: unknown
}

/**
 * Emit a real-time notification event.
 * Fire-and-forget: does NOT await, does NOT throw.
 */
export function emitNotification(
  event: EventType,
  rooms: string[],
  payload: EmitPayload
): void {
  if (!VALID_EVENTS.includes(event)) return

  try {
    fetch(EMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        rooms,
        payload: {
          ...payload,
          timestamp: payload.timestamp || new Date().toISOString(),
        },
      }),
    }).catch(() => {
      // Fire-and-forget: silently ignore failures
    })
  } catch {
    // Never let notification failures affect business logic
  }
}

export type { EventType, EmitPayload }

// ─── Room name helpers ─────────────────────────────────────────────────────

/** Role-scoped room (e.g. `role:doctor`) — all clients with that role receive the event. */
export function roleRoom(role: string): string {
  return `role:${role}`
}

/** Hospital-scoped room (e.g. `hospital:abc123`) — all clients in that hospital receive the event. */
export function hospitalRoom(hospitalId: string): string {
  return `hospital:${hospitalId}`
}

/** User-scoped room (e.g. `user:def456`) — only that specific user receives the event. */
export function userRoom(userId: string): string {
  return `user:${userId}`
}

// ─── Convenience emitters (no DB persistence) ───────────────────────────────

/**
 * Emit a real-time event to ALL users with a given role.
 * Use for broadcasts that don't need DB persistence (e.g. queue-updated, bed-status-changed).
 * Fire-and-forget.
 */
export function emitToRole(role: string, event: EventType, payload: EmitPayload): void {
  emitNotification(event, [roleRoom(role)], payload)
}

/**
 * Emit a real-time event to ALL users in a given hospital.
 * Fire-and-forget.
 */
export function emitToHospital(hospitalId: string, event: EventType, payload: EmitPayload): void {
  emitNotification(event, [hospitalRoom(hospitalId)], payload)
}

/**
 * Emit a real-time event ONLY to a specific user (no DB persistence).
 * For events that should also appear in the in-app notification list later,
 * use createNotification() instead — it does both DB write + emit.
 */
export function emitToUser(userId: string, event: EventType, payload: EmitPayload): void {
  emitNotification(event, [userRoom(userId)], payload)
}

// ─── Event → title/message resolver (used by emitToUserWithNotify) ─────────

const EVENT_TITLES: Record<EventType, { title: string; messageFn: (p: Record<string, unknown>) => string }> = {
  'new-admission': {
    title: 'New Admission',
    messageFn: (p) => `${p.patientName || 'Patient'} admitted to ${p.wardName || 'a ward'}`,
  },
  'vital-recorded': {
    title: 'Vitals Updated',
    messageFn: (p) => `Vitals recorded for ${p.patientName || 'patient'}`,
  },
  'sample-ordered': {
    title: 'Sample Ordered',
    messageFn: (p) => `Sample requested for ${p.testName || 'a test'}`,
  },
  'lab-result-ready': {
    title: 'Lab Result Ready',
    messageFn: (p) => `Lab result ready for ${p.testName || 'a test'} (${p.patientName || 'patient'})`,
  },
  'bill-generated': {
    title: 'Bill Generated',
    messageFn: (p) => `Bill generated for ${p.patientName || 'patient'}`,
  },
  'payment-received': {
    title: 'Payment Received',
    messageFn: (p) => `Payment of ₹${p.amount || 0} received from ${p.patientName || 'patient'}`,
  },
  'discharge-advised': {
    title: 'Discharge Advised',
    messageFn: (p) => `Discharge advised for ${p.patientName || 'patient'}`,
  },
  'ot-scheduled': {
    title: 'OT Scheduled',
    messageFn: (p) => `Surgery scheduled: ${p.surgeryName || ''} for ${p.patientName || 'patient'} on ${p.scheduledDate || ''} at ${p.scheduledStartTime || ''}`,
  },
  'ot-started': {
    title: 'Surgery Started',
    messageFn: (p) => `${p.surgeryName || 'Surgery'} for ${p.patientName || 'patient'} has started in ${p.otName || 'OT'}`,
  },
  'ot-completed': {
    title: 'Surgery Completed',
    messageFn: (p) => `${p.surgeryName || 'Surgery'} for ${p.patientName || 'patient'} is complete (duration: ${p.actualDuration || '—'} min)`,
  },
  'ot-cancelled': {
    title: 'Surgery Cancelled',
    messageFn: (p) => `${p.surgeryName || 'Surgery'} for ${p.patientName || 'patient'} was cancelled${p.cancellationReason ? ` — ${p.cancellationReason}` : ''}`,
  },
  'low-stock-alert': {
    title: 'Low Stock Alert',
    messageFn: (p) => `${p.itemName || 'Item'} is below reorder level (${p.currentStock || 0} ${p.unit || ''})`,
  },
  'external-test-ordered': {
    title: 'New Test Order',
    messageFn: (p) =>
      `${doctorDisplayName(p.doctorName)} ordered ${p.testName || 'a test'}${p.count && (p.count as number) > 1 ? ` (+${(p.count as number) - 1} more)` : ''} for ${p.patientName || 'patient'}`,
  },
  'external-test-accepted': {
    title: 'Order Accepted',
    messageFn: (p) => `${p.labName || 'Lab'} accepted your order for ${p.testName || 'a test'} (${p.patientName || 'patient'})`,
  },
  'external-test-rejected': {
    title: 'Order Rejected',
    messageFn: (p) => `${p.labName || 'Lab'} rejected your order for ${p.testName || 'a test'}`,
  },
  'external-report-uploaded': {
    title: 'Lab Report Ready',
    messageFn: (p) =>
      `${p.testName || 'Report'} from ${p.labName || 'lab'} is ready${p.isAbnormal ? ' — ⚠️ ABNORMAL' : ''}`,
  },
  'commission-paid': {
    title: 'Commission Paid',
    messageFn: (p) => `₹${p.amount || 0} commission paid${p.period ? ` for ${p.period}` : ''}${p.labName ? ` (${p.labName})` : ''}`,
  },
  'queue-updated': {
    title: 'Queue Updated',
    messageFn: (p) => `Queue for Dr. ${p.doctorName || ''}: ${p.queueLength || 0} waiting`,
  },
  'bed-status-changed': {
    title: 'Bed Status Changed',
    messageFn: (p) => `Bed ${p.bedNumber || p.bedId || ''} (${p.wardName || 'ward'}): ${p.oldStatus || ''} → ${p.newStatus || ''}`,
  },
  'prescription-shared': {
    title: 'Prescription Shared',
    messageFn: (p) => `Dr. ${p.doctorName || ''} granted you Rx access`,
  },
  'doctor-online': {
    title: 'Doctor Online',
    messageFn: (p) => `Dr. ${p.doctorName || ''} is now online`,
  },
  'doctor-offline': {
    title: 'Doctor Offline',
    messageFn: (p) => `Dr. ${p.doctorName || ''} is now offline`,
  },
  'video-call-started': {
    title: 'Video Consultation Started',
    messageFn: (p) => `${p.doctorName || 'Your doctor'} has started your video consultation — join now.`,
  },
  'video-call-ended': {
    title: 'Video Consultation Ended',
    messageFn: (p) => `Video consultation for ${p.patientName || 'patient'} has ended.`,
  },
  'queue-paused': {
    title: 'Queue Paused',
    messageFn: (p) =>
      p.paused === false
        ? `Dr. ${p.doctorName || ''} has resumed the queue.`
        : `Dr. ${p.doctorName || ''} has paused the queue.`,
  },
}

/**
 * Convenience wrapper: persist a Notification row to the DB AND emit a real-time
 * socket event to the user's personal room. Title + message are auto-derived
 * from the event type + payload using the EVENT_TITLES resolver.
 *
 * Use this for user-specific events that should ALSO appear in the in-app
 * notification list (e.g. external-report-uploaded, commission-paid).
 *
 * For role-wide / hospital-wide broadcasts that don't need DB persistence,
 * use emitToRole() / emitToHospital() instead.
 *
 * @param smsChannel  If true, ALSO send an SMS/WhatsApp to the user (per the
 *                    template defined in notify-channels.ts). Use this for
 *                    patient-facing + doctor-facing events that the recipient
 *                    might not see in real-time (e.g. external-report-uploaded
 *                    to a patient, commission-paid to a doctor). Internal
 *                    operational events (external-test-accepted to a doctor
 *                    who's actively on the dashboard) should NOT set this.
 */
export async function emitToUserWithNotify(
  userId: string,
  event: EventType,
  payload: EmitPayload,
  options?: { smsChannel?: boolean; hospitalId?: string }
): Promise<void> {
  const resolver = EVENT_TITLES[event]
  const title = resolver?.title || event
  const message = resolver?.messageFn(payload) || payload.message || ''

  await createNotification(userId, title, message, {
    event,
    payload,
    smsChannel: options?.smsChannel,
    hospitalId: options?.hospitalId,
    // Build template data for SMS: convert all payload values to strings
    templateData: Object.fromEntries(
      Object.entries(payload)
        .filter(([k]) => k !== 'message' && k !== 'title' && k !== 'timestamp' && k !== 'id')
        .map(([k, v]) => [k, String(v)])
    ),
  })
}

/**
 * Unified notification helper: persists a Notification row to the DB AND
 * emits a real-time socket event. Use this instead of calling
 * db.notification.create + emitNotification separately.
 *
 * @param userId   - recipient user ID (for DB row + user room)
 * @param title    - notification title
 * @param message  - notification message
 * @param event    - socket event type (defaults to the matching event, or omit to skip socket)
 * @param rooms    - additional socket rooms to broadcast to (e.g. [roleRoom('doctor')])
 * @param payload  - extra payload fields for the socket event
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  options?: {
    event?: EventType
    rooms?: string[]
    payload?: EmitPayload
    smsChannel?: boolean
    hospitalId?: string
    templateData?: Record<string, string>
  }
): Promise<void> {
  // 1. Persist to DB (so it shows in the in-app notification list)
  try {
    await db.notification.create({
      data: { userId, title, message },
    })
  } catch {
    // DB write failure should not block the socket emit
  }

  // 2. Emit real-time socket event to the user's personal room + any extra rooms
  if (options?.event) {
    const rooms = [userRoom(userId), ...(options.rooms || [])]
    emitNotification(options.event, rooms, {
      ...(options.payload || {}),
      id: userId,
      title,
      message,
    })
  }

  // 3. Send via SMS/WhatsApp if requested and configured
  if (options?.smsChannel) {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { mobileNo: true },
      })
      if (user?.mobileNo) {
        const eventType = options.event || ''
        const { sendEventNotification } = await import('@/lib/notify-channels')
        await sendEventNotification(eventType, options.templateData || {}, {
          userId,
          hospitalId: options.hospitalId,
          recipientPhone: user.mobileNo,
        })
      }
    } catch {
      // SMS failure should never break the main flow
    }
  }
}
