import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { emitToUserWithNotify, emitToRole } from '@/lib/emit-notification'
import { logStatusChange } from '@/lib/audit-log'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * POST /api/ot-schedules/[id]/cancel
 *   Hospital / receptionist / surgeon / admin: cancel a scheduled (or InProgress) surgery.
 *   Emits `ot-cancelled` event.
 *   If status was InProgress, also frees up the OT (status → Available).
 *
 *   Body: { reason: string }
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    let user = await requireRole(req, 'admin')
    if (!user) user = await requireRole(req, 'hospital')
    if (!user) user = await requireRole(req, 'receptionist')
    if (!user) user = await requireRole(req, 'doctor')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json().catch(() => ({}))
    // Accept both `reason` and `cancellationReason` (doctor UI sends the latter)
    const reason = body.reason || body.cancellationReason || ''

    const schedule = await db.otSchedule.findUnique({
      where: { id },
      include: {
        ot: { select: { id: true, name: true } },
        admission: { select: { userId: true, patientName: true } },
        surgeon: { include: { user: { select: { id: true, name: true } } } },
      },
    })
    if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (schedule.status === 'Completed' || schedule.status === 'Cancelled') {
      return NextResponse.json({ error: `Surgery already ${schedule.status}` }, { status: 400 })
    }

    // Doctor authorization
    if (user.role === 'doctor') {
      const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
      if (!doctor || schedule.surgeonId !== doctor.id) {
        return NextResponse.json({ error: 'Forbidden — you are not the assigned surgeon' }, { status: 403 })
      }
    }

    const wasInProgress = schedule.status === 'InProgress'

    const [updatedSchedule] = await Promise.all([
      db.otSchedule.update({
        where: { id },
        data: {
          status: 'Cancelled',
          cancellationReason: reason,
        },
      }),
      // If surgery was in progress, free the OT
      ...(wasInProgress ? [
        db.operationTheater.update({
          where: { id: schedule.otId },
          data: { status: 'Available' },
        }),
      ] : []),
    ])

    // ─── Emit real-time events ─────────────────────────────────────────
    try {
      const payload = {
        scheduleId: schedule.id,
        scheduleNo: schedule.scheduleNo,
        surgeryName: schedule.surgeryName,
        patientName: schedule.patientName || schedule.admission?.patientName || '',
        otName: schedule.ot?.name || '',
        cancellationReason: reason,
        message: '',
      }

      if (schedule.surgeon?.user) {
        await emitToUserWithNotify(schedule.surgeon.user.id, 'ot-cancelled', payload)
      }
      emitToRole('receptionist', 'ot-cancelled', payload)
      emitToRole('hospital', 'ot-cancelled', payload)

      if (schedule.admission?.userId) {
        await emitToUserWithNotify(schedule.admission.userId, 'ot-cancelled', payload, {
          smsChannel: true,
        })
      }
    } catch (emitErr) {
      console.error('ot-cancelled emit failed:', emitErr)
    }

    // Audit log: surgery cancellation → Cancelled (warning)
    try {
      await logStatusChange(
        'ot_schedule',
        schedule.id,
        schedule.status,
        'Cancelled',
        user,
        `Cancelled surgery "${schedule.surgeryName}" for ${schedule.patientName} — reason: ${reason || 'N/A'}`,
        { metadata: { reason, otName: schedule.ot?.name }, severity: 'warning' }
      )
    } catch (auditErr) {
      console.error('[audit-log] ot-schedule cancel capture failed:', auditErr)
    }

    return NextResponse.json({ schedule: updatedSchedule })
  } catch (error) {
    console.error('ot-schedule cancel error:', error)
    return NextResponse.json({ error: 'Failed to cancel surgery' }, { status: 500 })
  }
}
