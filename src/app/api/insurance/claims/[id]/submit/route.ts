import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, 'receptionist') || await requireRole(req, 'hospital')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const claim = await db.insuranceClaim.findUnique({ where: { id } })
    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }
    if (claim.status !== 'Draft') {
      return NextResponse.json({ error: 'Claim already submitted' }, { status: 400 })
    }

    const updated = await db.insuranceClaim.update({
      where: { id },
      data: {
        status: 'Submitted',
        submissionDate: new Date(),
      },
    })

    return NextResponse.json({ claim: { id: updated.id, status: updated.status } })
  } catch (error) {
    console.error('Claim submit error:', error)
    return NextResponse.json({ error: 'Failed to submit claim' }, { status: 500 })
  }
}
