import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { validateBody, updatePolicySchema } from '@/lib/validations'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/patient-insurance/[id] — get policy detail
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const policy = await db.patientInsurancePolicy.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true, code: true, contactNo: true, cashlessSupported: true } },
        tpa: { select: { id: true, name: true, code: true, preAuthEmail: true } },
        patient: { select: { id: true, name: true, mobileNo: true } },
        claims: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true, claimNo: true, claimAmount: true, approvedAmount: true,
            status: true, createdAt: true, settlementDate: true,
          },
        },
        preAuths: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true, preAuthNo: true, requestedAmount: true, approvedAmount: true,
            status: true, createdAt: true,
          },
        },
      },
    })

    if (!policy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 })
    }

    // Patient can only access their own policy
    if (user.role === 'patient' && policy.patientId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    // Other roles can access if they are hospital/admin/receptionist
    const allowed = ['hospital', 'admin', 'receptionist']
    if (user.role !== 'patient' && !allowed.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({
      policy: {
        id: policy.id,
        patientId: policy.patientId,
        patientName: policy.patient.name,
        patientMobile: policy.patient.mobileNo,
        companyId: policy.companyId,
        companyName: policy.company.name,
        companyCode: policy.company.code,
        companyContact: policy.company.contactNo,
        cashlessSupported: policy.company.cashlessSupported,
        tpaId: policy.tpaId,
        tpaName: policy.tpa?.name || null,
        tpaCode: policy.tpa?.code || null,
        tpaPreAuthEmail: policy.tpa?.preAuthEmail || null,
        policyNo: policy.policyNo,
        policyType: policy.policyType,
        memberName: policy.memberName,
        memberRelation: policy.memberRelation,
        sumInsured: policy.sumInsured,
        copayPercent: policy.copayPercent,
        roomRentLimit: policy.roomRentLimit,
        validFrom: policy.validFrom.toISOString(),
        validTo: policy.validTo?.toISOString() || null,
        status: policy.status,
        claims: policy.claims,
        preAuths: policy.preAuths,
        createdAt: policy.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Patient insurance GET [id] error:', error)
    return NextResponse.json({ error: 'Failed to load policy' }, { status: 500 })
  }
}

// PUT /api/patient-insurance/[id] — update policy
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const allowed = ['patient', 'receptionist', 'hospital', 'admin']
    if (!allowed.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params

    const existing = await db.patientInsurancePolicy.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 })
    }

    // Patients can only update their own policy
    if (user.role === 'patient' && existing.patientId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const v = validateBody(updatePolicySchema, body)
    if (!v.success) return v.error
    const data = v.data

    // Build update payload (only allowed fields)
    const updateData: Record<string, unknown> = {}
    if (data.companyId !== undefined) updateData.companyId = data.companyId
    if (data.tpaId !== undefined) updateData.tpaId = data.tpaId || null
    if (data.policyNo !== undefined) updateData.policyNo = data.policyNo
    if (data.policyType !== undefined) updateData.policyType = data.policyType
    if (data.memberName !== undefined) updateData.memberName = data.memberName
    if (data.memberRelation !== undefined) updateData.memberRelation = data.memberRelation
    if (data.sumInsured !== undefined) updateData.sumInsured = data.sumInsured
    if (data.copayPercent !== undefined) updateData.copayPercent = data.copayPercent
    if (data.roomRentLimit !== undefined) updateData.roomRentLimit = data.roomRentLimit
    if (data.validFrom !== undefined) updateData.validFrom = new Date(data.validFrom)
    if (data.validTo !== undefined) updateData.validTo = data.validTo ? new Date(data.validTo) : null
    if (data.status !== undefined) updateData.status = data.status

    const updated = await db.patientInsurancePolicy.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ policy: updated })
  } catch (error) {
    console.error('Patient insurance PUT [id] error:', error)
    return NextResponse.json({ error: 'Failed to update policy' }, { status: 500 })
  }
}
