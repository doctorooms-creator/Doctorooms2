import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { generateExpenseNo } from '@/lib/expense-utils'
import { startOfMonth, endOfMonth } from 'date-fns'

async function getAuth(request: NextRequest) {
  let user = await requireRole(request, 'hospital')
  if (!user) user = await requireRole(request, 'admin')
  if (!user) return null

  if (user.role === 'admin') {
    const url = new URL(request.url)
    const hospitalId = url.searchParams.get('hospitalId')
    return { user, hospitalId: hospitalId || null, isAdmin: true }
  }

  const hospital = await db.hospital.findUnique({ where: { userId: user.id } })
  if (!hospital) return null
  return { user, hospitalId: hospital.id, isAdmin: false }
}

// GET /api/expenses — list with filters (date range, category, vendor, status, pagination)
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { hospitalId } = auth

    const { searchParams } = new URL(request.url)
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const categoryId = searchParams.get('categoryId') || undefined
    const vendorId = searchParams.get('vendorId') || undefined
    const status = searchParams.get('status') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (hospitalId) where.hospitalId = hospitalId
    if (categoryId) where.categoryId = categoryId
    if (vendorId) where.vendorId = vendorId
    if (status) where.status = status

    const dateRange: Record<string, Date> = {}
    if (fromDate) dateRange.gte = new Date(fromDate)
    if (toDate) {
      const t = new Date(toDate)
      t.setHours(23, 59, 59, 999)
      dateRange.lte = t
    }
    if (Object.keys(dateRange).length > 0) where.expenseDate = dateRange

    const [expenses, total] = await Promise.all([
      db.expense.findMany({
        where,
        orderBy: { expenseDate: 'desc' },
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true, type: true } },
          vendor: { select: { id: true, name: true, category: true } },
        },
      }),
      db.expense.count({ where }),
    ])

    // Summary: pending, approved, paid this month, total amount
    const monthStart = startOfMonth(new Date())
    const monthEnd = endOfMonth(new Date())
    const summaryWhere = hospitalId ? { hospitalId } : {}
    const [pendingAgg, approvedAgg, paidAgg, allAgg] = await Promise.all([
      db.expense.aggregate({
        where: { ...summaryWhere, status: 'Pending' },
        _sum: { totalAmount: true },
        _count: true,
      }),
      db.expense.aggregate({
        where: { ...summaryWhere, status: 'Approved' },
        _sum: { totalAmount: true },
        _count: true,
      }),
      db.expense.aggregate({
        where: {
          ...summaryWhere,
          status: 'Paid',
          paymentDate: { gte: monthStart, lte: monthEnd },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),
      db.expense.aggregate({
        where: summaryWhere,
        _sum: { totalAmount: true },
        _count: true,
      }),
    ])

    return NextResponse.json({
      data: expenses,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      summary: {
        pending: { count: pendingAgg._count, total: pendingAgg._sum.totalAmount || 0 },
        approved: { count: approvedAgg._count, total: approvedAgg._sum.totalAmount || 0 },
        paidThisMonth: { count: paidAgg._count, total: paidAgg._sum.totalAmount || 0 },
        all: { count: allAgg._count, total: allAgg._sum.totalAmount || 0 },
      },
    })
  } catch (error) {
    console.error('Expenses GET error:', error)
    return NextResponse.json({ error: 'Failed to load expenses' }, { status: 500 })
  }
}

// POST /api/expenses — create expense
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { hospitalId, isAdmin, user } = auth

    const body = await request.json()
    const targetHospitalId = isAdmin ? body.hospitalId : hospitalId
    if (!targetHospitalId) {
      return NextResponse.json({ error: 'hospitalId is required' }, { status: 400 })
    }
    if (!body.categoryId || typeof body.categoryId !== 'string') {
      return NextResponse.json({ error: 'categoryId is required' }, { status: 400 })
    }
    if (typeof body.amount !== 'number' || body.amount < 0) {
      return NextResponse.json({ error: 'amount must be a non-negative number' }, { status: 400 })
    }

    const amount = body.amount
    const taxAmount = typeof body.taxAmount === 'number' ? body.taxAmount : 0
    const totalAmount = amount + taxAmount

    const expenseNo = await generateExpenseNo(targetHospitalId)

    const expense = await db.expense.create({
      data: {
        hospitalId: targetHospitalId,
        categoryId: body.categoryId,
        vendorId: body.vendorId || null,
        expenseNo,
        expenseDate: body.expenseDate ? new Date(body.expenseDate) : new Date(),
        amount,
        taxAmount,
        totalAmount,
        paymentMode: body.paymentMode || 'Cash',
        paymentRef: typeof body.paymentRef === 'string' ? body.paymentRef.trim() : '',
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : null,
        description: typeof body.description === 'string' ? body.description.trim() : '',
        receiptUrl: typeof body.receiptUrl === 'string' ? body.receiptUrl.trim() : '',
        costCenterType: typeof body.costCenterType === 'string' ? body.costCenterType.trim() : '',
        costCenterId: body.costCenterId || null,
        status: body.status || 'Pending',
        createdBy: user.id,
      },
      include: {
        category: { select: { id: true, name: true, type: true } },
        vendor: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ data: expense }, { status: 201 })
  } catch (error) {
    console.error('Expense POST error:', error)
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}
