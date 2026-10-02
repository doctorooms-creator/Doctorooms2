import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { logAction } from '@/lib/audit-log';
import { verifyJwt, revokeSession } from '@/lib/session';
import { getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // Capture the authenticated user BEFORE clearing the session cookie.
  // Audit log is fire-and-forget — never blocks logout.
  const clientIp = getClientIp(req)
  try {
    const user = await getAuthUser(req);
    if (user) {
      await logAction({
        userId: user.id,
        userRole: user.role,
        userName: user.name,
        action: 'logout',
        entityType: 'auth',
        entityId: user.id,
        description: 'User logged out',
        severity: 'info',
        ipAddress: clientIp,
        userAgent: req.headers.get('user-agent') || '',
      });
    }
  } catch (auditErr) {
    console.error('[audit-log] logout capture failed:', auditErr);
  }

  // SECURITY (P2.3): Revoke the session in the DB so the cookie can't be reused.
  // Extract the session token from the JWT, then mark the Session row as revoked.
  try {
    const sessionCookie = req.cookies.get('doctorooms_session')?.value
    if (sessionCookie) {
      const jwtPayload = verifyJwt(sessionCookie)
      if (jwtPayload?.sessionToken) {
        await revokeSession(jwtPayload.sessionToken)
      }
    }
  } catch (revokeErr) {
    console.error('[session] revoke failed during logout:', revokeErr)
    // Continue with cookie clear even if DB revoke failed
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('doctorooms_session', '', { maxAge: 0, path: '/' });
  response.cookies.set('doctorooms_role', '', { maxAge: 0, path: '/' });
  return response;
}
