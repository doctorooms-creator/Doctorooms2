import { db } from '@/lib/db'
import { pushAtursevaMessage } from '@/lib/aturseva/proactive'

type QueueNotificationEvent =
  | 'consultation_started'
  | 'consultation_completed'
  | 'wait_extended'
  | 'appointment_canceled'
  | 'turn_approaching'

interface QueueNotificationContext {
  bookingId: string
  doctorId: string
  // Walk-in patients have no linked user account (booking.userId is nullable).
  patientUserId?: string | null
  doctorName: string
  tokenNumber?: string | number | null
  departmentName?: string | null
}

/**
 * Send in-app notifications for queue/token events.
 * Called from doctor appointment status changes and prescription finalization.
 *
 * Events:
 * - consultation_started: Doctor started seeing the patient
 * - consultation_completed: Doctor finished the consultation
 * - wait_extended: Doctor extended the patient's wait
 * - appointment_canceled: Doctor canceled the appointment
 * - turn_approaching: Patient is 2 positions away from being called
 */
export async function sendQueueNotification(
  event: QueueNotificationEvent,
  ctx: QueueNotificationContext
) {
  try {
    const notifications: { userId: string | null | undefined; title: string; message: string }[] = []

    switch (event) {
      case 'consultation_started': {
        const tokenStr = ctx.tokenNumber ? ` (Token: ${ctx.tokenNumber})` : ''
        const deptStr = ctx.departmentName ? ` — ${ctx.departmentName}` : ''
        notifications.push({
          userId: ctx.patientUserId,
          title: 'Consultation Started',
          message: `Dr. ${ctx.doctorName}${deptStr} has started your consultation.${tokenStr} Please proceed to the consultation room.`,
        })
        break
      }

      case 'consultation_completed': {
        const tokenStr = ctx.tokenNumber ? ` (Token: ${ctx.tokenNumber})` : ''
        notifications.push({
          userId: ctx.patientUserId,
          title: 'Consultation Complete',
          message: `Your consultation with Dr. ${ctx.doctorName} is complete.${tokenStr} Please visit the pharmacy if medicines were prescribed.`,
        })
        break
      }

      case 'wait_extended': {
        notifications.push({
          userId: ctx.patientUserId,
          title: 'Wait Time Extended',
          message: `Dr. ${ctx.doctorName} has extended your wait time. Please check the queue for updated position.`,
        })
        break
      }

      case 'appointment_canceled': {
        notifications.push({
          userId: ctx.patientUserId,
          title: 'Appointment Canceled',
          message: `Your appointment with Dr. ${ctx.doctorName} has been canceled by the doctor.`,
        })
        break
      }

      case 'turn_approaching': {
        const tokenStr = ctx.tokenNumber ? ` (${ctx.tokenNumber})` : ''
        const deptStr = ctx.departmentName ? ` — ${ctx.departmentName}` : ''
        notifications.push({
          userId: ctx.patientUserId,
          title: 'Your Turn is Approaching',
          message: `Dr. ${ctx.doctorName}${deptStr} is calling the next patient soon.${tokenStr} Please be near the consultation area.`,
        })
        break
      }
    }

    // Recipients without a valid userId (walk-in patients, booking.userId = null)
    // are skipped: Notification.userId is NOT NULL in the schema, so writing
    // them would throw. No DB write, no error — valid recipients unchanged.
    const recipients = notifications.filter(
      (n): n is { userId: string; title: string; message: string } => !!n.userId
    )
    if (recipients.length === 0) return

    await db.notification.createMany({
      data: recipients.map(n => ({
        userId: n.userId,
        title: n.title,
        message: n.message,
      })),
    })

    // ── Aturseva proactive push (Phase 3): the same event lands in the ──
    // patient's chat thread in Aturseva's voice. turn_approaching is skipped
    // here — the two outer callers (notifyNextPatient / notifyApproachingPatient)
    // push richer, position-aware copy themselves.
    if (ctx.patientUserId && event !== 'turn_approaching') {
      const doc = `Dr. ${ctx.doctorName}`
      const token = ctx.tokenNumber ? ` Token #${ctx.tokenNumber}.` : ''
      const text =
        event === 'consultation_started'
          ? `🔔 Aapki baari shuru ho gayi! ${doc} ne aapki consultation start kar di hai${token} Consultation room me chaliye — main yahin hoon.`
          : event === 'consultation_completed'
            ? `✅ ${doc} ke saath aapki consultation complete ho gayi. Agar dawai likhi gayi hai to pharmacy se le lijiye. Tabiyat ka dhyan rakhna — koi sawaal ho to poochh lijiye. 🩺`
            : event === 'wait_extended'
              ? `⏳ ${doc} ne aapka wait thoda extend kiya hai. Live queue position jaanni ho to bas poochh lijiye — main turant bata dungi.`
              : event === 'appointment_canceled'
                ? `⚠️ ${doc} ne aapki aaj ki appointment cancel kar di hai. Rebook karne me madad chahiye to bataiye — main doosra slot dhoondh deti hoon.`
                : ''
      if (text) {
        await pushAtursevaMessage({
          userId: ctx.patientUserId,
          kind: `queue-${event}`,
          refId: ctx.bookingId,
          text,
        })
      }
    }
  } catch (error) {
    // Notifications should never block the main flow
    console.error('[QueueNotification] Failed to send notification:', error)
  }
}

/**
 * After a patient's status changes to 'Visited' (doctor started consultation),
 * check if there's a patient 2 positions ahead in the queue and notify them.
 */
