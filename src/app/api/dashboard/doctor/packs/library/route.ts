import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { PACKS } from '@/lib/specialty-packs/packs'
import { SPECIALTY_REGISTRY } from '@/lib/specialty-packs/registry'
import { packCounts } from '@/lib/specialty-packs/types'
import { getPackReviewStates, effectiveReview } from '@/lib/specialty-packs/review-status'

/**
 * Specialty Pack Library — full browsable catalog for the logged-in doctor.
 *
 * GET /api/dashboard/doctor/packs/library
 * → { installedPacks, library }
 *
 * Powers the Prescription Settings → Content Packs page (P3): doctors can
 * see their installed packs (receipt counts) AND browse the whole 21-pack
 * library to install additional specialties on demand.
 */
export async function GET(req: NextRequest) {
  const user = await requireRole(req, 'doctor')
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const doctor = await db.doctor.findFirst({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor profile not found — complete onboarding first' },
        { status: 404 }
      )
    }

    // Receipts = source of truth for what's installed
    const installs = await db.doctorPackInstall.findMany({
      where: { doctorId: doctor.id, status: 'Installed' },
      select: { packCode: true, packVersion: true, counts: true, installedAt: true },
      orderBy: { installedAt: 'desc' },
    })
    const receiptMap = new Map(installs.map((i) => [i.packCode, i]))
    const reviewStates = await getPackReviewStates()

    const parseCounts = (raw: string): Record<string, number> => {
      try {
        return JSON.parse(raw || '{}')
      } catch {
        return {}
      }
    }

    // Registry names that point at each pack (a pack can serve several
    // registry entries; GP-01 is also the fallback for pack-less specialties)
    const namesByPack = new Map<string, string[]>()
    let gpFallbackCount = 0
    for (const entry of SPECIALTY_REGISTRY) {
      if (entry.packCode && PACKS[entry.packCode]) {
        const list = namesByPack.get(entry.packCode) ?? []
        list.push(entry.name)
        namesByPack.set(entry.packCode, list)
      } else if (!entry.packCode && !entry.module) {
        // RX-routed specialty without its own pack → falls back to GP-01
        gpFallbackCount++
      }
    }

    const library = Object.values(PACKS).map((pack) => {
      const c = packCounts(pack)
      const receipt = receiptMap.get(pack.meta.code)
      const effective = effectiveReview(
        pack.meta.code,
        reviewStates.get(pack.meta.code) ?? null
      )
      return {
        code: pack.meta.code,
        title: pack.meta.title,
        tier: pack.meta.tier,
        version: pack.meta.version,
        reviewed: effective.reviewed,
        reviewedBy: effective.reviewedBy,
        summary: `${c.complaints} complaints · ${c.medicines} medicines · ${c.questions} questions`,
        counts: {
          categories: c.categories,
          complaints: c.complaints,
          questions: c.questions,
          suggestions: c.suggestions,
          labels: c.labels,
          findings: c.findings,
          medicines: c.medicines,
          findingMeds: c.findingMeds,
          tables: c.tables,
          rxTemplates: c.rxTemplates,
        },
        totalRows:
          c.complaints + c.questions + c.suggestions + c.labels + c.findings +
          c.medicines + c.findingMeds + c.tables + c.rxTemplates,
        specialtyNames: namesByPack.get(pack.meta.code) ?? [],
        fallbackFor: pack.meta.code === 'GP-01' ? gpFallbackCount : 0,
        installed: Boolean(receipt),
        installedAt: receipt?.installedAt ?? null,
        installedVersion: receipt?.packVersion ?? null,
        installedCounts: receipt ? parseCounts(receipt.counts) : null,
      }
    })

    return NextResponse.json({
      installedPacks: installs.map((i) => ({
        packCode: i.packCode,
        version: i.packVersion,
        counts: parseCounts(i.counts),
        installedAt: i.installedAt,
      })),
      library,
    })
  } catch (error) {
    console.error('[doctor-packs-library] GET error:', error)
    return NextResponse.json({ error: 'Failed to load pack library' }, { status: 500 })
  }
}
