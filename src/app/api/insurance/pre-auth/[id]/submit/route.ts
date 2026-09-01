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
    const preAuth = await db.insurancePreAuth.findUnique({ where: { id } })
    if (!preAuth) {
      return NextResponse.json({ error: 'Pre-auth not found' }, { status: 404 })
    }
    if (preAuth.status !== 'Pending') {
      return NextResponse.json({ error: 'Pre-auth already submitted' }, { status: 400 })
    }

    const updated = await db.insurancePreAuth.update({
      where: { id },
      data: {
        status: 'Submitted',
        submittedAt: new Date(),
        submittedBy: user.id,
      },
    })

    return NextResponse.json({ preAuth: { id: updated.id, status: updated.status } })
  } catch (error) {
    console.error('Pre-auth submit error:', error)
    return NextResponse.json({ error: 'Failed to submit pre-auth' }, { status: 500 })
  }
}
