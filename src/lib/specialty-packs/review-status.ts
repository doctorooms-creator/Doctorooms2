/**
 * PACK DOSE-REVIEW STATE (P3)
 *
 * Bridges the git-versioned pack files (meta.reviewedBy = '' while doses are
 * unverified) with the runtime MBBS review workflow (PackReview table).
 *
 * A pack counts as REVIEWED when either:
 *   - the pack source itself was authored post-review (meta.reviewedBy set), OR
 *   - an admin-side reviewer completed the PackReview workflow
 *     (status = 'reviewed' in the DB).
 *
 * Consumers:
 *   - /api/dashboard/doctor/packs            (banner chip amber/green)
 *   - /api/dashboard/doctor/packs/library    (library card badges)
 *   - install.ts                             (whether new installs stamp
 *                                             the 'UNVERIFIED DOSE' note)
 *   - admin pack-review console              (progress + completion state)
 */

import { db } from '@/lib/db'
import { getPack, PACKS } from './packs'
import { packCounts } from './types'

export interface PackReviewState {
  status: 'pending' | 'in_progress' | 'needs_changes' | 'reviewed'
  reviewedByName: string | null
  reviewedAt: Date | null
}

/** DB review rows for all packs (single query). Missing row → null. */
export async function getPackReviewStates(): Promise<Map<string, PackReviewState>> {
  const rows = await db.packReview.findMany({
    select: { packCode: true, status: true, reviewedByName: true, reviewedAt: true },
  })
  const map = new Map<string, PackReviewState>()
  for (const r of rows) {
    map.set(r.packCode, {
      status: (r.status as PackReviewState['status']) || 'pending',
      reviewedByName: r.reviewedByName || null,
      reviewedAt: r.reviewedAt || null,
    })
  }
  return map
}

/** Single-pack lookup (null when no review row exists). */
export async function getPackReviewState(packCode: string): Promise<PackReviewState | null> {
  const row = await db.packReview.findUnique({
    where: { packCode },
    select: { status: true, reviewedByName: true, reviewedAt: true },
  })
  if (!row) return null
  return {
    status: (row.status as PackReviewState['status']) || 'pending',
    reviewedByName: row.reviewedByName || null,
    reviewedAt: row.reviewedAt || null,
  }
}

/**
 * Effective review info for a pack, merging source meta + DB workflow.
 * `reviewed` = doses medically verified (drives the amber/green badge).
 */
export function effectiveReview(
  packCode: string,
  dbState: PackReviewState | null
): { reviewed: boolean; reviewedBy: string | null; reviewedAt: Date | null } {
  const pack = getPack(packCode)
  if (pack?.meta.reviewedBy) {
    return { reviewed: true, reviewedBy: pack.meta.reviewedBy, reviewedAt: null }
  }
  if (dbState?.status === 'reviewed') {
    return {
      reviewed: true,
      reviewedBy: dbState.reviewedByName,
      reviewedAt: dbState.reviewedAt,
    }
  }
  return { reviewed: false, reviewedBy: null, reviewedAt: null }
}

/** Verdict progress across every pack (for the admin console list). */
export async function packReviewProgress(): Promise<
  {
    packCode: string
    title: string
    tier: string
    version: string
    totalMedicines: number
    verdicts: Record<'verified' | 'needs_change' | 'pending', number>
    decided: number
    status: PackReviewState['status']
    reviewedByName: string | null
    reviewedAt: Date | null
    summary: string
  }[]
> {
  const [states, verdictRows] = await Promise.all([
    getPackReviewStates(),
    db.packMedicineReview.findMany({
      select: { packCode: true, medicineName: true, verdict: true },
    }),
  ])

  const byPack = new Map<string, Map<string, string>>()
  for (const v of verdictRows) {
    const m = byPack.get(v.packCode) ?? new Map<string, string>()
    m.set(v.medicineName, v.verdict)
    byPack.set(v.packCode, m)
  }

  return Object.values(PACKS).map((pack) => {
    const state = states.get(pack.meta.code) ?? null
    const meds = byPack.get(pack.meta.code) ?? new Map<string, string>()
    const total = pack.medicines.length
    const counts = { verified: 0, needs_change: 0, pending: 0 }
    for (const m of pack.medicines) {
      const v = meds.get(m.name)
      if (v === 'verified') counts.verified++
      else if (v === 'needs_change') counts.needs_change++
      else counts.pending++
    }
    const c = packCounts(pack)
    return {
      packCode: pack.meta.code,
      title: pack.meta.title,
      tier: pack.meta.tier,
      version: pack.meta.version,
      totalMedicines: total,
      verdicts: counts,
      decided: counts.verified + counts.needs_change,
      status: state?.status ?? 'pending',
      reviewedByName: state?.reviewedByName ?? null,
      reviewedAt: state?.reviewedAt ?? null,
      summary: `${c.complaints} complaints · ${c.medicines} medicines · ${c.questions} questions`,
    }
  })
}
