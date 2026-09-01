import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, 'hospital') || await requireRole(req, 'admin') || await requireRole(req, 'receptionist')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const claim = await db.insuranceClaim.findUnique({
      where: { id },
      include: {
        admission: { select: { patientName: true, admissionNo: true } },
        bill: { select: { billNo: true, netPayable: true } },
        policy: {
          include: {
            company: { select: { name: true, code: true } },
            tpa: { select: { name: true } },
            patient: { select: { name: true, mobileNo: true } },
          },
        },
        preAuth: { select: { preAuthNo: true, status: true, approvedAmount: true } },
        lineItems: true,
        documents: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    return NextResponse.json({ claim })
  } catch (error) {
    console.error('Claim detail error:', error)
    return NextResponse.json({ error: 'Failed to load claim' }, { status: 500 })
  }
}
