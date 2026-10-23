import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, RECEPTION_ROLES } from '@/lib/api-auth'
import { todayISTRange, todayISTStr } from '@/lib/date-utils'
import { slotAwareSort } from '@/lib/queue-ordering'

// ============ GET: Today's queue for the receptionist's doctor(s) ============
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user || !RECEPTION_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const queryDoctorId = searchParams.get('doctorId') || ''

    // Find receptionist
    const receptionist = await db.receptionist.findFirst({
      where: { userId: user.id },
      select: { doctorId: true, hospitalId: true },
    })

    if (!receptionist) {
      return NextResponse.json({ error: 'No doctor linked to this receptionist' }, { status: 404 })
    }

    // ── Hospital Mode ──
    const isHospitalMode = !!receptionist.hospitalId && !receptionist.doctorId

    if (isHospitalMode) {
      const hospitalDoctors = await db.doctorHospital.findMany({
        where: { hospitalId: receptionist.hospitalId, status: 'Active' },
        select: { doctorId: true },
      })
      const doctorIds = hospitalDoctors.map((d) => d.doctorId)

      const { start: startOfDay, end: endOfDay } = todayISTRange()
      const todayStr = todayISTStr()

      // Build where clause — optionally filter by a specific doctor
      const bookingWhere: Record<string, unknown> = {
        doctorId: { in: doctorIds },
        hospitalId: receptionist.hospitalId,
        bookingDate: { gte: startOfDay, lte: endOfDay },
        status: { in: ['Approve', 'Visited'] },
      }
      if (queryDoctorId) {
        // SECURITY: validate the requested doctor belongs to this hospital
        // before overriding the hospital-scoped filter
        if (!doctorIds.includes(queryDoctorId)) {
          return NextResponse.json({ error: 'Doctor not linked to your hospital' }, { status: 403 })
        }
        bookingWhere.doctorId = queryDoctorId
      }

      const [bookings, opdCompletedToday] = await Promise.all([
        db.booking.findMany({
          where: bookingWhere as any,
          include: {
            doctor: {
              include: { user: { select: { name: true, profileImg: true } } },
            },
            user: { select: { name: true, profileImg: true, mobileNo: true } },
          },
          orderBy: { createdAt: 'asc' },
        }),
        db.booking.count({
          where: {
            doctorId: { in: doctorIds },
            hospitalId: receptionist.hospitalId,
            bookingDate: { gte: startOfDay, lte: endOfDay },
            status: 'Finish',
          },
        }),
      ])

      // Slot-aware order (CTO Plan Phase 2, item 2d): slotted patients first
      // (timeSlot asc), then no-slot walk-ins (tokenOrder asc, createdAt asc).
      // Sorting globally is subset-consistent, so each per-doctor bucket built
      // below preserves the same relative order and the per-doctor
      // queuePosition assignment reflects it.
      const sortedBookings = slotAwareSort(bookings)

      // Build per-doctor queues
      const byDoctor: Record<string, typeof bookings> = {}
      for (const b of sortedBookings) {
        if (!byDoctor[b.doctorId]) byDoctor[b.doctorId] = []
        byDoctor[b.doctorId].push(b)
      }

      const queue = sortedBookings.map((booking) => ({
        id: booking.id,
        appointmentNo: booking.appointmentNo,
        patientName: booking.patientName || booking.user?.name || 'Walk-in',
        patientImg: booking.user?.profileImg || null,
        disease: booking.disease,
        timeSlot: booking.timeSlot || null,
        bookingMode: booking.bookingMode,
        bookingType: booking.bookingType,
        createdAt: booking.createdAt.toISOString(),
        status: booking.status,
        doctorId: booking.doctorId,
        doctorName: booking.doctor?.user?.name || 'Unknown',
        departmentId: booking.departmentId || null,
        tokenNumber: booking.tokenNumber || null,
        tokenOrder: booking.tokenOrder || 0,
        queuePosition: 0, // will be calculated per-doctor below
      }))

      // Assign per-doctor queue positions
      const doctorPositionTracker: Record<string, number> = {}
      for (const item of queue) {
        doctorPositionTracker[item.doctorId] = (doctorPositionTracker[item.doctorId] || 0) + 1
        item.queuePosition = doctorPositionTracker[item.doctorId]
      }

      return NextResponse.json({
        isHospitalMode: true,
        date: todayStr,
        totalInQueue: queue.length,
        queue,
        opdCompletedToday,
      })
    }

    // ── Clinic Mode ──
    const doctor = await db.doctor.findUnique({
      where: { id: receptionist.doctorId },
      select: {
        id: true,
        dailyLimit: true,
        userId: true,
        specialization: true,
        user: { select: { name: true, profileImg: true } },
        hospitalLinks: {
          where: { status: 'Active' },
          select: {
            designation: true,
            department: { select: { id: true, name: true, shortCode: true, icon: true } },
          },
          take: 1,
        },
      },
    })
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    // Today's date range in IST
    const { start: startOfDay, end: endOfDay } = todayISTRange()
    const todayStr = todayISTStr()

    // Fetch all Approve/Visited/Finish bookings for today
    const bookings = await db.booking.findMany({
      where: {
        doctorId: doctor.id,
        bookingDate: { gte: startOfDay, lte: endOfDay },
        status: { in: ['Approve', 'Visited'] },
      },
      include: {
        user: { select: { name: true, profileImg: true, mobileNo: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Count completed today
    const opdCompletedToday = await db.booking.count({
      where: {
        doctorId: doctor.id,
        bookingDate: { gte: startOfDay, lte: endOfDay },
        status: 'Finish',
      },
    })

    // Build queue with positions (slot-aware order: slotted patients first
    // by timeSlot asc, then no-slot walk-ins by tokenOrder/createdAt asc)
    const sortedBookings = slotAwareSort(bookings)
    const queue = sortedBookings.map((booking, index) => ({
      id: booking.id,
      appointmentNo: booking.appointmentNo,
      patientName: booking.patientName || booking.user?.name || 'Walk-in',
      patientImg: booking.user?.profileImg || null,
      disease: booking.disease,
      timeSlot: booking.timeSlot || null,
      bookingMode: booking.bookingMode,
      bookingType: booking.bookingType,
      createdAt: booking.createdAt.toISOString(),
      status: booking.status,
      doctorId: booking.doctorId,
      doctorName: doctor.user?.name || 'Unknown',
      departmentId: booking.departmentId || null,
      tokenNumber: booking.tokenNumber || null,
      tokenOrder: booking.tokenOrder || 0,
      queuePosition: index + 1,
    }))

    return NextResponse.json({
      isHospitalMode: false,
      date: todayStr,
      totalInQueue: queue.length,
      queue,
      opdLimit: doctor.dailyLimit,
      opdCompletedToday,
      // Clinic doctor context (used by the Queue page's clinic-mode view)
      doctor: {
        id: doctor.id,
        name: doctor.user?.name || 'Doctor',
        profileImg: doctor.user?.profileImg || null,
        specialization: doctor.specialization || '',
        designation: doctor.hospitalLinks[0]?.designation || '',
        department: doctor.hospitalLinks[0]?.department || null,
      },
    })
  } catch (error) {
    console.error('Walk-in queue GET error:', error)
    return NextResponse.json({ error: 'Failed to load queue' }, { status: 500 })
  }
}
