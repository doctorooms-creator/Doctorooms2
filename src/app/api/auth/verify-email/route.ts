import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyEmailVerificationToken } from '@/lib/session'
import { logAction } from '@/lib/audit-log'
import { getClientIp } from '@/lib/rate-limit'

/**
 * GET /api/auth/verify-email?token=<jwt>
 *   Verifies the email verification token (JWT signed with NEXTAUTH_SECRET).
 *   On success: sets user.status = 'Active' (was 'Pending' after registration).
 *   On failure: returns 400 with an error message.
 *
 * SECURITY (P2.7): Used by the email-verification flow.
 *   The token is a 24h-expiry JWT carrying { userId, purpose: 'email-verify' }.
 */
export async function GET(req: NextRequest) {
  const clientIp = getClientIp(req)
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Verification token is missing' },
        { status: 400 }
      )
    }

    const payload = verifyEmailVerificationToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification token. Please request a new one.' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, status: true, name: true, role: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    if (user.status === 'Active') {
      // Already verified — idempotent
      return NextResponse.json({
        success: true,
        message: 'Your email is already verified. You can log in.',
      })
    }

    // Activate the user
    await db.user.update({
      where: { id: user.id },
      data: { status: 'Active', emailVerifiedAt: new Date() },
    })

    // Audit log
    try {
      await logAction({
        userId: user.id,
        userRole: user.role,
        userName: user.name,
        action: 'email_verified',
        entityType: 'auth',
        entityId: user.id,
        description: 'User verified their email address',
        severity: 'info',
        ipAddress: clientIp,
        userAgent: req.headers.get('user-agent') || '',
      })
    } catch (auditErr) {
      console.error('[audit-log] email verification capture failed:', auditErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
