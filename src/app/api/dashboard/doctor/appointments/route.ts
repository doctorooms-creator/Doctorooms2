import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctor = await db.doctor.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = { doctorId: doctor.id }
    if (status && status !== 'All') {
      where.status = status
    }

    // Limit to recent appointments to avoid fetching the entire booking history.
    // Default 200 records, sorted by most recent first — sufficient for the
    // doctor appointments list UI which shows a filterable table.
    const limit = 200

    const [appointments, counts] = await Promise.all([
      db.booking.findMany({
        where,
        orderBy: { bookingDate: 'desc' },
        take: limit,
        include: {
          user: { select: { name: true, profileImg: true } },
          prescriptions: { select: { id: true } },
        },
      }),
      db.booking.groupBy({
        by: ['status'],
        where: { doctorId: doctor.id },
        _count: { status: true },
      }),
    ])

    const statusCounts = counts.reduce(
      (acc, c) => {
        acc[c.status] = c._count.status
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      appointments: appointments.map((b) => ({
        id: b.id,
        appointmentNo: b.appointmentNo,
        patientName: b.patientName || b.user?.name || 'Walk-in',
        patientImg: b.user?.profileImg || '',
        disease: b.disease,
        date: b.bookingDate,
        status: b.status,
        charge: b.appointmentCharge,
        hasPrescription: b.prescriptions.length > 0,
      })),
      counts: statusCounts,
    })
  } catch (error) {
    console.error('Doctor appointments error:', error)
    return NextResponse.json({ error: 'Failed to load appointments' }, { status: 500 })
  }
}
