/**
 * Redis client — graceful fallback to null when not configured.
 *
 * SECURITY (P5.2): Used for:
 *   - Rate limiting (shared across server instances)
 *   - Session cache (fast lookup without DB hit)
 *   - OTP cache (fast lookup without DB hit)
 *
 * When REDIS_URL is not set, this module returns null and all callers
 * fall back to their in-memory implementations (rate-limit.ts Map,
 * otp-store.ts DB queries, session.ts DB queries).
 *
 * To enable Redis:
 *   1. Provision a Redis instance (Upstash, Redis Cloud, self-hosted)
 *   2. Set REDIS_URL=redis://localhost:6379 (or rediss:// for TLS)
 *   3. Restart the server — all rate-limit/OTP/session lookups will
 *      automatically use Redis instead of in-memory/DB.
 */

import Redis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL

let redisClient: Redis | null = null

/**
 * Get the Redis client singleton, or null if Redis is not configured.
 * Callers should check `if (redis)` before using.
 */
export function getRedis(): Redis | null {
  if (!REDIS_URL) return null

  if (!redisClient) {
    try {
      redisClient = new Redis(REDIS_URL, {
        // Connection settings
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy: (times) => Math.min(times * 200, 2000), // Backoff up to 2s
        // TLS for rediss:// URLs (Upstash, Redis Cloud)
        tls: REDIS_URL.startsWith('rediss://') ? {} : undefined,
        // Lazy connect — don't block server startup if Redis is slow
        lazyConnect: false,
        // Auto-resubscribe after reconnect
        autoResubscribe: true,
      })

      redisClient.on('error', (err) => {
        console.error('[redis] Connection error:', err.message)
      })

      redisClient.on('connect', () => {
        console.log('[redis] Connected to Redis')
      })

      redisClient.on('reconnecting', () => {
        console.log('[redis] Reconnecting...')
      })
    } catch (err) {
      console.error('[redis] Failed to initialize:', err)
      redisClient = null
    }
  }

  return redisClient
}

/**
 * Check if Redis is available (configured + connected).
 */
export function isRedisAvailable(): boolean {
  return !!REDIS_URL && !!redisClient
}

/**
 * Wrapper for Redis INCR + EXPIRE (rate limiting pattern).
 * Returns the count after increment, or -1 if Redis is unavailable.
 */
export async function redisRateLimit(
  key: string,
  windowMs: number
): Promise<{ count: number; resetAt: number } | null> {
  const redis = getRedis()
  if (!redis) return null

  try {
    const count = await redis.incr(key)
    // Set expiry only on first increment (count === 1)
    if (count === 1) {
      await redis.pexpire(key, windowMs)
    }
    const ttl = await redis.pttl(key)
    return {
      count,
      resetAt: Date.now() + (ttl > 0 ? ttl : windowMs),
    }
  } catch (err) {
    console.error('[redis] rate limit failed:', err)
    return null
  }
}

/**
 * Wrapper for Redis GET + SET (session/OTP cache pattern).
 * Returns null if Redis is unavailable or key doesn't exist.
 */
export async function redisGet<T>(key: string): Promise<T | null> {
  const redis = getRedis()
  if (!redis) return null

  try {
    const value = await redis.get(key)
    if (!value) return null
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

/**
 * Wrapper for Redis SET with TTL.
 * Returns false if Redis is unavailable.
 */
export async function redisSet(
  key: string,
  value: unknown,
  ttlMs: number
): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return false

  try {
    await redis.set(key, JSON.stringify(value), 'PX', ttlMs)
    return true
  } catch {
    return false
  }
}

/**
 * Wrapper for Redis DEL.
 */
export async function redisDel(key: string): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return false

  try {
    await redis.del(key)
    return true
  } catch {
    return false
  }
}
