import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { emitToUserWithNotify } from '@/lib/emit-notification'
import { logStatusChange } from '@/lib/audit-log'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * POST /api/external-test-orders/[id]/reject
 *   Lab Technician: reject order (status -> Cancelled)
 *   Body: { reason: string }
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireRole(req, 'lab_technician')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const partner = await db.labPartner.findFirst({ where: { userId: user.id } })
    if (!partner) return NextResponse.json({ error: 'Lab partner profile not found' }, { status: 404 })

    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const reason = body.reason || ''

    const order = await db.externalTestOrder.findUnique({ where: { id } })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.labPartnerId !== partner.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (order.status === 'Completed' || order.status === 'Cancelled') {
      return NextResponse.json({ error: `Order already ${order.status}` }, { status: 400 })
    }

    const updated = await db.externalTestOrder.update({
      where: { id },
      data: {
        status: 'Cancelled',
        notes: `${order.notes}\n[Lab rejection: ${reason || 'No reason provided'}]`.trim(),
      },
    })

    // Notify the order's doctor that the lab rejected the order.
    try {
      const doctor = await db.doctor.findUnique({
        where: { id: order.doctorId },
        include: { user: { select: { id: true, name: true } } },
      })
      if (doctor?.user) {
        await emitToUserWithNotify(doctor.user.id, 'external-test-rejected', {
          orderId: order.id,
          orderNo: order.orderNo,
          testName: order.testName,
          labName: partner.labName,
          reason: reason || 'No reason provided',
          message: '',
        })
      }
    } catch (e) {
      console.error('emit failed:', e)
    }

    // Audit log: status change → Cancelled (warning severity)
    try {
      await logStatusChange(
        'external_test_order',
        order.id,
        order.status,
        'Cancelled',
        user,
        `Lab rejected order ${order.orderNo} — reason: ${reason || 'N/A'}`,
        { metadata: { reason, labName: partner.labName }, severity: 'warning' }
      )
    } catch (auditErr) {
      console.error('[audit-log] order reject capture failed:', auditErr)
    }

    return NextResponse.json({ order: updated })
  } catch (error) {
    console.error('order reject error:', error)
    return NextResponse.json({ error: 'Failed to reject order' }, { status: 500 })
  }
}
