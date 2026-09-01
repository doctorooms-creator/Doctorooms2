import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

// GET: List claims
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

    const claims = await db.insuranceClaim.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        admission: { select: { patientName: true, admissionNo: true } },
        policy: { include: { company: { select: { name: true } }, patient: { select: { name: true } } } },
        tpa: { select: { name: true } },
      },
    })

    return NextResponse.json({ claims })
  } catch (error) {
    console.error('Claims GET error:', error)
    return NextResponse.json({ error: 'Failed to load claims' }, { status: 500 })
  }
}

// POST: Create claim
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'receptionist') || await requireRole(req, 'hospital')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { admissionId, billId, policyId, preAuthId } = body

    if (!admissionId || !billId || !policyId) {
      return NextResponse.json({ error: 'admissionId, billId, and policyId are required' }, { status: 400 })
    }

    const admission = await db.ipdAdmission.findUnique({ where: { id: admissionId }, select: { hospitalId: true } })
    if (!admission) {
      return NextResponse.json({ error: 'Admission not found' }, { status: 404 })
    }

    const bill = await db.ipdBill.findUnique({ where: { id: billId }, select: { netPayable: true, lineItems: true } })
    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    const policy = await db.patientInsurancePolicy.findUnique({ where: { id: policyId }, select: { companyId: true, tpaId: true, copayPercent: true } })
    if (!policy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 })
    }

    // Generate claim number
    const count = await db.insuranceClaim.count({ where: { hospitalId: admission.hospitalId } })
    const claimNo = `CLM-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`

    // Compute patient share vs TPA share based on copay
    const claimAmount = bill.netPayable
    const copay = policy.copayPercent / 100
    const patientPayable = claimAmount * copay
    const tpaPayable = claimAmount - patientPayable

    // Create claim + line items in a transaction
    const claim = await db.$transaction(async (tx) => {
      const newClaim = await tx.insuranceClaim.create({
        data: {
          claimNo,
          admissionId,
          billId,
          policyId,
          companyId: policy.companyId,
          hospitalId: admission.hospitalId,
          tpaId: policy.tpaId || null,
          preAuthId: preAuthId || null,
          claimAmount,
          patientPayable,
          tpaPayable,
          status: 'Draft',
          createdBy: user.id,
        },
      })

      // Mirror bill line items as claim line items
      for (const item of bill.lineItems) {
        await tx.claimLineItem.create({
          data: {
            claimId: newClaim.id,
            billLineItemId: item.id,
            itemName: item.itemName,
            claimedAmount: item.totalAmount,
            allowedAmount: item.totalAmount, // initially same; TPA may revise
          },
        })
      }

      return newClaim
    })

    return NextResponse.json({ claim: { id: claim.id, claimNo: claim.claimNo } }, { status: 201 })
  } catch (error) {
    console.error('Claim POST error:', error)
    return NextResponse.json({ error: 'Failed to create claim' }, { status: 500 })
  }
}
