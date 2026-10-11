import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { generateDietPlan, getLatestDietPlan } from '@/lib/sevika/diet'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * GET /api/dashboard/patient/sevika/diet — latest saved diet plan (or null).
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const diet = await getLatestDietPlan(user.id)
    return NextResponse.json({ diet })
  } catch (err) {
    console.error('[sevika/diet GET] error:', err)
    return NextResponse.json({ error: 'Failed to load diet plan' }, { status: 500 })
  }
}

/**
 * POST /api/dashboard/patient/sevika/diet — (re)generate the 7-day AI diet
 * card from the patient's ACTIVE medicines (one LLM call; deterministic
 * fallback if AI is unavailable). Always carries the doctor-consult disclaimer.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const result = await generateDietPlan(user.id)
    return NextResponse.json({
      planId: result.planId,
      plan: result.plan,
      usedFallback: result.usedFallback,
    })
  } catch (err) {
    console.error('[sevika/diet POST] error:', err)
    return NextResponse.json({ error: 'Failed to generate diet plan' }, { status: 500 })
  }
}
