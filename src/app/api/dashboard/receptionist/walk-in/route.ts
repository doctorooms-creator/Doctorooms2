import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, RECEPTION_ROLES } from '@/lib/api-auth'
import { todayISTRange, todayISTStr } from '@/lib/date-utils'
import { generateTokenNumberTx, withSerializableTx } from '@/lib/token-utils'
import { slotAwareSort } from '@/lib/queue-ordering'
import { emitToRole, emitToHospital } from '@/lib/emit-notification'
import { Prisma } from '@prisma/client'

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

// ============ POST: Create a walk-in booking (directly Approve) ============
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user || !RECEPTION_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find receptionist
    const receptionist = await db.receptionist.findFirst({
      where: { userId: user.id },
      select: { doctorId: true, hospitalId: true },
    })

    if (!receptionist) {
      return NextResponse.json({ error: 'No doctor linked to this receptionist' }, { status: 404 })
    }

    // Parse body
    const body = await req.json()
    const { patientName, mobileNo, gender, age, disease, timeSlot, bookingMode, departmentId, doctorId: bodyDoctorId, isEmergency } = body

    // Phase 4 "Queue Resilience": emergency walk-ins get an EMR- token (in
    // hospital mode), jump to the top of the queue, and BYPASS the
    // slot-conflict check — an emergency may take any slot (or none) even if
    // it is already booked. The OPD limit still applies.
    const emergency = isEmergency === true

    // Validate required fields
    if (!patientName?.trim()) {
      return NextResponse.json({ error: 'Patient name is required' }, { status: 400 })
    }
    if (!disease?.trim()) {
      return NextResponse.json({ error: 'Disease/Reason is required' }, { status: 400 })
    }

    // ── Hospital Mode ──
    const isHospitalMode = !!receptionist.hospitalId && !receptionist.doctorId

    if (isHospitalMode) {
      if (!departmentId || !bodyDoctorId) {
        return NextResponse.json(
          { error: 'departmentId and doctorId are required in hospital mode' },
          { status: 400 }
        )
      }

      // Validate department belongs to this hospital
      const dept = await db.department.findFirst({
        where: { id: departmentId, hospitalId: receptionist.hospitalId, status: 'Active' },
      })
      if (!dept) {
        return NextResponse.json({ error: 'Invalid department for this hospital' }, { status: 400 })
      }

      // Validate doctor is linked to this hospital
      const docLink = await db.doctorHospital.findFirst({
        where: { doctorId: bodyDoctorId, hospitalId: receptionist.hospitalId, status: 'Active' },
        include: { doctor: { include: { user: true } } },
      })
      if (!docLink) {
        return NextResponse.json({ error: 'Doctor is not linked to this hospital' }, { status: 400 })
      }

      const doctor = docLink.doctor
      const { start: startOfDay, end: endOfDay } = todayISTRange()

      // 1. Check holiday (static data — safe outside the transaction).
      // Tolerant lookup: DoctorHoliday.userId references Doctor.id, but older
      // writers stored the doctor's USER id — match either convention.
      const holiday = await db.doctorHoliday.findFirst({
        where: {
          userId: { in: [doctor.userId, doctor.id] },
          date: { gte: startOfDay, lte: endOfDay },
        },
      })
      if (holiday) {
        return NextResponse.json({
          error: `Doctor is on holiday today. Reason: ${holiday.remark || 'Not specified'}`,
        }, { status: 400 })
      }

      // 2. Generate appointment number
      const appointmentNo = `DOC-${doctor.id.slice(0, 4).toUpperCase()}-${Date.now()}`

      // 3. Look up patient by mobile number
      let patientUserId: string | null = null
      if (mobileNo?.trim()) {
        const existingPatient = await db.user.findFirst({
          where: { mobileNo: mobileNo.trim(), role: 'patient' },
          select: { id: true },
        })
        if (existingPatient) {
          patientUserId = existingPatient.id
        }
      }

      // 4. Race-safe claim (CTO Plan Phase 2, item 2b): OPD-limit re-check +
      //    slot-conflict re-check + token computation + booking create ALL in
      //    one Serializable transaction (P2034 retried with jitter). Two
      //    receptionists clicking the same slot at the same moment → exactly
      //    one booking; the loser gets a 409.
      const bookingDate = new Date() // walk-ins are always today
      const claim = await withSerializableTx(async (tx) => {
        // 4a. Validate OPD limit
        const activeBookingsCount = await tx.booking.count({
          where: {
            doctorId: doctor.id,
            bookingDate: { gte: startOfDay, lte: endOfDay },
            status: { in: ['Approve', 'Visited', 'Finish'] },
          },
        })
        if (activeBookingsCount >= doctor.dailyLimit) {
          return { kind: 'opd-limit' as const }
        }

        // 4b. Validate slot conflict — SKIPPED for emergencies (Phase 4): an
        //     emergency may take any slot even if it is already booked.
        if (timeSlot && !emergency) {
          const slotConflict = await tx.booking.findFirst({
            where: {
              doctorId: doctor.id,
              bookingDate: { gte: startOfDay, lte: endOfDay },
              timeSlot,
              status: { in: ['Approve', 'Visited', 'Finish'] },
            },
          })
          if (slotConflict) {
            return { kind: 'slot-conflict' as const }
          }
        }

        // 4c. Generate token number INSIDE the tx (same counter window as
        //     the create → no duplicate tokens under concurrency).
        //     Emergencies stamp an EMR- prefix from the SAME per-doctor-per-day
        //     counter (Phase 4).
        let tokenNumber = ''
        let tokenOrder = 0
        try {
          const token = await generateTokenNumberTx(tx, doctor.id, departmentId, bookingDate, {
            emergency,
          })
          tokenNumber = token.tokenNumber
          tokenOrder = token.tokenOrder
        } catch (tokenErr) {
          // P2034 must abort the tx so the outer retry loop re-runs it.
          if (tokenErr instanceof Prisma.PrismaClientKnownRequestError && tokenErr.code === 'P2034') {
            throw tokenErr
          }
          console.error('Token generation failed (non-critical):', tokenErr)
        }

        // 4d. Create booking
        const booking = await tx.booking.create({
          data: {
            appointmentNo,
            doctorId: doctor.id,
            userId: patientUserId,
            patientName: patientName.trim(),
            disease: disease.trim(),
            gender: gender || '',
            age: age ? parseInt(age, 10) : null,
            status: 'Approve',
            bookingType: 'By Receptionist',
            bookingMode: bookingMode || 'InPerson',
            timeSlot: timeSlot || '',
            appointmentCharge: docLink.fees || doctor.fees,
            bookingDate,
            hospitalId: receptionist.hospitalId,
            departmentId,
            receptionistId: user.id,
            isEmergency: emergency,
            tokenNumber,
            tokenOrder,
          },
        })

        return { kind: 'created' as const, booking, activeBookingsCount }
      })

      if (claim.kind === 'opd-limit') {
        return NextResponse.json({ error: 'OPD limit reached for today' }, { status: 400 })
      }
      if (claim.kind === 'slot-conflict') {
        return NextResponse.json({ error: `Time slot ${timeSlot} is already booked` }, { status: 409 })
      }

      const { booking, activeBookingsCount } = claim

      // 5. Calculate queue position (after commit)
      const patientsAhead = await db.booking.count({
        where: {
          doctorId: doctor.id,
          bookingDate: { gte: startOfDay, lte: endOfDay },
          status: { in: ['Approve', 'Visited'] },
          createdAt: { lte: booking.createdAt },
          id: { not: booking.id },
        },
      })
      const queuePosition = patientsAhead + 1

      // 6. Notify patient if found by mobile (AFTER commit, outside the tx)
      if (patientUserId) {
        await db.notification.create({
          data: {
            userId: patientUserId,
            title: 'Walk-in Registration Confirmed',
            message: `Walk-in registration confirmed. Your queue position is #${queuePosition}. Appointment: ${appointmentNo}.`,
          },
        })
      }

      // 7. Notify doctor
      await db.notification.create({
        data: {
          userId: doctor.userId,
          title: 'New Walk-in Patient',
          message: `Walk-in patient ${patientName.trim()} registered. Queue #${queuePosition}. ${disease.trim() ? `Reason: ${disease.trim()}` : ''}`,
        },
      })

      // ── Real-time queue-updated emit (R3, hospital mode) — fires for
      // emergency bookings too so the TV board refreshes immediately ──
      try {
        const queueLength = await db.booking.count({
          where: {
            doctorId: doctor.id,
            bookingDate: { gte: startOfDay, lte: endOfDay },
            status: 'Approve',
          },
        })
        const queuePayload = {
          doctorId: doctor.id,
          doctorName: doctor.user?.name || 'Doctor',
          queueLength,
          nextPatientName: patientName.trim(),
          isEmergency: emergency,
          message: emergency
            ? `EMERGENCY walk-in registered with Dr. ${doctor.user?.name || 'Doctor'}.`
            : `New walk-in registered with Dr. ${doctor.user?.name || 'Doctor'}.`,
        }
        emitToRole('receptionist', 'queue-updated', queuePayload)
        emitToRole('doctor', 'queue-updated', queuePayload)
        if (receptionist.hospitalId) {
          emitToHospital(receptionist.hospitalId, 'queue-updated', queuePayload)
        }
      } catch (emitErr) {
        console.error('queue-updated emit failed:', emitErr)
      }

      return NextResponse.json({
        success: true,
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
          hospitalId: booking.hospitalId,
          departmentId: booking.departmentId,
          tokenNumber: booking.tokenNumber,
          tokenOrder: booking.tokenOrder,
        },
        queuePosition,
        opdCount: activeBookingsCount + 1,
        opdLimit: doctor.dailyLimit,
      })
    }

    // ── Clinic Mode ──
    const doctor = await db.doctor.findUnique({
      where: { id: receptionist.doctorId },
      select: { id: true, userId: true, dailyLimit: true, fees: true, user: { select: { name: true } } },
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    // Today's date range in IST
    const { start: startOfDay, end: endOfDay } = todayISTRange()

    // 1. Check holiday (static data — safe outside the transaction).
    // Tolerant lookup: DoctorHoliday.userId references Doctor.id, but older
    // writers stored the doctor's USER id — match either convention.
    const holiday = await db.doctorHoliday.findFirst({
      where: {
        userId: { in: [doctor.userId, doctor.id] },
        date: { gte: startOfDay, lte: endOfDay },
      },
    })

    if (holiday) {
      return NextResponse.json({
        error: `Doctor is on holiday today. Reason: ${holiday.remark || 'Not specified'}`,
      }, { status: 400 })
    }

    // 2. Generate appointment number
    const appointmentNo = `DOC-${doctor.id.slice(0, 4).toUpperCase()}-${Date.now()}`

    // 3. Look up patient by mobile number
    let patientUserId: string | null = null
    if (mobileNo?.trim()) {
      const existingPatient = await db.user.findFirst({
        where: { mobileNo: mobileNo.trim(), role: 'patient' },
        select: { id: true },
      })
      if (existingPatient) {
        patientUserId = existingPatient.id
      }
    }

    // 4. Race-safe claim (CTO Plan Phase 2, item 2b): OPD-limit re-check +
    //    slot-conflict re-check + booking create in ONE Serializable
    //    transaction (P2034 retried with jitter).
    //    Clinic-mode walk-ins now ALSO get OPD tokens when the doctor has an
    //    Active hospital link (e.g. Dr. Sharma → Sharma Clinic GEN dept →
    //    SHARMA-0XX): every patient in the queue carries the searchable ID
    //    that prints on prescriptions. Doctors without any hospital link keep
    //    the legacy tokenless behavior.
    //    Emergencies still get isEmergency stamped so the queue APIs sort
    //    them first (Phase 4).
    const bookingDate = new Date() // walk-ins are always today

    // Resolve the doctor's primary Active hospital link for token + context
    const primaryLink = await db.doctorHospital.findFirst({
      where: { doctorId: doctor.id, status: 'Active' },
      orderBy: { createdAt: 'asc' },
      select: { hospitalId: true, departmentId: true },
    })
    const clinicHospitalId = primaryLink?.hospitalId || null
    const clinicDepartmentId = primaryLink?.departmentId || null

    const claim = await withSerializableTx(async (tx) => {
      // 4a. Validate OPD limit
      const activeBookingsCount = await tx.booking.count({
        where: {
          doctorId: doctor.id,
          bookingDate: { gte: startOfDay, lte: endOfDay },
          status: { in: ['Approve', 'Visited', 'Finish'] },
        },
      })

      if (activeBookingsCount >= doctor.dailyLimit) {
        return { kind: 'opd-limit' as const }
      }

      // 4b. Validate slot conflict (if timeSlot provided) — SKIPPED for
      //     emergencies (Phase 4): an emergency may take any slot.
      if (timeSlot && !emergency) {
        const slotConflict = await tx.booking.findFirst({
          where: {
            doctorId: doctor.id,
            bookingDate: { gte: startOfDay, lte: endOfDay },
            timeSlot,
            status: { in: ['Approve', 'Visited', 'Finish'] },
          },
        })

        if (slotConflict) {
          return { kind: 'slot-conflict' as const }
        }
      }

      // 4c. Generate token INSIDE the tx when the doctor has a department
      //     (same counter window as the create → no duplicate tokens).
      let tokenNumber = ''
      let tokenOrder = 0
      if (clinicDepartmentId) {
        try {
          const token = await generateTokenNumberTx(tx, doctor.id, clinicDepartmentId, bookingDate, {
            emergency,
          })
          tokenNumber = token.tokenNumber
          tokenOrder = token.tokenOrder
        } catch (tokenErr) {
          if (tokenErr instanceof Prisma.PrismaClientKnownRequestError && tokenErr.code === 'P2034') {
            throw tokenErr
          }
          console.error('Token generation failed (non-critical):', tokenErr)
        }
      }

      // 4d. Create booking with Approve status
      const booking = await tx.booking.create({
        data: {
          appointmentNo,
          doctorId: doctor.id,
          userId: patientUserId,
          patientName: patientName.trim(),
          disease: disease.trim(),
          gender: gender || '',
          age: age ? parseInt(age, 10) : null,
          status: 'Approve',
          bookingType: 'By Receptionist',
          bookingMode: bookingMode || 'InPerson',
          timeSlot: timeSlot || '',
          appointmentCharge: doctor.fees,
          bookingDate,
          isEmergency: emergency,
          ...(clinicHospitalId ? { hospitalId: clinicHospitalId } : {}),
          ...(clinicDepartmentId ? { departmentId: clinicDepartmentId } : {}),
          tokenNumber,
          tokenOrder,
        },
      })

      return { kind: 'created' as const, booking, activeBookingsCount }
    })

    if (claim.kind === 'opd-limit') {
      return NextResponse.json({ error: 'OPD limit reached for today' }, { status: 400 })
    }
    if (claim.kind === 'slot-conflict') {
      return NextResponse.json({ error: `Time slot ${timeSlot} is already booked` }, { status: 409 })
    }

    const { booking, activeBookingsCount } = claim

    // 5. Calculate queue position (after commit)
    const patientsAhead = await db.booking.count({
      where: {
        doctorId: doctor.id,
        bookingDate: { gte: startOfDay, lte: endOfDay },
        status: { in: ['Approve', 'Visited'] },
        createdAt: { lte: booking.createdAt },
        id: { not: booking.id },
      },
    })
    const queuePosition = patientsAhead + 1

    // 6. Notify patient if found by mobile (AFTER commit, outside the tx)
    if (patientUserId) {
      await db.notification.create({
        data: {
          userId: patientUserId,
          title: 'Walk-in Registration Confirmed',
          message: `Walk-in registration confirmed. Your queue position is #${queuePosition}. Appointment: ${appointmentNo}.`,
        },
      })
    }

    // 7. Notify doctor
    await db.notification.create({
      data: {
        userId: doctor.userId,
        title: 'New Walk-in Patient',
        message: `Walk-in patient ${patientName.trim()} registered. Queue #${queuePosition}. ${disease.trim() ? `Reason: ${disease.trim()}` : ''}`,
      },
    })

    // ── Real-time queue-updated emit (R3, clinic mode) — fires for
    // emergency bookings too so dashboards refresh immediately ──
    try {
      const queueLength = await db.booking.count({
        where: {
          doctorId: doctor.id,
          bookingDate: { gte: startOfDay, lte: endOfDay },
          status: 'Approve',
        },
      })
      const queuePayload = {
        doctorId: doctor.id,
        doctorName: doctor.user?.name || 'Doctor',
        queueLength,
        nextPatientName: patientName.trim(),
        isEmergency: emergency,
        message: emergency
          ? `EMERGENCY walk-in registered with Dr. ${doctor.user?.name || 'Doctor'}.`
          : `New walk-in registered with Dr. ${doctor.user?.name || 'Doctor'}.`,
      }
      emitToRole('receptionist', 'queue-updated', queuePayload)
      emitToRole('doctor', 'queue-updated', queuePayload)
    } catch (emitErr) {
      console.error('queue-updated emit failed:', emitErr)
    }

    return NextResponse.json({
      success: true,
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
      },
      queuePosition,
      opdCount: activeBookingsCount + 1,
      opdLimit: doctor.dailyLimit,
    })
  } catch (error) {
    console.error('Walk-in registration POST error:', error)
    return NextResponse.json({ error: 'Failed to register walk-in patient' }, { status: 500 })
  }
}
