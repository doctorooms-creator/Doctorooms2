import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { db } from '@/lib/db';
import { generateOTP } from '@/lib/otp-store';

export async function POST(req: NextRequest) {
  try {
    // SECURITY (P1.10): 3 OTP requests per minute per IP — prevents OTP spam.
    const clientIp = getClientIp(req)
    const rl = await rateLimit(`forgot-password:ip:${clientIp}`, 3, 60_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many OTP requests. Please wait a minute.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
        }
      )
    }
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });

    // SECURITY: Always return the same response regardless of whether the email
    // exists in our database. This prevents user enumeration via 404 vs 200.
    // The OTP is only generated + stored if the user actually exists.
    const otp = user ? generateOTP(email.toLowerCase()) : null;
    if (user && otp) {
      // TODO (Phase 2.7): send OTP via email (Resend/SendGrid).
      // For now, the OTP is stored server-side only — see verify-otp route.
      // NEVER log the OTP value to console.log — it's a security leak.
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, an OTP has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
