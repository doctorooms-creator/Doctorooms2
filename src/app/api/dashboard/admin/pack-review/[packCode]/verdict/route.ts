import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { getPack } from '@/lib/specialty-packs/packs'
import { getPackReviewState } from '@/lib/specialty-packs/review-status'

/**
 * Pack dose-review console — record one medicine verdict (admin only).
 *
 * POST /api/dashboard/admin/pack-review/[packCode]/verdict
 *     { medicineName, verdict: 'verified' | 'needs_change' | 'pending', notes? }
 *
 * - upserts PackMedicineReview (reviewer identity + timestamp recorded)
 * - lazily creates the parent PackReview row (status: in_progress)
 * - recomputes PackReview.status: needs_changes when any medicine is
 *   flagged, in_progress otherwise (reviewed happens only via /complete)
 * - 409 when the pack is already reviewed (locked)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ packCode: string }> }
) {
  const user = await requireRole(req, 'admin')
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
    const medicineName = typeof body.medicineName === 'string' ? body.medicineName.trim() : ''
    const verdict = typeof body.verdict === 'string' ? body.verdict.trim() : ''
    const notes = typeof body.notes === 'string' ? body.notes.trim() : ''

    const medicine = pack.medicines.find((m) => m.name === medicineName)
    if (!medicine) {
      return NextResponse.json(
        { error: `Medicine "${medicineName}" is not part of pack ${packCode}` },
        { status: 400 }
      )
    }
    if (!['verified', 'needs_change', 'pending'].includes(verdict)) {
      return NextResponse.json(
        { error: "verdict must be 'verified' | 'needs_change' | 'pending'" },
        { status: 400 }
      )
    }
    if (verdict === 'needs_change' && !notes) {
      return NextResponse.json(
        { error: 'needs_change verdict ke saath correction note zaroori hai' },
        { status: 400 }
      )
    }

    const existing = await getPackReviewState(packCode)
    if (existing?.status === 'reviewed') {
      return NextResponse.json(
        { error: 'Pack already reviewed — verdicts locked' },
        { status: 409 }
      )
    }

    // Parent row first (FK), then the verdict row.
    await db.packReview.upsert({
      where: { packCode },
      update: {},
      create: { packCode, status: 'in_progress' },
    })

    await db.packMedicineReview.upsert({
      where: { packCode_medicineName: { packCode, medicineName } },
      update: {
        verdict,
        notes: notes || null,
        reviewedById: user.id,
        reviewedAt: new Date(),
      },
      create: {
        packCode,
        medicineName,
        verdict,
        notes: notes || null,
        reviewedById: user.id,
        reviewedAt: new Date(),
      },
    })

    // Recompute aggregate status from the full verdict set.
    const rows = await db.packMedicineReview.findMany({
      where: { packCode },
      select: { verdict: true },
    })
    const anyNeedsChange = rows.some((r) => r.verdict === 'needs_change')
    await db.packReview.update({
      where: { packCode },
      data: { status: anyNeedsChange ? 'needs_changes' : 'in_progress' },
    })

    const counts = {
      verified: rows.filter((r) => r.verdict === 'verified').length,
      needs_change: rows.filter((r) => r.verdict === 'needs_change').length,
      pending: pack.medicines.length - rows.length,
    }
    return NextResponse.json({ ok: true, medicineName, verdict, counts })
  } catch (error) {
    console.error('[admin-pack-review] verdict POST error:', error)
    return NextResponse.json({ error: 'Failed to record verdict' }, { status: 500 })
  }
}
