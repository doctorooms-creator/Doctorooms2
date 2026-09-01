import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { emitToUserWithNotify, emitToRole } from '@/lib/emit-notification'
import { logStatusChange } from '@/lib/audit-log'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * POST /api/ot-schedules/[id]/complete
 *   Hospital / receptionist / surgeon / admin: mark surgery as Completed.
 *   Sets actualEndTime to now (HH:mm), computes actualDuration from start/end times,
 *   frees up the OT (status → Available).
 *   Emits `ot-completed` event.
 *
 *   Body: { notes?: string (post-op notes), actualDuration?: number (minutes, optional override) }
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

    if (schedule.status !== 'InProgress') {
      return NextResponse.json({ error: `Surgery cannot be completed in ${schedule.status} state` }, { status: 400 })
    }

    // Doctor authorization
    if (user.role === 'doctor') {
      const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
      if (!doctor || schedule.surgeonId !== doctor.id) {
        return NextResponse.json({ error: 'Forbidden — you are not the assigned surgeon' }, { status: 403 })
      }
    }

    const body = await req.json().catch(() => ({}))
    const now = new Date()
    const endTimeStr = now.toTimeString().slice(0, 5) // HH:mm

    // Compute actual duration in minutes from start/end times (best-effort)
    let actualDuration = body.actualDuration
    if (typeof actualDuration !== 'number' && schedule.actualStartTime) {
      try {
        const [sh, sm] = schedule.actualStartTime.split(':').map(Number)
        const [eh, em] = endTimeStr.split(':').map(Number)
        const startMin = sh * 60 + sm
        const endMin = eh * 60 + em
        actualDuration = endMin >= startMin ? endMin - startMin : (24 * 60 - startMin) + endMin // handle overnight
      } catch {
        actualDuration = schedule.estimatedDuration
      }
    }

    const [updatedSchedule] = await Promise.all([
      db.otSchedule.update({
        where: { id },
        data: {
          status: 'Completed',
          actualEndTime: endTimeStr,
          estimatedDuration: typeof actualDuration === 'number' ? actualDuration : schedule.estimatedDuration,
          notes: body.notes ? `${schedule.notes}\n[Post-op]: ${body.notes}`.trim() : schedule.notes,
        },
      }),
      // Free up the OT
      db.operationTheater.update({
        where: { id: schedule.otId },
        data: { status: 'Available' },
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
        actualEndTime: endTimeStr,
        actualDuration: String(actualDuration ?? ''),
        message: '',
      }

      if (schedule.surgeon?.user) {
        await emitToUserWithNotify(schedule.surgeon.user.id, 'ot-completed', payload)
      }
      emitToRole('receptionist', 'ot-completed', payload)
      emitToRole('hospital', 'ot-completed', payload)

      if (schedule.admission?.userId) {
        await emitToUserWithNotify(schedule.admission.userId, 'ot-completed', payload, {
          smsChannel: true,
        })
      }
    } catch (emitErr) {
      console.error('ot-completed emit failed:', emitErr)
    }

    // Audit log: surgery completion InProgress → Completed
    try {
      await logStatusChange(
        'ot_schedule',
        schedule.id,
        'InProgress',
        'Completed',
        user,
        `Completed surgery "${schedule.surgeryName}" for ${schedule.patientName} at ${endTimeStr} (duration: ${actualDuration} min)`,
        { metadata: { otName: schedule.ot?.name, actualEndTime: endTimeStr, actualDuration } }
      )
    } catch (auditErr) {
      console.error('[audit-log] ot-schedule complete capture failed:', auditErr)
    }

    return NextResponse.json({ schedule: updatedSchedule })
  } catch (error) {
    console.error('ot-schedule complete error:', error)
    return NextResponse.json({ error: 'Failed to complete surgery' }, { status: 500 })
  }
}
