import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/dashboard/doctor/search-prescriptions?type=appointment&value=XXX
 * GET /api/dashboard/doctor/search-prescriptions?type=mobile&value=9876543210
 *
 * Doctor searches for prescriptions by:
 *   - Appointment ID (appointmentNo) → returns only that 1 visit's prescription (1-to-1)
 *   - Mobile Number (patient's mobileNo) → returns ALL prescriptions for that patient (1-to-many)
 *
 * Authorization: doctor can only see prescriptions they wrote (Prescription.doctorId === doctor.id)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
    if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'appointment'
    const value = (searchParams.get('value') || '').trim()

    if (!value) {
      return NextResponse.json({ error: 'Search value is required' }, { status: 400 })
    }

    let prescriptions: {
      id: string
      appointmentNo: string
      disease: string
      date: string
      status: string
      medicinesCount: number
      description: string
      bookingId: string
    }[] = []
    let patientName = ''
    let patientMobile = ''

    if (type === 'appointment') {
      // Search by Appointment ID (appointmentNo) → 1 prescription
      const booking = await db.booking.findFirst({
        where: {
          appointmentNo: { contains: value },
          doctorId: doctor.id,
        },
        include: {
          user: { select: { name: true, mobileNo: true } },
          prescriptions: {
            where: { doctorId: doctor.id },
            include: {
              medicines: { select: { id: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (booking) {
        patientName = booking.patientName || booking.user?.name || 'Unknown'
        patientMobile = booking.user?.mobileNo || ''
        prescriptions = booking.prescriptions.map((rx) => ({
          id: rx.id,
          appointmentNo: booking.appointmentNo,
          disease: rx.disease,
          date: rx.createdAt.toISOString(),
          status: booking.status,
          medicinesCount: rx.medicines.length,
          description: rx.description,
          bookingId: booking.id,
        }))
      }
    } else if (type === 'mobile') {
      // Search by Mobile Number → ALL prescriptions for this patient
      // Find the patient user by mobile number
      const patientUser = await db.user.findFirst({
        where: {
          mobileNo: { contains: value },
        },
        select: { id: true, name: true, mobileNo: true },
      })

      if (patientUser) {
        patientName = patientUser.name
        patientMobile = patientUser.mobileNo || ''

        // Get all bookings for this patient with this doctor
        const bookings = await db.booking.findMany({
          where: {
            userId: patientUser.id,
            doctorId: doctor.id,
          },
          include: {
            prescriptions: {
              where: { doctorId: doctor.id },
              include: {
                medicines: { select: { id: true } },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { bookingDate: 'desc' },
        })

        // Flatten all prescriptions across all bookings
        for (const b of bookings) {
          for (const rx of b.prescriptions) {
            prescriptions.push({
              id: rx.id,
              appointmentNo: b.appointmentNo,
              disease: rx.disease,
              date: rx.createdAt.toISOString(),
              status: b.status,
              medicinesCount: rx.medicines.length,
              description: rx.description,
              bookingId: b.id,
            })
          }
        }
      } else {
        // Also check walk-in bookings (patientName might have the mobile in it)
        // Or check by booking's patient mobile field if it exists
        const walkInBookings = await db.booking.findMany({
          where: {
            doctorId: doctor.id,
            // Check if any booking field contains the mobile number
            // Booking model has patientName but not mobile directly
            // So we rely on the user lookup above for registered patients
          },
          include: {
            prescriptions: {
              where: { doctorId: doctor.id },
              include: { medicines: { select: { id: true } } },
            },
          },
        })
        // For walk-in, we can't search by mobile since Booking doesn't have a mobile field
        // Only registered patients (User with mobileNo) are searchable by mobile
      }
    }

    if (prescriptions.length === 0) {
      return NextResponse.json(null)
    }

    return NextResponse.json({
      patientName,
      patientMobile,
      prescriptions,
    })
  } catch (error) {
    console.error('Search prescriptions error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
