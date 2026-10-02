import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { getFunnelStats } from '@/lib/analytics'

/**
 * GET /api/admin/analytics?days=30
 * Conversion-funnel stats (PRICING-STRATEGY §7): wall_viewed → wall_upgraded
 * per source, daily series and grand totals. Learns which upgrade moment earns.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'admin')
    if (!user) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const days = Math.min(90, Math.max(1, parseInt(searchParams.get('days') || '30', 10) || 30))

    const stats = await getFunnelStats(days)
    return NextResponse.json(stats)
  } catch (err) {
    console.error('[admin/analytics] error:', err)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}
