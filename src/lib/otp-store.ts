/**
 * OTP store — DB-persisted.
 *
 * SECURITY (P2.6): Previously in-memory Map — OTPs were lost on server restart
 * + not shared across instances. Now stored in the `OtpCode` table.
 *
 * OTPs are hashed with bcrypt (10 rounds) before storing — never in plain text.
 * Generation uses `crypto.randomInt()` (cryptographically secure, not Math.random()).
 * 5-minute expiry + max 5 attempts before the OTP is deleted.
 */

import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const OTP_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes
const MAX_ATTEMPTS = 5

/**
 * Generate a 6-digit OTP for the given email + persist its hash in the DB.
 * Returns the OTP in plain text (the caller is responsible for sending it via
 * email/SMS — never log this to console.log).
 *
 * Any previous unverified OTP for this email is deleted first (only one active
 * OTP per email at a time).
 */
export async function generateOTP(email: string): Promise<string> {
  // Delete any previous unverified OTP for this email
  await db.otpCode.deleteMany({
    where: { email: email.toLowerCase(), verified: false },
  })

  // Generate a 6-digit cryptographically secure OTP
  const otp = String(crypto.randomInt(100000, 1000000))
  const codeHash = await bcrypt.hash(otp, 10)

  await db.otpCode.create({
    data: {
      email: email.toLowerCase(),
      codeHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    },
  })

  return otp
}

/**
 * Verify the OTP for the given email.
 * Returns true if the OTP matches + is not expired + hasn't exceeded max attempts.
 * On success, marks the OTP as verified (so it can't be reused).
 * On failure, increments the attempts counter; after MAX_ATTEMPTS, deletes the OTP.
 */
export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  const entry = await db.otpCode.findFirst({
    where: {
      email: email.toLowerCase(),
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!entry) {
    return false
  }

  // Check attempts — if already exceeded, delete the OTP + return false
  if (entry.attempts >= MAX_ATTEMPTS) {
    await db.otpCode.delete({ where: { id: entry.id } })
    return false
  }

  // Compare the supplied OTP against the stored hash
  const isMatch = await bcrypt.compare(otp, entry.codeHash)
  if (!isMatch) {
    // Increment attempts; delete if exceeded
    const newAttempts = entry.attempts + 1
    if (newAttempts >= MAX_ATTEMPTS) {
      await db.otpCode.delete({ where: { id: entry.id } })
    } else {
      await db.otpCode.update({
        where: { id: entry.id },
        data: { attempts: newAttempts },
      })
    }
    return false
  }

  // Success — mark as verified so it can't be reused
  await db.otpCode.update({
    where: { id: entry.id },
    data: { verified: true },
  })

  return true
}

/**
 * Returns true if an OTP has been verified for this email (within the expiry window).
 * Used by the reset-password route as a precondition — must be true before allowing
 * the password change.
 */
export async function isOtpVerified(email: string): Promise<boolean> {
  const entry = await db.otpCode.findFirst({
    where: {
      email: email.toLowerCase(),
      verified: true,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })
  return !!entry
}

/**
 * Clear verified OTPs for an email — called after a successful password reset
 * so the same OTP can't be used twice.
 */
export async function clearOtp(email: string): Promise<void> {
  await db.otpCode.deleteMany({
    where: { email: email.toLowerCase() },
  })
}

/**
 * Cleanup expired OTPs — call periodically (e.g. via a cron or on each call).
 * For now, called inline by generateOTP (deletes previous unverified entries).
 * A full cron-based purge is a Phase 4 task.
 */
export async function purgeExpiredOtps(): Promise<number> {
  const result = await db.otpCode.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })
  return result.count
}
