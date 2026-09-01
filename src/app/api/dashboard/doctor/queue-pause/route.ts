import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { emitToHospital } from '@/lib/emit-notification'

/**
 * Doctor queue pause toggle (CTO Plan Phase 4, "Queue Resilience").
 *
 * GET  → { success: true, paused: boolean } — the doctor's current
 *        Doctor.queuePaused flag (shown by the doctor dashboard header).
 * PUT  → body { paused: boolean } — flips Doctor.queuePaused. On change we
 *        broadcast the 'queue-paused' socket event to the doctor's hospital
 *        room (fire-and-forget) so the waiting-room TV board and dashboards
 *        refresh immediately. Doctors without a hospital link simply skip
 *        the emit.
 *
 * Auth: doctor role only (getAuthUser via requireRole, same as the other
 * /api/dashboard/doctor/* routes).
 */

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctor = await db.doctor.findUnique({
      where: { userId: user.id },
      select: { id: true, queuePaused: true },
    })
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, paused: doctor.queuePaused })
  } catch (error) {
    console.error('Queue pause GET error:', error)
    return NextResponse.json({ error: 'Failed to load queue pause state' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctor = await db.doctor.findUnique({
      where: { userId: user.id },
      select: { id: true, hospitalId: true, user: { select: { name: true } } },
    })
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const body = await req.json()
    const { paused } = body as { paused?: unknown }

    if (typeof paused !== 'boolean') {
      return NextResponse.json(
        { error: 'paused must be a boolean' },
        { status: 400 }
      )
    }

    await db.doctor.update({
      where: { id: doctor.id },
      data: { queuePaused: paused },
    })

    // Real-time broadcast to the doctor's hospital room (TV board, reception
    // dashboards) — fire-and-forget, never blocks the response.
    if (doctor.hospitalId) {
      try {
        emitToHospital(doctor.hospitalId, 'queue-paused', {
          doctorId: doctor.id,
          doctorName: doctor.user?.name || 'Doctor',
          paused,
          message: paused
            ? `Dr. ${doctor.user?.name || 'Doctor'} has paused the queue.`
            : `Dr. ${doctor.user?.name || 'Doctor'} has resumed the queue.`,
        })
      } catch (emitErr) {
        console.error('queue-paused emit failed:', emitErr)
      }
    }

    return NextResponse.json({ success: true, paused })
  } catch (error) {
    console.error('Queue pause PUT error:', error)
    return NextResponse.json({ error: 'Failed to update queue pause state' }, { status: 500 })
  }
}
