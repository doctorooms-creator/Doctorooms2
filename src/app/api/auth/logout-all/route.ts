import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { verifyJwt } from '@/lib/session'
import { logAction } from '@/lib/audit-log'
import { getClientIp } from '@/lib/rate-limit'

/**
 * POST /api/auth/logout-all
 *   Revokes ALL sessions for the current user EXCEPT the one making the request.
 *   The current session stays alive so the user doesn't have to re-login.
 *
 *   SECURITY (P2.5): Used by the "Logout all other devices" button on the
 *   settings page — useful if the user suspects their account was accessed
 *   from an unknown device.
 */
export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req)
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract the current session's token from the JWT cookie
    const sessionCookie = req.cookies.get('doctorooms_session')?.value
    let currentToken: string | undefined
    if (sessionCookie) {
      const payload = verifyJwt(sessionCookie)
      currentToken = payload?.sessionToken
    }

    // Revoke all sessions EXCEPT the current one
    const revoked = await db.session.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
        ...(currentToken ? { token: { not: currentToken } } : {}),
      },
      data: { revokedAt: new Date() },
    })

    // Audit log this security-critical action
    try {
      await logAction({
        userId: user.id,
        userRole: user.role,
        userName: user.name,
        action: 'logout_all',
        entityType: 'auth',
        entityId: user.id,
        description: `User logged out all other devices — ${revoked.count} session(s) revoked`,
        severity: 'critical',
        ipAddress: clientIp,
        userAgent: req.headers.get('user-agent') || '',
      })
    } catch (auditErr) {
      console.error('[audit-log] logout-all capture failed:', auditErr)
    }

    return NextResponse.json({
      success: true,
      revokedCount: revoked.count,
      message: `${revoked.count} other device(s) have been logged out.`,
    })
  } catch (error) {
    console.error('Logout-all error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
