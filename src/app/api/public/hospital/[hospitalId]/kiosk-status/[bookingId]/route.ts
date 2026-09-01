import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * PUBLIC KIOSK STATUS — No auth required.
 * Patient polls this after submitting the kiosk form.
 * Returns booking status + token number once approved.
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ hospitalId: string; bookingId: string }> }
) {
  try {
    const { hospitalId, bookingId } = await params

    const booking = await db.booking.findFirst({
      where: { id: bookingId, hospitalId },
      select: {
        id: true,
        appointmentNo: true,
        status: true,
        tokenNumber: true,
        tokenOrder: true,
        patientName: true,
        timeSlot: true,
        bookingDate: true,
        // createdAt feeds the same-tokenOrder tiebreak in the queue position
        // count below — it was previously missing from the select (undefined
        // → tiebreak silently skipped).
        createdAt: true,
        departmentId: true,
        doctorId: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Fetch department + doctor info
    let department = null
    let doctor = null

    if (booking.departmentId) {
      department = await db.department.findUnique({
        where: { id: booking.departmentId },
        select: { name: true, shortCode: true, floorNo: true, opdRoom: true },
      })
    }

    if (booking.doctorId) {
      const doc = await db.doctor.findUnique({
        where: { id: booking.doctorId },
        include: { user: { select: { name: true } } },
      })
      if (doc) {
        // queuePaused (Phase 4): the kiosk status page shows an amber "Doctor's
        // queue is paused — approval may be delayed" hint while pending.
        doctor = { name: doc.user.name, specialization: doc.specialization, queuePaused: doc.queuePaused }
      }
    }

    // If approved, calculate queue position
    let queuePosition = 0
    let totalInQueue = 0
    if (booking.status === 'Approve' && booking.tokenOrder > 0) {
      const { start, end } = getISTRange(booking.bookingDate)
      const ahead = await db.booking.count({
        where: {
          doctorId: booking.doctorId!,
          bookingDate: { gte: start, lte: end },
          status: { in: ['Approve', 'Visited'] },
          id: { not: booking.id },
          OR: [
            { tokenOrder: { lt: booking.tokenOrder } },
            { tokenOrder: booking.tokenOrder, createdAt: { lt: booking.createdAt } },
          ],
        },
      })
      queuePosition = ahead + 1

      totalInQueue = await db.booking.count({
        where: {
          doctorId: booking.doctorId!,
          bookingDate: { gte: start, lte: end },
          status: { in: ['Approve', 'Visited'] },
        },
      })
    }

    return NextResponse.json({
      booking: {
        id: booking.id,
        appointmentNo: booking.appointmentNo,
        // status is ALWAYS present (incl. 'Rejected'/'NoShow') so the kiosk
        // status page can branch to the rose "not approved" panel.
        status: booking.status,
        tokenNumber: booking.tokenNumber || null,
        tokenOrder: booking.tokenOrder,
        patientName: booking.patientName,
        timeSlot: booking.timeSlot || null,
        queuePosition,
        totalInQueue,
      },
      department,
      doctor,
    })
  } catch (error) {
    console.error('Kiosk status error:', error)
    return NextResponse.json({ error: 'Failed to load status' }, { status: 500 })
  }
}

function getISTRange(date: Date) {
  const istOffset = 5.5 * 60 * 60 * 1000
  const istDate = new Date(date.getTime() + istOffset)
  const y = istDate.getUTCFullYear()
  const m = istDate.getUTCMonth()
  const d = istDate.getUTCDate()
  const startUTC = new Date(Date.UTC(y, m, d, 0, 0, 0) - istOffset)
  const endUTC = new Date(Date.UTC(y, m, d, 23, 59, 59, 999) - istOffset)
  return { start: startUTC, end: endUTC }
}
