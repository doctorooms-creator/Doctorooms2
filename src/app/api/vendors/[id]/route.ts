import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

async function getVendorAuth(request: NextRequest) {
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

// GET /api/vendors/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getVendorAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const vendor = await db.vendor.findUnique({
      where: { id },
      include: {
        expenses: {
          orderBy: { expenseDate: 'desc' },
          take: 50,
          include: { category: true },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 50,
        },
        _count: { select: { expenses: true, payments: true } },
      },
    })

    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

    // Scope check for hospital users
    if (!auth.isAdmin && vendor.hospitalId !== auth.hospitalId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ data: vendor })
  } catch (error) {
    console.error('Vendor GET error:', error)
    return NextResponse.json({ error: 'Failed to load vendor' }, { status: 500 })
  }
}

// PUT /api/vendors/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getVendorAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const existing = await db.vendor.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

    if (!auth.isAdmin && existing.hospitalId !== auth.hospitalId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const updated = await db.vendor.update({
      where: { id },
      data: {
        name: typeof body.name === 'string' ? body.name.trim() : undefined,
        category: typeof body.category === 'string' ? body.category.trim() : undefined,
        gstNo: typeof body.gstNo === 'string' ? body.gstNo.trim() : undefined,
        panNo: typeof body.panNo === 'string' ? body.panNo.trim() : undefined,
        contactPerson: typeof body.contactPerson === 'string' ? body.contactPerson.trim() : undefined,
        phoneNo: typeof body.phoneNo === 'string' ? body.phoneNo.trim() : undefined,
        email: typeof body.email === 'string' ? body.email.trim() : undefined,
        address: typeof body.address === 'string' ? body.address.trim() : undefined,
        city: typeof body.city === 'string' ? body.city.trim() : undefined,
        state: typeof body.state === 'string' ? body.state.trim() : undefined,
        pincode: typeof body.pincode === 'string' ? body.pincode.trim() : undefined,
        paymentTerms: typeof body.paymentTerms === 'string' ? body.paymentTerms.trim() : undefined,
        bankAccountNo: typeof body.bankAccountNo === 'string' ? body.bankAccountNo.trim() : undefined,
        bankIfsc: typeof body.bankIfsc === 'string' ? body.bankIfsc.trim() : undefined,
        status: typeof body.status === 'string' ? body.status : undefined,
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Vendor PUT error:', error)
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 })
  }
}

// DELETE /api/vendors/[id] — soft delete by setting status=Inactive
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getVendorAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const existing = await db.vendor.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

    if (!auth.isAdmin && existing.hospitalId !== auth.hospitalId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Soft delete — preserve audit trail and FK references on expenses/payments.
    const updated = await db.vendor.update({
      where: { id },
      data: { status: 'Inactive' },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Vendor DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 })
  }
}
