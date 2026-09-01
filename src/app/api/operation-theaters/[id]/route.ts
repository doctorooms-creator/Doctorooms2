import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

interface Params {
  params: Promise<{ id: string }>
}

/** GET /api/operation-theaters/[id] — any authed role */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    let user = await requireRole(req, 'admin')
    if (!user) user = await requireRole(req, 'hospital')
    if (!user) user = await requireRole(req, 'receptionist')
    if (!user) user = await requireRole(req, 'doctor')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const ot = await db.operationTheater.findUnique({
      where: { id },
      include: {
        schedules: {
          orderBy: { scheduledDate: 'desc' },
          take: 20,
          include: {
            surgeon: { include: { user: { select: { id: true, name: true } } } },
          },
        },
        hospital: { select: { id: true, hospitalName: true } },
      },
    })
    if (!ot) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ operationTheater: ot })
  } catch (error) {
    console.error('operation-theater GET error:', error)
    return NextResponse.json({ error: 'Failed to load operation theater' }, { status: 500 })
  }
}

/** PUT /api/operation-theaters/[id] — admin or hospital */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    let user = await requireRole(req, 'admin')
    if (!user) user = await requireRole(req, 'hospital')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const updated = await db.operationTheater.update({
      where: { id },
      data: {
        name: body.name,
        otType: ['Major', 'Minor'].includes(body.otType) ? body.otType : undefined,
        floorNo: body.floorNo,
        status: ['Available', 'In-Use', 'Maintenance'].includes(body.status) ? body.status : undefined,
      },
    })
    return NextResponse.json({ operationTheater: updated })
  } catch (error) {
    console.error('operation-theater PUT error:', error)
    return NextResponse.json({ error: 'Failed to update operation theater' }, { status: 500 })
  }
}

/** DELETE /api/operation-theaters/[id] — admin or hospital */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    let user = await requireRole(req, 'admin')
    if (!user) user = await requireRole(req, 'hospital')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await db.operationTheater.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('operation-theater DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete operation theater' }, { status: 500 })
  }
}
