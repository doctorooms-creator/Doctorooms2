import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, RECEPTION_ROLES } from '@/lib/api-auth'
import { todayISTStr, istDateRange } from '@/lib/date-utils'
import { slotAwareSort } from '@/lib/queue-ordering'

// ============ GET: Doctor's queue for a date ============
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  try {
    const user = await requireAuth(req)
    if (!user || ![...RECEPTION_ROLES, 'doctor', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { doctorId } = await params
    const { searchParams } = new URL(req.url)
    const dateStr = searchParams.get('date') || todayISTStr()

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 })
    }

    const { start, end } = istDateRange(dateStr)

    // Fetch doctor with user info
    const doctor = await db.doctor.findUnique({
      where: { id: doctorId },
      include: { user: { select: { name: true, profileImg: true } } },
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    // Check if doctor has a hospital link
    const doctorHospitalLink = await db.doctorHospital.findFirst({
      where: { doctorId, status: 'Active' },
      include: {
        department: { select: { id: true, name: true, shortCode: true, floorNo: true, opdRoom: true } },
        hospital: { select: { id: true, hospitalName: true } },
      },
    })

    // Fetch all bookings for this doctor on the given date (Approve, Visited, Finish)
    const bookings = await db.booking.findMany({
      where: {
        doctorId,
        bookingDate: { gte: start, lte: end },
        status: { in: ['Approve', 'Visited', 'Finish'] },
      },
      include: {
        user: { select: { name: true, profileImg: true } },
      },
    })

    // Sort: slot-aware dual-mode order (slotted by timeSlot asc, then
    // no-slot walk-ins by tokenOrder asc / createdAt asc).
    const sorted = slotAwareSort(bookings)

    // Build queue items
    const queue = sorted.map((booking) => {
      // Receptionist display name (kept for API shape; no receptionist
      // relation on Booking — always empty for now).
      const receptionistName = ''

      return {
        id: booking.id,
        tokenNumber: booking.tokenNumber || null,
        tokenOrder: booking.tokenOrder || 0,
        patientName: booking.patientName || booking.user?.name || 'Walk-in',
        patientImg: booking.user?.profileImg || null,
        disease: booking.disease || '',
        timeSlot: booking.timeSlot || '',
        status: booking.status,
        bookingType: booking.bookingType || 'By Self',
        bookingMode: booking.bookingMode || 'InPerson',
        videoRoomId: booking.videoRoomId || '',
        // Phase 4: emergency (EMR) bookings sort first + render a rose chip.
        isEmergency: booking.isEmergency || false,
        createdAt: booking.createdAt.toISOString(),
        receptionistName: receptionistName,
      }
    })

    // Stats
    const stats = {
      total: queue.length,
      waiting: queue.filter((q) => q.status === 'Approve').length,
      inConsultation: queue.filter((q) => q.status === 'Visited').length,
      completed: queue.filter((q) => q.status === 'Finish').length,
    }

    // Current serving = latest booking with status 'Visited'
    const visitedBookings = sorted.filter((b) => b.status === 'Visited')
    const currentServing = visitedBookings.length > 0
      ? {
          tokenNumber: visitedBookings[visitedBookings.length - 1].tokenNumber || null,
          patientName: visitedBookings[visitedBookings.length - 1].patientName || visitedBookings[visitedBookings.length - 1].user?.name || 'Walk-in',
        }
      : null

    return NextResponse.json({
      doctor: {
        id: doctor.id,
        name: doctor.user.name,
        specialization: doctor.specialization,
        profileImg: doctor.user.profileImg,
        // Phase 4: pause state (consumed by the doctor dashboard + kiosk).
        queuePaused: doctor.queuePaused || false,
      },
      department: doctorHospitalLink
        ? {
            id: doctorHospitalLink.department.id,
            name: doctorHospitalLink.department.name,
            shortCode: doctorHospitalLink.department.shortCode,
            floorNo: doctorHospitalLink.department.floorNo,
            opdRoom: doctorHospitalLink.department.opdRoom,
          }
        : null,
      hospital: doctorHospitalLink
        ? {
            id: doctorHospitalLink.hospital.id,
            hospitalName: doctorHospitalLink.hospital.hospitalName,
          }
        : null,
      date: dateStr,
      queue,
      stats,
      currentServing,
    })
  } catch (error) {
    console.error('Doctor queue GET error:', error)
    return NextResponse.json({ error: 'Failed to load doctor queue' }, { status: 500 })
  }
}
