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
 *
 * Phase 2 (plan §9): milestone bonuses (5th/10th conversion), conversion +
 * clawback (billing-ready — Razorpay webhook / admin ops), daily jobs
 * (pending-referral expiry, FIFO points-expiry materialization, stage sweep).
 */

import { db } from '@/lib/db'
import { emitNotification } from '@/lib/emit-notification'

// ─── Config ────────────────────────────────────────────────────────────────

export const STAGE_AWARDS = {
  activated: 300,
  habit: 700,
  converted: 1000,
} as const

// ─── A/B reward-size experiment (Phase 3, plan §9) ──────────────────────────

export interface VariantAwards {
  activated: number
  habit: number
  converted: number
  total: number
  label: 'a' | 'b'
}

/** Variant A = 2,000 pts (control) · Variant B = 2,500 pts (+25% reward). */
export const REWARD_VARIANTS: Record<'a' | 'b', VariantAwards> = {
  a: { activated: 300, habit: 700, converted: 1000, total: 2000, label: 'a' },
  b: { activated: 375, habit: 875, converted: 1250, total: 2500, label: 'b' },
}

/** Deterministic 50/50 split — stable across restarts, no migration needed. */
export function hashVariant(userId: string): 'a' | 'b' {
  let h = 0
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) >>> 0
  return h % 2 === 0 ? 'a' : 'b'
}

/**
 * The referrer's experiment variant. Stored on ReferralCode (new codes get it
 * at creation); legacy rows are lazily backfilled from the stable hash.
 */
export async function resolveVariant(userId: string): Promise<'a' | 'b'> {
  const row = await db.referralCode.findUnique({ where: { userId }, select: { variant: true } })
  if (row?.variant === 'a' || row?.variant === 'b') return row.variant
  const v = hashVariant(userId)
  if (row) {
    await db.referralCode
      .update({ where: { userId }, data: { variant: v } })
      .catch(() => {}) // backfill is best-effort
  }
  return v
}

/** Bookings the referee's practice needs for the HABIT stage. */
export const REFERRAL_HABIT_BOOKINGS = 20

/** Days an earn entry stays non-spendable (anti-fraud reversal window). */
export const POINTS_PENDING_DAYS = 15

/** Months until unspent earned points expire. */
export const POINTS_EXPIRY_MONTHS = 18

/** Annual earn cap per user (30 full referrals). */
export const ANNUAL_EARN_CAP = 60_000

/** Days a pending referral (no bookings) survives before auto-expiring. */
export const REFERRAL_PENDING_EXPIRY_DAYS = 90

/** Milestone bonuses — rolling 12-month converted referrals (plan §1.3). */
export const MILESTONE_BONUSES = [
  { conversions: 5, points: 2_000, type: 'earn_milestone_5', label: '5th Conversion Bonus' },
  { conversions: 10, points: 5_000, type: 'earn_milestone_10', label: '10th Conversion — Referral Champion' },
] as const

export interface RedeemItem {
  itemType: string
  title: string
  description: string
  points: number
  cashValue: number
  active: boolean
}

/** Redemption catalog — fully activated in Phase 2 (plan §1.4). */
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
    active: true,
  },
  {
    itemType: 'seat_year',
    title: 'Extra Doctor Seat — 1 Year',
    description: 'Pro plan mein ek aur doctor seat',
    points: 5000,
    cashValue: 2499,
    active: true,
  },
  {
    itemType: 'whatsapp_1000pack',
    title: 'WhatsApp Pack — 1,000 Reminders',
    description: 'Plan limit se zyada reminders',
    points: 1000,
    cashValue: 499,
    active: true,
  },
  {
    itemType: 'hospital_month',
    title: 'Hospital Pro — 1 Month',
    description: 'IPD, OT, insurance — full hospital suite',
    points: 10000,
    cashValue: 4999,
    active: true,
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
        data: { userId, code, variant: hashVariant(userId) },
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

    // A/B reward-size experiment — awards scale with the referrer's variant
    const awards = REWARD_VARIANTS[await resolveVariant(referral.referrerUserId)]

    // Stage 1: ACTIVATED — first booking in the referee's practice
    if (referral.status === 'pending' && bookings >= 1) {
      const awarded = await awardPoints({
        userId: referral.referrerUserId,
        type: 'earn_activated',
        points: awards.activated,
        refId: referral.id,
        note: 'Referral activated (first booking)',
        emitMessage: `🎉 Aapke referral ne pehla patient book kiya — ${awards.activated} points mile!`,
      })
      await db.referral.update({
        where: { id: referral.id },
        data: { status: 'activated', activatedAt: new Date() },
      })
      if (awarded) console.log(`[referral] stage1 awarded (${awards.activated}) → ${referral.referrerUserId}`)
    }

    // Stage 2: HABIT — 20+ bookings (sustained practice)
    if (
      (referral.status === 'activated' || referral.status === 'habit') &&
      bookings >= REFERRAL_HABIT_BOOKINGS
    ) {
      const awarded = await awardPoints({
        userId: referral.referrerUserId,
        type: 'earn_habit',
        points: awards.habit,
        refId: referral.id,
        note: 'Referral habit milestone (20 bookings)',
        emitMessage: `⚡ Aapka referral ab regular practice ban gaya — ${awards.habit} points mile!`,
      })
      if (referral.status !== 'habit') {
        await db.referral.update({
          where: { id: referral.id },
          data: { status: 'habit', habitAt: new Date() },
        })
      }
      if (awarded) console.log(`[referral] stage2 awarded (${awards.habit}) → ${referral.referrerUserId}`)
    }
  } catch (err) {
    // Stage checks must NEVER break the calling route (booking creation etc.)
    console.error('[referral] checkReferralStages failed:', err)
  }
}

