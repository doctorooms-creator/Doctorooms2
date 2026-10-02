import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * Helper: resolve hospital auth for vendor routes.
 * Accepts hospital or admin roles.
 */
async function getVendorAuth(request: NextRequest) {
  let user = await requireRole(request, 'hospital')
  if (!user) user = await requireRole(request, 'admin')
  if (!user) return null

  // Admins can scope to any hospital via query string; otherwise no hospital.
  if (user.role === 'admin') {
    const url = new URL(request.url)
    const hospitalId = url.searchParams.get('hospitalId')
    return { user, hospitalId: hospitalId || null, isAdmin: true }
  }

  const hospital = await db.hospital.findUnique({ where: { userId: user.id } })
  if (!hospital) return null
  return { user, hospitalId: hospital.id, isAdmin: false }
}

// GET /api/vendors — list vendors with pagination + search
export async function GET(request: NextRequest) {
  try {
    const auth = await getVendorAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { hospitalId, isAdmin } = auth

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined
    const status = searchParams.get('status') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (hospitalId) where.hospitalId = hospitalId
    if (status) where.status = status
    if (category) where.category = category
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { contactPerson: { contains: search } },
        { phoneNo: { contains: search } },
        { email: { contains: search } },
        { gstNo: { contains: search } },
        { city: { contains: search } },
      ]
    }

    const [vendors, total] = await Promise.all([
      db.vendor.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { expenses: true, payments: true },
          },
        },
      }),
      db.vendor.count({ where }),
    ])

    return NextResponse.json({
      data: vendors,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      isAdmin,
    })
  } catch (error) {
    console.error('Vendors GET error:', error)
    return NextResponse.json({ error: 'Failed to load vendors' }, { status: 500 })
  }
}

// POST /api/vendors — create vendor
export async function POST(request: NextRequest) {
  try {
    const auth = await getVendorAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { hospitalId, isAdmin } = auth

    const body = await request.json()
    // Admins must specify a hospitalId in the body
    const targetHospitalId = isAdmin ? body.hospitalId : hospitalId
    if (!targetHospitalId) {
      return NextResponse.json({ error: 'hospitalId is required' }, { status: 400 })
    }

    const required = ['name']
    for (const f of required) {
      if (!body[f] || typeof body[f] !== 'string' || !body[f].trim()) {
        return NextResponse.json({ error: `Field '${f}' is required` }, { status: 400 })
      }
    }

    const vendor = await db.vendor.create({
      data: {
        hospitalId: targetHospitalId,
        name: body.name.trim(),
        category: body.category?.trim() || '',
        gstNo: body.gstNo?.trim() || '',
        panNo: body.panNo?.trim() || '',
        contactPerson: body.contactPerson?.trim() || '',
        phoneNo: body.phoneNo?.trim() || '',
        email: body.email?.trim() || '',
        address: body.address?.trim() || '',
        city: body.city?.trim() || '',
        state: body.state?.trim() || '',
        pincode: body.pincode?.trim() || '',
        paymentTerms: body.paymentTerms?.trim() || '',
        bankAccountNo: body.bankAccountNo?.trim() || '',
        bankIfsc: body.bankIfsc?.trim() || '',
        status: body.status || 'Active',
      },
    })

    return NextResponse.json({ data: vendor }, { status: 201 })
  } catch (error) {
    console.error('Vendors POST error:', error)
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 })
  }
}
