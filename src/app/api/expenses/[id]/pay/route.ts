import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { generateVendorPaymentNo } from '@/lib/expense-utils'

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

// POST /api/expenses/[id]/pay — mark as Paid, set paymentDate, create VendorPayment if vendor exists
export async function POST(
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

    if (existing.status !== 'Approved') {
      return NextResponse.json(
        { error: `Expense is in ${existing.status} state — only Approved expenses can be paid` },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const paymentMode = typeof body.paymentMode === 'string' ? body.paymentMode : existing.paymentMode
    const paymentRef = typeof body.paymentRef === 'string' ? body.paymentRef.trim() : existing.paymentRef
    const paymentDate = body.paymentDate ? new Date(body.paymentDate) : new Date()

    // Update expense to Paid
    const updated = await db.expense.update({
      where: { id },
      data: {
        status: 'Paid',
        paymentMode,
        paymentRef,
        paymentDate,
      },
      include: {
        category: { select: { id: true, name: true } },
        vendor: { select: { id: true, name: true } },
      },
    })

    // Create a VendorPayment if a vendor is linked
    let vendorPayment = null
    if (existing.vendorId) {
      const paymentNo = await generateVendorPaymentNo(existing.hospitalId)
      vendorPayment = await db.vendorPayment.create({
        data: {
          hospitalId: existing.hospitalId,
          vendorId: existing.vendorId,
          expenseId: existing.id,
          paymentNo,
          amount: existing.totalAmount,
          paymentMode,
          paymentRef,
          paymentDate,
          notes: `Auto-generated from expense ${existing.expenseNo}`,
          createdBy: auth.user.id,
        },
      })
    }

    return NextResponse.json({ data: updated, vendorPayment })
  } catch (error) {
    console.error('Expense pay error:', error)
    return NextResponse.json({ error: 'Failed to mark expense as paid' }, { status: 500 })
  }
}
