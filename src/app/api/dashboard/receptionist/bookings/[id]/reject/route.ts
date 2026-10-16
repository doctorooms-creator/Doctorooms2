import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, RECEPTION_ROLES } from '@/lib/api-auth'
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
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Scoping: verify booking belongs to this receptionist's doctor or hospital
    const receptionist = await db.receptionist.findUnique({
      where: { userId: user.id },
      select: { doctorId: true, hospitalId: true },
    })
    if (!receptionist) {
      return NextResponse.json({ error: 'Receptionist not found' }, { status: 404 })
    }
    if (receptionist.hospitalId && !receptionist.doctorId) {
      // Hospital mode: verify booking belongs to this hospital
      if (booking.hospitalId !== receptionist.hospitalId) {
        return NextResponse.json({ error: 'Unauthorized — not your hospital\'s booking' }, { status: 403 })
      }
    } else {
      // Clinic mode: verify booking belongs to the receptionist's doctor
      if (booking.doctorId !== receptionist.doctorId) {
        return NextResponse.json({ error: 'Unauthorized — not your doctor\'s booking' }, { status: 403 })
      }
    }

    // Verify booking status is Pending
    if (booking.status !== 'Pending') {
      return NextResponse.json(
        { error: `Cannot reject booking with status: ${booking.status}` },
        { status: 400 }
      )
    }

    // Update status to Rejected
    await db.booking.update({
      where: { id },
      data: { status: 'Rejected' },
    })

    // Notify patient
    if (booking.userId) {
      await db.notification.create({
        data: {
          userId: booking.userId,
          title: 'Booking Rejected',
          message: `Your appointment request with Dr. ${booking.doctor?.user?.name || 'Unknown'} has been rejected. Please try another date or time.`,
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
            reason: 'Clinic ne is date ke liye booking accept nahi ki',
          },
        },
        text: `${docName} ki clinic ne ${label} ko ${booking.timeSlot || ''} baje ki appointment reject kar di hai. Koi baat nahi — main doosri date ya doosra doctor dhoondh sakti hoon, bas bataiye. 🩺`,
      })
    }

    return NextResponse.json({ success: true, status: 'Rejected' })
  } catch (error) {
    console.error('Reject booking error:', error)
    return NextResponse.json({ error: 'Failed to reject booking' }, { status: 500 })
  }
}
