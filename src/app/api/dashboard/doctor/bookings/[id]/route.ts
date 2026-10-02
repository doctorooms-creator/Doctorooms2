import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/dashboard/doctor/bookings/[id]
 *   Doctor: returns the booking's userId (patientId) and basic info.
 *   Used by the prescription wizard's lab tabs (Order Tests / Reports)
 *   to resolve the patientId needed by /api/external-test-orders and
 *   /api/lab-reports/patient.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const doctor = await db.doctor.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const { id } = await params

    const booking = await db.booking.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        patientName: true,
        age: true,
        gender: true,
        disease: true,
        bloodGroup: true,
        doctorId: true,
        status: true,
        bookingDate: true,
        timeSlot: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.doctorId !== doctor.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({
      booking: {
        id: booking.id,
        userId: booking.userId, // the patientId (User.id) needed by lab APIs
        patientName: booking.patientName,
        age: booking.age,
        gender: booking.gender,
        disease: booking.disease,
        bloodGroup: booking.bloodGroup,
        status: booking.status,
        bookingDate: booking.bookingDate.toISOString(),
        timeSlot: booking.timeSlot,
      },
    })
  } catch (error) {
    console.error('Get booking error:', error)
    return NextResponse.json({ error: 'Failed to load booking' }, { status: 500 })
  }
}
