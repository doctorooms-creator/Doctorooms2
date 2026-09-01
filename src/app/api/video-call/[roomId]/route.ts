import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { doctorDisplayName } from '@/lib/utils'

/**
 * GET /api/video-call/[roomId]
 *
 * Server-side authorization + context for a Jitsi video consultation room
 * (`doctorooms-<bookingId8>`). The frontend (video-call page) calls this
 * BEFORE mounting the Jitsi iframe so a bare room URL can never be opened
 * by an unrelated logged-in user.
 *
 * Authorization (any logged-in role may authenticate):
 *  - patient      → must be the booking's own patient (booking.userId)
 *  - doctor       → must be the booking's doctor (Doctor row via userId)
 *  - receptionist → linked to the booking's doctor OR its hospital
 *  - admin        → always allowed (observes as viewerRole 'receptionist')
 * All other roles (nurse, pharmacy, …) get 403.
 *
 * Live consultation state — every response is Cache-Control: no-store.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const { roomId } = await params

    const booking = await db.booking.findFirst({
      where: { videoRoomId: roomId },
      include: {
        // patient
        user: { select: { id: true, name: true, profileImg: true } },
        doctor: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Video room not found' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // ── Authorization ────────────────────────────────────────────────────
    // viewerRole drives how the frontend renders the room (doctor controls
    // vs patient join vs receptionist observation).
    let viewerRole: 'doctor' | 'patient' | 'receptionist'

    if (user.role === 'admin') {
      // Admins may observe any consultation, rendered like a receptionist.
      viewerRole = 'receptionist'
    } else if (user.role === 'patient') {
      if (booking.userId !== user.id) {
        return notAuthorized()
      }
      viewerRole = 'patient'
    } else if (user.role === 'doctor') {
      const doctor = await db.doctor.findUnique({
        where: { userId: user.id },
        select: { id: true },
      })
      if (!doctor || doctor.id !== booking.doctorId) {
        return notAuthorized()
      }
      viewerRole = 'doctor'
    } else if (user.role === 'receptionist') {
      const receptionist = await db.receptionist.findUnique({
        where: { userId: user.id },
      })
      if (
        !receptionist ||
        (receptionist.doctorId !== booking.doctorId &&
          receptionist.hospitalId !== booking.hospitalId)
      ) {
        return notAuthorized()
      }
      viewerRole = 'receptionist'
    } else {
      // nurse / pharmacy / hospital / lab_technician … — no access
      return notAuthorized()
    }

    // ── Context payload for the room UI ──────────────────────────────────
    // doctorDisplayName() prepends "Dr." only when missing, so a doctor
    // stored as "Dr. Anita Desai" never renders as "Dr. Dr. Anita Desai".
    return NextResponse.json(
      {
        success: true,
        viewerRole,
        booking: {
          id: booking.id,
          status: booking.status,
          bookingMode: booking.bookingMode,
          timeSlot: booking.timeSlot,
          bookingDate: booking.bookingDate,
          tokenNumber: booking.tokenNumber || null,
          patientName: booking.user?.name || 'Patient',
          patientImg: booking.user?.profileImg || null,
          doctorName: doctorDisplayName(booking.doctor?.user?.name),
          specialization: booking.doctor?.specialization || null,
          videoRoomId: booking.videoRoomId,
        },
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('GET /api/video-call/[roomId] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load consultation' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

function notAuthorized() {
  return NextResponse.json(
    { success: false, error: 'You are not authorized to join this consultation' },
    { status: 403, headers: { 'Cache-Control': 'no-store' } }
  )
}
