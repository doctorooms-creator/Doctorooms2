import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

// PUT: Update template
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, diagnosis, medicines, labs, advice, followUpDays, isCommon } = body

    // Verify ownership
    const existing = await db.prescriptionTemplate.findFirst({
      where: { id, doctorId: doctor.id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const updated = await db.prescriptionTemplate.update({
      where: { id },
      data: {
        name: name?.trim() || existing.name,
        diagnosis: diagnosis ?? existing.diagnosis,
        medicines: medicines ? JSON.stringify(medicines) : existing.medicines,
        labs: labs ? JSON.stringify(labs) : existing.labs,
        advice: advice ?? existing.advice,
        followUpDays: followUpDays ?? existing.followUpDays,
        isCommon: isCommon ?? existing.isCommon,
      },
    })

    return NextResponse.json({ template: { id: updated.id } })
  } catch (error) {
    console.error('Rx template PUT error:', error)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }
}

// DELETE: Delete template
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const { id } = await params

    // Verify ownership
    const existing = await db.prescriptionTemplate.findFirst({
      where: { id, doctorId: doctor.id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    await db.prescriptionTemplate.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Rx template DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}
