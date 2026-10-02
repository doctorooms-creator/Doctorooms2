import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/admin/referrals
 * Admin analytics: funnel by stage, points economy, top referrers.
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await requireRole(req, 'admin')
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const [
      totalCodes,
      referralsByStatus,
      pointsIssued,
      pointsRedeemed,
      redemptionsByItem,
      topReferrerRows,
    ] = await Promise.all([
      db.referralCode.count(),
      db.referral.groupBy({ by: ['status'], _count: { _all: true } }),
      db.pointsLedger.aggregate({ where: { points: { gt: 0 } }, _sum: { points: true } }),
      db.pointsLedger.aggregate({ where: { points: { lt: 0 } }, _sum: { points: true } }),
      db.redemption.groupBy({ by: ['itemType'], _count: { _all: true }, _sum: { pointsSpent: true } }),
      db.referral.groupBy({
        by: ['referrerUserId'],
        _count: { _all: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ])

    // Resolve top referrer names
    const topIds = topReferrerRows.map((r) => r.referrerUserId)
    const users = await db.user.findMany({
      where: { id: { in: topIds } },
      select: { id: true, name: true },
    })
    const nameMap = new Map(users.map((u) => [u.id, u.name]))

    const funnel = Object.fromEntries(referralsByStatus.map((r) => [r.status, r._count._all]))

    return NextResponse.json({
      totalCodes,
      funnel,
      activatedRate: funnel.pending
        ? Math.round(((funnel.activated ?? 0) + (funnel.habit ?? 0) + (funnel.converted ?? 0)) /
            Math.max(referralsByStatus.reduce((s, r) => s + r._count._all, 0), 1) * 100)
        : 0,
      pointsIssued: pointsIssued._sum.points ?? 0,
      pointsRedeemed: Math.abs(pointsRedeemed._sum.points ?? 0),
      redemptionsByItem: redemptionsByItem.map((r) => ({
        itemType: r.itemType,
        count: r._count._all,
        pointsSpent: r._sum.pointsSpent ?? 0,
      })),
      topReferrers: topReferrerRows.map((r) => ({
        name: nameMap.get(r.referrerUserId) ?? 'Unknown',
        referrals: r._count._all,
      })),
    })
  } catch (err) {
    console.error('[admin/referrals] error:', err)
    return NextResponse.json({ error: 'Failed to load referral stats' }, { status: 500 })
  }
}
