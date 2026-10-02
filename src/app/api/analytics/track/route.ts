import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { getHospitalIdForUser } from '@/lib/plans'
import { trackEvent, EVENT_SOURCES } from '@/lib/analytics'

/**
 * POST /api/analytics/track
 * Fire-and-forget conversion-funnel instrumentation (PRICING-STRATEGY §7).
 * Authenticated users only; always 200/204 so UI never blocks on tracking.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      // Silent no-op — anonymous tracking is not needed for the funnel
      return NextResponse.json({ ok: true })
    }

    const body = await req.json().catch(() => null)
    const type = body?.type
    const source = body?.source

    if (typeof type !== 'string' || typeof source !== 'string') {
      return NextResponse.json({ error: 'type and source required' }, { status: 400 })
    }

    // Whitelist: the funnel contract (see src/lib/analytics.ts)
    const VALID_TYPES = ['wall_viewed', 'wall_upgraded', 'founder_interest', 'report_viewed']
    if (!VALID_TYPES.includes(type) || !EVENT_SOURCES.includes(source as never)) {
      return NextResponse.json({ error: 'invalid event' }, { status: 400 })
    }

    const hospitalId = await getHospitalIdForUser({ id: user.id, role: user.role }).catch(() => null)

    await trackEvent({
      userId: user.id,
      hospitalId,
      type,
      source,
      meta: typeof body?.meta === 'object' && body?.meta !== null ? body.meta : undefined,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[analytics/track] error (ignored):', err)
    return NextResponse.json({ ok: true })
  }
}
