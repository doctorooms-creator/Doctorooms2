import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * GET /api/external-test-orders/[id]/report
 *   Doctor, Patient (own only): get the report(s) for this order.
 *   Returns reportUploads array + order context.
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    let user = await requireRole(req, 'doctor')
    if (!user) user = await requireRole(req, 'patient')
    if (!user) user = await requireRole(req, 'lab_technician')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const order = await db.externalTestOrder.findUnique({
      where: { id },
      select: {
        id: true,
        orderNo: true,
        doctorId: true,
        patientId: true,
        labPartnerId: true,
        testName: true,
        testType: true,
        testFee: true,
        status: true,
        urgency: true,
        orderedAt: true,
        completedAt: true,
        notes: true,
        reportUploads: true,
        labPartner: { select: { id: true, labName: true, city: true, mobile: true } },
      },
    })
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Authorization
    if (user.role === 'patient') {
      if (order.patientId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } else if (user.role === 'doctor') {
      const doctor = await db.doctor.findUnique({ where: { userId: user.id } })
      if (!doctor || doctor.id !== order.doctorId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } else if (user.role === 'lab_technician') {
      const partner = await db.labPartner.findFirst({ where: { userId: user.id } })
      if (!partner || partner.id !== order.labPartnerId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    return NextResponse.json({ order, reports: order.reportUploads })
  } catch (error) {
    console.error('report GET error:', error)
    return NextResponse.json({ error: 'Failed to load report' }, { status: 500 })
  }
}