export async function notifyApproachingPatient(
  doctorId: string,
  currentTokenOrder: number | null,
  bookingDate: Date
) {
  if (!currentTokenOrder) return

  try {
    // Find the patient 2 positions ahead (who is still waiting).
    // NOTE: Cannot use `tokenOrder: { gt: currentTokenOrder }` because that breaks
    // when intermediate patients are canceled. Instead, find bookings whose
    // tokenOrder > current, sorted ascending, and skip the first (the
    // immediately-next patient) to reach the one after.
    const approachingBooking = await db.booking.findFirst({
      where: {
        doctorId,
        bookingDate,
        status: 'Approve',
        tokenOrder: { gt: currentTokenOrder },
      },
      orderBy: { tokenOrder: 'asc' },
      skip: 1, // skip the immediately-next patient, get the one after
      select: {
        id: true,
        userId: true,
        tokenNumber: true,
        doctor: {
          select: {
            user: { select: { name: true } },
          },
        },
      },
    })

    if (!approachingBooking) return
    // Walk-in patient with no linked user account — nobody to notify.
    if (!approachingBooking.userId) return

    // Check if we already sent this notification recently (within 5 minutes)
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
    const recentNotification = await db.notification.findFirst({
      where: {
        userId: approachingBooking.userId,
        title: 'Your Turn is Approaching',
        createdAt: { gte: fiveMinAgo },
      },
    })
    if (recentNotification) return

    // Booking has no `department` relation — only `departmentId`. Look up the
    // department separately to get its name (if any).
    const bookingWithDept = await db.booking.findUnique({
      where: { id: approachingBooking.id },
      select: { departmentId: true },
    })
    let departmentName: string | null = null
    if (bookingWithDept?.departmentId) {
      const dept = await db.department.findUnique({
        where: { id: bookingWithDept.departmentId },
        select: { name: true },
      })
      departmentName = dept?.name || null
    }

    const doctorName = approachingBooking.doctor.user.name.replace('Dr. ', '')

    await sendQueueNotification('turn_approaching', {
      bookingId: approachingBooking.id,
      doctorId,
      patientUserId: approachingBooking.userId,
      doctorName,
      tokenNumber: approachingBooking.tokenNumber,
      departmentName,
    })

    // ── Aturseva proactive push (Phase 3): "2 patients baad aapki baari" ──
    // get-ready nudge — the patient should start moving toward the clinic.
    await pushAtursevaMessage({
      userId: approachingBooking.userId,
      kind: 'queue-turn-approaching',
      refId: approachingBooking.id,
      text: `⏳ ${doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`} ki clinic me 2 patients baad aapki baari hai${approachingBooking.tokenNumber ? ` (Token #${approachingBooking.tokenNumber})` : ''}. Clinic ke paas pahunchnne ki koshish karein — ready rahein!`,
    })
  } catch (error) {
    console.error('[QueueNotification] Failed to notify approaching patient:', error)
  }
}

/**
 * After a patient's consultation finishes (status → 'Finish'),
 * notify the next patient in queue that they're up next.
 */
export async function notifyNextPatient(
  doctorId: string,
  currentTokenOrder: number | null,
  bookingDate: Date
) {
  if (!currentTokenOrder) return

  try {
    // Find the very next waiting patient.
    // NOTE: Cannot use `tokenOrder: { gt: currentTokenOrder }` because that breaks
    // when intermediate patients are canceled. Instead, find the booking with
    // the smallest tokenOrder greater than the current one.
    const nextBooking = await db.booking.findFirst({
      where: {
        doctorId,
        bookingDate,
        status: 'Approve',
        tokenOrder: { gt: currentTokenOrder },
      },
      orderBy: { tokenOrder: 'asc' },
      select: {
        id: true,
        userId: true,
        tokenNumber: true,
        doctor: {
          select: {
            user: { select: { name: true } },
          },
        },
      },
    })

    if (!nextBooking) return
    // Walk-in patient with no linked user account — nobody to notify.
    if (!nextBooking.userId) return

    // Check for recent duplicate
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
    const recentNotification = await db.notification.findFirst({
      where: {
        userId: nextBooking.userId,
        title: 'Your Turn is Approaching',
        createdAt: { gte: fiveMinAgo },
      },
    })
    if (recentNotification) return

    // Booking has no `department` relation — only `departmentId`. Look up the
    // department separately to get its name (if any).
    const bookingWithDept = await db.booking.findUnique({
      where: { id: nextBooking.id },
      select: { departmentId: true },
    })
    let departmentName: string | null = null
    if (bookingWithDept?.departmentId) {
      const dept = await db.department.findUnique({
        where: { id: bookingWithDept.departmentId },
        select: { name: true },
      })
      departmentName = dept?.name || null
    }

    const doctorName = nextBooking.doctor.user.name.replace('Dr. ', '')

    await sendQueueNotification('turn_approaching', {
      bookingId: nextBooking.id,
      doctorId,
      patientUserId: nextBooking.userId,
      doctorName,
      tokenNumber: nextBooking.tokenNumber,
      departmentName,
    })

    // ── Aturseva proactive push (Phase 3): THE leave-now BAARI nudge ──
    // The immediately-next patient: consultation room ki taraf nikal jao.
    await pushAtursevaMessage({
      userId: nextBooking.userId,
      kind: 'queue-turn-next',
      refId: nextBooking.id,
      text: `🚶 Aapki baari aa gayi! ${doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`} ab aapko dekhenge${nextBooking.tokenNumber ? ` — Token #${nextBooking.tokenNumber}` : ''}. Consultation room ki taraf nikal jaayein. 🩺`,
    })
  } catch (error) {
    console.error('[QueueNotification] Failed to notify next patient:', error)
  }
}
