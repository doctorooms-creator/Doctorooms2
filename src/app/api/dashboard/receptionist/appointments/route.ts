import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { istDateRange } from '@/lib/date-utils'

/**
 * Appointment management (list + status updates).
 * The POST handler was retired with the booking unification (Reception
 * Panel P2) — ALL booking creation now flows through
 * /api/dashboard/receptionist/bookings (one desk, 3 modes, uniform tokens).
 */

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, 'receptionist')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const receptionist = await db.receptionist.findUnique({
      where: { userId: user.id },
    })

    if (!receptionist) {
      return NextResponse.json({ error: 'Receptionist not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''
    const from = searchParams.get('from') || ''
    const to = searchParams.get('to') || ''
    const queryDepartmentId = searchParams.get('departmentId') || ''
    const queryDoctorId = searchParams.get('doctorId') || ''

    // ── Hospital Mode ──
    const isHospitalMode = !!receptionist.hospitalId && !receptionist.doctorId

    if (isHospitalMode) {
      const hospitalDoctors = await db.doctorHospital.findMany({
        where: { hospitalId: receptionist.hospitalId, status: 'Active' },
        select: { doctorId: true },
      })
      const hospitalDoctorIds = hospitalDoctors.map((d) => d.doctorId)

      // Build base where with all hospital doctor IDs
      const where: Prisma.BookingWhereInput = {
        doctorId: { in: hospitalDoctorIds },
        hospitalId: receptionist.hospitalId,
      }

      if (statusFilter !== 'all') {
        where.status = statusFilter
      }
      if (search) {
        where.OR = [
          { patientName: { contains: search, mode: 'insensitive' } },
          { appointmentNo: { contains: search, mode: 'insensitive' } },
        ]
      }
      if (from || to) {
        where.bookingDate = {}
        if (from) {
          const range = istDateRange(from)
          where.bookingDate.gte = range.start
        }
        if (to) {
          const range = istDateRange(to)
          where.bookingDate.lte = range.end
        }
      }
      // Hospital-mode specific filters
      if (queryDepartmentId) {
        where.departmentId = queryDepartmentId
      }
      if (queryDoctorId) {
        where.doctorId = queryDoctorId
      }

      const [appointments, statusCounts] = await Promise.all([
        db.booking.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: {
            doctor: {
              include: { user: { select: { name: true, profileImg: true } } },
            },
            user: { select: { name: true, profileImg: true } },
          },
        }),
        db.booking.groupBy({
          by: ['status'],
          where: {
            doctorId: { in: hospitalDoctorIds },
            hospitalId: receptionist.hospitalId,
          },
          _count: { status: true },
        }),
      ])

      const statusCountMap = Object.fromEntries(
        statusCounts.map((s) => [s.status, s._count.status])
      )

      // Get hospital departments list
      const departments = await db.department.findMany({
        where: { hospitalId: receptionist.hospitalId, status: 'Active' },
        select: { id: true, name: true, shortCode: true },
        orderBy: { sortOrder: 'asc' },
      })

      return NextResponse.json({
        isHospitalMode: true,
        appointments: appointments.map((b) => ({
          id: b.id,
          appointmentNo: b.appointmentNo,
          patientName: b.patientName || b.user?.name || 'Walk-in',
          patientImg: b.user?.profileImg,
          patientUserId: b.userId || null,
          doctorId: b.doctor?.id || '',
          doctorName: b.doctor?.user?.name || 'Unknown',
          doctorImg: b.doctor?.user?.profileImg,
          doctorSpecialization: b.doctor?.specialization || null,
          departmentId: b.departmentId || null,
          date: b.bookingDate,
          timeSlot: b.timeSlot || '',
          status: b.status,
          charge: b.appointmentCharge,
          disease: b.disease,
          bookingType: b.bookingType,
          createdAt: b.createdAt,
          tokenNumber: b.tokenNumber || null,
        })),
        statusCounts: statusCountMap,
        doctor: null,
        departments,
      })
    }

    // ── Clinic Mode (unchanged) ──
    const where: Prisma.BookingWhereInput = { doctorId: receptionist.doctorId }
    if (statusFilter !== 'all') {
      where.status = statusFilter
    }
    if (search) {
      where.OR = [
        { patientName: { contains: search, mode: 'insensitive' } },
        { appointmentNo: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (from || to) {
      where.bookingDate = {}
      if (from) {
        const range = istDateRange(from)
        where.bookingDate.gte = range.start
      }
      if (to) {
        const range = istDateRange(to)
        where.bookingDate.lte = range.end
      }
    }

    const [appointments, statusCounts, doctor] = await Promise.all([
      db.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          doctor: {
            include: { user: { select: { name: true, profileImg: true } } },
          },
          user: { select: { name: true, profileImg: true } },
        },
      }),
      db.booking.groupBy({
        by: ['status'],
        where: { doctorId: receptionist.doctorId },
        _count: { status: true },
      }),
      db.doctor.findUnique({
        where: { id: receptionist.doctorId! },
        include: { user: { select: { name: true } } },
      }),
    ])

    const statusCountMap = Object.fromEntries(
      statusCounts.map((s) => [s.status, s._count.status])
    )

    return NextResponse.json({
      isHospitalMode: false,
      appointments: appointments.map((b) => ({
        id: b.id,
        appointmentNo: b.appointmentNo,
        patientName: b.patientName || b.user?.name || 'Walk-in',
        patientImg: b.user?.profileImg,
        patientUserId: b.userId || null,
        doctorId: b.doctor?.id || '',
        doctorName: b.doctor?.user?.name || 'Unknown',
        doctorImg: b.doctor?.user?.profileImg,
        doctorSpecialization: b.doctor?.specialization || null,
        date: b.bookingDate,
        timeSlot: b.timeSlot || '',
        status: b.status,
        charge: b.appointmentCharge,
        disease: b.disease,
        bookingType: b.bookingType,
        createdAt: b.createdAt,
        tokenNumber: b.tokenNumber || null,
      })),
      statusCounts: statusCountMap,
      doctor: doctor
        ? { id: doctor.id, name: doctor.user.name, fees: doctor.fees }
        : null,
    })
  } catch (error) {
    console.error('Receptionist appointments list error:', error)
    return NextResponse.json({ error: 'Failed to load appointments' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRole(request, 'receptionist')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const receptionist = await db.receptionist.findUnique({
      where: { userId: user.id },
    })

    if (!receptionist) {
      return NextResponse.json({ error: 'Receptionist not found' }, { status: 404 })
    }

    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Appointment ID and status are required' },
        { status: 400 }
      )
    }

    if (!['Approve', 'Canceled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // ── Hospital Mode: allow managing any appointment in this hospital ──
    const isHospitalMode = !!receptionist.hospitalId && !receptionist.doctorId

    let appointment
    if (isHospitalMode) {
      appointment = await db.booking.findFirst({
        where: { id, hospitalId: receptionist.hospitalId },
      })
    } else {
      appointment = await db.booking.findFirst({
        where: { id, doctorId: receptionist.doctorId },
      })
    }

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    await db.booking.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update appointment error:', error)
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}
