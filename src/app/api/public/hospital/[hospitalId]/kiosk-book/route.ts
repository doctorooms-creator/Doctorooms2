import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { todayISTRange, currentTimeIST } from '@/lib/date-utils'

/**
 * PUBLIC KIOSK BOOKING — No auth required.
 * Patient scans QR at hospital entrance, fills minimal details,
 * chooses department + doctor, request goes to receptionist for approval.
 *
 * Creates booking with status='Pending', bookingType='By Self'.
 * Receptionist approves → token assigned → patient gets SMS.
 */

interface KioskBookingBody {
  patientName: string
  mobileNo?: string
  age?: string
  gender?: string
  disease?: string
  departmentId: string
  doctorId: string
  timeSlot?: string
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ hospitalId: string }> }
) {
  try {
    const { hospitalId } = await params
    const body: KioskBookingBody = await req.json()

    // Validate required fields
    if (!body.patientName?.trim()) {
      return NextResponse.json({ error: 'Patient name is required' }, { status: 400 })
    }
    if (!body.departmentId) {
      return NextResponse.json({ error: 'Department is required' }, { status: 400 })
    }
    if (!body.doctorId) {
      return NextResponse.json({ error: 'Doctor is required' }, { status: 400 })
    }

    // Verify hospital exists and is active
    const hospital = await db.hospital.findFirst({
      where: { id: hospitalId, status: 'Active' },
      select: { id: true, hospitalName: true },
    })
    if (!hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })
    }

    // Verify department belongs to hospital
    const dept = await db.department.findFirst({
      where: { id: body.departmentId, hospitalId, status: 'Active' },
    })
    if (!dept) {
      return NextResponse.json({ error: 'Invalid department' }, { status: 400 })
    }

    // Verify doctor is linked to this hospital + department
    const docLink = await db.doctorHospital.findFirst({
      where: {
        doctorId: body.doctorId,
        hospitalId,
        departmentId: body.departmentId,
        status: 'Active',
        isAvailable: true,
      },
      include: {
        doctor: {
          include: { user: { select: { name: true } } },
        },
      },
    })
    if (!docLink) {
      return NextResponse.json({ error: 'Doctor not available' }, { status: 400 })
    }

    const { start: startOfDay, end: endOfDay } = todayISTRange()

    // Check OPD limit
    const activeCount = await db.booking.count({
      where: {
        doctorId: body.doctorId,
        bookingDate: { gte: startOfDay, lte: endOfDay },
        status: { in: ['Approve', 'Visited', 'Finish'] },
      },
    })

    if (activeCount >= docLink.doctor.dailyLimit) {
      return NextResponse.json({
        error: `OPD limit reached for ${docLink.doctor.user.name}. Please choose another doctor.`,
      }, { status: 400 })
    }

    // Check slot conflict if timeSlot provided
    if (body.timeSlot) {
      const conflict = await db.booking.findFirst({
        where: {
          doctorId: body.doctorId,
          bookingDate: { gte: startOfDay, lte: endOfDay },
          timeSlot: body.timeSlot,
          status: { in: ['Approve', 'Visited', 'Finish'] },
        },
      })
      if (conflict) {
        return NextResponse.json({
          error: `Time slot ${body.timeSlot} is already booked. Please choose another.`,
        }, { status: 409 })
      }
    }

    // Look up existing patient by mobile (auto-link)
    let patientUserId: string | null = null
    if (body.mobileNo?.trim()) {
      const existing = await db.user.findFirst({
        where: { mobileNo: body.mobileNo.trim(), role: 'patient' },
        select: { id: true },
      })
      if (existing) {
        patientUserId = existing.id
      }
    }

    // Generate appointment number
    const appointmentNo = `KSK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

    // Create booking with Pending status (awaiting receptionist approval)
    const booking = await db.booking.create({
      data: {
        appointmentNo,
        doctorId: body.doctorId,
        userId: patientUserId,
        patientName: body.patientName.trim(),
        disease: body.disease?.trim() || '',
        gender: body.gender || '',
        age: body.age ? parseInt(body.age, 10) : null,
        status: 'Pending',
        bookingType: 'By Self',
        bookingMode: 'InPerson',
        timeSlot: body.timeSlot || '',
        bookingDate: new Date(),
        hospitalId,
        departmentId: body.departmentId,
      },
    })

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      appointmentNo: booking.appointmentNo,
      status: 'Pending',
      message: 'Request sent to reception. Please wait for approval.',
    }, { status: 201 })
  } catch (error) {
    console.error('Kiosk booking error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
