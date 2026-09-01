import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { todayISTRange } from '@/lib/date-utils'
import { slotAwareSort } from '@/lib/queue-ordering'

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctor = await db.doctor.findUnique({
      where: { userId: user.id },
      select: { id: true, queuePaused: true },
    })
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const { start: todayStart, end: todayEnd } = todayISTRange()

    const [
      todayAppointments,
      totalPatients,
      pendingPrescriptions,
      recentReviews,
      todayAppointmentsList,
    ] = await Promise.all([
      db.booking.count({
        where: {
          doctorId: doctor.id,
          bookingDate: { gte: todayStart, lte: todayEnd },
          status: { in: ['Pending', 'Approve', 'Visited'] },
        },
      }),
      db.booking.groupBy({
        by: ['userId'],
        where: { doctorId: doctor.id, userId: { not: null } },
      }).then((r) => r.length),
      db.booking.count({
        where: {
          doctorId: doctor.id,
          status: { in: ['Visited', 'Finish'] },
          prescriptions: { none: {} },
        },
      }),
      db.doctorRating.findMany({
        where: { doctorId: user.id },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { name: true, profileImg: true } },
        },
      }),
      db.booking.findMany({
        where: {
          doctorId: doctor.id,
          bookingDate: { gte: todayStart, lte: todayEnd },
          status: { in: ['Pending', 'Approve', 'Visited'] },
        },
        orderBy: { bookingDate: 'asc' },
        include: {
          user: { select: { name: true, profileImg: true } },
        },
      }),
    ])

    const avgRating = await db.doctorRating.aggregate({
      where: { doctorId: user.id },
      _avg: { star: true },
    })

    // Slot-aware order (CTO Plan Phase 2, item 2d): slotted patients first by
    // timeSlot asc, then no-slot walk-ins by tokenOrder/createdAt asc — the
    // doctor's Today's Schedule now matches the queue timeline.
    const todayListSorted = slotAwareSort(todayAppointmentsList)

    return NextResponse.json({
      todayAppointments,
      totalPatients,
      pendingPrescriptions,
      averageRating: (avgRating._avg.star || 0).toFixed(1),
      // Phase 4: pause state for the doctor dashboard header chip/toggle.
      queuePaused: doctor.queuePaused || false,
      todayList: todayListSorted.map((b) => ({
        id: b.id,
        appointmentNo: b.appointmentNo,
        patientName: b.patientName || b.user?.name || 'Walk-in',
        patientImg: b.user?.profileImg || '',
        disease: b.disease,
        date: b.bookingDate,
        status: b.status,
        tokenNumber: b.tokenNumber || null,
        timeSlot: b.timeSlot || null,
        // Phase 4: emergency (EMR) bookings render a rose chip + sort first.
        isEmergency: b.isEmergency || false,
        // Video consultation revival (CTO Plan Phase 3): lets the dashboard
        // render a Video Call badge and deep-link the Jitsi room directly.
        bookingMode: b.bookingMode || 'InPerson',
        videoRoomId: b.videoRoomId || '',
      })),
      recentReviews: recentReviews.map((r) => ({
        id: r.id,
        patientName: r.isAnonymous ? 'Anonymous' : (r.patient?.name || 'Patient'),
        patientImg: r.isAnonymous ? '' : (r.patient?.profileImg || ''),
        star: r.star,
        review: r.review,
        date: r.createdAt,
      })),
    })
  } catch (error) {
    console.error('Doctor stats error:', error)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
