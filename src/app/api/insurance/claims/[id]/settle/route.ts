import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, 'hospital') || await requireRole(req, 'admin')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { settlementAmount, settlementRef, deductions, notes } = body

    const claim = await db.insuranceClaim.findUnique({ where: { id } })
    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }
    if (!['Submitted', 'UnderReview', 'Approved', 'PartiallyApproved'].includes(claim.status)) {
      return NextResponse.json({ error: 'Claim not in a settleable state' }, { status: 400 })
    }

    const updated = await db.insuranceClaim.update({
      where: { id },
      data: {
        status: 'Settled',
        settlementDate: new Date(),
        settlementAmount: parseFloat(settlementAmount) || 0,
        settlementRef: settlementRef || '',
        deductions: JSON.stringify(deductions || []),
        notes: notes || '',
      },
    })

    return NextResponse.json({ claim: { id: updated.id, status: updated.status } })
  } catch (error) {
    console.error('Claim settle error:', error)
    return NextResponse.json({ error: 'Failed to settle claim' }, { status: 500 })
  }
}
