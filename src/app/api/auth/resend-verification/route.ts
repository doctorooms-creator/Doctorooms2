import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { signEmailVerificationToken } from '@/lib/session'
import { sendVerificationEmail } from '@/lib/email'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

/**
 * POST /api/auth/resend-verification
 *   Resends the email verification email.
 *   Body: { email: string }
 *   Returns the same response whether the email exists or not (no user enumeration).
 *   Rate-limited: 3 per minute per IP.
 */
export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req)
  // SECURITY (P1.10): Rate-limit to prevent abuse.
  const rl = await rateLimit(`resend-verify:ip:${clientIp}`, 3, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, message: 'Too many requests. Please wait a minute.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    )
  }

  try {
    const body = await req.json()
    const email = body.email?.toLowerCase()

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    // Lookup the user (silently ignore if not found — no enumeration)
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, status: true },
    })

    // Only send a new verification email if:
    //   - User exists
    //   - User is in 'Pending' status (not already verified)
    if (user && user.status === 'Pending') {
      const token = signEmailVerificationToken(user.id)
      // Fire-and-forget — never block the response on email sending
      sendVerificationEmail(user.email, token).catch((err) => {
        console.error('[email] resend-verification failed:', err)
      })
    }

    // SECURITY: Always return the same response (no user enumeration).
    return NextResponse.json({
      success: true,
      message: 'If a pending account exists with this email, a new verification link has been sent.',
    })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
