import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { requireAuth, RECEPTION_ROLES } from '@/lib/api-auth'
import { todayISTRange, todayISTStr, istDateRange } from '@/lib/date-utils'
import { generateTokenNumberTx, withSerializableTx } from '@/lib/token-utils'
import { slotAwareSort } from '@/lib/queue-ordering'
import { emitToRole, emitToHospital } from '@/lib/emit-notification'
import { Prisma } from '@prisma/client'

/**
 * UNIFIED RECEPTION BOOKING API — "One Booking Desk, 3 modes"
 * (Reception Panel P2, owner-approved founder design.)
 *
 * Replaces the three legacy POST surfaces:
 *   • /api/dashboard/receptionist/walk-in        (today, explicit doctor, token)
 *   • /api/dashboard/receptionist/express-walkin (today, auto least-busy doctor)
 *   • /api/dashboard/receptionist/appointments   (future dates, NO safety rails)
 *
 * Modes (visitMode):
 *   • 'walkin'    — today, dept → associated doctor (core founder flow),
 *                   optional slot or queue-tail, emergency toggle
 *   • 'express'   — today, dept only → auto least-busy available doctor,
 *                   disease optional, instant token slip (hospital mode)
 *   • 'scheduled' — any date (default today/future), slot REQUIRED,
 *                   future-dated bookings consume the FUTURE day's token counter
 *
 * Patient identity (patientMode):
 *   • 'quick'    — name + optional mobile (mobile auto-links an existing user)
 *   • 'existing' — mobile lookup REQUIRED (400 if not found → use register)
 *   • 'register' — creates a real patient User (mobile required; if the mobile
 *                  already exists we LINK that patient instead of erroring —
 *                  the receptionist's intent is "book this person", not "fail")
 *
 * Uniformity rules (LOCKED per founder analysis — do not relax):
 *   1. ONE token system: {DEPT-shortCode}-{NNN} per doctor per day;
 *      EMR- prefix ONLY for emergencies. appointmentNo uses ONE generator
 *      (BRK-YYYYMMDD-NNNN, daily sequence, race-safe inside the Serializable tx).
 *   2. EVERY confirmed booking gets a token — today OR future-dated
 *      (generateTokenNumberTx already consumes the booking's own day counter).
 *   3. Queue system UNTOUCHED — slotAwareSort, queue-updated events, TV board,
 *      print queue, doctor queue view all read the same Booking fields.
 *   4. Charge ALWAYS stamped (docLink.fees ?? doctor.fees — never null).
 *   5. Notifications ALWAYS (patient when linked + doctor + queue-updated emit
 *      for today's bookings).
 *
 * Safety rails (superset of the old walk-in route — now on ALL modes):
 *   Serializable tx + P2034 retry ×5 · OPD-limit re-check · slot-conflict
 *   re-check (409) · holiday check on the VISIT date · emergency bypasses the
 *   slot check but never the OPD limit.
 */

/** Build the exact UTC instant for an IST wall-clock date + time. */
function istDateTime(dateStr: string, timeStr: string): Date {
  const range = istDateRange(dateStr)
  const [hours, minutes] = timeStr.split(':').map(Number)
  const totalMinutes =
    (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0)
  return new Date(range.start.getTime() + totalMinutes * 60000)
}

function generateRandomPassword() {
  return Math.random().toString(36).slice(-8)
}

type VisitMode = 'walkin' | 'express' | 'scheduled'
type PatientMode = 'quick' | 'existing' | 'register'

