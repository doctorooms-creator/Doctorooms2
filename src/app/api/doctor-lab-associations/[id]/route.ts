import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * DELETE /api/doctor-lab-associations/[id]
 *   Doctor (own) or Admin: deactivate association (soft delete via isActive=false)
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    let user = await requireRole(req, 'doctor')
    if (!user) user = await requireRole(req, 'admin')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const assoc = await db.doctorLabAssociation.findUnique({ where: { id } })
    if (!assoc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Doctor: must own this association
    if (user.role === 'doctor') {
      const doctor = await db.doctor.findUnique({ where: { userId: user.id } })
      if (!doctor || doctor.id !== assoc.doctorId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    await db.doctorLabAssociation.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('doctor-lab-assoc DELETE error:', error)
    return NextResponse.json({ error: 'Failed to remove association' }, { status: 500 })
  }
}

/**
 * PATCH /api/doctor-lab-associations/[id]
 *   Update commission percent or notes
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    let user = await requireRole(req, 'doctor')
    if (!user) user = await requireRole(req, 'admin')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    const assoc = await db.doctorLabAssociation.findUnique({ where: { id } })
    if (!assoc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (user.role === 'doctor') {
      const doctor = await db.doctor.findUnique({ where: { userId: user.id } })
      if (!doctor || doctor.id !== assoc.doctorId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const updated = await db.doctorLabAssociation.update({
      where: { id },
      data: {
        commissionPercent: typeof body.commissionPercent === 'number' ? body.commissionPercent : undefined,
        notes: body.notes ?? undefined,
      },
    })

    return NextResponse.json({ association: updated })
  } catch (error) {
    console.error('doctor-lab-assoc PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update association' }, { status: 500 })
  }
}
