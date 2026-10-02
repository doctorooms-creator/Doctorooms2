/**
 * Session management utilities.
 * Uses DB-persisted random tokens (not JWTs) so sessions can be revoked.
 * A short-lived JWT is also issued for Edge middleware verification (which
 * can't access the DB) — the JWT only protects route access; all API routes
 * still verify the DB token for full security.
 */

import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const JWT_DURATION_S = 7 * 24 * 60 * 60 // 7 days in seconds

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (secret) return secret

  // Dev sandbox fallback: if NEXTAUTH_SECRET is missing (e.g. .env was reset by
  // the sandbox's /start.sh), use a hardcoded dev secret. This is ONLY safe
  // because NODE_ENV is never 'production' in the dev sandbox. In production,
  // the missing secret would still throw (correct behavior — forces explicit config).
  if (process.env.NODE_ENV !== 'production') {
    return 'dev-only-fallback-secret-REPLACE-IN-PRODUCTION'
  }

  throw new Error(
    'NEXTAUTH_SECRET environment variable is required. ' +
    'Generate one with: openssl rand -hex 32'
  )
}

/** Create a random 64-char hex session token */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/** Create a session in the DB + return the token + a short-lived JWT for middleware */
export async function createSession(opts: {
  userId: string
  role: string
  ipAddress?: string
  userAgent?: string
}): Promise<{ token: string; jwt: string; expiresAt: Date }> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

  await db.session.create({
    data: {
      token,
      userId: opts.userId,
      expiresAt,
      ipAddress: opts.ipAddress || '',
      userAgent: opts.userAgent || '',
    },
  })

  // JWT carries {userId, role, token} so middleware can verify without DB access.
  const jwtToken = jwt.sign(
    { userId: opts.userId, role: opts.role, token },
    getSecret(),
    { expiresIn: JWT_DURATION_S }
  )

  return { token, jwt: jwtToken, expiresAt }
}

/** Verify a session token against the DB. Returns the user or null. */
export async function verifySession(token: string) {
  if (!token) return null

  try {
    const session = await db.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session) return null
    if (session.revokedAt) return null
    if (session.expiresAt < new Date()) return null
    if (session.user.status !== 'Active') return null

    return {
      user: session.user,
      session,
    }
  } catch {
    return null
  }
}

/** Revoke a session (logout) */
export async function revokeSession(token: string): Promise<void> {
  if (!token) return
  try {
    await db.session.updateMany({
      where: { token, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  } catch {
    // ignore
  }
}

/** Verify a JWT (for Edge middleware + API routes). Returns the full payload. */
export function verifyJwt(token: string): { userId: string; role: string; sessionToken: string } | null {
  try {
    const payload = jwt.verify(token, getSecret()) as { userId: string; role: string; token?: string }
    return { userId: payload.userId, role: payload.role, sessionToken: payload.token || '' }
  } catch {
    return null
  }
}

// ─── Email Verification Token (separate from session JWT) ─────────────────
// SECURITY (P2.7): Used by the email verification flow.
// Token is a JWT carrying { userId, purpose: 'email-verify', exp: 24h }.

const EMAIL_VERIFY_DURATION_S = 24 * 60 * 60 // 24 hours

/** Sign a short-lived JWT for email verification (24h expiry). */
export function signEmailVerificationToken(userId: string): string {
  return jwt.sign(
    { userId, purpose: 'email-verify' },
    getSecret(),
    { expiresIn: EMAIL_VERIFY_DURATION_S }
  )
}

/** Verify an email-verification JWT. Returns userId or null. */
export function verifyEmailVerificationToken(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, getSecret()) as { userId?: string; purpose?: string }
    if (payload.userId && payload.purpose === 'email-verify') {
      return { userId: payload.userId }
    }
    return null
  } catch {
    return null
  }
}