// ─── Stage 3: conversion + milestones (Phase 2) ────────────────────────────

/**
 * Mark a referral CONVERTED (referee became a paying customer).
 * Called by the Razorpay webhook on first payment.captured — or manually by
 * an admin (ops tool for payments captured outside the webhook).
 * Idempotent; also fires milestone bonuses (plan §1.3) at exactly the 5th /
 * 10th conversion in a rolling 12-month window.
 */
export async function markReferralConverted(
  refereeUserId: string,
  source = 'billing'
): Promise<{ converted: boolean; already?: boolean; milestoneAwarded?: string | null }> {
  const referral = await db.referral.findUnique({ where: { refereeUserId } })
  if (!referral) return { converted: false }
  if (referral.status === 'converted') return { converted: true, already: true }

  // Catch up stages 1–2 first (an admin may convert a pending referral whose
  // referee already has bookings — those awards must not be lost).
  await checkReferralStages(refereeUserId)
  const fresh = await db.referral.findUnique({ where: { refereeUserId } })
  if (!fresh) return { converted: false }

  const awards = REWARD_VARIANTS[await resolveVariant(fresh.referrerUserId)]

  await awardPoints({
    userId: fresh.referrerUserId,
    type: 'earn_converted',
    points: awards.converted,
    refId: fresh.id,
    note: `Referral converted to paid customer (${source})`,
    emitMessage: `💳 Aapka referral paying customer ban gaya — ${awards.converted} points mile!`,
  })
  await db.referral.update({
    where: { id: fresh.id },
    data: {
      status: 'converted',
      convertedAt: new Date(),
      activatedAt: fresh.activatedAt ?? new Date(),
    },
  })

  // Milestone bonuses — exact-count trigger keeps each milestone once-only
  // (idempotency also enforced via (type, refId) on the triggering referral).
  const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
  const conversions = await db.referral.count({
    where: {
      referrerUserId: fresh.referrerUserId,
      status: 'converted',
      convertedAt: { gte: yearAgo },
    },
  })

  let milestoneAwarded: string | null = null
  for (const m of MILESTONE_BONUSES) {
    if (conversions !== m.conversions) continue
    const awarded = await awardPoints({
      userId: fresh.referrerUserId,
      type: m.type,
      points: m.points,
      refId: fresh.id,
      note: `${m.label} — ${m.conversions} paid referrals in 12 months`,
      emitMessage:
        m.conversions === 10
          ? `🏆 Aap ban gaye REFERRAL CHAMPION — ${m.points} bonus points mile!`
          : `🏆 ${m.label}! ${m.points} bonus points mile!`,
    })
    if (awarded) milestoneAwarded = m.label
  }

  console.log(
    `[referral] converted (${source}) referee=${refereeUserId} referrer=${fresh.referrerUserId} (12-mo conversions: ${conversions}${milestoneAwarded ? `, milestone: ${milestoneAwarded}` : ''})`
  )
  return { converted: true, milestoneAwarded }
}

/**
 * Reverse the conversion award when a referee takes the 60-day-guarantee
 * refund (plan §1.1 clawback). The ledger may go negative — future earnings
 * offset it first, and the catalog's spendable check blocks redemptions
 * while negative. Idempotent per referral; a later re-conversion does NOT
 * re-award stage 3 (conservative anti-fraud, one shot per referral).
 */
