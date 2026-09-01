import { NextRequest, NextResponse } from 'next/server'
import { compare, hash } from 'bcryptjs'
import { requireAuth } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { verifyJwt } from '@/lib/session'
import { logAction } from '@/lib/audit-log'
import { getClientIp } from '@/lib/rate-limit'

export async function PATCH(req: NextRequest) {
  const clientIp = getClientIp(req)
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { currentPassword, newPassword } = body as {
      currentPassword?: string
      newPassword?: string
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Fetch the user with password field
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, password: true },
    })

    if (!dbUser || !dbUser.password) {
      return NextResponse.json(
        { error: 'User account not found' },
        { status: 404 }
      )
    }

    // Verify current password
    const isMatch = await compare(currentPassword, dbUser.password)
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    // Hash and update the new password
    const hashedPassword = await hash(newPassword, 10)
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    // SECURITY (P2.4): Invalidate ALL other sessions for this user.
    // The current session (the one making this request) stays alive so the
    // user doesn't get logged out immediately. All other devices get 401
    // on their next API call.
    try {
      // Extract the current session's token from the JWT cookie
      const sessionCookie = req.cookies.get('doctorooms_session')?.value
      let currentToken: string | undefined
      if (sessionCookie) {
        const payload = verifyJwt(sessionCookie)
        currentToken = payload?.sessionToken
      }
      // Revoke all sessions EXCEPT the current one
      await db.session.updateMany({
        where: {
          userId: user.id,
          revokedAt: null,
          ...(currentToken ? { token: { not: currentToken } } : {}),
        },
        data: { revokedAt: new Date() },
      })
    } catch (sessionErr) {
      console.error('[session] Failed to invalidate other sessions on password change:', sessionErr)
      // Don't fail the password change if session revocation fails
    }

    // Audit log: password change is a security-critical event
    try {
      await logAction({
        userId: user.id,
        userRole: user.role,
        userName: user.name,
        action: 'password_change',
        entityType: 'auth',
        entityId: user.id,
        description: 'User changed their password — all other sessions revoked',
        severity: 'critical',
        ipAddress: clientIp,
        userAgent: req.headers.get('user-agent') || '',
      })
    } catch (auditErr) {
      console.error('[audit-log] password change capture failed:', auditErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully. Other devices have been logged out.',
    })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
