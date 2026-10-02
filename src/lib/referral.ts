/**
 * Referral & Points System — core library
 * Spec: docs/REFERRAL-SYSTEM-PLAN.md
 *
 * Economy: 1 point ≈ ₹0.50 · full referral = 2,000 pts (staged)
 *   Stage 1 ACTIVATED (referee's 1st booking)     +300
 *   Stage 2 HABIT     (referee reaches 20 bookings) +700
 *   Stage 3 CONVERTED (referee becomes paying)    +1,000  (needs billing — dormant)
 *
 * Anti-fraud: earn entries spendable after 15 days (pendingUntil), expire after
 * 18 months (FIFO approximated — spend entries never expire), 60k/yr earn cap,
 * idempotent awards via (type, refId) uniqueness check.
 */

import { db } from '@/lib/db'
import { emitNotification } from '@/lib/emit-notification'

// ─── Config ────────────────────────────────────────────────────────────────

export const STAGE_AWARDS = {
  activated: 300,
  habit: 700,
  converted: 1000,
} as const

/** Bookings the referee's practice needs for the HABIT stage. */
export const REFERRAL_HABIT_BOOKINGS = 20

/** Days an earn entry stays non-spendable (anti-fraud reversal window). */
export const POINTS_PENDING_DAYS = 15

/** Months until unspent earned points expire. */
export const POINTS_EXPIRY_MONTHS = 18

/** Annual earn cap per user (30 full referrals). */
export const ANNUAL_EARN_CAP = 60_000

export interface RedeemItem {
  itemType: string
  title: string
  description: string
  points: number
  cashValue: number
  active: boolean
}

/** Redemption catalog — Phase 1 activates pro_month + ai_500pack. */
export const REDEEM_CATALOG: RedeemItem[] = [
  {
    itemType: 'pro_month',
    title: 'Doctorooms Pro — 1 Month',
    description: 'Pro features 30 din — WhatsApp auto-reminders, recall campaigns, full analytics',
    points: 2000,
    cashValue: 999,
    active: true,
  },
  {
    itemType: 'ai_500pack',
    title: 'AI Copilot — 500 Credits',
    description: 'Dr. Copilot ke liye 500 extra credits — Rx drafts, summaries, analytics',
    points: 1000,
    cashValue: 499,
    active: true,
  },
  {
    itemType: 'pro_year',
    title: 'Doctorooms Pro — 1 Year',
    description: '10 successful referrals = poora saal free',
    points: 20000,
    cashValue: 9999,
    active: false,
  },
  {
    itemType: 'seat_year',
    title: 'Extra Doctor Seat — 1 Year',
    description: 'Pro plan mein ek aur doctor seat',
    points: 5000,
    cashValue: 2499,
    active: false,
  },
  {
    itemType: 'whatsapp_1000pack',
    title: 'WhatsApp Pack — 1,000 Reminders',
    description: 'Plan limit se zyada reminders',
    points: 1000,
    cashValue: 499,
    active: false,
  },
  {
    itemType: 'hospital_month',
    title: 'Hospital Pro — 1 Month',
    description: 'IPD, OT, insurance — full hospital suite',
    points: 10000,
    cashValue: 4999,
    active: false,
  },
]

// ─── Referral code ─────────────────────────────────────────────────────────

/**
 * DR-{NAME}-{4 digits} — e.g. Dr. Amit Shah → DR-AMIT-4821
 * Name part: first word, uppercase, alnum only, max 12 chars.
 */
export function generateReferralCode(name: string): string {
  const base =
    name
      .replace(/^(dr\.?|dr)\s+/i, '')
      .split(/\s+/)[0]
      ?.replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 12) || 'DOC'
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `DR-${base || 'DOC'}-${digits}`
}

/** Get (or lazily create) the user's unique referral code. */
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const existing = await db.referralCode.findUnique({ where: { userId } })
  if (existing) return existing.code

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true },
  })

  // Retry a few times on (very unlikely) code collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode(user?.name || 'Doctor')
    try {
      const created = await db.referralCode.create({
        data: { userId, code },
      })
      return created.code
    } catch {
      // unique violation on code — retry with new digits
    }
  }
  // Fall back to userId-derived code (always unique)
  const fallback = `DR-${userId.slice(-6).toUpperCase()}`
  const created = await db.referralCode.create({
    data: { userId, code: fallback },
  })
  return created.code
}

