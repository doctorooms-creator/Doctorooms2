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
    const { status, approvedAmount, responseNotes, rejectionReason } = body

    if (!['Approved', 'PartiallyApproved', 'Rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const preAuth = await db.insurancePreAuth.findUnique({ where: { id } })
    if (!preAuth) {
      return NextResponse.json({ error: 'Pre-auth not found' }, { status: 404 })
    }
    if (preAuth.status !== 'Submitted') {
      return NextResponse.json({ error: 'Pre-auth not in Submitted state' }, { status: 400 })
    }

    const updated = await db.insurancePreAuth.update({
      where: { id },
      data: {
        status,
        approvedAmount: status === 'Rejected' ? 0 : parseFloat(approvedAmount) || 0,
        responseAt: new Date(),
        responseNotes: responseNotes || '',
        rejectionReason: status === 'Rejected' ? (rejectionReason || '') : '',
      },
    })

    return NextResponse.json({ preAuth: { id: updated.id, status: updated.status } })
  } catch (error) {
    console.error('Pre-auth respond error:', error)
    return NextResponse.json({ error: 'Failed to respond to pre-auth' }, { status: 500 })
  }
}
