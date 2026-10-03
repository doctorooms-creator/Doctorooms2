import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { getPlanOverview, PLANS } from '@/lib/plans'

/**
 * GET /api/plans/me
 * Billing-page payload for the logged-in doctor/hospital:
 * effective plan (from Subscription), live usage meters, founder seats,
 * referral wallet balance + the plan catalog for display.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user || !['doctor', 'hospital'].includes(user.role)) {
      return NextResponse.json({ error: 'Doctor or hospital access required' }, { status: 401 })
    }

    const overview = await getPlanOverview({ id: user.id, role: user.role })
    if (!overview) {
      return NextResponse.json({ error: 'Aapka profile kisi hospital se linked nahi hai' }, { status: 400 })
    }

    // Plan catalog for the pricing cards (display data straight from config)
    const catalog = [PLANS.free, PLANS.pro, PLANS.hospital].map((p) => ({
      key: p.key,
      name: p.name,
      tagline: p.tagline,
      priceMonthly: p.priceMonthly,
      priceAnnual: p.priceAnnual,
      founderAnnual: p.founderAnnual,
      effectiveMonthly: p.effectiveMonthly,
      limits: p.limits,
      features: p.features,
    }))

    return NextResponse.json({ ...overview, catalog })
  } catch (err) {
    console.error('[plans/me] error:', err)
    return NextResponse.json({ error: 'Failed to load plan overview' }, { status: 500 })
  }
}