const VISIT_MODES: VisitMode[] = ['walkin', 'express', 'scheduled']
const PATIENT_MODES: PatientMode[] = ['quick', 'existing', 'register']

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user || !RECEPTION_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const receptionist = await db.receptionist.findFirst({
      where: { userId: user.id },
      select: { doctorId: true, hospitalId: true },
    })
    if (!receptionist) {
      return NextResponse.json({ error: 'No doctor linked to this receptionist' }, { status: 404 })
    }

    const body = await req.json()
    const {
      patientName,
      mobileNo,
      gender,
      age,
      dateOfBirth,
      bloodGroup,
      weight,
      height,
      physicallyChallenged,
      relationWithMe,
      disease,
      description,
      departmentId: bodyDepartmentId,
      doctorId: bodyDoctorId,
      timeSlot,
      bookingMode,
      isEmergency,
    } = body
    const visitMode: VisitMode = VISIT_MODES.includes(body.visitMode) ? body.visitMode : 'walkin'
    const patientMode: PatientMode = PATIENT_MODES.includes(body.patientMode)
      ? body.patientMode
      : 'quick'
    const visitDate: string = typeof body.visitDate === 'string' && body.visitDate
      ? body.visitDate
      : todayISTStr()

    const emergency = isEmergency === true
    const trimmedMobile = typeof mobileNo === 'string' ? mobileNo.trim() : ''

    // ── Field validation (per mode) ──
    if (!patientName?.trim()) {
      return NextResponse.json({ error: 'Patient name is required' }, { status: 400 })
    }
    if (visitMode === 'walkin' && !disease?.trim()) {
      return NextResponse.json({ error: 'Disease/Reason is required for walk-in bookings' }, { status: 400 })
    }
    if ((patientMode === 'existing' || patientMode === 'register') && !trimmedMobile) {
      return NextResponse.json(
        { error: 'Mobile number is required to look up / register a patient' },
        { status: 400 }
      )
    }
    if (visitMode === 'scheduled') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(visitDate)) {
        return NextResponse.json({ error: 'A valid visit date (YYYY-MM-DD) is required' }, { status: 400 })
      }
      if (visitDate < todayISTStr()) {
        return NextResponse.json({ error: 'Visit date cannot be in the past' }, { status: 400 })
      }
      if (!timeSlot) {
        return NextResponse.json({ error: 'Please pick a time slot for a scheduled booking' }, { status: 400 })
      }
    }
    if (emergency && visitMode === 'scheduled') {
      return NextResponse.json({ error: 'Emergency bookings are same-day only' }, { status: 400 })
    }
    if (bookingMode && !['InPerson', 'VideoCall'].includes(bookingMode)) {
      return NextResponse.json({ error: 'Invalid booking mode' }, { status: 400 })
    }

    // The visit day's IST window — OPD limit, slot conflicts, holiday and the
    // token counter ALL use this window (future-dated bookings consume the
    // future day's counter — see token-utils).
    const visitRange = istDateRange(visitDate)
    const isToday = visitDate === todayISTStr()

    // ── Resolve patient identity ──
    let patientUserId: string | null = null
    let linkedExisting = false

    if (trimmedMobile) {
      const existingPatient = await db.user.findFirst({
        where: { mobileNo: trimmedMobile, role: 'patient' },
        select: { id: true },
      })
      if (existingPatient) {
        patientUserId = existingPatient.id
        linkedExisting = true
      }
    }

    if (patientMode === 'existing' && !patientUserId) {
      return NextResponse.json(
        { error: 'No patient found with this mobile number. Use "Register New" or "Quick Name" instead.' },
        { status: 400 }
      )
    }

    if (patientMode === 'register' && !patientUserId) {
      // Create the patient account (same contract as
      // /api/dashboard/receptionist/patients/register — deterministic email,
      // random password; the receptionist shares credentials verbally).
      const generatedEmail = `patient_${trimmedMobile.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@doctorooms.com`
      const emailTaken = await db.user.findUnique({
        where: { email: generatedEmail },
        select: { id: true },
      })
      if (emailTaken) {
        // Deterministic email collision with a non-matching mobile — extremely
        // unlikely, but refuse rather than fork the account.
        return NextResponse.json(
          { error: 'A patient account already exists for this mobile number. Use "Existing Patient" lookup.' },
          { status: 409 }
        )
      }
      const hashedPassword = bcrypt.hashSync(generateRandomPassword(), 10)
      const newUser = await db.user.create({
        data: {
          name: patientName.trim(),
          email: generatedEmail,
          mobileNo: trimmedMobile,
          gender: gender || '',
          role: 'patient',
          status: 'Active',
          password: hashedPassword,
          profileImg: 'default.png',
        },
        select: { id: true },
      })
      patientUserId = newUser.id
    }

    // ── Resolve doctor + department (mode-dependent) ──
    const isHospitalMode = !!receptionist.hospitalId && !receptionist.doctorId

    let finalDoctorId: string
    let finalDepartmentId: string | null
    let hospitalId: string | null
    let doctorFees: number | null = null

    if (isHospitalMode) {
      hospitalId = receptionist.hospitalId
      if (!bodyDepartmentId) {
        return NextResponse.json({ error: 'Department is required' }, { status: 400 })
      }
      const dept = await db.department.findFirst({
        where: { id: bodyDepartmentId, hospitalId, status: 'Active' },
        select: { id: true, name: true, shortCode: true, floorNo: true, opdRoom: true },
      })
      if (!dept) {
        return NextResponse.json({ error: 'Invalid department for this hospital' }, { status: 400 })
      }
      finalDepartmentId = dept.id

      if (visitMode === 'express' && !bodyDoctorId) {
        // Auto-assign: least-busy AVAILABLE doctor of this department today,
        // skipping doctors on holiday (founder rule — never queue a patient
        // behind a doctor who isn't there).
        const links = await db.doctorHospital.findMany({
          where: { departmentId: dept.id, hospitalId, status: 'Active', isAvailable: true },
          select: { doctorId: true },
        })
        if (links.length === 0) {
          return NextResponse.json(
            { error: 'No available doctors in this department right now' },
            { status: 400 }
          )
        }
        const { start: startOfDay, end: endOfDay } = todayISTRange()
        const onHolidayUserIds = (
          await db.doctorHoliday.findMany({
            where: { date: { gte: startOfDay, lte: endOfDay } },
            select: { userId: true },
          })
        ).map((h) => h.userId)
        const doctorRows = await db.doctor.findMany({
          where: { id: { in: links.map((l) => l.doctorId) } },
          select: { id: true, userId: true },
        })
        const eligible = doctorRows.filter((d) => !onHolidayUserIds.includes(d.userId))
        if (eligible.length === 0) {
          return NextResponse.json(
            { error: 'All doctors of this department are on holiday today' },
            { status: 400 }
          )
        }
        const queues = await Promise.all(
          eligible.map(async (d) => ({
            doctorId: d.id,
            len: await db.booking.count({
              where: {
                doctorId: d.id,
                bookingDate: { gte: startOfDay, lte: endOfDay },
                status: { in: ['Approve', 'Visited'] },
              },
            }),
          }))
        )
        queues.sort((a, b) => a.len - b.len)
        finalDoctorId = queues[0].doctorId
      } else {
        if (!bodyDoctorId) {
          return NextResponse.json({ error: 'Doctor is required' }, { status: 400 })
        }
        finalDoctorId = bodyDoctorId
      }

      // The doctor must be actively linked to THIS hospital AND department —
      // the founder flow guarantees the queue belongs to the department's
      // doctor (also blocks stale doctor ids from old dropdown state).
      const docLink = await db.doctorHospital.findFirst({
        where: {
          doctorId: finalDoctorId,
          hospitalId,
          departmentId: dept.id,
          status: 'Active',
        },
        include: {
          doctor: {
            select: {
              id: true,
              userId: true,
              fees: true,
              dailyLimit: true,
              user: { select: { name: true } },
            },
          },
        },
      })
      if (!docLink) {
        return NextResponse.json(
          { error: 'This doctor is not associated with the selected department' },
          { status: 400 }
        )
      }
      doctorFees = docLink.fees ?? docLink.doctor.fees ?? 0
    } else {
      // ── Clinic mode: always the receptionist's own doctor ──
      finalDoctorId = receptionist.doctorId!
      const doctor = await db.doctor.findUnique({
        where: { id: finalDoctorId },
        select: {
          id: true,
          userId: true,
          fees: true,
          dailyLimit: true,
          user: { select: { name: true } },
        },
      })
      if (!doctor) {
        return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
      }
      doctorFees = doctor.fees ?? 0
      // Clinic doctors carry their department via the primary Active hospital
      // link (token prefix + context), like the legacy walk-in route.
      const primaryLink = await db.doctorHospital.findFirst({
        where: { doctorId, status: 'Active' },
        orderBy: { createdAt: 'asc' },
        select: { hospitalId: true, departmentId: true },
      })
      finalDepartmentId = primaryLink?.departmentId || null
      hospitalId = primaryLink?.hospitalId || null
    }

    // ── Holiday check on the VISIT date (static data — safe outside the tx) ──
    const doctorRecord = await db.doctor.findUnique({
      where: { id: finalDoctorId },
      select: { userId: true, dailyLimit: true, user: { select: { name: true } } },
    })
    if (!doctorRecord) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }
    // Tolerant lookup: DoctorHoliday.userId references Doctor.id, but older
    // writers stored the doctor's USER id — match either convention.
    const holiday = await db.doctorHoliday.findFirst({
      where: {
        userId: { in: [doctorRecord.userId, finalDoctorId] },
        date: { gte: visitRange.start, lte: visitRange.end },
      },
    })
    if (holiday) {
      return NextResponse.json(
        {
          error: `Dr. ${doctorRecord.user?.name || ''} is on holiday on ${visitDate}. Reason: ${holiday.remark || 'Not specified'}`,
        },
        { status: 400 }
      )
    }

    // ── Booking instant + appointmentNo base ──
    const bookingDate =
      visitMode === 'scheduled'
        ? istDateTime(visitDate, timeSlot)
        : new Date()

    // The appointmentNo daily sequence window = the CREATION day (receipts are
    // numbered by when they're issued, matching real-hospital registers).
    const { start: creationDayStart } = todayISTRange()
    const dateStamp = todayISTStr().replace(/-/g, '')

    // ── Race-safe claim (S6: two receptionists clicking simultaneously →
    //    exactly one booking; the loser gets a clean 4xx) ──
    const claim = await withSerializableTx(async (tx) => {
      // 1. OPD limit — for the VISIT day (re-checked inside the tx).
      const activeBookingsCount = await tx.booking.count({
        where: {
          doctorId: finalDoctorId,
          bookingDate: { gte: visitRange.start, lte: visitRange.end },
          status: { in: ['Approve', 'Visited', 'Finish'] },
        },
      })
      if (activeBookingsCount >= (doctorRecord.dailyLimit || 50)) {
        return { kind: 'opd-limit' as const }
      }

      // 2. Slot conflict for the VISIT day — SKIPPED for emergencies
      //    (an emergency may take any slot) and for queue-tail bookings
      //    (empty timeSlot = tail, no slot to conflict).
      if (timeSlot && !emergency) {
        const slotConflict = await tx.booking.findFirst({
          where: {
            doctorId: finalDoctorId,
            bookingDate: { gte: visitRange.start, lte: visitRange.end },
            timeSlot,
            status: { in: ['Approve', 'Visited', 'Finish'] },
          },
        })
        if (slotConflict) {
          return { kind: 'slot-conflict' as const }
        }
      }

      // 3. Token INSIDE the tx — the booking's OWN day consumes the counter
      //    (future-dated → future counter; EMR- prefix only for emergencies).
      let tokenNumber = ''
      let tokenOrder = 0
      if (finalDepartmentId) {
        try {
          const token = await generateTokenNumberTx(
            tx,
            finalDoctorId,
            finalDepartmentId,
            bookingDate,
            { emergency }
          )
          tokenNumber = token.tokenNumber
          tokenOrder = token.tokenOrder
        } catch (tokenErr) {
          // P2034 must abort the tx so the outer retry loop re-runs it.
          if (
            tokenErr instanceof Prisma.PrismaClientKnownRequestError &&
            tokenErr.code === 'P2034'
          ) {
            throw tokenErr
          }
          console.error('Token generation failed (non-critical):', tokenErr)
        }
      }

      // 4. Unified appointmentNo — ONE generator for every new reception
      //    booking (legacy APT/DOC-/EXP- prefixes retired; old rows keep
      //    their values — display-only).
      const todaysCount = await tx.booking.count({
        where: { createdAt: { gte: creationDayStart } },
      })
      const appointmentNo = `BRK-${dateStamp}-${String(todaysCount + 1).padStart(4, '0')}`

      // 5. Create the booking — charge ALWAYS stamped, bookingMode ALWAYS set.
      const booking = await tx.booking.create({
        data: {
          appointmentNo,
          doctorId: finalDoctorId,
          userId: patientUserId,
          patientName: patientName.trim(),
          disease: disease?.trim() || '',
          description: description?.trim() || '',
          gender: gender || '',
          age: age ? parseInt(String(age), 10) || null : null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          bloodGroup: bloodGroup || '',
          weight: weight ? parseFloat(String(weight)) || 0 : 0,
          height: height ? parseFloat(String(height)) || 0 : 0,
          physicallyChallenged: physicallyChallenged || 'No',
          relationWithMe: relationWithMe || '',
          status: 'Approve',
          bookingType: 'By Receptionist',
          bookingMode: visitMode === 'express' ? 'InPerson' : bookingMode || 'InPerson',
          timeSlot: timeSlot || '',
          appointmentCharge: doctorFees ?? 0,
          bookingDate,
          isEmergency: emergency,
          tokenNumber,
          tokenOrder,
          ...(hospitalId ? { hospitalId } : {}),
          ...(finalDepartmentId ? { departmentId: finalDepartmentId } : {}),
          receptionistId: user.id,
        },
      })

      return { kind: 'created' as const, booking, activeBookingsCount }
    })

    if (claim.kind === 'opd-limit') {
      return NextResponse.json(
        { error: `OPD limit reached for Dr. ${doctorRecord.user?.name || ''} on ${visitDate}` },
        { status: 400 }
      )
    }
    if (claim.kind === 'slot-conflict') {
      return NextResponse.json(
        { error: `Time slot ${timeSlot} is already booked on ${visitDate}` },
        { status: 409 }
      )
    }

    const { booking, activeBookingsCount } = claim

    // ── Queue position (after commit) — for the VISIT day.
    // Computed with slotAwareSort (the SAME ordering the Queue page / TV
    // board / doctor queue view use) so the reported position matches what
    // the patient actually sees — emergencies jump to the top here too.
    let queuePosition = 0
    {
      const dayQueue = await db.booking.findMany({
        where: {
          doctorId: finalDoctorId,
          bookingDate: { gte: visitRange.start, lte: visitRange.end },
          status: { in: ['Approve', 'Visited'] },
        },
        select: {
          id: true,
          timeSlot: true,
          tokenOrder: true,
          createdAt: true,
          isEmergency: true,
        },
      })
      const sorted = slotAwareSort(dayQueue)
      const idx = sorted.findIndex((b) => b.id === booking.id)
      queuePosition = idx >= 0 ? idx + 1 : 0
    }

    // ── Notifications ALWAYS (patient when linked + doctor) ──
    const dateLabel = visitDate === todayISTStr() ? 'today' : `on ${visitDate}`
    if (patientUserId) {
      await db.notification
        .create({
          data: {
            userId: patientUserId,
            title: emergency ? 'Emergency Registration Confirmed' : 'Registration Confirmed',
            message: emergency
              ? `EMERGENCY registration confirmed${booking.tokenNumber ? ` — token ${booking.tokenNumber}` : ''}. Please proceed to the doctor immediately.`
              : `Your appointment with Dr. ${doctorRecord.user?.name || ''} is confirmed ${dateLabel}${booking.tokenNumber ? ` — token ${booking.tokenNumber}` : ''}${queuePosition ? `, queue position #${queuePosition}` : ''}. Appointment: ${booking.appointmentNo}.`,
          },
        })
        .catch(() => {})
    }
    await db.notification
      .create({
        data: {
          userId: doctorRecord.userId,
          title: emergency ? 'EMERGENCY Patient Added' : 'New Patient Added',
          message: `${emergency ? 'EMERGENCY patient' : 'Patient'} ${patientName.trim()} booked ${dateLabel}${booking.tokenNumber ? ` (token ${booking.tokenNumber})` : ''}${queuePosition ? `, queue #${queuePosition}` : ''}.${disease?.trim() ? ` Reason: ${disease.trim()}` : ''}`,
        },
      })
      .catch(() => {})

    // ── Real-time queue-updated emit — today's bookings only (the TV board
    //    and dashboards track today's queue; future bookings change nothing) ──
    if (isToday) {
      try {
        const queueLength = await db.booking.count({
          where: {
            doctorId: finalDoctorId,
            bookingDate: { gte: visitRange.start, lte: visitRange.end },
            status: 'Approve',
          },
        })
        const queuePayload = {
          doctorId: finalDoctorId,
          doctorName: doctorRecord.user?.name || 'Doctor',
          queueLength,
          nextPatientName: patientName.trim(),
          isEmergency: emergency,
          message: emergency
            ? `EMERGENCY patient registered with Dr. ${doctorRecord.user?.name || 'Doctor'}.`
            : `New patient registered with Dr. ${doctorRecord.user?.name || 'Doctor'}.`,
        }
        emitToRole('receptionist', 'queue-updated', queuePayload)
        emitToRole('doctor', 'queue-updated', queuePayload)
        if (hospitalId) {
          emitToHospital(hospitalId, 'queue-updated', queuePayload)
        }
      } catch (emitErr) {
        console.error('queue-updated emit failed:', emitErr)
      }
    }

    // ── Department context for the token slip card / print ──
    let departmentInfo: {
      id: string
      name: string
      shortCode: string
      floorNo: number | null
      opdRoom: string | null
    } | null = null
    if (finalDepartmentId) {
      const dept = await db.department.findUnique({
        where: { id: finalDepartmentId },
        select: { id: true, name: true, shortCode: true, floorNo: true, opdRoom: true },
      })
      if (dept) departmentInfo = dept
    }

    return NextResponse.json(
      {
        success: true,
        linkedExisting,
        booking: {
          id: booking.id,
          appointmentNo: booking.appointmentNo,
          patientName: booking.patientName,
          disease: booking.disease,
          timeSlot: booking.timeSlot,
          bookingMode: booking.bookingMode,
          status: booking.status,
          isEmergency: booking.isEmergency,
          createdAt: booking.createdAt.toISOString(),
          visitDate,
          doctorId: finalDoctorId,
          doctorName: doctorRecord.user?.name || 'Doctor',
          departmentId: finalDepartmentId,
          departmentName: departmentInfo?.name || null,
          departmentShortCode: departmentInfo?.shortCode || null,
          floorNo: departmentInfo?.floorNo ?? null,
          opdRoom: departmentInfo?.opdRoom || null,
          hospitalId,
          tokenNumber: booking.tokenNumber,
          tokenOrder: booking.tokenOrder,
          queuePosition,
          charge: booking.appointmentCharge,
        },
        opdCount: activeBookingsCount + 1,
        opdLimit: doctorRecord.dailyLimit,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unified booking POST error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
