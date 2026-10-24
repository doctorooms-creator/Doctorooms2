import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * PUT /api/opd/allergies — record a patient allergy from the cockpit chart.
 *
 * Phase D of PLAN-OPD-COCKPIT (04 §2.6, decision D7): v1 free-text allergy,
 * stored on `User.settingsJson.allergies` — the same merge-safe JSON-key
 * pattern the patient settings and sevika slot times already use. This keeps
 * the feature deployable TODAY: the prod Supabase DB is not pushable from
 * this sandbox (stale password — only Vercel holds the live one), so a new
 * `Patient.allergies` column would break prod on deploy. When a prod schema
 * push is possible, the column replaces this key and this route is a 5-line
 * migration.
 */

const MAX_LEN = 200

export async function PUT(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { bookingId, allergies } = body as { bookingId?: string; allergies?: string }
    if (!bookingId) return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })
    if (typeof allergies !== 'string' || allergies.trim().length > MAX_LEN) {
      return NextResponse.json({ error: `Allergies must be text, max ${MAX_LEN} characters` }, { status: 400 })
    }

    const doctor = await db.doctor.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })

    // Scope: the booking must belong to THIS doctor.
    const booking = await db.booking.findFirst({
      where: { id: bookingId, doctorId: doctor.id },
      select: { id: true, userId: true },
    })
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    if (!booking.userId) {
      return NextResponse.json(
        { error: 'Walk-in without a patient account — allergy will be noted on the Rx instead' },
        { status: 409 }
      )
    }

    // Merge-safe write (never clobbers other settingsJson consumers).
    const patientUser = await db.user.findUnique({
      where: { id: booking.userId },
      select: { settingsJson: true },
    })
    let parsed: Record<string, unknown> = {}
    try {
      parsed = patientUser?.settingsJson ? JSON.parse(patientUser.settingsJson) : {}
    } catch {
      // Corrupt JSON — start a clean object rather than failing the doctor.
      parsed = {}
    }
    const trimmed = allergies.trim()
    if (trimmed) parsed.allergies = trimmed
    else delete parsed.allergies

    await db.user.update({
      where: { id: booking.userId },
      data: { settingsJson: JSON.stringify(parsed) },
    })

    return NextResponse.json({ allergies: trimmed || null })
  } catch (error) {
    console.error('OPD allergies PUT error:', error)
    return NextResponse.json({ error: 'Failed to save allergies' }, { status: 500 })
  }
}
