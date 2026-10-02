import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { logStatusChange } from '@/lib/audit-log'
import { getAuditContext } from '@/lib/audit-context'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        doctor: {
          include: { user: { select: { name: true } } },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Verify booking belongs to user
    if (booking.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow cancel if Pending or Approve
    if (!['Pending', 'Approve'].includes(booking.status)) {
      return NextResponse.json(
        { error: `Cannot cancel booking with status: ${booking.status}` },
        { status: 400 }
      )
    }

    // Capture the pre-update status for the audit log (P2.8)
    const oldStatus = booking.status

    // Update status to Canceled
    await db.booking.update({
      where: { id },
      data: { status: 'Canceled' },
    })

    // Create notification for patient
    await db.notification.create({
      data: {
        userId: user.id,
        title: 'Appointment Canceled',
        message: `Your appointment with Dr. ${booking.doctor?.user?.name || 'Unknown'} has been canceled.`,
      },
    })

    // AUDIT (P2.8): Record patient-initiated cancellation.
    try {
      const auditCtx = getAuditContext(req)
      await logStatusChange(
        'booking',
        booking.id,
        oldStatus,
        'Canceled',
        user,
        `Cancelled appointment ${booking.appointmentNo || booking.id.slice(-8)}`,
        {
          metadata: { reason: 'Patient-initiated cancel' },
          hospitalId: booking.hospitalId || undefined,
          ...auditCtx,
        }
      )
    } catch (auditErr) {
      console.error('[audit-log] booking cancel capture failed:', auditErr)
    }

    return NextResponse.json({ success: true, status: 'Canceled' })
  } catch (error) {
    console.error('Cancel booking error:', error)
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
  }
}
