import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/commission/admin
 *   Admin: full commission report across all doctors × all labs.
 *   Optional ?period=YYYY-MM (defaults to current month).
 *
 * Response shape:
 *   {
 *     summary: { totalCommission, totalRevenue, totalTests, pending, paid },
 *     matrix: [{ doctorId, doctorName, perLab: [{ labName, tests, commission }], totals: { tests, commission } }],
 *     perLab: [{ labId, labName, tests, revenue, commission, paid, pending }],
 *     perDoctor: [{ doctorId, doctorName, tests, commission, paid, pending }],
 *     recentBillings: [...]
 *   }
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'admin')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || ''

    const where: Record<string, unknown> = {}
    if (period) {
      // Filter billings in this period by billedAt year-month
      const [y, m] = period.split('-').map(Number)
      const start = new Date(y, m - 1, 1)
      const end = new Date(y, m, 1)
      where.AND = [{ billedAt: { gte: start } }, { billedAt: { lt: end } }]
    }

    const billings = await db.labBilling.findMany({
      where,
      include: {
        doctor: { include: { user: { select: { id: true, name: true } } } },
        labPartner: { select: { id: true, labName: true, city: true } },
        externalOrder: { select: { patientId: true, testName: true, testType: true } },
      },
      orderBy: { billedAt: 'desc' },
    })

    const totalCommission = billings.reduce((s, b) => s + b.commissionAmount, 0)
    const totalRevenue = billings.reduce((s, b) => s + b.amount, 0)
    const totalTests = billings.length
    const paid = billings
      .filter((b) => b.paymentStatus === 'Paid')
      .reduce((s, b) => s + b.commissionAmount, 0)
    const pending = billings
      .filter((b) => b.paymentStatus === 'Pending')
      .reduce((s, b) => s + b.commissionAmount, 0)

    // Matrix: doctor × lab
    const matrixMap = new Map<string, {
      doctorId: string
      doctorName: string
      perLab: Map<string, { labName: string; tests: number; commission: number }>
      tests: number
      commission: number
    }>()
    const perLabMap = new Map<string, { labId: string; labName: string; tests: number; revenue: number; commission: number; paid: number; pending: number }>()
    const perDoctorMap = new Map<string, { doctorId: string; doctorName: string; tests: number; commission: number; paid: number; pending: number }>()

    for (const b of billings) {
      const dId = b.doctorId
      const dName = b.doctor?.user?.name || 'Unknown Doctor'
      const lId = b.labPartnerId
      const lName = b.labPartner?.labName || 'Unknown Lab'

      if (!matrixMap.has(dId)) {
        matrixMap.set(dId, { doctorId: dId, doctorName: dName, perLab: new Map(), tests: 0, commission: 0 })
      }
      const dm = matrixMap.get(dId)!
      if (!dm.perLab.has(lId)) {
        dm.perLab.set(lId, { labName: lName, tests: 0, commission: 0 })
      }
      const dl = dm.perLab.get(lId)!
      dl.tests += 1
      dl.commission += b.commissionAmount
      dm.tests += 1
      dm.commission += b.commissionAmount

      if (!perLabMap.has(lId)) {
        perLabMap.set(lId, { labId: lId, labName: lName, tests: 0, revenue: 0, commission: 0, paid: 0, pending: 0 })
      }
      const ll = perLabMap.get(lId)!
      ll.tests += 1
      ll.revenue += b.amount
      ll.commission += b.commissionAmount
      if (b.paymentStatus === 'Paid') ll.paid += b.commissionAmount
      else ll.pending += b.commissionAmount

      if (!perDoctorMap.has(dId)) {
        perDoctorMap.set(dId, { doctorId: dId, doctorName: dName, tests: 0, commission: 0, paid: 0, pending: 0 })
      }
      const dd = perDoctorMap.get(dId)!
      dd.tests += 1
      dd.commission += b.commissionAmount
      if (b.paymentStatus === 'Paid') dd.paid += b.commissionAmount
      else dd.pending += b.commissionAmount
    }

    const matrix = Array.from(matrixMap.values()).map((dm) => ({
      doctorId: dm.doctorId,
      doctorName: dm.doctorName,
      perLab: Array.from(dm.perLab.values()),
      tests: dm.tests,
      commission: dm.commission,
    }))

    return NextResponse.json({
      summary: { totalCommission, totalRevenue, totalTests, paid, pending },
      matrix,
      perLab: Array.from(perLabMap.values()),
      perDoctor: Array.from(perDoctorMap.values()),
      recentBillings: billings.slice(0, 20).map((b) => ({
        id: b.id,
        amount: b.amount,
        commissionAmount: b.commissionAmount,
        commissionPercent: b.commissionPercent,
        paymentStatus: b.paymentStatus,
        billedAt: b.billedAt,
        paidAt: b.paidAt,
        transactionRef: b.transactionRef,
        doctorName: b.doctor?.user?.name,
        labName: b.labPartner?.labName,
        testName: b.externalOrder?.testName,
      })),
    })
  } catch (error) {
    console.error('commission/admin GET error:', error)
    return NextResponse.json({ error: 'Failed to load commission report' }, { status: 500 })
  }
}
