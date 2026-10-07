import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { packStatusForDoctor } from '@/lib/specialty-packs/install'

/**
 * Specialty Starter Packs — status for the logged-in doctor.
 *
 * GET /api/dashboard/doctor/packs
 * → { installedPacks, mastersEmpty, suggestedPack }
 *
 * Drives the empty-state banner (docs/specialty-packs/03 §6 T4/T5):
 * show banner when mastersEmpty && suggestedPack && !alreadyInstalled.
 */
export async function GET(req: NextRequest) {
  const user = await requireRole(req, 'doctor')
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const doctor = await db.doctor.findFirst({
      where: { userId: user.id },
      select: { id: true, specialization: true },
    })
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor profile not found' },
        { status: 404 }
      )
    }

    const status = await packStatusForDoctor(doctor.id, doctor.specialization)
    return NextResponse.json(status)
  } catch (error) {
    console.error('[doctor-packs] GET error:', error)
    return NextResponse.json({ error: 'Failed to load pack status' }, { status: 500 })
  }
}
