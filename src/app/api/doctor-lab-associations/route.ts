import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/doctor-lab-associations
 *   Doctor: list MY associations (default). ?doctorId=<id> supported (admin only).
 *   Admin: pass ?doctorId to view a specific doctor's associations.
 *
 * POST /api/doctor-lab-associations
 *   Doctor: associate self with an existing lab partner (by labPartnerId).
 *   Admin: pass ?doctorId in body to associate a specific doctor.
 *
 *   Body: { labPartnerId, commissionPercent?, notes? }  (and optionally doctorId for admin)
 */
export async function GET(req: NextRequest) {
  try {
    let user = await requireRole(req, 'doctor')
    if (!user) user = await requireRole(req, 'admin')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    let doctorId = searchParams.get('doctorId') || ''

    // Resolve current doctor's id
    if (user.role === 'doctor') {
      const doctor = await db.doctor.findUnique({ where: { userId: user.id } })
      if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
      doctorId = doctor.id
    } else if (!doctorId) {
      return NextResponse.json({ error: 'doctorId required for admin' }, { status: 400 })
    }

    const associations = await db.doctorLabAssociation.findMany({
      where: { doctorId, isActive: true },
      include: {
        labPartner: {
          include: {
            _count: { select: { externalOrders: true, reportUploads: true } },
          },
        },
      },
      orderBy: { associatedAt: 'desc' },
    })

    return NextResponse.json({ associations })
  } catch (error) {
    console.error('doctor-lab-assoc GET error:', error)
    return NextResponse.json({ error: 'Failed to load associations' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    let user = await requireRole(req, 'doctor')
    if (!user) user = await requireRole(req, 'admin')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { labPartnerId, commissionPercent, notes, doctorId: bodyDoctorId } = body

    if (!labPartnerId) {
      return NextResponse.json({ error: 'labPartnerId is required' }, { status: 400 })
    }

    let doctorId = bodyDoctorId || ''
    if (user.role === 'doctor') {
      const doctor = await db.doctor.findUnique({ where: { userId: user.id } })
      if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
      doctorId = doctor.id
    } else if (!doctorId) {
      return NextResponse.json({ error: 'doctorId required for admin' }, { status: 400 })
    }

    // Upsert (re-activate if previously deactivated)
    const existing = await db.doctorLabAssociation.findUnique({
      where: { doctorId_labPartnerId: { doctorId, labPartnerId } },
    })

    let association
    if (existing) {
      association = await db.doctorLabAssociation.update({
        where: { id: existing.id },
        data: {
          isActive: true,
          commissionPercent: typeof commissionPercent === 'number' ? commissionPercent : existing.commissionPercent,
          notes: notes ?? existing.notes,
        },
      })
    } else {
      association = await db.doctorLabAssociation.create({
        data: {
          doctorId,
          labPartnerId,
          commissionPercent: typeof commissionPercent === 'number' ? commissionPercent : 10,
          notes: notes || '',
        },
      })
    }

    return NextResponse.json({ association }, { status: 201 })
  } catch (error) {
    console.error('doctor-lab-assoc POST error:', error)
    return NextResponse.json({ error: 'Failed to create association' }, { status: 500 })
  }
}
