import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { complaintIds } = body

    if (!Array.isArray(complaintIds)) {
      return NextResponse.json({ error: 'complaintIds array is required' }, { status: 400 })
    }

    // Verify prescription ownership
    const prescription = await db.prescription.findUnique({
      where: { id },
      select: { id: true, doctorId: true },
    })
    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    const doctor = await db.doctor.findUnique({
      where: { id: prescription.doctorId, userId: user.id },
      select: { id: true },
    })
    if (!doctor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete existing complaints
    await db.pCo.deleteMany({ where: { prescriptionId: id } })

    // Create new complaint links
    if (complaintIds.length > 0) {
      await db.pCo.createMany({
        data: complaintIds.map((coId: string) => ({
          prescriptionId: id,
          coId,
          createdById: user.id,
        })),
      })
    }

    // Fetch the saved complaints with master data for response.
    // PCo has NO relation to CoMaster (only raw coId), so hydrate manually —
    // `include: { co }` is a PrismaClientValidationError on this model (same
    // pattern as the prescription GET route).
    const savedRows = await db.pCo.findMany({ where: { prescriptionId: id } })
    const coIds = savedRows.map((c) => c.coId).filter(Boolean)
    const coMasters = coIds.length
      ? await db.coMaster.findMany({ where: { id: { in: coIds } } })
      : []
    const coMap = new Map(coMasters.map((c) => [c.id, c]))
    const savedComplaints = savedRows.map((c) => {
      const co = coMap.get(c.coId)
      return {
        ...c,
        co: co
          ? { id: co.id, coDetail: co.coDetail, coDetailEn: co.coDetailEn, coCode: co.coCode }
          : null,
      }
    })

    return NextResponse.json({ complaints: savedComplaints })
  } catch (error) {
    console.error('Save complaints error:', error)
    return NextResponse.json({ error: 'Failed to save complaints' }, { status: 500 })
  }
}
