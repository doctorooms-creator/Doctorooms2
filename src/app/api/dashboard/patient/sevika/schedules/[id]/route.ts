import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  action: z.enum(['stop', 'resume']),
})

/**
 * PATCH /api/dashboard/patient/sevika/schedules/[id]
 *  - stop:   status → Stopped + future pending doses removed (koi reminder nahi)
 *  - resume: status → Active (future doses dobara generate hongi)
 * DELETE behaves like stop.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const schedule = await db.sevikaSchedule.findFirst({
      where: { id, userId: user.id },
    })
    if (!schedule) return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })

    const body = await req.json().catch(() => null)
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    if (parsed.data.action === 'stop') {
      await db.sevikaDose.deleteMany({
        where: {
          scheduleId: schedule.id,
          status: { in: ['Pending', 'Snoozed'] },
          dueAt: { gt: new Date() },
        },
      })
      await db.sevikaSchedule.update({
        where: { id: schedule.id },
        data: { status: 'Stopped' },
      })
      return NextResponse.json({ status: 'Stopped' })
    }

    // resume: regenerate remaining days of doses
    const daysLeft = Math.ceil(
      (schedule.startDate.getTime() + schedule.durationDays * 86400000 - Date.now()) / 86400000
    )
    await db.sevikaSchedule.update({
      where: { id: schedule.id },
      data: { status: 'Active' },
    })
    if (daysLeft > 0) {
      // regenerate future doses for remaining days (source-respecting)
      const { generateDoses } = await import('@/lib/sevika/schedule')
      await generateDoses({
        userId: user.id,
        medicineName: schedule.medicineName,
        dose: schedule.dose,
        instructions: schedule.instructions,
        morning: schedule.morning,
        afternoon: schedule.afternoon,
        evening: schedule.evening,
        durationDays: daysLeft,
        source: schedule.source,
        prescriptionId: schedule.prescriptionId,
      })
    }
    return NextResponse.json({ status: 'Active', daysLeft: Math.max(daysLeft, 0) })
  } catch (err) {
    console.error('[sevika/schedules/[id] PATCH] error:', err)
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Reuse PATCH logic by faking the body — patients may delete via UI.
  return PATCH(
    new NextRequest(req.url, {
      method: 'PATCH',
      headers: req.headers,
      body: JSON.stringify({ action: 'stop' }),
    }),
    { params }
  )
}
