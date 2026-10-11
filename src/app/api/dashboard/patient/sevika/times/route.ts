import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { requireRole } from '@/lib/api-auth'
import { getSlotTimes, saveSlotTimes } from '@/lib/sevika/schedule'

export const dynamic = 'force-dynamic'

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time HH:MM format me hona chahiye')

const timesSchema = z
  .object({
    morning: hhmm.optional(),
    afternoon: hhmm.optional(),
    evening: hhmm.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'Kam se kam ek time update karein' })

/**
 * GET /api/dashboard/patient/sevika/times — current personalised slot times.
 * PUT /api/dashboard/patient/sevika/times — save (HH:MM each).
 * Stored in User.settingsJson.sevika — new doses use these times.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const slotTimes = await getSlotTimes(user.id)
    return NextResponse.json({ slotTimes })
  } catch (err) {
    console.error('[sevika/times GET] error:', err)
    return NextResponse.json({ error: 'Failed to load times' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    const parsed = timesSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    await saveSlotTimes(user.id, parsed.data)
    const slotTimes = await getSlotTimes(user.id)
    return NextResponse.json({ slotTimes })
  } catch (err) {
    console.error('[sevika/times PUT] error:', err)
    return NextResponse.json({ error: 'Failed to save times' }, { status: 500 })
  }
}
