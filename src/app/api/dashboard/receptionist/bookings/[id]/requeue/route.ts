import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/dashboard/receptionist/bookings/[id]/requeue
 *   Receptionist or Hospital: moves a "SentForTests" patient back to the normal queue.
 *   Changes booking status from "SentForTests" → "Approve".
 *   Used when lab reports are ready and patient returns to the doctor.
 *
 *   Body: { tokenNumber?: string }  (optional — re-generate token if needed)
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    let user = await requireRole(req, 'receptionist')
    if (!user) user = await requireRole(req, 'hospital')
    if (!user) user = await requireRole(req, 'admin')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const booking = await db.booking.findUnique({
      where: { id },
      select: { id: true, status: true, doctorId: true, patientName: true },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.status !== 'SentForTests') {
      return NextResponse.json(
        { error: 'Only patients sent for tests can be re-queued' },
        { status: 400 }
      )
    }

    // Change status back to Approve — patient re-enters the normal queue
    await db.booking.update({
      where: { id },
      data: { status: 'Approve' },
    })

    return NextResponse.json({
      success: true,
      message: `${booking.patientName} has been added back to the queue.`,
    })
  } catch (error) {
    console.error('Re-queue error:', error)
    return NextResponse.json({ error: 'Failed to re-queue patient' }, { status: 500 })
  }
}
