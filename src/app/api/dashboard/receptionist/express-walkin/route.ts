import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, RECEPTION_ROLES } from '@/lib/api-auth'

/**
 * GET: mobile-number patient lookup (used by the unified Booking Desk).
 * The POST handler was retired with the booking unification — all booking
 * creation now flows through /api/dashboard/receptionist/bookings.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user || !RECEPTION_ROLES.includes(user.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const mobile = searchParams.get('mobile')
    if (!mobile?.trim()) return NextResponse.json({ found: false })
    const patient = await db.user.findFirst({ where: { mobileNo: mobile.trim(), role: 'patient' }, select: { id: true, name: true, gender: true, mobileNo: true } })
    if (!patient) return NextResponse.json({ found: false })
    return NextResponse.json({ found: true, patient })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
