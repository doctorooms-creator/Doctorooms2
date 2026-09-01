import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * GET /api/lab-partners/[id]
 *   Admin, Doctor, or Lab Technician: get lab partner details
 *   Lab Technician can only access their own profile
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    let user = await requireRole(req, 'admin')
    if (!user) user = await requireRole(req, 'doctor')
    if (!user) user = await requireRole(req, 'lab_technician')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    // Lab tech can only view own profile
    if (user.role === 'lab_technician') {
      const own = await db.labPartner.findFirst({ where: { userId: user.id } })
      if (!own || own.id !== id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const partner = await db.labPartner.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, mobileNo: true, status: true } },
        doctorAssociations: {
          include: {
            doctor: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
        },
        testCatalog: { orderBy: { testName: 'asc' } },
        _count: { select: { externalOrders: true, reportUploads: true, billings: true } },
      },
    })

    if (!partner) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ partner })
  } catch (error) {
    console.error('lab-partner GET error:', error)
    return NextResponse.json({ error: 'Failed to load lab partner' }, { status: 500 })
  }
}

/**
 * PUT /api/lab-partners/[id]
 *   Admin only: update lab partner details
 */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await requireRole(req, 'admin')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    const partner = await db.labPartner.update({
      where: { id },
      data: {
        labName: body.labName,
        ownerName: body.ownerName,
        email: body.email,
        mobile: body.mobile,
        altMobile: body.altMobile,
        address: body.address,
        state: body.state,
        city: body.city,
        pincode: body.pincode,
        gstNo: body.gstNo,
        registrationNo: body.registrationNo,
        specializations: body.specializations,
        testsAvailable: body.testsAvailable,
        status: body.status,
        hospitalId: body.hospitalId || null,
      },
    })

    // Sync User fields (name, mobile, status) where provided
    if (body.email || body.mobile || body.status) {
      await db.user.update({
        where: { id: partner.userId },
        data: {
          ...(body.email && { email: body.email, name: body.ownerName || body.labName }),
          ...(body.mobile && { mobileNo: body.mobile }),
          ...(body.status && { status: body.status }),
        },
      })
    }

    return NextResponse.json({ partner })
  } catch (error) {
    console.error('lab-partner PUT error:', error)
    return NextResponse.json({ error: 'Failed to update lab partner' }, { status: 500 })
  }
}

/**
 * DELETE /api/lab-partners/[id]
 *   Admin only: deactivate (soft delete by status=Inactive)
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await requireRole(req, 'admin')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const partner = await db.labPartner.update({
      where: { id },
      data: { status: 'Inactive' },
    })

    await db.user.update({
      where: { id: partner.userId },
      data: { status: 'Inactive' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('lab-partner DELETE error:', error)
    return NextResponse.json({ error: 'Failed to deactivate lab partner' }, { status: 500 })
  }
}
