import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { generateVendorPaymentNo } from '@/lib/expense-utils'

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

// GET /api/vendor-payments — list
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { hospitalId } = auth

    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (hospitalId) where.hospitalId = hospitalId
    if (vendorId) where.vendorId = vendorId

    const [payments, total] = await Promise.all([
      db.vendorPayment.findMany({
        where,
        orderBy: { paymentDate: 'desc' },
        skip,
        take: limit,
        include: {
          vendor: { select: { id: true, name: true, category: true } },
          expense: { select: { id: true, expenseNo: true, totalAmount: true } },
        },
      }),
      db.vendorPayment.count({ where }),
    ])

    return NextResponse.json({
      data: payments,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Vendor payments GET error:', error)
    return NextResponse.json({ error: 'Failed to load vendor payments' }, { status: 500 })
  }
}

// POST /api/vendor-payments — create payment (optionally linked to an expense)
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
    if (!body.vendorId || typeof body.vendorId !== 'string') {
      return NextResponse.json({ error: 'vendorId is required' }, { status: 400 })
    }
    if (typeof body.amount !== 'number' || body.amount <= 0) {
      return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 })
    }

    const paymentNo = await generateVendorPaymentNo(targetHospitalId)

    const payment = await db.vendorPayment.create({
      data: {
        hospitalId: targetHospitalId,
        vendorId: body.vendorId,
        expenseId: body.expenseId || null,
        paymentNo,
        amount: body.amount,
        paymentMode: body.paymentMode || 'Bank',
        paymentRef: typeof body.paymentRef === 'string' ? body.paymentRef.trim() : '',
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
        notes: typeof body.notes === 'string' ? body.notes.trim() : '',
        createdBy: user.id,
      },
      include: {
        vendor: { select: { id: true, name: true, category: true } },
        expense: { select: { id: true, expenseNo: true, totalAmount: true } },
      },
    })

    return NextResponse.json({ data: payment }, { status: 201 })
  } catch (error) {
    console.error('Vendor payment POST error:', error)
    return NextResponse.json({ error: 'Failed to create vendor payment' }, { status: 500 })
  }
}
