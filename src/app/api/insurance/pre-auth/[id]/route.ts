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
    const preAuth = await db.insurancePreAuth.findUnique({
      where: { id },
      include: {
        admission: { select: { patientName: true, admissionNo: true, patientAge: true, patientGender: true, initialDiagnosis: true } },
        policy: {
          include: {
            company: { select: { name: true, code: true } },
            tpa: { select: { name: true, code: true, preAuthEmail: true } },
            patient: { select: { name: true, mobileNo: true } },
          },
        },
      },
    })

    if (!preAuth) {
      return NextResponse.json({ error: 'Pre-auth not found' }, { status: 404 })
    }

    return NextResponse.json({ preAuth })
  } catch (error) {
    console.error('Pre-auth detail error:', error)
    return NextResponse.json({ error: 'Failed to load pre-auth' }, { status: 500 })
  }
}
