import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { emitToUserWithNotify, emitToRole } from '@/lib/emit-notification'
import { logCreate } from '@/lib/audit-log'

/**
 * GET /api/ot-schedules
 *   Doctor: list MY surgeries (filter by surgeonId = doctor.id).
 *   Hospital / Receptionist / Admin: list all surgeries for the hospital.
 *   Query: ?status=...&date=YYYY-MM-DD&surgeonId=...&otId=...
 *
 * POST /api/ot-schedules
 *   Doctor, Hospital, Receptionist, Admin: create a new surgery schedule.
 *   Body: {
 *     otId, hospitalId, admissionId, patientName, patientAge, patientGender,
 *     surgeonId?, assistantSurgeons? (array of doctor ids), anesthetistId?,
 *     nurseId?, otTechnician?, surgeryName, surgeryCategory?, surgeryType?,
 *     scheduledDate (ISO), scheduledStartTime (HH:mm), estimatedDuration? (min),
 *     notes?
 *   }
 *
 * On create: emit `ot-scheduled` event to:
 *   - The surgeon's user room (if surgeonId is set)
 *   - role:receptionist + role:hospital (so they see the new surgery in the OT board)
 *   - The patient's user room (if admission has a userId) — patient gets SMS too
 */
export async function GET(req: NextRequest) {
  try {
    let user = await requireRole(req, 'doctor')
    if (!user) user = await requireRole(req, 'hospital')
    if (!user) user = await requireRole(req, 'receptionist')
    if (!user) user = await requireRole(req, 'admin')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || ''
    const dateStr = searchParams.get('date') || ''
    const surgeonId = searchParams.get('surgeonId') || ''
    const otId = searchParams.get('otId') || ''
    const todayOnly = searchParams.get('today') === 'true'

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (surgeonId) where.surgeonId = surgeonId
    if (otId) where.otId = otId

    // Date filter
    if (todayOnly) {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      where.AND = [{ scheduledDate: { gte: start } }, { scheduledDate: { lt: end } }]
    } else if (dateStr) {
      const [y, m, d] = dateStr.split('-').map(Number)
      const start = new Date(y, m - 1, d)
      const end = new Date(y, m - 1, d + 1)
      where.AND = [{ scheduledDate: { gte: start } }, { scheduledDate: { lt: end } }]
    }

    // Role-based filtering
    if (user.role === 'doctor') {
      const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
      if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
      where.surgeonId = doctor.id
    } else if (user.role === 'hospital') {
      const hospital = await db.hospital.findUnique({ where: { userId: user.id }, select: { id: true } })
      if (!hospital) return NextResponse.json({ error: 'Hospital profile not found' }, { status: 404 })
      where.hospitalId = hospital.id
    } else if (user.role === 'receptionist') {
      // Receptionists belong to a hospital via the Receptionist table (not userId on Hospital)
      const receptionist = await db.receptionist.findUnique({ where: { userId: user.id }, select: { hospitalId: true } })
      if (!receptionist) return NextResponse.json({ error: 'Receptionist profile not found' }, { status: 404 })
      where.hospitalId = receptionist.hospitalId
    }

    const schedules = await db.otSchedule.findMany({
      where,
      orderBy: [{ scheduledDate: 'asc' }, { scheduledStartTime: 'asc' }],
      include: {
        ot: { select: { id: true, name: true, otType: true, floorNo: true } },
        hospital: { select: { id: true, hospitalName: true } },
        admission: { select: { id: true, admissionNo: true, patientName: true, userId: true } },
        surgeon: { include: { user: { select: { id: true, name: true } } } },
      },
    })

    return NextResponse.json({ schedules })
  } catch (error) {
    console.error('ot-schedules GET error:', error)
    return NextResponse.json({ error: 'Failed to load surgery schedules' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    let user = await requireRole(req, 'doctor')
    if (!user) user = await requireRole(req, 'hospital')
    if (!user) user = await requireRole(req, 'receptionist')
    if (!user) user = await requireRole(req, 'admin')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      otId, hospitalId, admissionId, patientName, patientAge, patientGender,
      surgeonId, assistantSurgeons, anesthetistId, nurseId, otTechnician,
      surgeryName, surgeryCategory, surgeryType,
      scheduledDate, scheduledStartTime, estimatedDuration, notes,
    } = body

    if (!otId || !admissionId || !surgeryName || !scheduledDate) {
      return NextResponse.json({ error: 'otId, admissionId, surgeryName, scheduledDate are required' }, { status: 400 })
    }

    // Derive hospitalId + patient info from the OT / admission when not provided
    // (frontends often only know otId + admissionId)
    let resolvedHospitalId = hospitalId as string | undefined
    let resolvedPatientName = patientName as string | undefined
    let resolvedPatientAge = patientAge as number | undefined
    let resolvedPatientGender = patientGender as string | undefined

    const admissionRecord = await db.ipdAdmission.findUnique({
      where: { id: admissionId },
      select: { hospitalId: true, patientName: true, patientAge: true, patientGender: true },
    })
    if (!admissionRecord) {
      return NextResponse.json({ error: 'Admission not found' }, { status: 404 })
    }
    resolvedHospitalId = resolvedHospitalId || admissionRecord.hospitalId
    resolvedPatientName = resolvedPatientName || admissionRecord.patientName
    resolvedPatientAge = resolvedPatientAge ?? admissionRecord.patientAge
    resolvedPatientGender = resolvedPatientGender || admissionRecord.patientGender

    if (!resolvedHospitalId) {
      return NextResponse.json({ error: 'hospitalId is required' }, { status: 400 })
    }

    // Generate scheduleNo (e.g. OT-2026-0001)
    const year = new Date().getFullYear()
    const count = await db.otSchedule.count({
      where: { scheduleNo: { startsWith: `OT-${year}-` } },
    })
    const scheduleNo = `OT-${year}-${String(count + 1).padStart(4, '0')}`

    const schedule = await db.otSchedule.create({
      data: {
        scheduleNo,
        otId,
        hospitalId: resolvedHospitalId,
        admissionId,
        patientName: resolvedPatientName || '',
        patientAge: typeof resolvedPatientAge === 'number' ? resolvedPatientAge : parseInt(String(resolvedPatientAge)) || 0,
        patientGender: resolvedPatientGender || '',
        surgeonId: surgeonId || null,
        assistantSurgeons: Array.isArray(assistantSurgeons) ? JSON.stringify(assistantSurgeons) : '[]',
        anesthetistId: anesthetistId || null,
        nurseId: nurseId || null,
        otTechnician: otTechnician || '',
        surgeryName,
        surgeryCategory: surgeryCategory || '',
        surgeryType: ['Elective', 'Emergency'].includes(surgeryType) ? surgeryType : 'Elective',
        scheduledDate: new Date(scheduledDate),
        scheduledStartTime: scheduledStartTime || '',
        estimatedDuration: typeof estimatedDuration === 'number' ? estimatedDuration : parseInt(estimatedDuration) || 60,
        status: 'Scheduled',
        notes: notes || '',
      },
      include: {
        ot: { select: { name: true } },
        admission: { select: { userId: true, patientName: true } },
        surgeon: { include: { user: { select: { id: true, name: true } } } },
      },
    })

    // ─── Emit real-time events ─────────────────────────────────────────
    try {
      // 1. Surgeon gets a notification + in-app toast (they're often a doctor on the move)
      if (schedule.surgeon?.user) {
        await emitToUserWithNotify(schedule.surgeon.user.id, 'ot-scheduled', {
          scheduleId: schedule.id,
          scheduleNo: schedule.scheduleNo,
          surgeryName: schedule.surgeryName,
          patientName: schedule.patientName,
          otName: schedule.ot?.name || '',
          scheduledDate: schedule.scheduledDate.toISOString(),
          scheduledStartTime: schedule.scheduledStartTime,
          message: '',
        })
      }

      // 2. Receptionist + hospital get an ephemeral broadcast (the OT board updates live)
      emitToRole('receptionist', 'ot-scheduled', {
        scheduleId: schedule.id,
        scheduleNo: schedule.scheduleNo,
        surgeryName: schedule.surgeryName,
        patientName: schedule.patientName,
        otName: schedule.ot?.name || '',
        scheduledDate: schedule.scheduledDate.toISOString(),
        scheduledStartTime: schedule.scheduledStartTime,
        message: '',
      })
      emitToRole('hospital', 'ot-scheduled', {
        scheduleId: schedule.id,
        scheduleNo: schedule.scheduleNo,
        surgeryName: schedule.surgeryName,
        patientName: schedule.patientName,
        otName: schedule.ot?.name || '',
        scheduledDate: schedule.scheduledDate.toISOString(),
        scheduledStartTime: schedule.scheduledStartTime,
        message: '',
      })

      // 3. Patient gets a notification + SMS (they need to know their surgery date)
      if (schedule.admission?.userId) {
        await emitToUserWithNotify(schedule.admission.userId, 'ot-scheduled', {
          scheduleId: schedule.id,
          scheduleNo: schedule.scheduleNo,
          surgeryName: schedule.surgeryName,
          patientName: schedule.patientName || 'You',
          otName: schedule.ot?.name || '',
          scheduledDate: schedule.scheduledDate.toISOString(),
          scheduledStartTime: schedule.scheduledStartTime,
          message: '',
        }, {
          smsChannel: true,
        })
      }
    } catch (emitErr) {
      console.error('ot-scheduled emit failed:', emitErr)
    }

    // Audit log: surgery scheduled (critical)
    try {
      await logCreate(
        'ot_schedule',
        schedule.id,
        user,
        `Scheduled surgery "${schedule.surgeryName}" for ${schedule.patientName} on ${schedule.scheduledDate.toISOString()} at ${schedule.scheduledStartTime} in ${schedule.ot?.name || ''}`,
        {
          surgeryName: schedule.surgeryName,
          otId: schedule.otId,
          admissionId: schedule.admissionId,
          scheduledDate: schedule.scheduledDate.toISOString(),
          surgeonId: schedule.surgeonId,
        },
        { severity: 'critical' }
      )
    } catch (auditErr) {
      console.error('[audit-log] ot-schedule create capture failed:', auditErr)
    }

    return NextResponse.json({ schedule }, { status: 201 })
  } catch (error) {
    console.error('ot-schedules POST error:', error)
    return NextResponse.json({ error: 'Failed to create surgery schedule' }, { status: 500 })
  }
}
