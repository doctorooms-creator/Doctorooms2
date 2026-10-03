import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import {
  getOrCreateReferralCode,
  getWalletSummary,
  checkReferralStages,
  maskName,
  REDEEM_CATALOG,
  MILESTONE_BONUSES,
  REWARD_VARIANTS,
  resolveVariant,
  stageMetaFor,
} from '@/lib/referral'

/**
 * GET /api/referral/me
 * Referrer's dashboard payload: code, wallet, referrals tracker, catalog, stats.
 * Also lazily advances referral stages (idempotent) so the tracker is fresh.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user || user.role !== 'doctor') {
      return NextResponse.json({ error: 'Doctor access required' }, { status: 401 })
    }
    const userId = user.id

    // 1. Ensure a referral code exists (lazy creation on first dashboard visit)
    const code = await getOrCreateReferralCode(userId)

    // A/B reward-size experiment (Phase 3): the referrer's variant drives
    // award sizes, share texts and all dashboard copy.
    const variant = await resolveVariant(userId)
    const variantAwards = REWARD_VARIANTS[variant]
    const stageMeta = stageMetaFor(variant)

    // 2. Refresh stages for my referrals (idempotent, cheap counts)
    const myReferrals = await db.referral.findMany({
      where: { referrerUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    for (const r of myReferrals) {
      if (r.status === 'pending' || r.status === 'activated') {
        await checkReferralStages(r.refereeUserId)
      }
    }

    // 3. Re-read after potential stage updates
    const referrals = await db.referral.findMany({
      where: { referrerUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // Referee display info (masked privacy)
    const refereeIds = referrals.map((r) => r.refereeUserId)
    const referees = await db.user.findMany({
      where: { id: { in: refereeIds } },
      select: { id: true, name: true, createdAt: true },
    })
    const refereeMap = new Map(referees.map((u) => [u.id, u]))

    const tracker = referrals.map((r) => {
      const meta = stageMeta[r.status] ?? stageMeta.pending
      const ref = refereeMap.get(r.refereeUserId)
      return {
        id: r.id,
        refereeName: maskName(ref?.name ?? 'New User'),
        refereeRole: ref ? 'registered' : 'unknown',
        status: r.status,
        stageLabel: meta.label,
        stageBadge: meta.badge,
        pointsEarned: meta.earned,
        createdAt: r.createdAt.toISOString(),
        activatedAt: r.activatedAt?.toISOString() ?? null,
      }
    })

    // 4. Wallet + recent ledger
    const wallet = await getWalletSummary(userId)
    const ledger = await db.pointsLedger.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        type: true,
        points: true,
        note: true,
        createdAt: true,
        expiresAt: true,
      },
    })

    // 5. Stats
    const totalEarned = tracker.reduce((s, t) => s + t.pointsEarned, 0)
    const stats = {
      totalReferrals: tracker.length,
      activated: tracker.filter((t) => t.status !== 'pending' && t.status !== 'expired').length,
      converted: tracker.filter((t) => t.status === 'converted').length,
      totalEarned,
      // Variant-aware: A = 2,000 pts per full referral, B = 2,500
      fullReferralEquivalents: Math.floor(totalEarned / variantAwards.total),
    }

    // 6. Milestones (rolling 12-month conversions) + champion badge (Phase 2)
    const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    const [rollingConversions, championEntry] = await Promise.all([
      db.referral.count({
        where: { referrerUserId: userId, status: 'converted', convertedAt: { gte: yearAgo } },
      }),
      db.pointsLedger.findFirst({
        where: { userId, type: 'earn_milestone_10' },
        select: { id: true },
      }),
    ])
    const milestones = {
      rollingConversions,
      champion: !!championEntry,
      targets: MILESTONE_BONUSES.map((m) => ({ conversions: m.conversions, points: m.points })),
    }

    // 7. Leaderboard rank (plan §9 Phase 3) — position among all referrers
    // who have ≥1 referral, ranked by earned referral points.
    const EARNS = [
      'earn_activated',
      'earn_habit',
      'earn_converted',
      'earn_milestone_5',
      'earn_milestone_10',
    ]
    const myEarned = await db.pointsLedger.aggregate({
      where: { userId, points: { gt: 0 }, type: { in: EARNS } },
      _sum: { points: true },
    })
    const myEarnedPts = myEarned._sum.points ?? 0
    const rankRow = await db.referral.findFirst({
      where: { referrerUserId: userId },
      select: { id: true },
    })
    const totalReferrers = await db.referral.groupBy({ by: ['referrerUserId'] })
    const leaderboard: {
      myRank: number | null
      myEarnedPoints: number
      hasReferrals: boolean
      totalReferrers?: number
    } = {
      myRank: null,
      myEarnedPoints: myEarnedPts,
      hasReferrals: !!rankRow,
    }
    if (rankRow) {
      // Everyone strictly above me: referrers whose earned points exceed mine
      const earnedRows = await db.pointsLedger.groupBy({
        by: ['userId'],
        where: { points: { gt: 0 }, type: { in: EARNS } },
        _sum: { points: true },
      })
      const referrerSet = new Set(totalReferrers.map((t) => t.referrerUserId))
      const above = earnedRows.filter(
        (r) => referrerSet.has(r.userId) && r.userId !== userId && (r._sum.points ?? 0) > myEarnedPts
      ).length
      leaderboard.myRank = above + 1
      leaderboard.totalReferrers = referrerSet.size
    }

    return NextResponse.json({
      code,
      shareUrl: `/r/${code}`,
      variant,
      variantAwards,
      wallet,
      tracker,
      ledger: ledger.map((l) => ({
        ...l,
        createdAt: l.createdAt.toISOString(),
        expiresAt: l.expiresAt?.toISOString() ?? null,
      })),
      catalog: REDEEM_CATALOG,
      stats,
      milestones,
      leaderboard,
    })
  } catch (err) {
    console.error('[referral/me] error:', err)
    return NextResponse.json({ error: 'Failed to load referral data' }, { status: 500 })
  }
}
