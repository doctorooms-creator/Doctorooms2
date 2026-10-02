import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { istDateRange } from '@/lib/date-utils'
import { slotAwareSort } from '@/lib/queue-ordering'

// ============ GET: Patient's queue position for a booking ============
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId is required' },
        { status: 400 }
      )
    }

    // Fetch booking with doctor info
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        doctor: {
          include: { user: { select: { name: true, profileImg: true } } },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Verify ownership: the booking's userId must match the logged-in user
    if (booking.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If booking doesn't have a token number, return basic info without queue
    if (!booking.tokenNumber || booking.tokenOrder <= 0) {
      return NextResponse.json({
        booking: {
          id: booking.id,
          tokenNumber: booking.tokenNumber || null,
          tokenOrder: booking.tokenOrder || 0,
          status: booking.status,
          timeSlot: booking.timeSlot,
          disease: booking.disease,
          bookingDate: booking.bookingDate.toISOString(),
          bookingMode: booking.bookingMode,
        },
        queueInfo: null,
        doctor: {
          name: booking.doctor.user.name,
          specialization: booking.doctor.specialization,
          profileImg: booking.doctor.user.profileImg,
        },
        department: null,
        hospital: null,
      })
    }

    // Get the IST date string for the booking date
    const bookingDateIST = new Date(
      new Date(booking.bookingDate).getTime() + 5.5 * 60 * 60 * 1000
    )
    const y = bookingDateIST.getUTCFullYear()
    const m = String(bookingDateIST.getUTCMonth() + 1).padStart(2, '0')
    const d = String(bookingDateIST.getUTCDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${d}`
    const { start, end } = istDateRange(dateStr)

    // Count patients ahead using the SAME slot-aware ordering the doctor's
    // queue displays (CTO Plan Phase 2, 2d): slotted patients by timeSlot,
    // then queue-tail walk-ins by tokenOrder. The patient's position MUST
    // match what the doctor's list shows — not raw tokenOrder.
    // isEmergency is selected so the Phase 4 emergency tier applies here too
    // (an EMR- booking ahead of you counts toward your position).
    const queueBookings = await db.booking.findMany({
      where: {
        doctorId: booking.doctorId,
        bookingDate: { gte: start, lte: end },
        status: { in: ['Approve', 'Visited'] },
      },
      select: { id: true, tokenOrder: true, timeSlot: true, createdAt: true, isEmergency: true },
    })
    const sortedQueue = slotAwareSort(queueBookings)
    const myIndex = sortedQueue.findIndex((b) => b.id === booking.id)
    const patientsAhead = myIndex >= 0 ? myIndex : queueBookings.length

    const myPosition = patientsAhead + 1
    const estimatedWaitMinutes = patientsAhead * 10

    // Total patients in queue for progress bar
    const totalInQueue = queueBookings.length

    // Progress: 100% when you're #1
    const progressPercent = totalInQueue > 0
      ? Math.round(((totalInQueue - patientsAhead) / totalInQueue) * 100)
      : 100

    // Currently serving: latest booking with status 'Visited' for same doctor today
    const currentlyServingBooking = await db.booking.findFirst({
      where: {
        doctorId: booking.doctorId,
        bookingDate: { gte: start, lte: end },
        status: 'Visited',
      },
      orderBy: { createdAt: 'desc' },
      select: { tokenNumber: true },
    })

    // Fetch department & hospital info if this is a hospital booking
    let department: {
      name: string
      shortCode: string
      floorNo: string
      opdRoom: string
    } | null = null
    let hospital: {
      hospitalName: string
      address: string
      city: string
    } | null = null

    if (booking.hospitalId) {
      // Find the doctor-hospital link with department
      const dhLink = await db.doctorHospital.findFirst({
        where: {
          doctorId: booking.doctorId,
          hospitalId: booking.hospitalId,
          status: 'Active',
        },
        include: {
          department: {
            select: {
              name: true,
              shortCode: true,
              floorNo: true,
              opdRoom: true,
            },
          },
          hospital: {
            select: {
              hospitalName: true,
              address: true,
              city: true,
            },
          },
        },
      })

      if (dhLink) {
        department = dhLink.department
          ? {
              name: dhLink.department.name,
              shortCode: dhLink.department.shortCode,
              floorNo: dhLink.department.floorNo,
              opdRoom: dhLink.department.opdRoom,
            }
          : null
        hospital = dhLink.hospital
          ? {
              hospitalName: dhLink.hospital.hospitalName,
              address: dhLink.hospital.address,
              city: dhLink.hospital.city,
            }
          : null
      }
    }

    return NextResponse.json({
      booking: {
        id: booking.id,
        tokenNumber: booking.tokenNumber,
        tokenOrder: booking.tokenOrder,
        status: booking.status,
        timeSlot: booking.timeSlot,
        disease: booking.disease,
        bookingDate: booking.bookingDate.toISOString(),
        bookingMode: booking.bookingMode,
      },
      queueInfo: {
        totalAhead: patientsAhead,
        myPosition,
        totalInQueue,
        progressPercent,
        estimatedWaitMinutes,
        currentlyServingToken: currentlyServingBooking?.tokenNumber || null,
        currentlyServingPatientName: null,
      },
      doctor: {
        name: booking.doctor.user.name,
        specialization: booking.doctor.specialization,
        profileImg: booking.doctor.user.profileImg,
      },
      department,
      hospital,
    })
  } catch (error) {
    console.error('Patient queue GET error:', error)
    return NextResponse.json({ error: 'Failed to load queue info' }, { status: 500 })
  }
}
