/**
 * Sentry error reporting integration.
 *
 * SECURITY (P4.1): Captures unhandled errors + exceptions in production.
 * In dev mode (no SENTRY_DSN), this module is a no-op — errors go to
 * console.error only.
 *
 * To enable:
 *   1. Sign up at https://sentry.io (free tier: 5,000 errors/month)
 *   2. Create a Next.js project → get the DSN
 *   3. Set SENTRY_DSN in .env
 *   4. Run `npx @sentry/wizard@latest -i nextjs` to auto-wire the SDK
 *      (this will modify next.config.ts + create sentry configs)
 *
 * For now, this stub provides:
 *   - `captureError(error)` — logs to console.error + (when SENTRY_DSN is set)
 *     would forward to Sentry.
 *   - `captureMessage(message, level)` — same pattern.
 *
 * Usage in API routes:
 *   import { captureError } from '@/lib/sentry-stub'
 *   } catch (error) {
 *     captureError('Route name error:', error)
 *     return NextResponse.json({ error: 'Failed' }, { status: 500 })
 *   }
 *
 * Usage in client components:
 *   import { captureError } from '@/lib/sentry-stub'
 *   try { ... } catch (err) { captureError('Component error:', err) }
 */

const SENTRY_DSN = process.env.SENTRY_DSN

export function captureError(context: string, error: unknown): void {
  // Always log to console (visible in dev + captured by server logs in prod)
  console.error(`[sentry/${SENTRY_DSN ? 'prod' : 'dev'}] ${context}:`, error)

  // When Sentry DSN is set, the @sentry/nextjs SDK (installed via wizard)
  // would automatically capture these. For now, we just log.
  // Once `npx @sentry/wizard@latest -i nextjs` is run, this file can be
  // replaced with the auto-generated sentry.client.config.ts etc.
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  const prefix = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log
  prefix(`[sentry/${SENTRY_DSN ? 'prod' : 'dev'}] ${message}`)
}

export function isSentryEnabled(): boolean {
  return !!SENTRY_DSN
}
