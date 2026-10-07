import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { logAction } from '@/lib/audit-log'
import { installPack } from '@/lib/specialty-packs/install'

/**
 * Specialty Starter Packs — install for the logged-in doctor.
 *
 * POST /api/dashboard/doctor/packs/install  { packCode?: string }
 * - packCode optional: defaults to the doctor's specialization → fallback chain
 * - Idempotent: re-install of the same pack returns alreadyInstalled
 * - 409 if doctor profile missing
 *
 * Used by the empty-state banner (T4) — existing pre-pack-era doctors
 * get one-click content. Audit: 'pack_install'.
 */
export async function POST(req: NextRequest) {
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
        { error: 'Doctor profile not found — complete onboarding first' },
        { status: 409 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const packCode = typeof body.packCode === 'string' && body.packCode.trim() ? body.packCode.trim() : undefined

    const result = await installPack({
      userId: user.id,
      doctorId: doctor.id,
      packCode,
      specialization: doctor.specialization,
      installedById: user.id, // self-service install
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Audit log (never blocks the response)
    try {
      await logAction({
        userId: user.id,
        userRole: user.role,
        userName: user.name,
        action: 'pack_install',
        entityType: 'doctor',
        entityId: doctor.id,
        description: `Starter pack ${result.packCode} v${result.version} ${result.alreadyInstalled ? 'already installed' : 'installed'} (${result.summary})${result.skipped ? ` — ${result.skipped} items skipped (already present)` : ''}`,
        severity: 'info',
        ipAddress: req.headers.get('x-forwarded-for') || '',
        userAgent: req.headers.get('user-agent') || '',
      })
    } catch (auditErr) {
      console.error('[doctor-packs] audit log failed:', auditErr)
    }

    return NextResponse.json(result, { status: result.alreadyInstalled ? 200 : 201 })
  } catch (error) {
    console.error('[doctor-packs] POST error:', error)
    return NextResponse.json({ error: 'Failed to install pack' }, { status: 500 })
  }
}
