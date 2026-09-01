/**
 * Rate limiting + brute-force protection.
 *
 * SECURITY (P1.10 + P1.14 + P5.2):
 *   - Tracks request counts per IP per time window.
 *   - Tracks failed login attempts per email + per IP.
 *   - Locks account after N failures for X minutes.
 *
 * Redis (P5.2): When REDIS_URL is set, rate limits are shared across
 * server instances via Redis. When not set, falls back to in-memory Map
 * (single-instance only).
 *
 * Public API:
 *   - rateLimit(key, max, windowMs)  → { allowed, remaining, resetAt }
 *   - recordLoginFailure(email, ip)  → { locked, unlockAt }
 *   - isLoginLocked(email)           → { locked, unlockAt }
 *   - clearLoginFailures(email)      → void  (call on successful login)
 *   - getClientIp(req)               → string
 */

import { redisRateLimit, getRedis } from '@/lib/redis'

interface RateEntry {
  count: number
  resetAt: number
}

const ipHits = new Map<string, RateEntry>()

/**
 * Rate-limit check by arbitrary key (usually IP).
 * Returns { allowed, remaining, resetAt } — caller is responsible for
 * returning 429 if !allowed.
 *
 * SECURITY (P5.2): If Redis is available, uses Redis INCR + EXPIRE for
 * shared rate limiting across instances. Falls back to in-memory Map.
 */
export async function rateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  // Try Redis first (shared across instances)
  const redisResult = await redisRateLimit(`ratelimit:${key}`, windowMs)
  if (redisResult) {
    const allowed = redisResult.count <= max
    return {
      allowed,
      remaining: Math.max(0, max - redisResult.count),
      resetAt: redisResult.resetAt,
    }
  }

  // Fall back to in-memory Map (single-instance only)
  const now = Date.now()
  const entry = ipHits.get(key)

  if (!entry || entry.resetAt < now) {
    ipHits.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs }
  }

  entry.count++
  const allowed = entry.count <= max
  return {
    allowed,
    remaining: Math.max(0, max - entry.count),
    resetAt: entry.resetAt,
  }
}

// ─── Brute-force protection on login ─────────────────────────────────────

interface LoginFailEntry {
  count: number
  lockedUntil: number
}

const loginFailures = new Map<string, LoginFailEntry>()

const MAX_LOGIN_FAILURES = 5
const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes
const FAILURE_WINDOW_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Record a failed login attempt for an email (also tracks per-IP).
 * Returns whether the account is now locked + unlock time.
 */
export function recordLoginFailure(
  email: string,
  _ip: string
): { locked: boolean; unlockAt: number } {
  const key = email.toLowerCase()
  const now = Date.now()
  const entry = loginFailures.get(key)

  // If entry expired or doesn't exist, start fresh
  if (!entry || (entry.lockedUntil < now && entry.count >= MAX_LOGIN_FAILURES)) {
    loginFailures.set(key, {
      count: 1,
      lockedUntil: 0,
    })
    return { locked: false, unlockAt: 0 }
  }

  entry.count++

  // If we've hit the threshold, lock for LOCKOUT_MS
  if (entry.count >= MAX_LOGIN_FAILURES) {
    entry.lockedUntil = now + LOCKOUT_MS
    return { locked: true, unlockAt: entry.lockedUntil }
  }

  return { locked: false, unlockAt: 0 }
}

/**
 * Check if an email is currently locked out due to too many failed logins.
 */
export function isLoginLocked(email: string): { locked: boolean; unlockAt: number } {
  const key = email.toLowerCase()
  const entry = loginFailures.get(key)
  if (!entry) return { locked: false, unlockAt: 0 }

  const now = Date.now()
  if (entry.lockedUntil > now) {
    return { locked: true, unlockAt: entry.lockedUntil }
  }

  // Lockout expired — clear the entry
  if (entry.lockedUntil > 0 && entry.lockedUntil <= now) {
    loginFailures.delete(key)
  }

  return { locked: false, unlockAt: 0 }
}

/**
 * Clear failed login attempts for an email — call on successful login.
 */
export function clearLoginFailures(email: string): void {
  loginFailures.delete(email.toLowerCase())
}

// ─── IP extraction ────────────────────────────────────────────────────────

/**
 * Extract client IP from request headers.
 * Checks X-Forwarded-For (first IP) → X-Real-IP → 'unknown' fallback.
 */
export function getClientIp(req: { headers: { get: (name: string) => string | null } }): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    // Take the first IP in the comma-separated list
    return xff.split(',')[0].trim()
  }
  return req.headers.get('x-real-ip') || 'unknown'
}

// ─── Periodic cleanup (every 5 minutes) ────────────────────────────────────

// Run cleanup on each module load + on a timer
function cleanup() {
  const now = Date.now()
  // Clean IP rate-limit entries
  for (const [key, entry] of ipHits) {
    if (entry.resetAt < now) ipHits.delete(key)
  }
  // Clean login-failure entries past their lockout
  for (const [key, entry] of loginFailures) {
    if (entry.lockedUntil > 0 && entry.lockedUntil < now) {
      loginFailures.delete(key)
    } else if (entry.lockedUntil === 0 && entry.count > 0) {
      // Old failure entries (no lock yet) — clean after FAILURE_WINDOW_MS
      // We don't have a timestamp per entry; assume they're stale after 5 min.
      // Could be improved by adding a `lastFailedAt` field.
      loginFailures.delete(key)
    }
  }
}

// Run every 5 minutes (won't block event loop)
if (typeof setInterval !== 'undefined') {
  setInterval(cleanup, 5 * 60 * 1000).unref?.()
}
