import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { emitToUserWithNotify } from '@/lib/emit-notification'
import { logCreate } from '@/lib/audit-log'

/**
 * GET /api/external-test-orders
 *   Doctor: list orders created by me. ?patientId / ?status / ?bookingId supported.
 *   Lab Technician: list orders routed to my lab (status defaults to "Ordered" + "InProgress").
 *   Patient: list orders for me (read-only).
 *
 * POST /api/external-test-orders
 *   Doctor: create one or more test orders for a patient (one per (test, lab) pair).
 *   Body shape:
 *   {
 *     patientId, bookingId?, notes?, urgency?,
 *     orders: [
 *       { testName, testType, testFee, labPartnerId, commissionPercent },
 *       ...
 *     ]
 *   }
 */
export async function GET(req: NextRequest) {
  try {
    let user = await requireRole(req, 'doctor')
    if (!user) user = await requireRole(req, 'lab_technician')
    if (!user) user = await requireRole(req, 'patient')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || ''
    const patientId = searchParams.get('patientId') || ''
    const bookingId = searchParams.get('bookingId') || ''

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (patientId) where.patientId = patientId
    if (bookingId) where.bookingId = bookingId

    if (user.role === 'doctor') {
      const doctor = await db.doctor.findUnique({ where: { userId: user.id } })
      if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
      where.doctorId = doctor.id
    } else if (user.role === 'lab_technician') {
      const partner = await db.labPartner.findFirst({ where: { userId: user.id } })
      // Internal lab technicians (LabTechnician model) have no LabPartner profile and
      // never receive external partner orders — return an empty list instead of 404 so
      // sidebar badges and dashboards polling this endpoint don't log errors.
      if (!partner) return NextResponse.json({ orders: [] })
      where.labPartnerId = partner.id
    } else if (user.role === 'patient') {
      where.patientId = user.id
    }

    const orders = await db.externalTestOrder.findMany({
      where,
      orderBy: { orderedAt: 'desc' },
      include: {
        labPartner: { select: { id: true, labName: true, city: true, mobile: true } },
        doctor: {
          include: { user: { select: { id: true, name: true, mobileNo: true } } },
        },
        patient: { select: { id: true, name: true, gender: true, mobileNo: true } },
        reportUploads: { select: { id: true, fileName: true, fileType: true, uploadedAt: true, notes: true, verifiedByDoctor: true, verifiedAt: true } },
        billing: { select: { id: true, amount: true, commissionAmount: true, paymentStatus: true } },
      },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('external-test-orders GET error:', error)
    return NextResponse.json({ error: 'Failed to load test orders' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const doctor = await db.doctor.findUnique({ where: { userId: user.id } })
    if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })

    const body = await req.json()
    const {
      patientId,
      bookingId,
      notes,
      urgency,
      orders = [],
    } = body

    if (!patientId || !Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ error: 'patientId and at least one order are required' }, { status: 400 })
    }

    // Verify patient exists
    const patient = await db.user.findUnique({ where: { id: patientId } })
    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 })

    // Verify the doctor has an association with each lab requested
    const labIds = Array.from(new Set(orders.map((o: { labPartnerId: string }) => o.labPartnerId)))
    const associations = await db.doctorLabAssociation.findMany({
      where: { doctorId: doctor.id, labPartnerId: { in: labIds }, isActive: true },
    })
    const assocByLab: Record<string, { commissionPercent: number }> = {}
    for (const a of associations) {
      assocByLab[a.labPartnerId] = { commissionPercent: a.commissionPercent }
    }

    const created = []
    for (const o of orders) {
      const assoc = assocByLab[o.labPartnerId]
      if (!assoc) {
        return NextResponse.json(
          { error: `Lab ${o.labPartnerId} is not associated with this doctor` },
          { status: 400 }
        )
      }
      const order = await db.externalTestOrder.create({
        data: {
          doctorId: doctor.id,
          patientId,
          labPartnerId: o.labPartnerId,
          bookingId: bookingId || null,
          testName: o.testName,
          testType: o.testType || 'Blood',
          testFee: typeof o.testFee === 'number' ? o.testFee : 0,
          status: 'Ordered',
          urgency: urgency || 'Normal',
          notes: notes || '',
        },
      })
      created.push(order)
    }

    // Group created orders by labPartnerId so each lab gets ONE consolidated
    // "new test order" notification (with count) instead of one per test.
    try {
      const grouped: Record<string, typeof created> = {}
      for (const o of created) {
        if (!grouped[o.labPartnerId]) grouped[o.labPartnerId] = []
        grouped[o.labPartnerId].push(o)
      }
      for (const labPartnerId of Object.keys(grouped)) {
        const labOrders = grouped[labPartnerId]
        const partner = await db.labPartner.findUnique({
          where: { id: labPartnerId },
          select: { userId: true, labName: true },
        })
        if (!partner) continue
        const first = labOrders[0]
        await emitToUserWithNotify(partner.userId, 'external-test-ordered', {
          orderId: first.id,
          orderNo: first.orderNo,
          testName: labOrders.length === 1 ? first.testName : `${labOrders.length} tests`,
          patientName: patient.name,
          doctorName: user.name,
          urgency: first.urgency,
          labName: partner.labName,
          count: labOrders.length,
          message: '',
        })
      }
    } catch (e) {
      console.error('emit failed:', e)
    }

    // Audit log: one entry per created order (granular audit trail)
    try {
      for (const order of created) {
        const partner = await db.labPartner.findUnique({
          where: { id: order.labPartnerId },
          select: { labName: true },
        })
        await logCreate(
          'external_test_order',
          order.id,
          user,
          `Created test order "${order.testName}" for ${patient.name} (lab: ${partner?.labName || 'unknown'})`,
          {
            testName: order.testName,
            testType: order.testType,
            testFee: order.testFee,
            patientId: patient.id,
            labPartnerId: order.labPartnerId,
            urgency: order.urgency,
          }
        )
      }
    } catch (auditErr) {
      console.error('[audit-log] external-test-orders create capture failed:', auditErr)
    }

    return NextResponse.json({ orders: created }, { status: 201 })
  } catch (error) {
    console.error('external-test-orders POST error:', error)
    return NextResponse.json({ error: 'Failed to create test orders' }, { status: 500 })
  }
}
