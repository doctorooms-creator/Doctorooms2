import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { logStatusChange } from '@/lib/audit-log'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * POST /api/diet-orders/[id]/stop
 *   Doctor, Hospital, Receptionist, Nurse, Admin: stop an active diet order.
 *   Body: { reason: string }
 *   Sets status → Stopped, stoppedBy → user, stoppedAt → now, stoppedReason.
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    let user = await requireRole(req, 'admin')
    if (!user) user = await requireRole(req, 'doctor')
    if (!user) user = await requireRole(req, 'hospital')
    if (!user) user = await requireRole(req, 'receptionist')
    if (!user) user = await requireRole(req, 'nurse')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const reason = body.reason || ''

    const existing = await db.dietOrder.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (existing.status === 'Stopped') {
      return NextResponse.json({ error: 'Diet order already stopped' }, { status: 400 })
    }

    // Resolve stoppedBy: for doctors, store Doctor.id; for others, User.id
    let stoppedBy = user.id
    if (user.role === 'doctor') {
      const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
      stoppedBy = doctor?.id || user.id
    }

    const updated = await db.dietOrder.update({
      where: { id },
      data: {
        status: 'Stopped',
        stoppedBy,
        stoppedAt: new Date(),
        stoppedReason: reason,
        endDate: existing.endDate || new Date(),
      },
    })

    // Audit log: diet order Active → Stopped
    try {
      await logStatusChange(
        'diet_order',
        id,
        'Active',
        'Stopped',
        user,
        `Stopped diet order "${existing.dietType}" — reason: ${reason || 'N/A'}`,
        { metadata: { reason } }
      )
    } catch (auditErr) {
      console.error('[audit-log] diet-order stop capture failed:', auditErr)
    }

    return NextResponse.json({ dietOrder: updated })
  } catch (error) {
    console.error('diet-order stop error:', error)
    return NextResponse.json({ error: 'Failed to stop diet order' }, { status: 500 })
  }
}
