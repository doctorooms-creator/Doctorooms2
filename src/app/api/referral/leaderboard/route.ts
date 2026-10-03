import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboard } from '@/lib/referral'

/**
 * GET /api/referral/leaderboard?limit=20
 * PUBLIC — top referrers (masked names, no IDs). Social-proof engine for the
 * referral program (plan §9 Phase 3). No auth required.
 */
export async function GET(req: NextRequest) {
  try {
    const limitParam = parseInt(req.nextUrl.searchParams.get('limit') ?? '20', 10)
    const limit = Number.isNaN(limitParam) ? 20 : Math.min(Math.max(limitParam, 1), 50)
    const leaderboard = await getLeaderboard(limit)
    return NextResponse.json(
      { leaderboard },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    )
  } catch (err) {
    console.error('[referral/leaderboard] error:', err)
    return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 })
  }
}
