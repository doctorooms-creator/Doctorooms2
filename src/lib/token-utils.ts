/**
 * OPD Token generation — race-condition safe via serializable transaction.
 * Even if 10 receptionists click simultaneously, no duplicate tokens.
 *
 * Future-date token fix (CTO Plan Phase 2, item 2e): the counter window is
 * the IST day of the booking's OWN date (optional 3rd arg, default = today
 * IST). A tomorrow-dated booking now consumes tomorrow's counter instead of
 * today's.
 */

import { db } from './db'
import { istDateRange, istDateStrFromDate } from './date-utils'
import { Prisma } from '@prisma/client'

const MAX_RETRIES = 5

/**
 * Tx-aware core: computes the next OPD token for the given doctor using the
 * caller's transaction client. MUST NOT open a (nested) transaction — it runs
 * inside the caller's Serializable transaction so the counter read + the
 * booking create are serialized together (race-safe slot/token claims).
 *
 * Emergency bookings (CTO Plan Phase 4, "Queue Resilience"): pass
 * `{ emergency: true }` to stamp an `EMR-00X` token instead of the department
 * prefix. The ORDER still comes from the SAME per-doctor-per-day counter
 * (EMR-004 = the doctor's 4th booking of the day) — only the printed prefix
 * changes, so queue positions stay consistent with regular bookings.
 */
export async function generateTokenNumberTx(
  tx: Prisma.TransactionClient,
  doctorId: string,
  departmentId: string,
  bookingDate?: Date | string,
  options?: { emergency?: boolean }
): Promise<{
  tokenNumber: string
  tokenOrder: number
}> {
  // The booking's OWN date decides the counter window (IST day boundaries).
  const { start: startOfDay, end: endOfDay } = istDateRange(
    istDateStrFromDate(bookingDate ?? new Date())
  )

  const dept = await tx.department.findUnique({
    where: { id: departmentId },
    select: { shortCode: true },
  })
  // Emergencies always print the fixed EMR- prefix regardless of department;
  // regular bookings keep the department shortCode (e.g. GEN-001).
  const prefix = options?.emergency ? 'EMR' : dept?.shortCode || 'OPD'

  const maxTokenOrder = await tx.booking.aggregate({
    where: {
      doctorId,
      bookingDate: { gte: startOfDay, lte: endOfDay },
      tokenOrder: { gt: 0 },
    },
    _max: { tokenOrder: true },
  })

  const tokenOrder = (maxTokenOrder._max.tokenOrder || 0) + 1
  const tokenNumber = `${prefix}-${String(tokenOrder).padStart(3, '0')}`
  return { tokenNumber, tokenOrder }
}

/**
 * Run `fn` inside ONE Serializable transaction, retrying up to MAX_RETRIES
 * times on write-conflict aborts (Prisma P2034 / SQLite busy) with jitter.
 * `fn` must NOT open a nested transaction — use the tx client it receives.
 */
export async function withSerializableTx<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  let lastError: unknown = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await db.$transaction(fn, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      })
    } catch (error) {
      lastError = error
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 50))
        continue
      }
      throw error
    }
  }
  throw new Error(`Serializable transaction failed after ${MAX_RETRIES} retries: ${lastError}`)
}

/**
 * Public wrapper — Serializable transaction + P2034 retry ×5 with jitter.
 * Existing callers (no 3rd arg) keep today-IST behavior; future-dated
 * bookings pass their own bookingDate so they consume the right counter.
 * Pass `{ emergency: true }` as the 4th arg to stamp an EMR- token.
 */
export async function generateTokenNumber(
  doctorId: string,
  departmentId: string,
  bookingDate?: Date | string,
  options?: { emergency?: boolean }
): Promise<{
  tokenNumber: string
  tokenOrder: number
}> {
  return withSerializableTx((tx) =>
    generateTokenNumberTx(tx, doctorId, departmentId, bookingDate, options)
  )
}

/**
 * Centralized token stamping (PDF-audit fix, Issue 3): EVERY path that moves
 * a booking into 'Approve' must leave it with a queue token — walk-in POST,
 * Pending-Bookings /approve, Appointments-page /status, and the doctor-side
 * status route all funnel through here. Idempotent: bookings that already
 * carry a token are returned untouched. The counter window is the booking's
 * OWN date (future-dated bookings consume their own day's counter).
 *
 * Department resolution mirrors the /approve route: use the stamped
 * departmentId when present, else the doctor's primary Active hospital link
 * (clinic bookings get e.g. GEN → SHARMA-0XX via their doctor's link).
 * Returns null only when no department can be resolved (no Active link) —
 * callers treat that as "token still pending" rather than failing the
 * approval itself.
 */
export async function ensureBookingToken(booking: {
  id: string
  doctorId: string
  departmentId?: string | null
  hospitalId?: string | null
  bookingDate: Date
  tokenNumber?: string | null
  tokenOrder?: number | null
  isEmergency?: boolean | null
}): Promise<{ tokenNumber: string; tokenOrder: number } | null> {
  if (booking.tokenNumber && (booking.tokenOrder ?? 0) > 0) return null

  let departmentId = booking.departmentId || undefined
  if (!booking.hospitalId || !departmentId) {
    const primaryLink = await db.doctorHospital.findFirst({
      where: { doctorId: booking.doctorId, status: 'Active' },
      orderBy: { createdAt: 'asc' },
      select: { departmentId: true },
    })
    if (!primaryLink?.departmentId) return null
    departmentId = departmentId || primaryLink.departmentId
  }
  if (!departmentId) return null

  const token = await generateTokenNumber(
    booking.doctorId,
    departmentId,
    booking.bookingDate,
    { emergency: !!booking.isEmergency }
  )
  await db.booking.update({
    where: { id: booking.id },
    data: { tokenNumber: token.tokenNumber, tokenOrder: token.tokenOrder },
  })
  return token
}
