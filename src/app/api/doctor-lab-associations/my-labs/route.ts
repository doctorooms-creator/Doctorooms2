import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/doctor-lab-associations/my-labs
 *   Doctor: returns MY associated lab partners as a compact list for dropdowns.
 *   Optional ?specialization=blood|radiology|both to filter by specialization.
 *   Optional ?includeCatalog=true to also attach each lab's ACTIVE test catalog
 *   (LabTestCatalog rows, ordered testCategory asc then testName asc) — powers
 *   the catalog-driven Order Tests picker. Without it the response shape is
 *   unchanged (no `catalog` field) for existing consumers.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const doctor = await db.doctor.findUnique({ where: { userId: user.id } })
    if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const specialization = searchParams.get('specialization') || ''
    const includeCatalog = searchParams.get('includeCatalog') === 'true'

    const associations = await db.doctorLabAssociation.findMany({
      where: { doctorId: doctor.id, isActive: true },
      include: { labPartner: true },
      orderBy: { associatedAt: 'desc' },
    })

    let labs = associations.map((a) => ({
      id: a.labPartner.id,
      labName: a.labPartner.labName,
      ownerName: a.labPartner.ownerName,
      email: a.labPartner.email,
      mobile: a.labPartner.mobile,
      city: a.labPartner.city,
      specializations: a.labPartner.specializations,
      testsAvailable: a.labPartner.testsAvailable,
      commissionPercent: a.commissionPercent,
      associationId: a.id,
    }))

    if (specialization) {
      labs = labs.filter((l) => {
        if (l.specializations === 'both') return true
        return l.specializations === specialization
      })
    }

    if (includeCatalog && labs.length > 0) {
      // One grouped fetch for all labs: rows come back ordered by testCategory
      // then testName, so each lab's subsequence preserves that order too.
      const catalogRows = await db.labTestCatalog.findMany({
        where: { labPartnerId: { in: labs.map((l) => l.id) }, isActive: true },
        orderBy: [{ testCategory: 'asc' }, { testName: 'asc' }],
      })

      const catalogByLab = new Map<string, typeof catalogRows>()
      for (const row of catalogRows) {
        const list = catalogByLab.get(row.labPartnerId)
        if (list) list.push(row)
        else catalogByLab.set(row.labPartnerId, [row])
      }

      labs = labs.map((l) => ({
        ...l,
        catalog: (catalogByLab.get(l.id) ?? []).map((t) => ({
          id: t.id,
          testName: t.testName,
          testCategory: t.testCategory,
          fee: t.fee,
          sampleType: t.sampleType,
          turnaroundTime: t.turnaroundTime,
          isActive: t.isActive,
        })),
      }))
    }

    return NextResponse.json({ labs })
  } catch (error) {
    console.error('my-labs GET error:', error)
    return NextResponse.json({ error: 'Failed to load my labs' }, { status: 500 })
  }
}
