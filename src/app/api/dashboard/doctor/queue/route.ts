import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { todayISTRange, todayISTStr } from '@/lib/date-utils'
import { slotAwareSort } from '@/lib/queue-ordering'

/**
 * Doctor's OPD queue for today.
 *
 * Rewritten to fix two issues:
 *  1. N+1 query — the old version called `db.booking.count()` once per
 *     booking inside a `Promise.all`. We now fetch all bookings in a single
 *     query and compute positions in-memory.
 *  2. Sort order — slot-aware (CTO Plan Phase 2, item 2d): if any booking
 *     has a parseable timeSlot, slotted patients come first (timeSlot asc)
 *     and no-slot walk-ins follow (tokenOrder > 0 asc, then createdAt asc).
 *     When no booking has a parseable timeSlot this degrades to exactly the
 *     legacy order (tokenOrder > 0 asc, then createdAt asc). See
 *     @/lib/queue-ordering.
 *
 * Returns `{ date, stats, currentServing, opdLimit, opdCompletedToday, queue }`.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctor = await db.doctor.findUnique({
      where: { userId: user.id },
      select: { id: true, dailyLimit: true, queuePaused: true },
    })
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    // Today's date range in IST
    const { start: startOfDay, end: endOfDay } = todayISTRange()
    const todayStr = todayISTStr()

    // Single query: all Approve/Visited/Finish bookings for today.
    // No per-booking `count()` calls — we compute positions in-memory below.
    const [bookings, opdCompletedToday] = await Promise.all([
      db.booking.findMany({
        where: {
          doctorId: doctor.id,
          bookingDate: { gte: startOfDay, lte: endOfDay },
          status: { in: ['Approve', 'Visited', 'Finish'] },
        },
        include: {
          user: { select: { name: true, profileImg: true } },
        },
      }),
      db.booking.count({
        where: {
          doctorId: doctor.id,
          bookingDate: { gte: startOfDay, lte: endOfDay },
          status: 'Finish',
        },
      }),
    ])

    // Sort: slot-aware dual-mode order (slotted by timeSlot asc, then
    // no-slot walk-ins by tokenOrder asc / createdAt asc).
    const sorted = slotAwareSort(bookings)

    // Compute positions in-memory (queue position only counts Approve/Visited,
    // since Finish patients are not actually waiting).
    const waitingOrInConsult = sorted.filter(
      (b) => b.status === 'Approve' || b.status === 'Visited'
    )
    const positionById = new Map<string, number>()
    waitingOrInConsult.forEach((b, idx) => {
      positionById.set(b.id, idx + 1)
    })

    const queue = sorted.map((booking) => ({
      id: booking.id,
      appointmentNo: booking.appointmentNo,
      patientName: booking.patientName || booking.user?.name || 'Walk-in',
      patientImg: booking.user?.profileImg || null,
      disease: booking.disease,
      timeSlot: booking.timeSlot,
      bookingMode: booking.bookingMode,
      // Video consultation revival (CTO Plan Phase 3): room id for the Jitsi
      // call (empty string while the call hasn't been started).
      videoRoomId: booking.videoRoomId || '',
      bookingType: booking.bookingType,
      createdAt: booking.createdAt.toISOString(),
      status: booking.status,
      // Phase 4: emergency (EMR) bookings render a rose chip + sort first.
      isEmergency: booking.isEmergency || false,
      tokenNumber: booking.tokenNumber || null,
      tokenOrder: booking.tokenOrder || 0,
      queuePosition: positionById.get(booking.id) ?? null,
    }))

    // Stats
    const stats = {
      total: queue.length,
      waiting: queue.filter((q) => q.status === 'Approve').length,
      inConsultation: queue.filter((q) => q.status === 'Visited').length,
      completed: queue.filter((q) => q.status === 'Finish').length,
    }

    // Current serving = latest Visited booking (last in the waiting list with
    // status Visited; sorted by tokenOrder asc).
    const visitedBookings = sorted.filter((b) => b.status === 'Visited')
    const currentServing = visitedBookings.length > 0
      ? {
          id: visitedBookings[visitedBookings.length - 1].id,
          tokenNumber: visitedBookings[visitedBookings.length - 1].tokenNumber || null,
          patientName:
            visitedBookings[visitedBookings.length - 1].patientName ||
            visitedBookings[visitedBookings.length - 1].user?.name ||
            'Walk-in',
        }
      : null

    return NextResponse.json({
      date: todayStr,
      stats,
      currentServing,
      opdLimit: doctor.dailyLimit,
      opdCompletedToday,
      // Phase 4: pause state for the Pause/Resume toggle on the doctor's own
      // dashboard (mirror of GET /api/dashboard/doctor/queue-pause).
      queuePaused: doctor.queuePaused || false,
      queue,
    })
  } catch (error) {
    console.error('Doctor queue error:', error)
    return NextResponse.json({ error: 'Failed to load queue' }, { status: 500 })
  }
}
