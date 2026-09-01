import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/dashboard/doctor/sent-for-tests
 *   Doctor: list all patients with status "SentForTests" for this doctor.
 *   These are patients who were sent for lab tests and are waiting for reports.
 *   They are NOT in the normal queue — they appear in a separate section.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
    if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })

    const bookings = await db.booking.findMany({
      where: {
        doctorId: doctor.id,
        status: 'SentForTests',
      },
      orderBy: { bookingDate: 'desc' },
      select: {
        id: true,
        appointmentNo: true,
        patientName: true,
        disease: true,
        tokenNumber: true,
        bookingDate: true,
      },
      take: 20,
    })

    return NextResponse.json({
      bookings: bookings.map((b) => ({
        id: b.id,
        appointmentNo: b.appointmentNo,
        patientName: b.patientName || 'Unknown',
        disease: b.disease,
        tokenNumber: b.tokenNumber,
      })),
    })
  } catch (error) {
    console.error('Sent-for-tests error:', error)
    return NextResponse.json({ error: 'Failed to load sent-for-tests' }, { status: 500 })
  }
}
