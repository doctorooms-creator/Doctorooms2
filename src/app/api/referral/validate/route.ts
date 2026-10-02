import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/referral/validate?code=DR-AMIT-4821
 * Public — used by the registration form to show the live
 * "✓ Dr. X ka referral — 30 din full trial" badge.
 */
export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code')?.trim().toUpperCase()
    if (!code || code.length < 4 || code.length > 24) {
      return NextResponse.json({ valid: false, message: 'Invalid code format' })
    }

    const rc = await db.referralCode.findUnique({
      where: { code },
      select: { userId: true },
    })
    if (!rc) {
      return NextResponse.json({ valid: false, message: 'Code not found' })
    }

    // Referrer must be an active doctor (Phase 1: doctor-to-doctor)
    const referrer = await db.user.findUnique({
      where: { id: rc.userId },
      select: { name: true, role: true, status: true },
    })
    if (!referrer || referrer.role !== 'doctor' || referrer.status !== 'Active') {
      return NextResponse.json({ valid: false, message: 'Referrer not eligible' })
    }

    return NextResponse.json({
      valid: true,
      referrerName: referrer.name,
      message: `${referrer.name} ka referral — 30 din ka full access milega`,
    })
  } catch (err) {
    console.error('[referral/validate] error:', err)
    return NextResponse.json({ valid: false, message: 'Validation failed' }, { status: 500 })
  }
}
