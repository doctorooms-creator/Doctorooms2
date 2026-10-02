import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

// GET: List pre-auths
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'hospital') || await requireRole(req, 'admin') || await requireRole(req, 'receptionist')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const admissionId = searchParams.get('admissionId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (admissionId) where.admissionId = admissionId
    if (status) where.status = status

    const preAuths = await db.insurancePreAuth.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        admission: { select: { patientName: true, admissionNo: true } },
        policy: { include: { company: { select: { name: true } }, patient: { select: { name: true } } } },
      },
    })

    return NextResponse.json({ preAuths })
  } catch (error) {
    console.error('Pre-auth GET error:', error)
    return NextResponse.json({ error: 'Failed to load pre-auths' }, { status: 500 })
  }
}

// POST: Create pre-auth
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'receptionist') || await requireRole(req, 'hospital')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { admissionId, policyId, requestedAmount, diagnosis, procedures, estimatedDays } = body

    if (!admissionId || !policyId) {
      return NextResponse.json({ error: 'admissionId and policyId are required' }, { status: 400 })
    }

    const admission = await db.ipdAdmission.findUnique({ where: { id: admissionId }, select: { hospitalId: true, status: true } })
    if (!admission || admission.status !== 'Admitted') {
      return NextResponse.json({ error: 'Admission not found or not active' }, { status: 400 })
    }

    // Generate pre-auth number
    const count = await db.insurancePreAuth.count({ where: { hospitalId: admission.hospitalId } })
    const preAuthNo = `PA-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`

    const preAuth = await db.insurancePreAuth.create({
      data: {
        preAuthNo,
        admissionId,
        policyId,
        hospitalId: admission.hospitalId,
        requestedAmount: parseFloat(requestedAmount) || 0,
        diagnosis: diagnosis || '',
        procedures: JSON.stringify(procedures || []),
        estimatedDays: parseInt(estimatedDays) || 1,
        status: 'Pending',
        createdBy: user.id,
      },
    })

    return NextResponse.json({ preAuth: { id: preAuth.id, preAuthNo: preAuth.preAuthNo } }, { status: 201 })
  } catch (error) {
    console.error('Pre-auth POST error:', error)
    return NextResponse.json({ error: 'Failed to create pre-auth' }, { status: 500 })
  }
}
