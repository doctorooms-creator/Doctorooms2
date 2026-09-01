import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { emitToUserWithNotify } from '@/lib/emit-notification'
import { logStatusChange } from '@/lib/audit-log'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * POST /api/external-test-orders/[id]/accept
 *   Lab Technician: accept order (status Ordered -> InProgress)
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireRole(req, 'lab_technician')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const partner = await db.labPartner.findFirst({ where: { userId: user.id } })
    if (!partner) return NextResponse.json({ error: 'Lab partner profile not found' }, { status: 404 })

    const { id } = await params
    const order = await db.externalTestOrder.findUnique({ where: { id } })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.labPartnerId !== partner.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (order.status !== 'Ordered') {
      return NextResponse.json({ error: `Order cannot be accepted in ${order.status} state` }, { status: 400 })
    }

    const updated = await db.externalTestOrder.update({
      where: { id },
      data: { status: 'InProgress' },
    })

    // Notify the order's doctor that the lab accepted the order.
    try {
      const doctor = await db.doctor.findUnique({
        where: { id: order.doctorId },
        include: { user: { select: { id: true, name: true } } },
      })
      if (doctor?.user) {
        const patient = await db.user.findUnique({
          where: { id: order.patientId },
          select: { name: true },
        })
        await emitToUserWithNotify(doctor.user.id, 'external-test-accepted', {
          orderId: order.id,
          orderNo: order.orderNo,
          testName: order.testName,
          patientName: patient?.name || 'patient',
          labName: partner.labName,
          message: '',
        })
      }
    } catch (e) {
      console.error('emit failed:', e)
    }

    // Audit log: status change Ordered → InProgress
    try {
      await logStatusChange(
        'external_test_order',
        order.id,
        'Ordered',
        'InProgress',
        user,
        `Lab accepted order ${order.orderNo} (${order.testName})`,
        { metadata: { labName: partner.labName } }
      )
    } catch (auditErr) {
      console.error('[audit-log] order accept capture failed:', auditErr)
    }

    return NextResponse.json({ order: updated })
  } catch (error) {
    console.error('order accept error:', error)
    return NextResponse.json({ error: 'Failed to accept order' }, { status: 500 })
  }
}
