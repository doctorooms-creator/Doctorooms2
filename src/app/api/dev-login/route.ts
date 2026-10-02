import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DEV_USERS, getDevUser } from '@/lib/api-auth';
import { createSession } from '@/lib/session';
import { logAction } from '@/lib/audit-log';

/**
 * Dev-only login endpoint.
 * Accepts: { role: string, userId?: string }
 * If userId is provided, logs in as that specific user (e.g. dev-doctor-anita).
 * Otherwise, finds the first active DB user with that role.
 */
export async function POST(req: NextRequest) {
  // Dev-only login endpoint. Disabled in production (NODE_ENV === 'production').
  // In the dev sandbox, NODE_ENV is never 'production', so this endpoint is always available.
  // (Previously also required DEV_MODE=1, but that env var gets reset by the sandbox's
  // /start.sh on each boot, causing "Login failed (404)". Using NODE_ENV alone is more robust.)
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }

  try {
    const { role, userId } = await req.json();

    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Role is required' },
        { status: 400 }
      );
    }

    // If userId is provided, find that specific user
    let user = null;
    if (userId) {
      user = await db.user.findUnique({
        where: { id: userId, status: 'Active' },
      }).catch(() => null);
    }

    // If no userId or user not found, try by role
    if (!user) {
      user = await db.user.findFirst({
        where: { role, status: 'Active' },
      }).catch(() => null);
    }

    // Fallback to dev user if no DB user exists
    const devUser = getDevUser(role);
    if (!user && !DEV_USERS[role]) {
      return NextResponse.json(
        { success: false, message: `Unknown role: ${role}` },
        { status: 400 }
      );
    }

    const resolvedUser = user
      ? { id: user.id, name: user.name, email: user.email, role: user.role, gender: user.gender, profileImg: user.profileImg, mobileNo: user.mobileNo }
      : devUser;

    // Create a real session (DB token + JWT) so middleware + API auth both work
    const ipAddress = req.headers.get('x-forwarded-for') || 'dev';
    const userAgent = req.headers.get('user-agent') || 'dev';
    const { jwt: jwtToken } = await createSession({
      userId: resolvedUser.id,
      role: resolvedUser.role,
      ipAddress,
      userAgent,
    });

    const response = NextResponse.json({
      success: true,
      user: resolvedUser,
    });

    // Set session cookie = JWT
    response.cookies.set('doctorooms_session', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set('doctorooms_role', resolvedUser.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    // Audit log: dev login (fire-and-forget — never block login)
    try {
      await logAction({
        userId: resolvedUser.id,
        userRole: resolvedUser.role,
        userName: resolvedUser.name,
        action: 'login',
        entityType: 'auth',
        entityId: resolvedUser.id,
        description: `Dev login as ${resolvedUser.role}`,
        severity: 'info',
        metadata: { method: 'dev', role },
      });
    } catch (auditErr) {
      console.error('[audit-log] dev-login capture failed:', auditErr);
    }

    return response;
  } catch (error) {
    console.error('Dev login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
