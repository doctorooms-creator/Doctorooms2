import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole, requireAuth } from '@/lib/api-auth'

// GET: List patient insurance policies
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get('patientId')

    const where: Record<string, unknown> = {}
    // Patients can only see their own policies
    if (user.role === 'patient') {
      where.patientId = user.id
    } else if (patientId) {
      where.patientId = patientId
    }

    const policies = await db.patientInsurancePolicy.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        company: { select: { name: true, code: true, cashlessSupported: true } },
        tpa: { select: { name: true, code: true } },
        patient: { select: { name: true, mobileNo: true } },
      },
    })

    return NextResponse.json({ policies })
  } catch (error) {
    console.error('Patient insurance GET error:', error)
    return NextResponse.json({ error: 'Failed to load policies' }, { status: 500 })
  }
}

// POST: Create patient insurance policy
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { patientId, companyId, tpaId, policyNo, policyType, memberName, memberRelation, sumInsured, copayPercent, roomRentLimit, validFrom, validTo } = body

    if (!patientId || !companyId || !policyNo) {
      return NextResponse.json({ error: 'patientId, companyId, and policyNo are required' }, { status: 400 })
    }

    // Patients can only create policies for themselves
    const effectivePatientId = user.role === 'patient' ? user.id : patientId

    const policy = await db.patientInsurancePolicy.create({
      data: {
        patientId: effectivePatientId,
        companyId,
        tpaId: tpaId || null,
        policyNo,
        policyType: policyType || 'Individual',
        memberName: memberName || '',
        memberRelation: memberRelation || 'Self',
        sumInsured: parseFloat(sumInsured) || 0,
        copayPercent: parseFloat(copayPercent) || 0,
        roomRentLimit: parseFloat(roomRentLimit) || 0,
        validFrom: new Date(validFrom || Date.now()),
        validTo: validTo ? new Date(validTo) : null,
        status: 'Active',
      },
    })

    return NextResponse.json({ policy: { id: policy.id } }, { status: 201 })
  } catch (error) {
    console.error('Patient insurance POST error:', error)
    return NextResponse.json({ error: 'Failed to create policy' }, { status: 500 })
  }
}
