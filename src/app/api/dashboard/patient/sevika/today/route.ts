import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { todayISTRange } from '@/lib/date-utils'
import { computeAdherence, getSlotTimes } from '@/lib/sevika/schedule'
import { getLatestDietPlan } from '@/lib/sevika/diet'

export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/patient/sevika/today
 * Everything the Sevika home screen needs in one call:
 * today's dose timeline + adherence stats + active medicines + latest diet plan.
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

    return NextResponse.json({ doses, medicines, adherence, diet, slotTimes })
  } catch (err) {
    console.error('[sevika/today] error:', err)
    return NextResponse.json({ error: 'Failed to load Sevika data' }, { status: 500 })
  }
}
