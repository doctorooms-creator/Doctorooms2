import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { generateDoses } from '@/lib/sevika/schedule'

export const dynamic = 'force-dynamic'

const createSchema = z.object({
  medicineName: z.string().min(1, 'Medicine ka naam zaroori hai').max(120),
  dose: z.string().max(80).optional().default(''),
  instructions: z.string().max(300).optional().default(''),
  morning: z.number().int().min(0).max(1).optional().default(0),
  afternoon: z.number().int().min(0).max(1).optional().default(0),
  evening: z.number().int().min(0).max(1).optional().default(0),
  durationDays: z.number().int().min(1).max(90).optional().default(5),
  prescriptionId: z.string().optional().nullable(),
})

/**
 * GET /api/dashboard/patient/sevika/schedules — all schedules with progress.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const schedules = await db.sevikaSchedule.findMany({
      where: { userId: user.id },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        doses: { select: { status: true } },
      },
    })

    const list = schedules.map((s) => {
      const total = s.doses.length
      const taken = s.doses.filter((d) => d.status === 'Taken').length
      const missed = s.doses.filter((d) => d.status === 'Missed' || d.status === 'Skipped').length
      return {
        id: s.id,
        medicineName: s.medicineName,
        dose: s.dose,
        instructions: s.instructions,
        morning: s.morning,
        afternoon: s.afternoon,
        evening: s.evening,
        durationDays: s.durationDays,
        startDate: s.startDate,
        status: s.status,
        source: s.source,
        progress: { total, taken, missed },
      }
    })

    return NextResponse.json({ schedules: list })
  } catch (err) {
    console.error('[sevika/schedules GET] error:', err)
    return NextResponse.json({ error: 'Failed to load schedules' }, { status: 500 })
  }
}

/**
 * POST /api/dashboard/patient/sevika/schedules — add a medicine + pre-generate doses.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }
    const data = parsed.data
    if (data.morning + data.afternoon + data.evening === 0) {
      return NextResponse.json(
        { error: 'Kam se kam ek slot chuniye (subah / dopahar / raat)' },
        { status: 422 }
      )
    }

    const { scheduleId, doses } = await generateDoses({
      userId: user.id,
      medicineName: data.medicineName,
      dose: data.dose,
      instructions: data.instructions,
      morning: data.morning,
      afternoon: data.afternoon,
      evening: data.evening,
      durationDays: data.durationDays,
      source: 'Manual',
      prescriptionId: data.prescriptionId ?? null,
    })

    return NextResponse.json({ scheduleId, doses }, { status: 201 })
  } catch (err) {
    console.error('[sevika/schedules POST] error:', err)
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 })
  }
}
