/**
 * Queue lifecycle — the single source of truth for CALLING a patient.
 *
 * Phase C of the OPD Cockpit (04 §2.2): the Approve→Visited transition +
 * patient notifications previously lived inline in the doctor status route.
 * Auto-advance (finalize) needs the same logic — extracted here so there is
 * ONE implementation (the token-centralization lesson: never let the same
 * business rule live in 3 places).
 *
 * Race-safe: the transition uses updateMany guarded on status='Approve' —
 * if two callers race (doctor presses N while finalize auto-advances), the
 * second write matches 0 rows and reports "already called" instead of
 * double-notifying.
 */

import { db } from '@/lib/db'
import { todayISTStr, istDateRange } from '@/lib/date-utils'
import { slotAwareSort } from '@/lib/queue-ordering'
import { sendQueueNotification, notifyApproachingPatient } from '@/lib/queue-notifications'

export interface CalledPatient {
  id: string
  tokenNumber: string | null
  patientName: string
}

/**
 * Flip a waiting (Approve) booking to Visited and fire the call pipeline:
 * consultation_started to the patient + approaching-notification to the
 * patient 2 slots behind. Returns the called patient, or null when the
 * booking was not in Approve (already called / finished / no-showed).
 */
export async function callNextPatient(opts: {
  doctorId: string
  doctorName: string
  bookingId: string
}): Promise<CalledPatient | null> {
  const { doctorId, doctorName, bookingId } = opts

  // Read first for the notification context (token, patient, ordering).
  const booking = await db.booking.findFirst({
    where: { id: bookingId, doctorId },
    select: {
      id: true,
      status: true,
      userId: true,
      patientName: true,
      tokenNumber: true,
      tokenOrder: true,
      bookingDate: true,
      departmentId: true,
    },
  })
  if (!booking || booking.status !== 'Approve') return null

  // Race-safe transition: only one caller can flip Approve → Visited.
  const updated = await db.booking.updateMany({
    where: { id: bookingId, status: 'Approve' },
    data: { status: 'Visited' },
  })
  if (updated.count === 0) return null

  // Notifications (best-effort — a failed send never rolls back the call).
  try {
    let departmentName: string | null = null
    if (booking.departmentId) {
      const dept = await db.department.findUnique({
        where: { id: booking.departmentId },
        select: { name: true },
      })
      departmentName = dept?.name || null
    }

    await sendQueueNotification('consultation_started', {
      bookingId: booking.id,
      doctorId,
      patientUserId: booking.userId,
      doctorName: doctorName.replace('Dr. ', ''),
      tokenNumber: booking.tokenNumber || null,
      departmentName,
    })
    await notifyApproachingPatient(doctorId, booking.tokenOrder, booking.bookingDate)
  } catch (err) {
    console.error('callNextPatient notification error:', err)
  }

  return {
    id: booking.id,
    tokenNumber: booking.tokenNumber || null,
    patientName: booking.patientName || 'Patient',
  }
}

/**
 * The first WAITING patient of the doctor's day, in FIFO + emergency order
 * (same ordering as every queue surface — no drift possible).
 */
export async function firstWaitingPatient(doctorId: string): Promise<{
  id: string
  tokenNumber: string | null
  patientName: string
} | null> {
  const { start, end } = istDateRange(todayISTStr())
  const waiting = await db.booking.findMany({
    where: {
      doctorId,
      bookingDate: { gte: start, lte: end },
      status: 'Approve',
    },
    select: {
      id: true,
      patientName: true,
      tokenNumber: true,
      tokenOrder: true,
      createdAt: true,
      timeSlot: true,
      isEmergency: true,
    },
  })

  const sorted = slotAwareSort(waiting)
  const first = sorted[0]
  if (!first) return null
  return {
    id: first.id,
    tokenNumber: first.tokenNumber || null,
    patientName: first.patientName || 'Patient',
  }
}

/**
 * Whether any patient of this doctor is mid-consultation today (Visited).
 * The auto-advance rule: never call the next patient while one is in OPD.
 */
export async function anyInConsultation(doctorId: string): Promise<boolean> {
  const { start, end } = istDateRange(todayISTStr())
  const count = await db.booking.count({
    where: {
      doctorId,
      bookingDate: { gte: start, lte: end },
      status: 'Visited',
    },
  })
  return count > 0
}

/** Doctor-side auto-advance preference (cookie v1 — 04 §2.3). */
export function readAutoAdvanceCookie(req: Request): boolean {
  const cookieHeader = req.headers.get('cookie') || ''
  const match = /(?:^|;\s*)opd_autoadvance=([^;]+)/.exec(cookieHeader)
  return match ? match[1] !== 'off' : true
}
