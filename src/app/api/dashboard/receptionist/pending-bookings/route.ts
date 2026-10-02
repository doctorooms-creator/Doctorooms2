import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, RECEPTION_ROLES } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user || !RECEPTION_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Resolve hospital (works for receptionist and hospital/admin roles)
    let hospitalId: string | null = null
    let doctorId: string | null = null

    if (user.role === 'receptionist') {
      const receptionist = await db.receptionist.findUnique({
        where: { userId: user.id },
        select: { doctorId: true, hospitalId: true },
      })
      if (!receptionist) {
        return NextResponse.json({ error: 'Receptionist not found' }, { status: 404 })
      }
      hospitalId = receptionist.hospitalId
      doctorId = receptionist.doctorId
    } else if (user.role === 'hospital' || user.role === 'admin') {
      const hospital = await db.hospital.findUnique({
        where: { userId: user.id },
        select: { id: true },
      })
      hospitalId = hospital?.id || null
    }

    if (!hospitalId) {
      return NextResponse.json({ error: 'No hospital linked' }, { status: 404 })
    }

    // ── Hospital Mode: shared pool — all pending bookings for the hospital ──
    const isHospitalMode = !!hospitalId && !doctorId

    let pendingBookings
    if (isHospitalMode) {
      pendingBookings = await db.booking.findMany({
        where: {
          status: 'Pending',
          bookingType: 'By Self',
          hospitalId,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, profileImg: true, mobileNo: true } },
          doctor: {
            include: { user: { select: { name: true, profileImg: true } } },
          },
        },
      })
    } else {
      // ── Clinic Mode ──
      pendingBookings = await db.booking.findMany({
        where: {
          status: 'Pending',
          bookingType: 'By Self',
          doctorId: doctorId!,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, profileImg: true, mobileNo: true } },
          doctor: {
            include: { user: { select: { name: true, profileImg: true } } },
          },
        },
      })
    }

    // Calculate hypothetical queue position for each booking if it were approved
    const bookingsWithQueue = await Promise.all(
      pendingBookings.map(async (b) => {
        const bookingDate = new Date(b.bookingDate)
        const dateOnly = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate())
        const nextDay = new Date(dateOnly)
        nextDay.setDate(nextDay.getDate() + 1)

        // Count existing approved bookings for that doctor on that date
        const existingApproved = await db.booking.count({
          where: {
            doctorId: b.doctorId,
            bookingDate: { gte: dateOnly, lt: nextDay },
            status: { in: ['Approve', 'Visited', 'Finish'] },
          },
        })

        const hypotheticalQueuePosition = existingApproved + 1

        return {
          id: b.id,
          appointmentNo: b.appointmentNo,
          patientName: b.user?.name || b.patientName || 'Unknown',
          patientImg: b.user?.profileImg || null,
          patientMobile: b.user?.mobileNo || '',
          disease: b.disease,
          description: b.description,
          bookingDate: b.bookingDate,
          timeSlot: b.timeSlot,
          bookingMode: b.bookingMode || 'InPerson',
          createdAt: b.createdAt,
          doctorName: b.doctor.user?.name || 'Unknown',
          doctorSpecialization: b.doctor.specialization || '',
          departmentId: b.departmentId || null,
          departmentName: null, // Booking has no department relation; departmentId available if needed
          queuePosition: hypotheticalQueuePosition,
          opdCount: existingApproved,
          opdLimit: b.doctor.dailyLimit || 0,
          isKiosk: b.appointmentNo?.startsWith('KSK-') || false,
        }
      })
    )

    return NextResponse.json({ bookings: bookingsWithQueue, isHospitalMode })
  } catch (error) {
    console.error('Pending bookings list error:', error)
    return NextResponse.json({ error: 'Failed to load pending bookings' }, { status: 500 })
  }
}
