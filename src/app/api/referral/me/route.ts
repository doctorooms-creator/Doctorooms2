import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import {
  getOrCreateReferralCode,
  getWalletSummary,
  checkReferralStages,
  maskName,
  STAGE_META,
  REDEEM_CATALOG,
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
      const meta = STAGE_META[r.status] ?? STAGE_META.pending
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
      // 2,000 pts per full referral → "X poore referrals jaise"
      fullReferralEquivalents: Math.floor(totalEarned / 2000),
    }

    return NextResponse.json({
      code,
      shareUrl: `/r/${code}`,
      wallet,
      tracker,
      ledger: ledger.map((l) => ({
        ...l,
        createdAt: l.createdAt.toISOString(),
        expiresAt: l.expiresAt?.toISOString() ?? null,
      })),
      catalog: REDEEM_CATALOG,
      stats,
    })
  } catch (err) {
    console.error('[referral/me] error:', err)
    return NextResponse.json({ error: 'Failed to load referral data' }, { status: 500 })
  }
}
