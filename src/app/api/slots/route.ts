import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { getSlotInventory, isSlotInventoryError } from '@/lib/slot-inventory'

/**
 * GET /api/slots?doctorId=...&date=YYYY-MM-DD
 *
 * Slot inventory for a doctor on a given IST date — the single source of
 * truth for slot availability (holiday / schedule / OPD-limit + per-slot
 * free|taken|past statuses + next free slot).
 *
 * Auth: any logged-in role (patients book online; reception/doctor dashboards
 * consume the same endpoint). Live data — never cached.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const doctorId = searchParams.get('doctorId')
    const date = searchParams.get('date')

    if (!doctorId || !date) {
      return NextResponse.json(
        { error: 'doctorId and date are required' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const inventory = await getSlotInventory(doctorId, date)

    return NextResponse.json(inventory, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    if (isSlotInventoryError(error)) {
      // INVALID_DATE → 400, DOCTOR_NOT_FOUND → 404
      const status = error.code === 'DOCTOR_NOT_FOUND' ? 404 : 400
      return NextResponse.json(
        { error: error.message },
        { status, headers: { 'Cache-Control': 'no-store' } }
      )
    }
    console.error('GET /api/slots error:', error)
    return NextResponse.json(
      { error: 'Failed to load slot inventory' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
