import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signEmailVerificationToken } from '@/lib/session';
import { sendVerificationEmail } from '@/lib/email';
import { logAction } from '@/lib/audit-log';
import { emitNotification } from '@/lib/emit-notification';

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
    const { name, email, mobileNo, gender, password, role, referralCode } = body;

    // Security: Only allow self-registration for the 3 self-serve roles
    // (ONBOARDING-1): patient, hospital/clinic owner, and solo-practice doctor
    // (FREE plan). Privileged roles (admin, receptionist, assistant,
    // pharmacist, nurse, lab_technician) must be assigned by an admin through
    // the dashboard, not through public registration.
    // NOTE: doctor/hospital users get NO profile rows here — the guided
    // onboarding wizard creates them after login (keeps public listings clean).
    const ALLOWED_SELF_REGISTER_ROLES = ['patient', 'hospital', 'doctor'];
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

    // ── EMAIL VERIFICATION vs FALLBACK (ONBOARDING-1) ──────────────────────
    // With RESEND_API_KEY configured → status 'Pending' + verification email
    // (login only after verifying). WITHOUT a key → create as 'Active' and
    // skip the email block entirely — a verification email we cannot send
    // would soft-lock every new account behind a login 403.
    const emailConfigured = Boolean(process.env.RESEND_API_KEY);
    const initialStatus = emailConfigured ? 'Pending' : 'Active';
    if (!emailConfigured) {
      console.warn(
        '[register] RESEND_API_KEY not configured — creating account as Active without email verification (fallback mode)'
      );
    }

    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashed,
        mobileNo: mobileNo || '',
        gender: gender || 'Male',
        role: safeRole,
        status: initialStatus,
      },
    });

    // Send the verification email ONLY when email delivery is configured
    // (fire-and-forget — never blocks registration).
    if (emailConfigured) {
      try {
        const verifyToken = signEmailVerificationToken(user.id)
        sendVerificationEmail(user.email, verifyToken).catch((err) => {
          console.error('[email] registration verification email failed:', err)
        })
      } catch (emailErr) {
        console.error('[email] failed to sign verification token:', emailErr)
      }
    }

    // ── Referral claim (docs/REFERRAL-SYSTEM-PLAN.md) ─────────────────────
    // Claimable ONLY at signup (this route). Fire-and-forget semantics:
    // a failed claim must never block registration. Anti-fraud: self-referral
    // impossible (new user), referee unique per user, referrer must be an
    // active doctor.
    try {
      const code = typeof referralCode === 'string' ? referralCode.trim().toUpperCase() : '';
      if (code) {
        const rc = await db.referralCode.findUnique({ where: { code } });
        if (rc && rc.userId !== user.id) {
          const referrer = await db.user.findUnique({
            where: { id: rc.userId },
            select: { role: true, status: true, name: true },
          });
          if (referrer && referrer.role === 'doctor' && referrer.status === 'Active') {
            // One claim per new user (refereeUserId is unique in schema)
            await db.referral.create({
              data: {
                referrerUserId: rc.userId,
                refereeUserId: user.id,
                code,
                status: 'pending',
              },
            });
            // Toast to the referrer — new referral signed up
            emitNotification('referral-reward', [`user:${rc.userId}`], {
              message: `🔔 ${user.name} ne aapke referral code se signup kiya!`,
            });
            console.log(`[referral] claimed: ${user.id} → ${rc.userId} (${code})`);
          }
        }
      }
    } catch (refErr) {
      console.error('[referral] claim failed (non-blocking):', refErr);
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
        description: `New ${user.role} registered — status: ${user.status}${emailConfigured ? ' (email verification required)' : ' (active — email fallback, no RESEND_API_KEY)'}`,
        severity: 'info',
        ipAddress: clientIp,
        userAgent: req.headers.get('user-agent') || '',
      })
    } catch (auditErr) {
      console.error('[audit-log] registration capture failed:', auditErr)
    }

    return NextResponse.json({
      success: true,
      message: emailConfigured
        ? 'Registration successful! Please check your email to verify your account.'
        : 'Registration successful! You can log in now.',
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
