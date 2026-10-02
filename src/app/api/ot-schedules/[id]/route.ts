import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

interface Params {
  params: Promise<{ id: string }>
}

/** GET /api/ot-schedules/[id] — any authed role */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    let user = await requireRole(req, 'admin')
    if (!user) user = await requireRole(req, 'hospital')
    if (!user) user = await requireRole(req, 'receptionist')
    if (!user) user = await requireRole(req, 'doctor')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const schedule = await db.otSchedule.findUnique({
      where: { id },
      include: {
        ot: true,
        hospital: { select: { id: true, hospitalName: true, address: true, contactNo: true, email: true } },
        admission: {
          include: {
            patient: { select: { id: true, name: true, mobileNo: true, gender: true } },
            bed: { include: { ward: true } },
            attendingDoctor: { include: { user: { select: { id: true, name: true } } } },
          },
        },
        surgeon: { include: { user: { select: { id: true, name: true } } } },
      },
    })
    if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ schedule })
  } catch (error) {
    console.error('ot-schedule GET error:', error)
    return NextResponse.json({ error: 'Failed to load surgery schedule' }, { status: 500 })
  }
}

/** PUT /api/ot-schedules/[id] — admin / hospital / doctor (the surgeon) */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    let user = await requireRole(req, 'admin')
    if (!user) user = await requireRole(req, 'hospital')
    if (!user) user = await requireRole(req, 'receptionist')
    if (!user) user = await requireRole(req, 'doctor')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const existing = await db.otSchedule.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Doctor must be the assigned surgeon to edit
    if (user.role === 'doctor') {
      const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
      if (!doctor || existing.surgeonId !== doctor.id) {
        return NextResponse.json({ error: 'Forbidden — you are not the assigned surgeon' }, { status: 403 })
      }
    }

    const body = await req.json()

    // Status transitions for actions without a dedicated endpoint
    // (Start/Complete/Cancel use their own routes; Postponed is handled here)
    if (body.status === 'Postponed' && existing.status === 'Scheduled') {
      const updatedPostponed = await db.otSchedule.update({
        where: { id },
        data: {
          status: 'Postponed',
          notes: body.notes !== undefined ? body.notes : undefined,
        },
      })
      return NextResponse.json({ schedule: updatedPostponed })
    }

    const updated = await db.otSchedule.update({
      where: { id },
      data: {
        surgeonId: body.surgeonId !== undefined ? body.surgeonId : undefined,
        assistantSurgeons: body.assistantSurgeons !== undefined ? JSON.stringify(body.assistantSurgeons) : undefined,
        anesthetistId: body.anesthetistId !== undefined ? body.anesthetistId : undefined,
        nurseId: body.nurseId !== undefined ? body.nurseId : undefined,
        otTechnician: body.otTechnician,
        surgeryName: body.surgeryName,
        surgeryCategory: body.surgeryCategory,
        surgeryType: ['Elective', 'Emergency'].includes(body.surgeryType) ? body.surgeryType : undefined,
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : undefined,
        scheduledStartTime: body.scheduledStartTime,
        estimatedDuration: typeof body.estimatedDuration === 'number' ? body.estimatedDuration : undefined,
        notes: body.notes,
      },
    })
    return NextResponse.json({ schedule: updated })
  } catch (error) {
    console.error('ot-schedule PUT error:', error)
    return NextResponse.json({ error: 'Failed to update surgery schedule' }, { status: 500 })
  }
}
