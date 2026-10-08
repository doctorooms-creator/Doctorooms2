import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { packReviewProgress } from '@/lib/specialty-packs/review-status'

/**
 * Pack dose-review console — list (admin only).
 *
 * GET /api/dashboard/admin/pack-review
 * → { packs: [{ packCode, title, tier, totalMedicines, verdicts, status, … }] }
 *
 * One row per library pack with live verdict progress for the MBBS
 * review workflow (P3).
 */
export async function GET(req: NextRequest) {
  const user = await requireRole(req, 'admin')
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const packs = await packReviewProgress()
    return NextResponse.json({ packs })
  } catch (error) {
    console.error('[admin-pack-review] GET error:', error)
    return NextResponse.json({ error: 'Failed to load review progress' }, { status: 500 })
  }
}
