import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/commission/doctor
 *   Doctor: own commission summary (per lab + totals + per-month breakdown).
 *   Query: ?period=YYYY-MM (optional — defaults to current month for pending; all-time for total)
 *
 * Response shape:
 *   {
 *     summary: { totalCommission, totalRevenue, totalTests, paidCommission, pendingCommission },
 *     perLab: [{ labPartnerId, labName, tests, revenue, commission, pending, paid }],
 *     perMonth: [{ period, commission, revenue, tests, paid, pending }],
 *     recentBillings: [...most recent 10]
 *   }
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const doctor = await db.doctor.findUnique({ where: { userId: user.id } })
    if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })

    // All billings for this doctor
    const allBillings = await db.labBilling.findMany({
      where: { doctorId: doctor.id },
      include: { labPartner: { select: { id: true, labName: true, city: true } } },
      orderBy: { billedAt: 'desc' },
    })

    // Summary
    const totalCommission = allBillings.reduce((s, b) => s + b.commissionAmount, 0)
    const totalRevenue = allBillings.reduce((s, b) => s + b.amount, 0)
    const totalTests = allBillings.length
    const paidCommission = allBillings
      .filter((b) => b.paymentStatus === 'Paid')
      .reduce((s, b) => s + b.commissionAmount, 0)
    const pendingCommission = allBillings
      .filter((b) => b.paymentStatus === 'Pending')
      .reduce((s, b) => s + b.commissionAmount, 0)

    // Per lab
    const perLabMap = new Map<string, {
      labPartnerId: string
      labName: string
      city: string
      tests: number
      revenue: number
      commission: number
      pending: number
      paid: number
    }>()
    for (const b of allBillings) {
      const labId = b.labPartnerId
      if (!perLabMap.has(labId)) {
        perLabMap.set(labId, {
          labPartnerId: labId,
          labName: b.labPartner?.labName || 'Unknown Lab',
          city: b.labPartner?.city || '',
          tests: 0,
          revenue: 0,
          commission: 0,
          pending: 0,
          paid: 0,
        })
      }
      const e = perLabMap.get(labId)!
      e.tests += 1
      e.revenue += b.amount
      e.commission += b.commissionAmount
      if (b.paymentStatus === 'Pending') e.pending += b.commissionAmount
      else e.paid += b.commissionAmount
    }

    // Per month
    const perMonthMap = new Map<string, {
      period: string
      commission: number
      revenue: number
      tests: number
      paid: number
      pending: number
    }>()
    for (const b of allBillings) {
      const d = new Date(b.billedAt)
      const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!perMonthMap.has(period)) {
        perMonthMap.set(period, { period, commission: 0, revenue: 0, tests: 0, paid: 0, pending: 0 })
      }
      const e = perMonthMap.get(period)!
      e.tests += 1
      e.revenue += b.amount
      e.commission += b.commissionAmount
      if (b.paymentStatus === 'Paid') e.paid += b.commissionAmount
      else e.pending += b.commissionAmount
    }

    return NextResponse.json({
      summary: {
        totalCommission,
        totalRevenue,
        totalTests,
        paidCommission,
        pendingCommission,
      },
      perLab: Array.from(perLabMap.values()),
      perMonth: Array.from(perMonthMap.values()).sort((a, b) => (a.period < b.period ? 1 : -1)),
      recentBillings: allBillings.slice(0, 10).map((b) => ({
        id: b.id,
        amount: b.amount,
        commissionAmount: b.commissionAmount,
        commissionPercent: b.commissionPercent,
        paymentStatus: b.paymentStatus,
        billedAt: b.billedAt,
        paidAt: b.paidAt,
        transactionRef: b.transactionRef,
        labPartnerName: b.labPartner?.labName,
      })),
    })
  } catch (error) {
    console.error('commission/doctor GET error:', error)
    return NextResponse.json({ error: 'Failed to load commission' }, { status: 500 })
  }
}
