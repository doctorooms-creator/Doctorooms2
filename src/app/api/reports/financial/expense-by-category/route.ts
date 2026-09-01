import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { parseISO, startOfMonth, endOfMonth, format } from 'date-fns'

/**
 * GET /api/reports/financial/expense-by-category
 *
 * Query params: fromDate, toDate (YYYY-MM-DD). Defaults to current month.
 * Status filter: 'Paid' by default; pass ?status=all for all statuses.
 *
 * Returns: [{ category, type, count, amount }]
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
      fromDate = startOfMonth(now)
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
      select: {
        totalAmount: true,
        category: { select: { id: true, name: true, type: true } },
      },
    })

    const map = new Map<string, { category: string; type: string; count: number; amount: number }>()
    for (const e of expenses) {
      const key = e.category?.id || 'unknown'
      const existing = map.get(key) || {
        category: e.category?.name || 'Uncategorised',
        type: e.category?.type || 'Operating',
        count: 0,
        amount: 0,
      }
      existing.count += 1
      existing.amount += e.totalAmount
      map.set(key, existing)
    }

    const data = Array.from(map.values())
      .map((d) => ({ ...d, amount: Math.round(d.amount * 100) / 100 }))
      .sort((a, b) => b.amount - a.amount)

    return NextResponse.json({
      fromDate: format(fromDate, 'yyyy-MM-dd'),
      toDate: format(toDate, 'yyyy-MM-dd'),
      status: statusFilter,
      data,
      total: data.reduce((s, d) => s + d.amount, 0),
    })
  } catch (error) {
    console.error('Expense-by-category error:', error)
    return NextResponse.json({ error: 'Failed to load report data' }, { status: 500 })
  }
}
