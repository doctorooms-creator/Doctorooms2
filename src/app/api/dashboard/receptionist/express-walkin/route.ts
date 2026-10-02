import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, RECEPTION_ROLES } from '@/lib/api-auth'
import { todayISTRange, todayISTStr } from '@/lib/date-utils'
import { generateTokenNumberTx, withSerializableTx } from '@/lib/token-utils'
import { emitToRole, emitToHospital } from '@/lib/emit-notification'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user || !RECEPTION_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { patientName, mobileNo, departmentId, doctorId, age, gender, disease, isEmergency } = body

    // Phase 4 "Queue Resilience": emergency walk-ins get an EMR- token from
    // the SAME per-doctor-per-day counter and jump to the top of the queue.
    const emergency = isEmergency === true

    if (!patientName?.trim()) return NextResponse.json({ error: 'Patient name is required' }, { status: 400 })
    if (!departmentId) return NextResponse.json({ error: 'Department is required' }, { status: 400 })

    // Resolve hospital
    let hospitalId: string | null = null
    if (user.role === 'receptionist') {
      const r = await db.receptionist.findFirst({ where: { userId: user.id }, select: { hospitalId: true } })
      hospitalId = r?.hospitalId || null
    } else if (user.role === 'hospital' || user.role === 'admin') {
      const h = await db.hospital.findUnique({ where: { userId: user.id }, select: { id: true } })
      hospitalId = h?.id || null
    }
    if (!hospitalId) return NextResponse.json({ error: 'No hospital linked' }, { status: 404 })

    const dept = await db.department.findFirst({ where: { id: departmentId, hospitalId, status: 'Active' } })
    if (!dept) return NextResponse.json({ error: 'Invalid department' }, { status: 400 })

    // Auto-assign doctor if not specified
    let finalDoctorId = doctorId
    if (!finalDoctorId) {
      const links = await db.doctorHospital.findMany({ where: { departmentId, hospitalId, status: 'Active', isAvailable: true }, select: { doctorId: true } })
      if (links.length === 0) return NextResponse.json({ error: 'No available doctors' }, { status: 400 })
      const { start: startOfDay, end: endOfDay } = todayISTRange()
      const queues = await Promise.all(links.map(async (l) => ({ doctorId: l.doctorId, len: await db.booking.count({ where: { doctorId: l.doctorId, bookingDate: { gte: startOfDay, lte: endOfDay }, status: { in: ['Approve', 'Visited'] } } }) })))
      queues.sort((a, b) => a.len - b.len)
      finalDoctorId = queues[0].doctorId
    } else {
      const link = await db.doctorHospital.findFirst({ where: { doctorId: finalDoctorId, hospitalId, departmentId, status: 'Active' } })
      if (!link) return NextResponse.json({ error: 'Doctor not available' }, { status: 400 })
    }

    // Look up existing patient by mobile
    let patientUserId: string | null = null
    let resolvedName = patientName.trim()
    let resolvedGender = gender || ''
    if (mobileNo?.trim()) {
      const existing = await db.user.findFirst({ where: { mobileNo: mobileNo.trim(), role: 'patient' }, select: { id: true, name: true, gender: true } })
      if (existing) { patientUserId = existing.id; resolvedName = existing.name; resolvedGender = existing.gender || '' }
    }

    const { start: startOfDay, end: endOfDay } = todayISTRange()
    const appointmentNo = `EXP-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

    // Race-safe claim (CTO Plan Phase 2, item 2b): OPD-limit check + token
    // computation + booking create in ONE Serializable transaction (P2034
    // retried with jitter). Express walk-ins take no timeSlot (currentTimeIST
    // at create time), but the token counter + create still race when two
    // kiosks register simultaneously → duplicate tokens.
    const bookingDate = new Date() // walk-ins are always today
    const claim = await withSerializableTx(async (tx) => {
      // OPD-limit check (re-checked inside the tx — race-safe)
      const doctor = await tx.doctor.findUnique({
        where: { id: finalDoctorId },
        select: { dailyLimit: true },
      })
      const activeBookingsCount = await tx.booking.count({
        where: {
          doctorId: finalDoctorId,
          bookingDate: { gte: startOfDay, lte: endOfDay },
          status: { in: ['Approve', 'Visited', 'Finish'] },
        },
      })
      if (doctor && activeBookingsCount >= doctor.dailyLimit) {
        return { kind: 'opd-limit' as const }
      }

      // Token computation INSIDE the tx (same counter window as the create).
      // Emergencies stamp an EMR- prefix (Phase 4).
      const { tokenNumber, tokenOrder } = await generateTokenNumberTx(
        tx,
        finalDoctorId,
        departmentId,
        bookingDate,
        { emergency }
      )

      // Create booking in the same transaction
      const booking = await tx.booking.create({
        data: { appointmentNo, doctorId: finalDoctorId, userId: patientUserId, patientName: resolvedName, disease: disease?.trim() || '', gender: resolvedGender, age: age ? parseInt(age, 10) : null, status: 'Approve', bookingType: 'By Receptionist', bookingMode: 'InPerson', timeSlot: '', bookingDate, hospitalId, departmentId, receptionistId: user.id, isEmergency: emergency, tokenNumber, tokenOrder },
      })

      return { kind: 'created' as const, booking, tokenNumber, tokenOrder }
    })

    if (claim.kind === 'opd-limit') {
      return NextResponse.json({ error: 'OPD limit reached for today' }, { status: 400 })
    }

    const { booking, tokenNumber, tokenOrder } = claim

    const patientsAhead = await db.booking.count({ where: { doctorId: finalDoctorId, bookingDate: { gte: startOfDay, lte: endOfDay }, status: { in: ['Approve', 'Visited'] }, id: { not: booking.id }, OR: [{ tokenOrder: { lt: tokenOrder } }, { tokenOrder, createdAt: { lt: booking.createdAt } }] } })

    if (patientUserId) {
      await db.notification.create({ data: { userId: patientUserId, title: 'Token Assigned', message: `Your token is ${tokenNumber}. Queue position: #${patientsAhead + 1}.` } }).catch(() => {})
    }

    // ── Real-time queue-updated emit (Phase 4) — emergency or not, the TV
    // board + dashboards refresh immediately. Fire-and-forget. ──
    try {
      const [queueLength, doctorUser] = await Promise.all([
        db.booking.count({
          where: {
            doctorId: finalDoctorId,
            bookingDate: { gte: startOfDay, lte: endOfDay },
            status: 'Approve',
          },
        }),
        db.doctor.findUnique({
          where: { id: finalDoctorId },
          select: { user: { select: { name: true } } },
        }),
      ])
      const queuePayload = {
        doctorId: finalDoctorId,
        doctorName: doctorUser?.user?.name || 'Doctor',
        queueLength,
        nextPatientName: resolvedName,
        isEmergency: emergency,
        message: emergency
          ? `EMERGENCY walk-in registered with Dr. ${doctorUser?.user?.name || 'Doctor'}.`
          : `New express walk-in registered with Dr. ${doctorUser?.user?.name || 'Doctor'}.`,
      }
      emitToRole('receptionist', 'queue-updated', queuePayload)
      emitToRole('doctor', 'queue-updated', queuePayload)
      if (hospitalId) {
        emitToHospital(hospitalId, 'queue-updated', queuePayload)
      }
    } catch (emitErr) {
      console.error('queue-updated emit failed:', emitErr)
    }

    return NextResponse.json({ success: true, booking: { id: booking.id, appointmentNo, tokenNumber, tokenOrder, patientName: resolvedName, age: age ? parseInt(age, 10) : null, gender: resolvedGender, mobileNo: mobileNo || '', disease: disease || '', isEmergency: booking.isEmergency, queuePosition: patientsAhead + 1, departmentId, departmentName: dept.name, departmentShortCode: dept.shortCode, floorNo: dept.floorNo, opdRoom: dept.opdRoom, doctorId: finalDoctorId, hospitalId, date: todayISTStr() } }, { status: 201 })
  } catch (error) {
    console.error('Express walk-in error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user || !RECEPTION_ROLES.includes(user.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const mobile = searchParams.get('mobile')
    if (!mobile?.trim()) return NextResponse.json({ found: false })
    const patient = await db.user.findFirst({ where: { mobileNo: mobile.trim(), role: 'patient' }, select: { id: true, name: true, gender: true, mobileNo: true } })
    if (!patient) return NextResponse.json({ found: false })
    return NextResponse.json({ found: true, patient })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
