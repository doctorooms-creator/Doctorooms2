import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { emitToUserWithNotify, emitToRole } from '@/lib/emit-notification'
import { logStatusChange } from '@/lib/audit-log'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * POST /api/ot-schedules/[id]/start
 *   Hospital / receptionist / surgeon doctor / admin: mark surgery as InProgress.
 *   Sets actualStartTime to now (HH:mm), updates OT status to "In-Use".
 *   Emits `ot-started` event to: surgeon, patient, role:receptionist, role:hospital.
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    let user = await requireRole(req, 'admin')
    if (!user) user = await requireRole(req, 'hospital')
    if (!user) user = await requireRole(req, 'receptionist')
    if (!user) user = await requireRole(req, 'doctor')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const schedule = await db.otSchedule.findUnique({
      where: { id },
      include: {
        ot: { select: { id: true, name: true } },
        admission: { select: { userId: true, patientName: true } },
        surgeon: { include: { user: { select: { id: true, name: true } } } },
      },
    })
    if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (schedule.status !== 'Scheduled') {
      return NextResponse.json({ error: `Surgery cannot start in ${schedule.status} state` }, { status: 400 })
    }

    // Doctor authorization: must be the assigned surgeon
    if (user.role === 'doctor') {
      const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
      if (!doctor || schedule.surgeonId !== doctor.id) {
        return NextResponse.json({ error: 'Forbidden — you are not the assigned surgeon' }, { status: 403 })
      }
    }

    const now = new Date()
    const startTimeStr = now.toTimeString().slice(0, 5) // HH:mm

    const [updatedSchedule] = await Promise.all([
      db.otSchedule.update({
        where: { id },
        data: {
          status: 'InProgress',
          actualStartTime: startTimeStr,
        },
      }),
      // Mark the OT as In-Use
      db.operationTheater.update({
        where: { id: schedule.otId },
        data: { status: 'In-Use' },
      }),
    ])

    // ─── Emit real-time events ─────────────────────────────────────────
    try {
      const payload = {
        scheduleId: schedule.id,
        scheduleNo: schedule.scheduleNo,
        surgeryName: schedule.surgeryName,
        patientName: schedule.patientName || schedule.admission?.patientName || '',
        otName: schedule.ot?.name || '',
        actualStartTime: startTimeStr,
        message: '',
      }

      // Surgeon gets a notification (even though they're likely present — for audit log)
      if (schedule.surgeon?.user) {
        await emitToUserWithNotify(schedule.surgeon.user.id, 'ot-started', payload)
      }

      // Receptionist + hospital get ephemeral broadcast (OT board updates live)
      emitToRole('receptionist', 'ot-started', payload)
      emitToRole('hospital', 'ot-started', payload)

      // Patient's family (if patient has a userId) gets a notification + SMS
      if (schedule.admission?.userId) {
        await emitToUserWithNotify(schedule.admission.userId, 'ot-started', payload, {
          smsChannel: true,
        })
      }
    } catch (emitErr) {
      console.error('ot-started emit failed:', emitErr)
    }

    // Audit log: surgery start Scheduled → InProgress
    try {
      await logStatusChange(
        'ot_schedule',
        schedule.id,
        'Scheduled',
        'InProgress',
        user,
        `Started surgery "${schedule.surgeryName}" for ${schedule.patientName} at ${startTimeStr} in ${schedule.ot?.name}`,
        { metadata: { otName: schedule.ot?.name, actualStartTime: startTimeStr } }
      )
    } catch (auditErr) {
      console.error('[audit-log] ot-schedule start capture failed:', auditErr)
    }

    return NextResponse.json({ schedule: updatedSchedule })
  } catch (error) {
    console.error('ot-schedule start error:', error)
    return NextResponse.json({ error: 'Failed to start surgery' }, { status: 500 })
  }
}
