import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/lab-partners
 *   Admin: list ALL lab partners (with optional filters: status, search, createdBy)
 *   Doctor: list only lab partners associated with this doctor (via DoctorLabAssociation)
 *   Lab Technician: list only their own lab partner profile
 *
 * POST /api/lab-partners
 *   Admin or Doctor: create a new lab partner account.
 *   - Creates a User (role=lab_technician, status=Active)
 *   - Creates a LabPartner row linked to that User
 *   - If creator is a Doctor, also auto-creates a DoctorLabAssociation row
 */
export async function GET(req: NextRequest) {
  try {
    // Allow admin, doctor or lab_technician
    let user = await requireRole(req, 'admin')
    if (!user) user = await requireRole(req, 'doctor')
    if (!user) user = await requireRole(req, 'lab_technician')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''
    const createdBy = searchParams.get('createdBy') || ''

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (createdBy) where.createdBy = createdBy
    if (search) {
      where.OR = [
        { labName: { contains: search } },
        { ownerName: { contains: search } },
        { email: { contains: search } },
        { mobile: { contains: search } },
        { city: { contains: search } },
      ]
    }

    // Role-based filtering
    if (user.role === 'doctor') {
      // Get doctor.id from User.id
      const doctor = await db.doctor.findUnique({ where: { userId: user.id } })
      if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
      const associations = await db.doctorLabAssociation.findMany({
        where: { doctorId: doctor.id, isActive: true },
        select: { labPartnerId: true },
      })
      const labIds = associations.map((a) => a.labPartnerId)
      where.id = { in: labIds.length ? labIds : ['__none__'] }
    } else if (user.role === 'lab_technician') {
      // Lab tech: only their own profile
      where.userId = user.id
    }

    const partners = await db.labPartner.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { doctorAssociations: true, externalOrders: true, reportUploads: true } },
      },
    })

    return NextResponse.json({ partners })
  } catch (error) {
    console.error('lab-partners GET error:', error)
    return NextResponse.json({ error: 'Failed to load lab partners' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Admin or Doctor can create lab partners
    let user = await requireRole(req, 'admin')
    if (!user) user = await requireRole(req, 'doctor')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      labName,
      ownerName,
      email,
      mobile,
      altMobile,
      address,
      state,
      city,
      pincode,
      gstNo,
      registrationNo,
      specializations,
      testsAvailable,
      commissionPercent,
      password,
      hospitalId,
    } = body

    if (!labName || !email) {
      return NextResponse.json({ error: 'Lab name and email are required' }, { status: 400 })
    }

    // Check email uniqueness
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // 1. Create a User with role=lab_technician
    const newUser = await db.user.create({
      data: {
        name: ownerName || labName,
        email,
        role: 'lab_technician',
        status: 'Active',
        password: password || 'lab12345', // dev default — should be changed
        mobileNo: mobile || '',
      },
    })

    // 2. Create LabPartner
    const partner = await db.labPartner.create({
      data: {
        userId: newUser.id,
        hospitalId: hospitalId || null,
        labName,
        ownerName: ownerName || '',
        email,
        mobile: mobile || '',
        altMobile: altMobile || '',
        address: address || '',
        state: state || '',
        city: city || '',
        pincode: pincode || '',
        gstNo: gstNo || '',
        registrationNo: registrationNo || '',
        specializations: specializations || 'both',
        testsAvailable: testsAvailable || '[]',
        status: 'Active',
        createdBy: user.id,
      },
    })

    // 3. If creator is a doctor, auto-create DoctorLabAssociation
    if (user.role === 'doctor') {
      const doctor = await db.doctor.findUnique({ where: { userId: user.id } })
      if (doctor) {
        await db.doctorLabAssociation.create({
          data: {
            doctorId: doctor.id,
            labPartnerId: partner.id,
            commissionPercent: typeof commissionPercent === 'number' ? commissionPercent : 10,
            isActive: true,
          },
        })
      }
    }

    return NextResponse.json({ partner, userId: newUser.id }, { status: 201 })
  } catch (error) {
    console.error('lab-partners POST error:', error)
    return NextResponse.json({ error: 'Failed to create lab partner' }, { status: 500 })
  }
}
