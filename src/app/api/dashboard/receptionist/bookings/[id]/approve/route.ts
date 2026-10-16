import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, RECEPTION_ROLES } from '@/lib/api-auth'
import { todayISTRange } from '@/lib/date-utils'
import { generateTokenNumber } from '@/lib/token-utils'
import { emitToRole, emitToHospital } from '@/lib/emit-notification'
import { pushAtursevaMessage } from '@/lib/aturseva/proactive'

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function bookingDateLabel(d: Date): string {
  const ist = new Date(d.getTime() + 5.5 * 3600 * 1000)
  const day = DAYS_EN[ist.getUTCDay()] || ''
  return `${day}, ${ist.getUTCDate()} ${MONTHS_EN[ist.getUTCMonth()] || ''}`
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req)
    if (!user || !RECEPTION_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        doctor: {
          include: { user: { select: { name: true } } },
        },
        user: { select: { name: true } },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // ── Receptionist scoping ──
    if (user.role === 'receptionist') {
      const receptionist = await db.receptionist.findUnique({
        where: { userId: user.id },
        select: { doctorId: true, hospitalId: true },
      })

      if (!receptionist) {
        return NextResponse.json({ error: 'Receptionist profile not found' }, { status: 403 })
      }

      const isHospitalMode = !!receptionist.hospitalId && !receptionist.doctorId

      if (isHospitalMode) {
        // Hospital receptionist: verify booking belongs to their hospital
        if (booking.hospitalId !== receptionist.hospitalId) {
          return NextResponse.json(
            { error: 'Unauthorized — not your hospital\'s booking' },
            { status: 403 }
          )
        }
      } else {
        // Clinic receptionist: verify booking belongs to their doctor
        if (booking.doctorId !== receptionist.doctorId) {
          return NextResponse.json(
            { error: 'Unauthorized — not your doctor\'s booking' },
            { status: 403 }
          )
        }
      }
    }

    // Verify booking status is Pending
    if (booking.status !== 'Pending') {
      return NextResponse.json(
        { error: `Cannot approve booking with status: ${booking.status}` },
        { status: 400 }
      )
    }

    // Check OPD limit again (race condition guard)
    const { start: startOfDay, end: endOfDay } = todayISTRange()

    const activeBookingsCount = await db.booking.count({
      where: {
        doctorId: booking.doctorId,
        bookingDate: { gte: startOfDay, lte: endOfDay },
        status: { in: ['Approve', 'Visited', 'Finish'] },
      },
    })

    if (activeBookingsCount >= booking.doctor.dailyLimit) {
      // Phase 4: an OPD-limit rejection is a REJECTION, not a cancellation —
      // 'Rejected' now exists as a first-class status so patients see the
      // right state (rose panel) on their dashboard / kiosk status page.
      await db.booking.update({
        where: { id },
        data: { status: 'Rejected' },
      })

      if (booking.userId) {
        await db.notification.create({
          data: {
            userId: booking.userId,
            title: 'Booking Rejected',
            message: `Your appointment request with Dr. ${booking.doctor?.user?.name || 'Unknown'} has been rejected. The OPD limit for today is full. Please try another date or time.`,
          },
        })

        // ── Aturseva proactive push (Phase 3): rejection lands in the chat ──
        const docName = booking.doctor?.user?.name || 'Doctor'
        const label = bookingDateLabel(booking.bookingDate)
        await pushAtursevaMessage({
          userId: booking.userId,
          kind: 'booking-rejected',
          refId: booking.id,
          card: {
            type: 'booking_update',
            title: 'Appointment reject ho gayi',
            data: {
              bookingId: booking.id,
              doctor: docName,
              specialization: booking.doctor?.specialization || 'General Physician',
              dateLabel: label,
              timeSlot: booking.timeSlot || '',
              status: 'Rejected',
              statusHi: 'Reject ho gaya',
              reason: "OPD limit full ho gaya tha",
            },
          },
          text: `${docName} ki clinic ne ${label} ko ${booking.timeSlot || ''} baje ki appointment reject kar di — OPD limit full tha. Koi baat nahi, main doosri date ya doosra doctor dhoondh sakti hoon, bas bataiye. 🩺`,
        })
      }

      return NextResponse.json({
        success: false,
        error: 'OPD limit reached for today. Booking has been rejected.',
        status: 'Rejected',
      })
    }

    // ── Generate token ──
    // Hospital bookings (hospitalId + departmentId stamped at booking time)
    // get a department-prefix token. Clinic bookings created without hospital
    // context now ALSO get one: resolve the doctor's primary Active hospital
    // link (e.g. Sharma Clinic → GEN dept → SHARMA-0XX) so every approved
    // patient carries the searchable queue ID printed on prescriptions.
    let tokenNumber = booking.tokenNumber
    let tokenOrder = booking.tokenOrder

    if (!tokenNumber && booking.doctorId) {
      let departmentId = booking.departmentId
      if (!booking.hospitalId || !departmentId) {
        const primaryLink = await db.doctorHospital.findFirst({
          where: { doctorId: booking.doctorId, status: 'Active' },
          orderBy: { createdAt: 'asc' },
          select: { departmentId: true, hospitalId: true },
        })
        if (primaryLink) {
          departmentId = departmentId || primaryLink.departmentId
        }
      }
      if (departmentId) {
        const token = await generateTokenNumber(booking.doctorId, departmentId)
        tokenNumber = token.tokenNumber
        tokenOrder = token.tokenOrder
      }
    }

    // Approve the booking
    await db.booking.update({
      where: { id },
      data: {
        status: 'Approve',
        receptionistId: user.id,
        tokenNumber,
        tokenOrder,
      },
    })

    // Calculate queue position — count Approve AND Visited bookings ahead
    // (a patient currently in consultation is still ahead of you in the day's
    // queue). Matches the patient-side queue API and the doctor dashboard,
    // so the number printed on the approval notification equals the number
    // every other screen shows.
    const patientsAhead = await db.booking.count({
      where: {
        doctorId: booking.doctorId,
        bookingDate: { gte: startOfDay, lte: endOfDay },
        status: { in: ['Approve', 'Visited'] },
        createdAt: { lte: booking.createdAt },
        id: { not: booking.id },
      },
    })
    const queuePosition = patientsAhead + 1

    // Build token display for notifications
    const tokenDisplay = tokenNumber ? ` Token: ${tokenNumber}.` : ''
    const doctorName = booking.doctor?.user?.name || 'Doctor'
    const patientName = booking.user?.name || booking.patientName || 'Patient'

    // Notify patient (in-app + SMS)
    if (booking.userId) {
      const { createNotification } = await import('@/lib/emit-notification')
      await createNotification(
        booking.userId,
        'Appointment Confirmed',
        `Your appointment with Dr. ${doctorName} has been confirmed. Queue #${queuePosition}.${tokenDisplay}`,
        {
          event: 'bill-generated', // closest event type for token assignment
          smsChannel: true,
          hospitalId: booking.hospitalId || undefined,
          templateData: {
            patientName,
            doctorName,
            tokenNumber: tokenNumber || '',
            queuePosition: String(queuePosition),
            hospitalName: 'Hospital',
          },
        }
      )
    }

    // Notify doctor (in-app only)
    await db.notification.create({
      data: {
        userId: booking.doctor.userId,
        title: 'New Patient Booking',
        message: `New patient ${patientName} booked. Queue #${queuePosition}.${tokenDisplay}`,
      },
    })

    // ── Real-time queue-updated emit (R3) ──
    // Notify receptionist + doctor roles (and the hospital if applicable) that
    // this doctor's queue has changed. Fire-and-forget; never break business logic.
    try {
      const queueLength = await db.booking.count({
        where: {
          doctorId: booking.doctorId as string,
          status: 'Approve',
          bookingDate: { gte: startOfDay, lte: endOfDay },
        },
      })
      const queuePayload = {
        doctorId: booking.doctorId as string,
        doctorName,
        queueLength,
        nextPatientName: patientName,
      }
      emitToRole('receptionist', 'queue-updated', queuePayload)
      emitToRole('doctor', 'queue-updated', queuePayload)
      if (booking.hospitalId) {
        emitToHospital(booking.hospitalId, 'queue-updated', queuePayload)
      }
    } catch (emitErr) {
      console.error('queue-updated emit failed:', emitErr)
    }

    // ── Aturseva proactive push (Phase 3): approval lands in the chat ──
    // The patient's own thread gets the good news + token + queue position —
    // "AI batati hai" pillar: no need to open the Appointments page to know.
    if (booking.userId) {
      const label = bookingDateLabel(booking.bookingDate)
      await pushAtursevaMessage({
        userId: booking.userId,
        kind: 'booking-approved',
        refId: booking.id,
        card: {
          type: 'booking_update',
          title: 'Appointment confirm ho gaya ✓',
          data: {
            bookingId: booking.id,
            doctor: doctorName,
            specialization: booking.doctor?.specialization || 'General Physician',
            dateLabel: label,
            timeSlot: booking.timeSlot || '',
            mode: booking.bookingMode || 'InPerson',
            status: 'Approve',
            statusHi: 'Confirmed ✓',
            tokenNumber: tokenNumber || null,
            queuePosition,
            fees: booking.appointmentCharge || booking.doctor?.fees || 0,
          },
        },
        text: `Achhi khabar! 🎉 ${doctorName} ne aapki ${label} ko ${booking.timeSlot || ''} baje ki appointment CONFIRM kar di hai.${tokenNumber ? ` Token ${tokenNumber} hai,` : ''} queue me position #${queuePosition}. ${booking.bookingMode === 'VideoCall' ? 'Video call ka link appointment page me milega.' : 'Clinic pahunchne ka time nikal lijiye!'}`,
      })
    }

    return NextResponse.json({
      success: true,
      status: 'Approve',
      queuePosition,
      tokenNumber,
      tokenOrder,
    })
  } catch (error) {
    console.error('Approve booking error:', error)
    return NextResponse.json({ error: 'Failed to approve booking' }, { status: 500 })
  }
}
