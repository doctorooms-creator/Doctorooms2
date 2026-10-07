import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/api-auth'

/**
 * ONBOARDING-1: Onboarding status check.
 *
 * Self-serve doctors/hospitals register WITHOUT a profile entity (keeps
 * public listings clean). This endpoint tells the dashboard layout guards
 * whether a profile entity exists yet, so un-onboarded users get routed to
 * the guided wizard instead of a broken dashboard.
 *
 * GET → { success, role, hasProfile, hospitalName? }
 *   - doctor   → hasProfile = a Doctor row exists for this user
 *   - hospital → hasProfile = a Hospital row exists for this user
 *   - others   → hasProfile = true (no profile entity required)
 * 401 when unauthenticated.
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    if (user.role === 'doctor') {
      const doctor = await db.doctor.findFirst({
        where: { userId: user.id },
        select: { id: true },
      })
      return NextResponse.json({
        success: true,
        role: user.role,
        hasProfile: Boolean(doctor),
      })
    }

    if (user.role === 'hospital') {
      // userId is unique on Hospital — findUnique is exact
      const hospital = await db.hospital.findUnique({
        where: { userId: user.id },
        select: { hospitalName: true },
      })
      return NextResponse.json({
        success: true,
        role: user.role,
        hasProfile: Boolean(hospital),
        ...(hospital?.hospitalName ? { hospitalName: hospital.hospitalName } : {}),
      })
    }

    return NextResponse.json({
      success: true,
      role: user.role,
      hasProfile: true,
    })
  } catch (error) {
    console.error('[onboarding-status] error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
