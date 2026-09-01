import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { istDateRange } from '@/lib/date-utils'
import { withSerializableTx } from '@/lib/token-utils'
import { logCreate } from '@/lib/audit-log'
import { getAuditContext } from '@/lib/audit-context'

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { doctorId, bookingDate, timeSlot, bookingMode, disease, description, gender, age, bloodGroup, weight, relationWithMe, state, city, hospitalId, departmentId } = body

    if (!doctorId || !bookingDate || !bookingMode || !disease || !gender) {
      return NextResponse.json(
        { error: 'doctorId, bookingDate, bookingMode, disease, and gender are required' },
        { status: 400 }
      )
    }

    // Validate bookingMode
    if (!['InPerson', 'VideoCall'].includes(bookingMode)) {
      return NextResponse.json(
        { error: 'bookingMode must be InPerson or VideoCall' },
        { status: 400 }
      )
    }

    // Validate doctor exists
    const doctor = await db.doctor.findUnique({
      where: { id: doctorId },
      include: { user: { select: { name: true } } },
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    // Validate hospital context if provided
    if (hospitalId) {
      const dhLink = await db.doctorHospital.findFirst({
        where: {
          doctorId,
          hospitalId,
          ...(departmentId ? { departmentId } : {}),
          status: 'Active',
        },
      })
      if (!dhLink) {
        return NextResponse.json({ error: 'Doctor is not available at this hospital/department' }, { status: 400 })
      }
    }

    // Hospital attribution (Phase 2, 2f): when the patient books a doctor
    // directly (no hospital context in the request), resolve the doctor's
    // primary Active hospital link and stamp hospitalId + departmentId from
    // it. Otherwise the booking would carry hospitalId=null and never appear
    // in ANY hospital reception's pending pool, TV board, or queue scoping.
    let effectiveHospitalId: string | undefined = hospitalId || undefined
    let effectiveDepartmentId: string | undefined = departmentId || undefined
    if (!effectiveHospitalId) {
      const primaryLink = await db.doctorHospital.findFirst({
        where: { doctorId, status: 'Active' },
        orderBy: { createdAt: 'asc' },
        select: { hospitalId: true, departmentId: true },
      })
      if (primaryLink) {
        effectiveHospitalId = primaryLink.hospitalId
        effectiveDepartmentId = effectiveDepartmentId || primaryLink.departmentId
      }
    }

    const dateObj = new Date(bookingDate)
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ error: 'Invalid booking date' }, { status: 400 })
    }

    // SECURITY (P1.11): Reject past dates + same-day slots that have already ended.
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (dateObj < today) {
      return NextResponse.json({ error: 'Cannot book an appointment in the past' }, { status: 400 })
    }
    if (dateObj.toDateString() === new Date().toDateString() && timeSlot) {
      // Same-day booking — the requested slot must still be in the future.
      const [slotH, slotM] = timeSlot.split(':').map(Number)
      if (!isNaN(slotH) && !isNaN(slotM)) {
        const slotDateTime = new Date(dateObj)
        slotDateTime.setHours(slotH, slotM, 0, 0)
        if (slotDateTime < new Date()) {
          return NextResponse.json(
            { error: 'Cannot book a slot that has already ended' },
            { status: 400 }
          )
        }
      }
    }

    // Extract IST date range for comparisons
    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
    const { start: dateOnly, end: _endOfDay } = istDateRange(dateStr)
    const nextDay = new Date(_endOfDay.getTime() + 1)

    // Check if date is a holiday for this doctor
    // Tolerant lookup: DoctorHoliday.userId references Doctor.id, but older
    // writers stored the doctor's USER id — match either convention.
    const holiday = await db.doctorHoliday.findFirst({
      where: {
        userId: { in: [doctor.userId, doctor.id] },
        date: {
          gte: dateOnly,
          lt: nextDay,
        },
      },
    })

    if (holiday) {
      return NextResponse.json(
        { error: `Dr. ${doctor.user.name} is on holiday on this date. Reason: ${holiday.remark || 'Not specified'}` },
        { status: 400 }
      )
    }

    // Generate unique appointmentNo (random suffix prevents collision on rapid bookings)
    const appointmentNo = `APT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

    // Race-safe claim (CTO Plan Phase 2, item 2b): OPD-limit re-check +
    // slot-conflict re-check + booking create in ONE Serializable transaction
    // (P2034 retried with jitter). Two patients racing for the same future
    // slot → exactly one booking; the loser gets a 409. (Patient bookings are
    // created as 'Pending' — no OPD token is generated here; tokens are
    // assigned at reception-approve time.)
    const claim = await withSerializableTx(async (tx) => {
      // Check OPD limit
      const activeBookingsCount = await tx.booking.count({
        where: {
          doctorId,
          bookingDate: { gte: dateOnly, lt: nextDay },
          status: { in: ['Approve', 'Visited', 'Finish'] },
        },
      })

      if (activeBookingsCount >= doctor.dailyLimit) {
        return { kind: 'opd-limit' as const }
      }

      // Check time slot conflict if provided
      if (timeSlot) {
        const slotConflict = await tx.booking.findFirst({
          where: {
            doctorId,
            bookingDate: { gte: dateOnly, lt: nextDay },
            timeSlot,
            status: { in: ['Approve', 'Visited', 'Finish'] },
          },
        })

        if (slotConflict) {
          return { kind: 'slot-conflict' as const }
        }
      }

      // Create booking — same transaction as the checks above
      const booking = await tx.booking.create({
        data: {
          appointmentNo,
          doctorId,
          userId: user.id,
          bookingDate: dateObj,
          timeSlot: timeSlot || '',
          bookingMode,
          bookingType: 'By Self',
          disease,
          description: description || '',
          gender,
          age: age ?? undefined,
          bloodGroup: bloodGroup || '',
          weight: weight ?? 0,
          relationWithMe: relationWithMe || '',
          state: state || '',
          city: city || '',
          status: 'Pending',
          appointmentCharge: doctor.fees || 0,
          patientName: user.name,
          ...(effectiveHospitalId ? { hospitalId: effectiveHospitalId } : {}),
          ...(effectiveDepartmentId ? { departmentId: effectiveDepartmentId } : {}),
        },
      })

      return { kind: 'created' as const, booking }
    })

    if (claim.kind === 'opd-limit') {
      return NextResponse.json(
        { error: `Dr. ${doctor.user.name}'s OPD limit (${doctor.dailyLimit}) has been reached for this date` },
        { status: 400 }
      )
    }
    if (claim.kind === 'slot-conflict') {
      return NextResponse.json(
        { error: `Time slot ${timeSlot} is already booked for this date` },
        { status: 409 }
      )
    }

    const { booking } = claim

    // Create notification for patient (AFTER commit, outside the tx)
    await db.notification.create({
      data: {
        userId: user.id,
        title: 'Booking Request Sent',
        message: `Booking request sent to Dr. ${doctor.user.name}. Waiting for reception to confirm.`,
      },
    })

    // Notify doctor
    if (doctor?.userId) {
      await db.notification.create({
        data: {
          userId: doctor.userId,
          title: 'New Appointment Booked',
          message: `${user.name} has booked an appointment for ${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'a future date'}.`,
          status: 'UNREAD',
        },
      })
    }

    // Notify receptionist(s) — hospital or clinic mode
    const bookingDateStr = booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'a future date'
    if (hospitalId) {
      // Hospital mode: notify ALL hospital receptionists
      const hospitalReceptionists = await db.receptionist.findMany({
        where: { hospitalId },
      })
      for (const rec of hospitalReceptionists) {
        await db.notification.create({
          data: {
            userId: rec.userId,
            title: 'New Appointment Booked',
            message: `${user.name} has booked an appointment for ${bookingDateStr}.`,
            status: 'UNREAD',
          },
        })
      }
    } else {
      // Clinic mode: notify the clinic receptionist
      const receptionist = await db.receptionist.findFirst({
        where: { doctorId: booking.doctorId },
      })
      if (receptionist) {
        await db.notification.create({
          data: {
            userId: receptionist.userId,
            title: 'New Appointment Booked',
            message: `${user.name} has booked an appointment with your doctor for ${bookingDateStr}.`,
            status: 'UNREAD',
          },
        })
      }
    }

    // AUDIT (P2.8): Record patient-initiated booking creation.
    try {
      const auditCtx = getAuditContext(req)
      await logCreate(
        'booking',
        booking.id,
        user,
        `Created appointment for Dr. ${doctor.user.name || ''} on ${bookingDateStr} at ${timeSlot || 'N/A'}`,
        {
          doctorId,
          patientId: user.id,
          bookingDate: booking.bookingDate.toISOString(),
          timeSlot,
          bookingMode,
          hospitalId: hospitalId || null,
        },
        { severity: 'info', ...(hospitalId ? { hospitalId } : {}), ...auditCtx }
      )
    } catch (auditErr) {
      console.error('[audit-log] booking create capture failed:', auditErr)
    }

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error: unknown) {
    // SECURITY (P1.5): Handle the unique-constraint violation on
    // (doctorId, bookingDate, timeSlot, status) — belt-and-braces legacy
    // handler. The slot race is now closed at the application layer by the
    // Serializable claim transaction above (and that constraint is currently
    // disabled in the schema), but if the DB constraint is ever re-enabled
    // this still returns 409 Conflict instead of 500.
    const err = error as { code?: string; meta?: { target?: string[] } }
    if (err?.code === 'P2002') {
      const target = err.meta?.target?.join(', ') || 'unique constraint'
      console.warn(`Booking conflict: ${target}`)
      return NextResponse.json(
        { error: 'This slot was just booked by another patient. Please select a different slot.' },
        { status: 409 }
      )
    }
    console.error('Patient create booking error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
