import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

// GET /api/lab-technician/profile
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, 'lab_technician')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tech = await db.labTechnician.findUnique({
      where: { userId: user.id },
      include: {
        user: { select: { name: true, email: true, mobileNo: true, profileImg: true, gender: true } },
        hospital: { select: { hospitalName: true } },
      },
    })

    if (!tech) {
      return NextResponse.json({ error: 'Lab technician not found' }, { status: 404 })
    }

    // Client renders `profile.hospital.name` — expose a `name` alias.
    const profile = {
      ...tech,
      hospital: tech.hospital ? { ...tech.hospital, name: tech.hospital.hospitalName } : null,
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Lab tech profile GET error:', error)
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
  }
}

// PUT /api/lab-technician/profile
export async function PUT(request: NextRequest) {
  try {
    const user = await requireRole(request, 'lab_technician')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { qualification, specialization, phoneNo } = body

    const updated = await db.labTechnician.update({
      where: { userId: user.id },
      data: {
        ...(qualification !== undefined && { qualification }),
        ...(specialization !== undefined && { specialization }),
        ...(phoneNo !== undefined && { phoneNo }),
      },
      include: {
        user: { select: { name: true, email: true, mobileNo: true, profileImg: true, gender: true } },
        hospital: { select: { hospitalName: true } },
      },
    })

    return NextResponse.json({
      profile: {
        ...updated,
        hospital: updated.hospital ? { ...updated.hospital, name: updated.hospital.hospitalName } : null,
      },
    })
  } catch (error) {
    console.error('Lab tech profile PUT error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
