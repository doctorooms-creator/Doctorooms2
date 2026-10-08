import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { requireAnyRole } from '@/lib/api-auth'
import { logAction } from '@/lib/audit-log'
import { getPack } from '@/lib/specialty-packs/packs'
import { getPackReviewState } from '@/lib/specialty-packs/review-status'

/**
 * Pack dose-review console — complete a pack review (admin + scoped reviewer).
 *
 * POST /api/dashboard/admin/pack-review/[packCode]/complete
 *     { reviewedByName }
 *
 * Gates:
 *   - every pack medicine must have a verdict (no pending)
 *   - no needs_change verdicts may remain (corrections must land in the
 *     pack source first, then re-verdict)
 *
 * Effects:
 *   - PackReview → status 'reviewed', stamped with reviewer name + time
 *   - all installed DoctorMedicine rows for this pack (every doctor with a
 *     receipt) get the ' · UNVERIFIED DOSE' description note stripped —
 *     one raw UPDATE (pooler-safe, idempotent)
 *   - audit log entry
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ packCode: string }> }
) {
  const user = await requireAnyRole(req, ['admin', 'reviewer'])
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { packCode } = await params
    const pack = getPack(packCode)
    if (!pack) {
      return NextResponse.json({ error: 'Unknown pack code' }, { status: 404 })
    }

    const body = await req.json().catch(() => ({}))
    const reviewedByName =
      typeof body.reviewedByName === 'string' ? body.reviewedByName.trim() : ''
    if (reviewedByName.length < 3) {
      return NextResponse.json(
        { error: 'Reviewer ka poora naam darj karein (min 3 characters)' },
        { status: 400 }
      )
    }

    // Gate 1: every medicine decided.
    const rows = await db.packMedicineReview.findMany({
      where: { packCode },
      select: { medicineName: true, verdict: true },
    })
    const verdictMap = new Map(rows.map((r) => [r.medicineName, r.verdict]))
    const pending = pack.medicines.filter((m) => !verdictMap.has(m.name)).length
    if (pending > 0) {
      return NextResponse.json(
        { error: `${pending} medicines abhi pending hain — sab verdicts pehle darj karein`, pending },
        { status: 400 }
      )
    }

    // Gate 2: no unresolved corrections.
    const needsChange = pack.medicines.filter(
      (m) => verdictMap.get(m.name) === 'needs_change'
    )
    if (needsChange.length > 0) {
      return NextResponse.json(
        {
          error: `${needsChange.length} medicines me correction pending hai — pack source fix hone ke baad re-verdict karein`,
          needsChange: needsChange.map((m) => m.name),
        },
        { status: 400 }
      )
    }

    const existing = await getPackReviewState(packCode)
    if (existing?.status === 'reviewed' && existing.reviewedByName === reviewedByName) {
      return NextResponse.json({ ok: true, alreadyReviewed: true, updatedRows: 0 })
    }

    // Stamp the review.
    await db.packReview.upsert({
      where: { packCode },
      update: { status: 'reviewed', reviewedByName, reviewedAt: new Date() },
      create: { packCode, status: 'reviewed', reviewedByName, reviewedAt: new Date() },
    })

    // Propagate: strip the UNVERIFIED DOSE note from every installed copy
    // of this pack's medicines (append-only install names match exactly).
    const medNames = pack.medicines.map((m) => m.name)
    const updatedRows = await db.$executeRaw(
      Prisma.sql`
        UPDATE "DoctorMedicine" AS dm
        SET "description" = replace(dm."description", ' · UNVERIFIED DOSE', '')
        FROM "DoctorPackInstall" AS dpi
        WHERE dm."userId" = dpi."doctorId"
          AND dpi."packCode" = ${packCode}
          AND dpi."status" = 'Installed'
          AND dm."name" = ANY(${medNames})
          AND dm."description" LIKE '%UNVERIFIED DOSE%'
      `
    )

    // Audit (never blocks the response).
    try {
      await logAction({
        userId: user.id,
        userRole: user.role,
        userName: user.name,
        action: 'pack_review_complete',
        entityType: 'pack',
        entityId: packCode,
        description: `Pack ${packCode} (${pack.meta.title}) dose-review COMPLETED by ${reviewedByName} — all ${pack.medicines.length} medicines verified; ${updatedRows} installed medicine rows cleaned`,
        severity: 'info',
        ipAddress: req.headers.get('x-forwarded-for') || '',
        userAgent: req.headers.get('user-agent') || '',
      })
    } catch (auditErr) {
      console.error('[admin-pack-review] audit log failed:', auditErr)
    }

    return NextResponse.json({
      ok: true,
      packCode,
      title: pack.meta.title,
      reviewedByName,
      medicinesVerified: pack.medicines.length,
      updatedRows,
    })
  } catch (error) {
    console.error('[admin-pack-review] complete POST error:', error)
    return NextResponse.json({ error: 'Failed to complete pack review' }, { status: 500 })
  }
}