// ─── Wallet / balance ──────────────────────────────────────────────────────

export interface WalletSummary {
  total: number // all non-expired points (incl. pending)
  spendable: number // past the 15-day anti-fraud window
  pending: number // still inside the window
  expiringSoon: number // expiring within 60 days
  nextExpiry: string | null
}

export async function getWalletSummary(userId: string): Promise<WalletSummary> {
  const now = new Date()
  const entries = await db.pointsLedger.findMany({
    where: {
      userId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    select: { points: true, pendingUntil: true, expiresAt: true },
    orderBy: { createdAt: 'desc' },
  })

  let total = 0
  let spendable = 0
  let pending = 0
  let expiringSoon = 0
  let nextExpiry: Date | null = null

  const sixtyDays = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)

  for (const e of entries) {
    total += e.points
    const isPending = e.pendingUntil && e.pendingUntil > now
    if (e.points > 0 && isPending) pending += e.points
    else spendable += e.points

    if (e.expiresAt) {
      if (!nextExpiry || e.expiresAt < nextExpiry) nextExpiry = e.expiresAt
      if (e.expiresAt <= sixtyDays && e.points > 0) expiringSoon += e.points
    }
  }

  return {
    total,
    spendable,
    pending,
    expiringSoon,
    nextExpiry: nextExpiry?.toISOString() ?? null,
  }
}

/** Sum of positive ledger entries earned this calendar year (cap check). */
async function earnedThisYear(userId: string): Promise<number> {
  const yearStart = new Date(new Date().getFullYear(), 0, 1)
  const agg = await db.pointsLedger.aggregate({
    where: {
      userId,
      points: { gt: 0 },
      createdAt: { gte: yearStart },
    },
    _sum: { points: true },
  })
  return agg._sum.points ?? 0
}

// ─── Awarding points ───────────────────────────────────────────────────────

export interface AwardInput {
  userId: string
  type: string
  points: number
  refId?: string
  note?: string
  /** Toast message for the earner (socket). Skip emitting if empty. */
  emitMessage?: string
}

/**
 * Append-only award. Idempotent on (type, refId) — safe to call from booking
 * hooks that may fire more than once. Enforces annual earn cap.
 * Returns true if awarded, false if skipped (duplicate / capped).
 */
export async function awardPoints(input: AwardInput): Promise<boolean> {
  const { userId, type, points, refId, note, emitMessage } = input

  // Idempotency guard (stage awards and redemptions always carry a refId)
  if (refId) {
    const dup = await db.pointsLedger.findFirst({
      where: { type, refId },
      select: { id: true },
    })
    if (dup) return false
  }

  // Annual earn cap
  if (points > 0) {
    const earned = await earnedThisYear(userId)
    if (earned + points > ANNUAL_EARN_CAP) {
      console.warn(
        `[referral] annual cap hit for ${userId}: ${earned}+${points} > ${ANNUAL_EARN_CAP}`
      )
      return false
    }
  }

  const now = new Date()
  const pendingUntil =
    points > 0
      ? new Date(now.getTime() + POINTS_PENDING_DAYS * 24 * 60 * 60 * 1000)
      : null
  const expiresAt =
    points > 0
      ? new Date(
          now.getTime() + POINTS_EXPIRY_MONTHS * 30 * 24 * 60 * 60 * 1000
        )
      : null

  await db.$transaction(async (tx) => {
    // Snapshot balance AFTER this entry (approximate under concurrency —
    // the ledger itself stays the source of truth).
    const agg = await tx.pointsLedger.aggregate({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      _sum: { points: true },
    })
    const balanceAfter = (agg._sum.points ?? 0) + points

    await tx.pointsLedger.create({
      data: {
        userId,
        type,
        points,
        balanceAfter,
        refId,
        note: note ?? '',
        pendingUntil,
        expiresAt,
      },
    })
  })

  // Real-time toast to the earner (fire-and-forget)
  if (emitMessage) {
    emitNotification('referral-reward', [`user:${userId}`], {
      message: emitMessage,
      points,
      type,
    })
  }

  return true
}

// ─── Stage progression ─────────────────────────────────────────────────────

