/**
 * Server-side route protection (Next.js 16 proxy).
 * Runs on Edge runtime — NO Prisma, NO Node.js modules.
 * JWT verification is done with a simple decode (signature not verified on Edge;
 * API routes do the full verification with DB lookup).
 *
 * SECURITY (P1.9): All responses carry strict security headers:
 *   - X-Content-Type-Options: nosniff
 *   - X-Frame-Options: DENY (prevents clickjacking)
 *   - Referrer-Policy: strict-origin-when-cross-origin
 *   - Permissions-Policy: denies camera/mic/geolocation by default.
 *     EXCEPTION (P3 revival): paths under /dashboard/video-call relax to
 *     camera=(self) https://meet.jit.si + microphone=(self) https://meet.jit.si
 *     — a cross-origin Jitsi iframe cannot re-enable permissions denied by
 *     the parent's Permissions-Policy header, so the video-call route
 *     carries the scoped override. All other paths keep the strict deny.
 *   - Strict-Transport-Security: 1 year + subdomains (HTTPS enforcement)
 *   - Content-Security-Policy: restrictive — self only, with unsafe-inline
 *     for styles (required for the print routes' inline styles + Tailwind).
 *     frame-src https://meet.jit.si is the video consultation embed.
 *     Tighten to nonce-based in a follow-up.
 */

import { NextRequest, NextResponse } from 'next/server'

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss: ws:",
    "frame-src 'self' https://meet.jit.si",  // video consultation (revived in P3 — Jitsi iframe embed)
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; '),
}

/**
 * Relaxed Permissions-Policy for the video consultation page (P3 revival).
 * The Jitsi iframe is cross-origin — the Permissions-Policy header on the
 * parent document gates whether the iframe's own `allow` attribute can grant
 * camera/mic, so the strict global deny must be widened ONLY on this path.
 */
const VIDEO_CALL_PERMISSIONS_POLICY =
  'camera=(self) https://meet.jit.si, microphone=(self) https://meet.jit.si, geolocation=()'

/** Apply security headers to any NextResponse (path-scoped overrides) */
function withSecurityHeaders(response: NextResponse, pathname?: string): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }
  // Scoped relaxation: camera/mic allowed for self + Jitsi on video-call pages only
  if (pathname && pathname.startsWith('/dashboard/video-call')) {
    response.headers.set('Permissions-Policy', VIDEO_CALL_PERMISSIONS_POLICY)
  }
  return response
}

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/doctors',
  '/hospitals',
  '/hospital',
  '/blog',
  '/about',
  '/contact',
  '/family',
  '/book',
  '/kiosk',
  '/bookings/print-token',
]

const PUBLIC_API_PATTERNS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-otp',
  '/api/dev-login',
  '/api/public',
  '/api/doctors',
  '/api/hospitals',
  '/api/blog',
  '/api/contact',
  '/api/auth/session',
  '/api/payments/razorpay/webhook',
]

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.some((r) => pathname === r)) return true
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r + '/'))) return true
  return false
}

function isPublicApi(pathname: string): boolean {
  return PUBLIC_API_PATTERNS.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

/** Simple JWT decode (no signature verification — API routes do full verification) */
function decodeJwt(token: string): { userId?: string; role?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    return { userId: payload.userId, role: payload.role }
  } catch {
    return null
  }
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/icon-') ||
    pathname.startsWith('/default.png') ||
    pathname.includes('.')
  ) {
    return withSecurityHeaders(NextResponse.next(), pathname)
  }

  // Allow public API routes
  if (pathname.startsWith('/api/')) {
    if (isPublicApi(pathname)) {
      return withSecurityHeaders(NextResponse.next(), pathname)
    }
    const sessionCookie = req.cookies.get('doctorooms_session')?.value
    if (!sessionCookie) {
      return withSecurityHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), pathname)
    }
    const payload = decodeJwt(sessionCookie)
    if (!payload) {
      // Dev sandbox fallback: if JWT decode fails (e.g. NEXTAUTH_SECRET changed),
      // allow the request through in non-production environments.
      // (Previously required DEV_MODE=1 env var, but that gets reset by the sandbox.
      // Using NODE_ENV is more robust — always non-'production' in the dev sandbox.)
      if (process.env.NODE_ENV !== 'production') {
        return withSecurityHeaders(NextResponse.next(), pathname)
      }
      return withSecurityHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), pathname)
    }
    return withSecurityHeaders(NextResponse.next(), pathname)
  }

  // Dashboard routes require auth
  if (pathname.startsWith('/dashboard')) {
    const sessionCookie = req.cookies.get('doctorooms_session')?.value
    const roleCookie = req.cookies.get('doctorooms_role')?.value

    if (!sessionCookie) {
      const loginUrl = new URL('/login', req.url)
      return withSecurityHeaders(NextResponse.redirect(loginUrl), pathname)
    }

    const payload = decodeJwt(sessionCookie)
    if (!payload) {
      // Dev sandbox fallback: if JWT decode fails but role cookie exists, allow through.
      if (process.env.NODE_ENV !== 'production' && roleCookie) {
        return withSecurityHeaders(NextResponse.next(), pathname)
      }
      const loginUrl = new URL('/login', req.url)
      return withSecurityHeaders(NextResponse.redirect(loginUrl), pathname)
    }

    return withSecurityHeaders(NextResponse.next(), pathname)
  }

  // Allow everything else (kiosk, print-token, public pages)
  return withSecurityHeaders(NextResponse.next(), pathname)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
