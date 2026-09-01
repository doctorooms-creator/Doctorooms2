import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

async function getAuth(request: NextRequest) {
  let user = await requireRole(request, 'hospital')
  if (!user) user = await requireRole(request, 'admin')
  if (!user) return null

  if (user.role === 'admin') {
    return { user, hospitalId: null as string | null, isAdmin: true }
  }

  const hospital = await db.hospital.findUnique({ where: { userId: user.id } })
  if (!hospital) return null
  return { user, hospitalId: hospital.id, isAdmin: false }
}

// GET /api/expenses/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const expense = await db.expense.findUnique({
      where: { id },
      include: {
        category: true,
        vendor: true,
        payments: { orderBy: { paymentDate: 'desc' } },
      },
    })
    if (!expense) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (!auth.isAdmin && expense.hospitalId !== auth.hospitalId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ data: expense })
  } catch (error) {
    console.error('Expense GET error:', error)
    return NextResponse.json({ error: 'Failed to load expense' }, { status: 500 })
  }
}

// PUT /api/expenses/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const existing = await db.expense.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (!auth.isAdmin && existing.hospitalId !== auth.hospitalId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Locked statuses — cannot edit once approved/paid
    if (['Paid', 'Cancelled'].includes(existing.status)) {
      return NextResponse.json(
        { error: `Cannot edit expense in ${existing.status} status` },
        { status: 400 }
      )
    }

    const body = await request.json()
    const amount = typeof body.amount === 'number' ? body.amount : existing.amount
    const taxAmount = typeof body.taxAmount === 'number' ? body.taxAmount : existing.taxAmount
    const totalAmount = amount + taxAmount

    const updated = await db.expense.update({
      where: { id },
      data: {
        categoryId: body.categoryId || undefined,
        vendorId: body.vendorId === null ? null : body.vendorId || undefined,
        expenseDate: body.expenseDate ? new Date(body.expenseDate) : undefined,
        amount: typeof body.amount === 'number' ? body.amount : undefined,
        taxAmount: typeof body.taxAmount === 'number' ? body.taxAmount : undefined,
        totalAmount,
        paymentMode: typeof body.paymentMode === 'string' ? body.paymentMode : undefined,
        paymentRef: typeof body.paymentRef === 'string' ? body.paymentRef.trim() : undefined,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : undefined,
        description: typeof body.description === 'string' ? body.description.trim() : undefined,
        receiptUrl: typeof body.receiptUrl === 'string' ? body.receiptUrl.trim() : undefined,
        costCenterType: typeof body.costCenterType === 'string' ? body.costCenterType.trim() : undefined,
        costCenterId: body.costCenterId === null ? null : body.costCenterId || undefined,
        status: typeof body.status === 'string' ? body.status : undefined,
      },
      include: {
        category: { select: { id: true, name: true, type: true } },
        vendor: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Expense PUT error:', error)
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
  }
}