/**
 * Count bookings in the referee's practice. Works when the referee is a
 * doctor (bookings on their doctor profile) OR a clinic/hospital owner
 * (bookings of doctors inside hospitals they own).
 */
export async function countRefereeBookings(refereeUserId: string): Promise<number> {
  const asDoctor = await db.doctor.findFirst({
    where: { userId: refereeUserId },
    select: { id: true },
  })

  if (asDoctor) {
    return db.booking.count({ where: { doctorId: asDoctor.id } })
  }

  // Hospital-owner referee: count bookings of doctors in their hospitals
  const hospitals = await db.hospital.findMany({
    where: { userId: refereeUserId },
    select: { id: true },
  })
  if (hospitals.length === 0) return 0

  return db.booking.count({
    where: { doctor: { hospitalId: { in: hospitals.map((h) => h.id) } } },
  })
}

/**
 * Advance a referral's stages based on the referee's live booking count.
 * Idempotent — call freely from booking routes and the referral dashboard.
 * Stage 3 (converted) stays dormant until billing exists.
 */
export async function checkReferralStages(refereeUserId: string): Promise<void> {
  try {
    const referral = await db.referral.findUnique({
      where: { refereeUserId },
    })
    if (!referral || referral.status === 'converted' || referral.status === 'expired') {
      return
    }

    const bookings = await countRefereeBookings(refereeUserId)

    // Stage 1: ACTIVATED — first booking in the referee's practice
    if (referral.status === 'pending' && bookings >= 1) {
      const awarded = await awardPoints({
        userId: referral.referrerUserId,
        type: 'earn_activated',
        points: STAGE_AWARDS.activated,
        refId: referral.id,
        note: 'Referral activated (first booking)',
        emitMessage: `🎉 Aapke referral ne pehla patient book kiya — ${STAGE_AWARDS.activated} points mile!`,
      })
      await db.referral.update({
        where: { id: referral.id },
        data: { status: 'activated', activatedAt: new Date() },
      })
      if (awarded) console.log(`[referral] stage1 awarded (${STAGE_AWARDS.activated}) → ${referral.referrerUserId}`)
    }

    // Stage 2: HABIT — 20+ bookings (sustained practice)
    if (
      (referral.status === 'activated' || referral.status === 'habit') &&
      bookings >= REFERRAL_HABIT_BOOKINGS
    ) {
      const awarded = await awardPoints({
        userId: referral.referrerUserId,
        type: 'earn_habit',
        points: STAGE_AWARDS.habit,
        refId: referral.id,
        note: 'Referral habit milestone (20 bookings)',
        emitMessage: `⚡ Aapka referral ab regular practice ban gaya — ${STAGE_AWARDS.habit} points mile!`,
      })
      if (referral.status !== 'habit') {
        await db.referral.update({
          where: { id: referral.id },
          data: { status: 'habit', habitAt: new Date() },
        })
      }
      if (awarded) console.log(`[referral] stage2 awarded (${STAGE_AWARDS.habit}) → ${referral.referrerUserId}`)
    }
  } catch (err) {
    // Stage checks must NEVER break the calling route (booking creation etc.)
    console.error('[referral] checkReferralStages failed:', err)
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** "Dr. Mehta" → "Dr. M****a" (privacy in the referrer's tracker). */
export function maskName(name: string): string {
  if (!name) return 'New User'
  const parts = name.split(/\s+/)
  const masked = parts
    .map((p) => {
      if (p.length <= 2) return p[0] + '*'
      return p[0] + '*'.repeat(Math.min(p.length - 2, 4)) + p[p.length - 1]
    })
    .join(' ')
  return masked
}

export const STAGE_META: Record<
  string,
  { label: string; badge: string; earned: number }
> = {
  pending: { label: 'Signed Up', badge: '🔔', earned: 0 },
  activated: { label: 'Activated', badge: '✅', earned: STAGE_AWARDS.activated },
  habit: { label: 'Regular Practice', badge: '⚡', earned: STAGE_AWARDS.activated + STAGE_AWARDS.habit },
  converted: {
    label: 'Paid Customer',
    badge: '💳',
    earned: STAGE_AWARDS.activated + STAGE_AWARDS.habit + STAGE_AWARDS.converted,
  },
  expired: { label: 'Expired', badge: '⌛', earned: 0 },
}
