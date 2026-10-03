import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { getWalletSummary, REDEEM_CATALOG, awardPoints } from '@/lib/referral'
import { emitNotification } from '@/lib/emit-notification'

/** Catalog items that map to a Subscription period (plan §1.4). */
const SUBSCRIPTION_ITEMS: Record<string, { planKey: 'pro' | 'hospital'; days: number }> = {
  pro_month: { planKey: 'pro', days: 30 },
  pro_year: { planKey: 'pro', days: 365 },
  hospital_month: { planKey: 'hospital', days: 30 },
}

/** Catalog items that only record an entitlement grant (plan-system hooks). */
const ENTITLEMENT_ITEMS = new Set(['ai_500pack', 'whatsapp_1000pack', 'seat_year'])

/**
 * POST /api/referral/redeem  body: { itemType }
 * Redeem catalog items with points (Phase 2 — full catalog):
 *  - pro_month / pro_year / hospital_month → extends/creates the doctor's
 *    hospital Subscription (source: points)
 *  - ai_500pack / whatsapp_1000pack / seat_year → recorded grant
 *    (enforcement lands with usage counters / plan gating)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user || user.role !== 'doctor') {
      return NextResponse.json({ error: 'Doctor access required' }, { status: 401 })
    }
    const userId = user.id

    const { itemType } = await req.json()
    const item = REDEEM_CATALOG.find((c) => c.itemType === itemType)
    if (!item || !item.active) {
      return NextResponse.json({ error: 'Item not available' }, { status: 400 })
    }

    // Spendable balance check (15-day anti-fraud window already applied)
    const wallet = await getWalletSummary(userId)
    if (wallet.spendable < item.points) {
      const shortfall = item.points - wallet.spendable
      return NextResponse.json(
        {
          error: 'Insufficient spendable points',
          shortfall,
          spendable: wallet.spendable,
          needed: item.points,
          hint:
            wallet.pending > 0
              ? `${wallet.pending} points pending hain (15-din security window) — thodi der mein spendable ho jayenge.`
              : `${Math.ceil(shortfall / 300)} active referrals aur = ye item free.`,
        },
        { status: 400 }
      )
    }

    // ── Subscription items need a hospital to attach the period to ──
    // Resolution order matches how the app links doctors to hospitals:
    // 1. Doctor.hospitalId (primary/direct field)
    // 2. First active DoctorHospital link (multi-hospital doctors)
    let hospitalId: string | null = null
    const subItem = SUBSCRIPTION_ITEMS[itemType]
    if (subItem) {
      const doctor = await db.doctor.findFirst({
        where: { userId },
        select: { id: true, hospitalId: true },
      })
      hospitalId = doctor?.hospitalId ?? null

      if (!hospitalId && doctor) {
        const link = await db.doctorHospital.findFirst({
          where: { doctorId: doctor.id, isAvailable: true },
          orderBy: { createdAt: 'asc' },
          select: { hospitalId: true },
        })
        hospitalId = link?.hospitalId ?? null
      }

      if (!hospitalId) {
        return NextResponse.json(
          { error: 'Aapka profile kisi hospital se linked nahi hai — pehle profile complete karein.' },
          { status: 400 }
        )
      }
    }

    // Atomic-ish: create Redemption + spend ledger entry
    const redemption = await db.redemption.create({
      data: {
        userId,
        itemType,
        pointsSpent: item.points,
        status: 'applied',
      },
    })

    const spent = await awardPoints({
      userId,
      type: `redeem_${itemType}`,
      points: -item.points,
      refId: redemption.id,
      note: `Redeemed: ${item.title}`,
      emitMessage: `🎁 Redeemed: ${item.title} (${item.points} points)`,
    })
    if (!spent) {
      // Ledger append failed (should not happen — awards are idempotent on
      // type+refId and this refId is fresh). Revert redemption to be safe.
      await db.redemption.update({
        where: { id: redemption.id },
        data: { status: 'reverted', revertedAt: new Date() },
      })
      return NextResponse.json({ error: 'Redemption failed — points not charged' }, { status: 500 })
    }

    // Apply the actual benefit
    let subscriptionInfo: Record<string, unknown> | null = null
    if (subItem && hospitalId) {
      const existing = await db.subscription.findUnique({ where: { hospitalId } })
      const now = new Date()
      const base =
        existing?.currentPeriodEnd && existing.currentPeriodEnd > now
          ? existing.currentPeriodEnd
          : now
      const newEnd = new Date(base.getTime() + subItem.days * 24 * 60 * 60 * 1000)

      const sub = await db.subscription.upsert({
        where: { hospitalId },
        create: {
          hospitalId,
          planKey: subItem.planKey,
          status: 'active',
          source: 'points',
          currentPeriodStart: now,
          currentPeriodEnd: newEnd,
        },
        update: {
          planKey: subItem.planKey,
          status: 'active',
          source: 'points',
          currentPeriodEnd: newEnd,
        },
      })
      subscriptionInfo = {
        planKey: sub.planKey,
        status: sub.status,
        source: sub.source,
        currentPeriodEnd: sub.currentPeriodEnd?.toISOString(),
      }
    }

    const walletAfter = await getWalletSummary(userId)

    // Celebration moment — redemption success (roadmap): full-screen confetti
    // on the redeemer's screen + DB notification for offline visibility.
    emitNotification('celebration', [`user:${userId}`], {
      title: '🎁 Redemption Successful!',
      message: `${item.title} unlock ho gaya! ${item.points} points kharch hue — enjoy your reward 🎉`,
      kind: 'redeem',
      points: item.points,
    })
    db.notification
      .create({
        data: {
          userId,
          title: '🎁 Redemption Successful',
          message: `${item.title} unlock ho gaya — ${item.points} points kharch hue.`,
        },
      })
      .catch(() => {})

    return NextResponse.json({
      success: true,
      item: item.title,
      pointsSpent: item.points,
      wallet: walletAfter,
      subscription: subscriptionInfo,
      applied: subItem ? 'subscription' : ENTITLEMENT_ITEMS.has(itemType) ? 'entitlement-recorded' : 'unknown',
    })
  } catch (err) {
    console.error('[referral/redeem] error:', err)
    return NextResponse.json({ error: 'Redemption failed' }, { status: 500 })
  }
}
