import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { todayISTRange } from '@/lib/date-utils'
import { computeAdherence, getSlotTimes } from '@/lib/sevika/schedule'
import { getLatestDietPlan } from '@/lib/sevika/diet'

export const dynamic = 'force-dynamic'

/** P3 adaptive rail: must mirror CATCHUP_WINDOW_MS in doses/[id]/route.ts */
const CATCHUP_WINDOW_MS = 2 * 60 * 60 * 1000

/**
 * GET /api/dashboard/patient/sevika/today
 * Everything the Sevika home screen needs in one call:
 * today's dose timeline + adherence stats + active medicines + latest diet plan
 * + P3 catch-up list (Missed/Skipped doses still within the 2h late-take window).
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { start, end } = todayISTRange()

    const [doses, medicines, adherence, diet, slotTimes] = await Promise.all([
      db.sevikaDose.findMany({
        where: { userId: user.id, dueAt: { gte: start, lte: end } },
        include: {
          schedule: {
            select: { id: true, medicineName: true, dose: true, instructions: true },
          },
        },
        orderBy: { dueAt: 'asc' },
      }),
      db.sevikaSchedule.findMany({
        where: { userId: user.id, status: 'Active' },
        select: {
          id: true,
          medicineName: true,
          dose: true,
          instructions: true,
          morning: true,
          afternoon: true,
          evening: true,
          durationDays: true,
          startDate: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      computeAdherence(user.id),
      getLatestDietPlan(user.id),
      getSlotTimes(user.id),
    ])

    // P3: Missed/Skipped doses from the last 2h — the patient can still take them late.
    const now = Date.now()
    const catchup = doses
      .filter(
        (d) =>
          (d.status === 'Missed' || d.status === 'Skipped') &&
          now - new Date(d.dueAt).getTime() <= CATCHUP_WINDOW_MS
      )
      .map((d) => ({
        id: d.id,
        medicineName: d.schedule.medicineName,
        dose: d.schedule.dose,
        dueAt: d.dueAt,
        slot: d.slot,
        status: d.status,
      }))

    return NextResponse.json({ doses, medicines, adherence, diet, slotTimes, catchup })
  } catch (err) {
    console.error('[sevika/today] error:', err)
    return NextResponse.json({ error: 'Failed to load Sevika data' }, { status: 500 })
  }
}