export async function applyClawback(
  refereeUserId: string,
  reason = 'refund'
): Promise<{ clawedBack: boolean }> {
  const referral = await db.referral.findUnique({ where: { refereeUserId } })
  if (!referral || referral.status !== 'converted') return { clawedBack: false }

  const awards = REWARD_VARIANTS[await resolveVariant(referral.referrerUserId)]
  const done = await awardPoints({
    userId: referral.referrerUserId,
    type: 'clawback',
    points: -awards.converted,
    refId: referral.id,
    note: `Clawback: conversion award reversed (${reason})`,
    emitMessage: `⚠️ Referee refund process hua — ${awards.converted} points reverse kiye gaye.`,
  })
  // Downgrade status back to the highest stage actually earned.
  await db.referral.update({
    where: { id: referral.id },
    data: { status: referral.habitAt ? 'habit' : 'activated', convertedAt: null },
  })
  if (done) {
    console.log(`[referral] clawback (-${awards.converted}) referee=${refereeUserId} (${reason})`)
  }
  return { clawedBack: done }
}

// ─── Daily jobs (Phase 2 — run via /api/cron/referral-daily) ──────────────

export interface DailyJobsResult {
  ranAt: string
  /** pending referrals > 90 days auto-expired */
  expiredReferrals: number
  /** distinct users whose stale points got materialized */
  usersSwept: number
  /** 'expire' ledger rows written */
  expiredPointsEntries: number
  /** total points expired */
  expiredPoints: number
  /** referrals re-checked for stage progression */
  stageSweeps: number
}

interface FifoLot {
  entryId: string
  remaining: number
  expiresAt: Date | null
}

/**
 * Replay a user's ledger chronologically to compute remaining earn "lots"
 * after all spends consumed them FIFO (oldest-expiring first).
 * Materialized 'expire' entries zero their source lot, so partially-spent
 * lots are never double-deducted on re-runs.
 */
async function replayFifoLots(userId: string): Promise<FifoLot[]> {
  const entries = await db.pointsLedger.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: { id: true, type: true, points: true, refId: true, expiresAt: true },
    take: 2000,
  })

  const lots = new Map<string, FifoLot>()
  const consume = (amountIn: number) => {
    let amount = amountIn
    const byExpiry = [...lots.values()].sort((a, b) => {
      const ea = a.expiresAt ? a.expiresAt.getTime() : Number.MAX_SAFE_INTEGER
      const eb = b.expiresAt ? b.expiresAt.getTime() : Number.MAX_SAFE_INTEGER
      return ea - eb
    })
    for (const lot of byExpiry) {
      if (amount <= 0) break
      const take = Math.min(lot.remaining, amount)
      lot.remaining -= take
      amount -= take
    }
  }

  for (const e of entries) {
    if (e.points > 0) {
      lots.set(e.id, { entryId: e.id, remaining: e.points, expiresAt: e.expiresAt })
    } else if (e.type === 'expire' && e.refId) {
      // Already-materialized expiry — the source lot is gone.
      const lot = lots.get(e.refId)
      if (lot) lot.remaining = 0
    } else {
      consume(-e.points)
    }
  }
  return [...lots.values()].filter((l) => l.remaining > 0)
}

/**
 * Daily maintenance — idempotent, safe to re-run any time (plan §4 cron):
 *  a) auto-expire pending referrals older than 90 days (edge case §10)
 *  b) FIFO points-expiry materialization: unspent lots past their 18-month
 *     validity get an 'expire' ledger row so users see WHY balance dropped
 *  c) sweep active referrals for missed stage progressions
 */
