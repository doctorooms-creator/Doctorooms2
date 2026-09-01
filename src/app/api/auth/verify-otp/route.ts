import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp-store';
import { logAction } from '@/lib/audit-log';
import { getAuditContext } from '@/lib/audit-context';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const valid = verifyOTP(normalizedEmail, otp);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // AUDIT (P2.8): Record successful OTP verification (pre-auth event).
    // No user context yet (this route runs before login completes) so
    // userId/userRole/userName are blank. The email is captured as entityId
    // so admins can attribute the OTP verification back to the requester.
    try {
      const auditCtx = getAuditContext(req);
      await logAction({
        userId: undefined,
        userRole: '',
        userName: '',
        action: 'otp_verify',
        entityType: 'auth',
        entityId: normalizedEmail,
        description: `OTP verified for ${normalizedEmail}`,
        severity: 'info',
        ...auditCtx,
      });
    } catch (auditErr) {
      console.error('[audit-log] otp verify capture failed:', auditErr);
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
