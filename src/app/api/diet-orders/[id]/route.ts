import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

interface Params {
  params: Promise<{ id: string }>
}

/** GET /api/diet-orders/[id] — any authed role */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    let user = await requireRole(req, 'admin')
    if (!user) user = await requireRole(req, 'doctor')
    if (!user) user = await requireRole(req, 'hospital')
    if (!user) user = await requireRole(req, 'receptionist')
    if (!user) user = await requireRole(req, 'nurse')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const order = await db.dietOrder.findUnique({
      where: { id },
      include: {
        admission: {
          include: {
            patient: { select: { id: true, name: true, mobileNo: true } },
            bed: { include: { ward: true } },
          },
        },
        hospital: { select: { id: true, hospitalName: true, address: true, contactNo: true } },
      },
    })
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ dietOrder: order })
  } catch (error) {
    console.error('diet-order GET error:', error)
    return NextResponse.json({ error: 'Failed to load diet order' }, { status: 500 })
  }
}

/** PUT /api/diet-orders/[id] — update dietType / mealType / instructions / endDate */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    let user = await requireRole(req, 'admin')
    if (!user) user = await requireRole(req, 'doctor')
    if (!user) user = await requireRole(req, 'hospital')
    if (!user) user = await requireRole(req, 'receptionist')
    if (!user) user = await requireRole(req, 'nurse')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const existing = await db.dietOrder.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (existing.status === 'Stopped') {
      return NextResponse.json({ error: 'Cannot edit a stopped diet order' }, { status: 400 })
    }

    const body = await req.json()
    const updated = await db.dietOrder.update({
      where: { id },
      data: {
        dietType: body.dietType,
        mealType: body.mealType,
        instructions: body.instructions,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
    })
    return NextResponse.json({ dietOrder: updated })
  } catch (error) {
    console.error('diet-order PUT error:', error)
    return NextResponse.json({ error: 'Failed to update diet order' }, { status: 500 })
  }
}
