import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/lab-billing/report
 *   Admin: list all lab billings with filters.
 *   Lab Technician: list billings for own lab.
 *
 *   Query: ?labPartnerId / ?doctorId / ?status (Pending|Paid) / ?period (YYYY-MM) / ?patientId
 */
export async function GET(req: NextRequest) {
  try {
    let user = await requireRole(req, 'admin')
    if (!user) user = await requireRole(req, 'lab_technician')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const labPartnerId = searchParams.get('labPartnerId') || ''
    const doctorId = searchParams.get('doctorId') || ''
    const status = searchParams.get('status') || ''
    const period = searchParams.get('period') || ''
    const patientId = searchParams.get('patientId') || ''

    const where: Record<string, unknown> = {}
    if (labPartnerId) where.labPartnerId = labPartnerId
    if (doctorId) where.doctorId = doctorId
    if (status) where.paymentStatus = status
    if (patientId) where.patientId = patientId
    if (period) {
      const [y, m] = period.split('-').map(Number)
      const start = new Date(y, m - 1, 1)
      const end = new Date(y, m, 1)
      where.AND = [{ billedAt: { gte: start } }, { billedAt: { lt: end } }]
    }

    // Lab technician: only own lab
    if (user.role === 'lab_technician') {
      const partner = await db.labPartner.findFirst({ where: { userId: user.id } })
      if (!partner) return NextResponse.json({ error: 'Lab partner profile not found' }, { status: 404 })
      where.labPartnerId = partner.id
    }

    const billings = await db.labBilling.findMany({
      where,
      orderBy: { billedAt: 'desc' },
      include: {
        labPartner: { select: { id: true, labName: true, city: true, ownerName: true } },
        doctor: { include: { user: { select: { id: true, name: true } } } },
        externalOrder: {
          select: {
            id: true,
            orderNo: true,
            testName: true,
            testType: true,
            patient: { select: { id: true, name: true, mobileNo: true } },
          },
        },
      },
    })

    const totalRevenue = billings.reduce((s, b) => s + b.amount, 0)
    const totalCommission = billings.reduce((s, b) => s + b.commissionAmount, 0)
    const labRevenue = billings.reduce((s, b) => s + (b.amount - b.commissionAmount), 0)
    const paidCommission = billings
      .filter((b) => b.paymentStatus === 'Paid')
      .reduce((s, b) => s + b.commissionAmount, 0)
    const pendingCommission = billings
      .filter((b) => b.paymentStatus === 'Pending')
      .reduce((s, b) => s + b.commissionAmount, 0)

    return NextResponse.json({
      billings,
      summary: {
        totalRevenue,
        totalCommission,
        labRevenue,
        paidCommission,
        pendingCommission,
        totalBills: billings.length,
      },
    })
  } catch (error) {
    console.error('lab-billing/report GET error:', error)
    return NextResponse.json({ error: 'Failed to load billing report' }, { status: 500 })
  }
}
