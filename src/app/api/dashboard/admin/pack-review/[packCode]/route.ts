import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAnyRole } from '@/lib/api-auth'
import { getPack } from '@/lib/specialty-packs/packs'
import { getPackReviewState } from '@/lib/specialty-packs/review-status'

/**
 * Pack dose-review console — pack detail (admin + scoped reviewer).
 *
 * GET /api/dashboard/admin/pack-review/[packCode]
 * → { pack, review, medicines: [{ name, salt, doseOptions, freq, flags, verdict, notes }] }
 *
 * Medicines come from the git-versioned pack source; verdicts from the
 * PackMedicineReview table (pending when no row).
 */
export async function GET(
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

    const [review, verdictRows] = await Promise.all([
      getPackReviewState(packCode),
      db.packMedicineReview.findMany({
        where: { packCode },
        select: { medicineName: true, verdict: true, notes: true, reviewedAt: true },
      }),
    ])
    const verdictMap = new Map(verdictRows.map((v) => [v.medicineName, v]))

    const medicines = pack.medicines.map((m) => {
      const v = verdictMap.get(m.name)
      return {
        name: m.name,
        salt: m.salt,
        doseOptions: m.doseOptions,
        morning: m.morning,
        afternoon: m.afternoon,
        evening: m.evening,
        tab: m.tab,
        flags: m.flags ?? null,
        verdict: v?.verdict ?? 'pending',
        notes: v?.notes ?? null,
        reviewedAt: v?.reviewedAt ?? null,
      }
    })

    return NextResponse.json({
      pack: {
        code: pack.meta.code,
        title: pack.meta.title,
        tier: pack.meta.tier,
        version: pack.meta.version,
        summary: pack.meta.sourceNotes || '',
      },
      review: review ?? { status: 'pending', reviewedByName: null, reviewedAt: null },
      medicines,
    })
  } catch (error) {
    console.error('[admin-pack-review] detail GET error:', error)
    return NextResponse.json({ error: 'Failed to load pack review detail' }, { status: 500 })
  }
}
