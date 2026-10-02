import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import {
  parseISO,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  format,
  subMonths,
} from 'date-fns'

/**
 * GET /api/reports/financial/expense-trend
 *
 * Query params: fromDate, toDate (YYYY-MM-DD). Defaults to last 12 months.
 * Status filter: 'Paid' by default; pass ?status=all for all statuses.
 *
 * Returns: {
 *   fromDate, toDate,
 *   monthly: [{ month, total, count, paid, approved, pending }],
 *   total, totalCount
 * }
 */
export async function GET(req: NextRequest) {
  try {
    const user = (await requireRole(req, 'hospital')) || (await requireRole(req, 'admin'))
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const fromDateStr = searchParams.get('fromDate')
    const toDateStr = searchParams.get('toDate')
    const statusFilter = searchParams.get('status') || 'Paid'

    const now = new Date()
    let fromDate: Date
    let toDate: Date
    if (fromDateStr && toDateStr) {
      fromDate = startOfMonth(parseISO(fromDateStr))
      toDate = endOfMonth(parseISO(toDateStr))
    } else {
      // Last 12 months by default
      fromDate = startOfMonth(subMonths(now, 11))
      toDate = endOfMonth(now)
    }

    const hospitalFilter = user.role === 'admin' ? {} : { hospitalId: user.id }
    const where: Record<string, unknown> = {
      ...hospitalFilter,
      expenseDate: { gte: fromDate, lte: toDate },
    }
    if (statusFilter !== 'all') where.status = statusFilter

    const expenses = await db.expense.findMany({
      where,
      select: { totalAmount: true, status: true, expenseDate: true },
    })

    const months = eachMonthOfInterval({ start: fromDate, end: toDate })
    const monthly = months.map((m) => {
      const mStart = startOfMonth(m)
      const mEnd = endOfMonth(m)
      const inMonth = expenses.filter(
        (e) => e.expenseDate >= mStart && e.expenseDate <= mEnd
      )
      const sum = (status: string) =>
        inMonth.filter((e) => e.status === status).reduce((s, e) => s + e.totalAmount, 0)
      return {
        month: format(m, 'MMM yy'),
        total: Math.round(inMonth.reduce((s, e) => s + e.totalAmount, 0) * 100) / 100,
        count: inMonth.length,
        paid: Math.round(sum('Paid') * 100) / 100,
        approved: Math.round(sum('Approved') * 100) / 100,
        pending: Math.round(sum('Pending') * 100) / 100,
      }
    })

    const total = expenses.reduce((s, e) => s + e.totalAmount, 0)

    return NextResponse.json({
      fromDate: format(fromDate, 'yyyy-MM-dd'),
      toDate: format(toDate, 'yyyy-MM-dd'),
      status: statusFilter,
      monthly,
      total: Math.round(total * 100) / 100,
      totalCount: expenses.length,
    })
  } catch (error) {
    console.error('Expense-trend error:', error)
    return NextResponse.json({ error: 'Failed to load report data' }, { status: 500 })
  }
}
