import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { logAction } from '@/lib/audit-log';
import { createSession } from '@/lib/session';
import { rateLimit, recordLoginFailure, isLoginLocked, clearLoginFailures, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // SECURITY (P1.10): IP-based rate limit — 10 login attempts per minute per IP.
    const clientIp = getClientIp(req)
    const ipRate = await rateLimit(`login:ip:${clientIp}`, 10, 60_000)
    if (!ipRate.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many login attempts from this IP. Please try again in a minute.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((ipRate.resetAt - Date.now()) / 1000)) },
        }
      )
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // SECURITY (P1.14): Account-level brute-force protection — 5 failures in 5 min = 15 min lock.
    const lockStatus = isLoginLocked(email)
    if (lockStatus.locked) {
      const remainingMin = Math.ceil((lockStatus.unlockAt - Date.now()) / 60_000)
      return NextResponse.json(
        {
          success: false,
          message: `Account temporarily locked due to too many failed attempts. Try again in ${remainingMin} minute(s).`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((lockStatus.unlockAt - Date.now()) / 1000)) },
        }
      )
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      // Don't reveal whether the email exists — but DO record the failure for
      // rate-limiting purposes (so attackers can't probe without burning the limit).
      recordLoginFailure(email, clientIp)
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      // SECURITY (P1.14): Record the failure + check if we should lock
      const failStatus = recordLoginFailure(email, clientIp)
      if (failStatus.locked) {
        return NextResponse.json(
          {
            success: false,
            message: 'Too many failed login attempts. Account locked for 15 minutes.',
          },
          {
            status: 429,
            headers: { 'Retry-After': String(Math.ceil((failStatus.unlockAt - Date.now()) / 1000)) },
          }
        )
      }
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (user.status === 'Block') {
      return NextResponse.json(
        { success: false, message: 'Your account has been blocked. Contact support.' },
        { status: 403 }
      );
    }

    if (user.status === 'Pending') {
      return NextResponse.json(
        { success: false, message: 'Your account is pending approval.' },
        { status: 403 }
      );
    }

    // Successful login — clear any prior brute-force failures
    clearLoginFailures(email)

    // SECURITY (P2.1): Create a real DB-persisted session + JWT.
    // The cookie value is the JWT (signed with NEXTAUTH_SECRET), NOT the user.id.
    // getAuthUser will verifySession(token) — checks signature + DB row + revokedAt + expiry.
    const { jwt: sessionJwt, expiresAt } = await createSession({
      userId: user.id,
      role: user.role,
      ipAddress: clientIp,
      userAgent: req.headers.get('user-agent') || '',
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        profileImg: user.profileImg,
        mobileNo: user.mobileNo,
      },
      sessionExpiresAt: expiresAt.toISOString(),
    });

    // Set session cookie = JWT (httpOnly — client reads user via /api/auth/me)
    response.cookies.set('doctorooms_session', sessionJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',  // tightened from 'lax' (P1.9 already set this on headers)
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    // Role cookie — used by Edge proxy for fast routing decisions.
    // The proxy can't verify JWT signature (Edge runtime limitation), so it
    // reads the role from this cookie. API routes still do full JWT verification.
    response.cookies.set('doctorooms_role', user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    // Audit log: user logged in (fire-and-forget — never block login)
    try {
      await logAction({
        userId: user.id,
        userRole: user.role,
        userName: user.name,
        action: 'login',
        entityType: 'auth',
        entityId: user.id,
        description: 'User logged in',
        severity: 'info',
        metadata: { method: 'password' },
        ipAddress: clientIp,
        userAgent: req.headers.get('user-agent') || '',
      });
    } catch (auditErr) {
      console.error('[audit-log] login capture failed:', auditErr);
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
