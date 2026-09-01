import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signEmailVerificationToken } from '@/lib/session';
import { sendVerificationEmail } from '@/lib/email';
import { logAction } from '@/lib/audit-log';

export async function POST(req: NextRequest) {
  try {
    // SECURITY (P1.10): 5 registrations per minute per IP — prevents spam signup.
    const clientIp = getClientIp(req)
    const rl = await rateLimit(`register:ip:${clientIp}`, 5, 60_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many registrations. Please wait a minute.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
        }
      )
    }
    const body = await req.json();
    const { name, email, mobileNo, gender, password, role } = body;

    // Security: Only allow self-registration for patient and hospital roles.
    // Privileged roles (admin, doctor, receptionist, assistant, pharmacist) must be
    // assigned by an admin through the dashboard, not through public registration.
    const ALLOWED_SELF_REGISTER_ROLES = ['patient', 'hospital'];
    const safeRole = ALLOWED_SELF_REGISTER_ROLES.includes(role) ? role : 'patient';

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Phone dedup (Phase 4 "Queue Resilience"): the same mobile number must
    // not create a second patient account — walk-in/expression booking links
    // existing patients BY MOBILE, so duplicates silently fork their history.
    if (mobileNo?.trim()) {
      const existingByMobile = await db.user.findFirst({
        where: { mobileNo: mobileNo.trim(), role: 'patient' },
        select: { id: true },
      });
      if (existingByMobile) {
        return NextResponse.json(
          {
            success: false,
            message:
              'An account with this mobile number already exists. Please login or use a different number.',
          },
          { status: 409 }
        );
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    // SECURITY (P2.7): Set status to 'Pending' — user can't login until they verify email.
    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashed,
        mobileNo: mobileNo || '',
        gender: gender || 'Male',
        role: safeRole,
        status: 'Pending',
      },
    });

    // Send the verification email (fire-and-forget — never block registration)
    try {
      const verifyToken = signEmailVerificationToken(user.id)
      sendVerificationEmail(user.email, verifyToken).catch((err) => {
        console.error('[email] registration verification email failed:', err)
      })
    } catch (emailErr) {
      console.error('[email] failed to sign verification token:', emailErr)
    }

    // Audit log the registration
    try {
      await logAction({
        userId: user.id,
        userRole: user.role,
        userName: user.name,
        action: 'register',
        entityType: 'auth',
        entityId: user.id,
        description: `New ${user.role} registered — status: Pending (email verification required)`,
        severity: 'info',
        ipAddress: clientIp,
        userAgent: req.headers.get('user-agent') || '',
      })
    } catch (auditErr) {
      console.error('[audit-log] registration capture failed:', auditErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