export async function runDailyReferralJobs(): Promise<DailyJobsResult> {
  const now = new Date()

  // (a) pending referrals that never activated
  const pendingCutoff = new Date(
    now.getTime() - REFERRAL_PENDING_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  )
  const expired = await db.referral.updateMany({
    where: { status: 'pending', createdAt: { lt: pendingCutoff } },
    data: { status: 'expired', expiredAt: now },
  })

  // (b) FIFO expiry materialization — per-user replay, so only truly-unspent
  // amounts expire (partial redemptions are never double-deducted)
  const staleUsers = await db.pointsLedger.groupBy({
    by: ['userId'],
    where: { points: { gt: 0 }, expiresAt: { lte: now } },
    orderBy: { userId: 'asc' },
    take: 100,
  })
  let expiredPointsEntries = 0
  let expiredPoints = 0
  for (const u of staleUsers) {
    const lots = await replayFifoLots(u.userId)
    for (const lot of lots) {
      if (!lot.expiresAt || lot.expiresAt > now || lot.remaining <= 0) continue
      const done = await awardPoints({
        userId: u.userId,
        type: 'expire',
        points: -lot.remaining,
        refId: lot.entryId,
        note: `${lot.remaining} points expire ho gaye (18-month validity khatam)`,
      })
      if (done) {
        expiredPointsEntries++
        expiredPoints += lot.remaining
      }
    }
  }

  // (c) stage sweep — catches habit progressions for referees whose bookings
  // bypassed the booking-route hook (imported data, manual fixes etc.)
  const active = await db.referral.findMany({
    where: { status: { in: ['pending', 'activated'] } },
    select: { refereeUserId: true },
    take: 500,
  })
  for (const r of active) {
    await checkReferralStages(r.refereeUserId)
  }

  const result: DailyJobsResult = {
    ranAt: now.toISOString(),
    expiredReferrals: expired.count,
    usersSwept: staleUsers.length,
    expiredPointsEntries,
    expiredPoints,
    stageSweeps: active.length,
  }
  console.log(`[referral] daily jobs: ${JSON.stringify(result)}`)
  return result
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

/** Variant-aware stage meta (A/B experiment) — B's totals are 25% higher. */
export function stageMetaFor(variant: 'a' | 'b'): Record<
  string,
  { label: string; badge: string; earned: number }
> {
  const v = REWARD_VARIANTS[variant]
  return {
    pending: { label: 'Signed Up', badge: '🔔', earned: 0 },
    activated: { label: 'Activated', badge: '✅', earned: v.activated },
    habit: { label: 'Regular Practice', badge: '⚡', earned: v.activated + v.habit },
    converted: { label: 'Paid Customer', badge: '💳', earned: v.total },
    expired: { label: 'Expired', badge: '⌛', earned: 0 },
  }
}

/**
 * Top referrers leaderboard (public — masked names only).
 * Ranked by earned referral points; every entry must have ≥1 referral.
 */
export async function getLeaderboard(limit = 20) {
  const EARNS = ['earn_activated', 'earn_habit', 'earn_converted', 'earn_milestone_5', 'earn_milestone_10']
  const [earnRows, refRows, convertedRows, championRows] = await Promise.all([
    db.pointsLedger.groupBy({
      by: ['userId'],
      where: { points: { gt: 0 }, type: { in: EARNS } },
      _sum: { points: true },
    }),
    db.referral.groupBy({ by: ['referrerUserId'], _count: { _all: true } }),
    db.referral.groupBy({
      by: ['referrerUserId'],
      where: { status: 'converted' },
      _count: { _all: true },
    }),
    db.pointsLedger.groupBy({
      by: ['userId'],
      where: { type: 'earn_milestone_10' },
    }),
  ])

  const earnedMap = new Map(earnRows.map((r) => [r.userId, r._sum.points ?? 0]))
  const referralCountMap = new Map(refRows.map((r) => [r.referrerUserId, r._count._all]))
  const convertedMap = new Map(convertedRows.map((r) => [r.referrerUserId, r._count._all]))
  const championSet = new Set(championRows.map((r) => r.userId))

  // Must have actually referred someone to be on the board
  const candidates = [...referralCountMap.keys()]
    .map((userId) => ({
      userId,
      points: earnedMap.get(userId) ?? 0,
      referrals: referralCountMap.get(userId) ?? 0,
      conversions: convertedMap.get(userId) ?? 0,
    }))
    .sort((a, b) => b.points - a.points || b.referrals - a.referrals)
    .slice(0, limit)

  if (candidates.length === 0) return []

  // Display info: masked name + specialty + city (best-effort, public-safe)
  const users = await db.user.findMany({
    where: { id: { in: candidates.map((c) => c.userId) } },
    select: { id: true, name: true },
  })
  const doctors = await db.doctor.findMany({
    where: { userId: { in: candidates.map((c) => c.userId) } },
    select: { userId: true, specialization: true, city: true },
  })
  const nameMap = new Map(users.map((u) => [u.id, u.name]))
  const docMap = new Map(doctors.map((d) => [d.userId, d]))

  return candidates.map((c, i) => ({
    rank: i + 1,
    name: maskName(nameMap.get(c.userId) ?? 'Doctor'),
    specialty: docMap.get(c.userId)?.specialization || null,
    city: docMap.get(c.userId)?.city || null,
    points: c.points,
    referrals: c.referrals,
    conversions: c.conversions,
    champion: championSet.has(c.userId),
  }))
}
