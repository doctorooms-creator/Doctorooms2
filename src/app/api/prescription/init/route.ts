import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { sendQueueNotification, notifyApproachingPatient } from '@/lib/queue-notifications'

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })
    }

    const doctor = await db.doctor.findUnique({
      where: { userId: user.id },
      select: { id: true, user: { select: { name: true } } },
    })
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    // Check if booking exists and belongs to this doctor
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        doctorId: true,
        patientName: true,
        age: true,
        gender: true,
        status: true,
        userId: true,
        tokenNumber: true,
        tokenOrder: true,
        bookingDate: true,
        departmentId: true,
      },
    })
    if (!booking || booking.doctorId !== doctor.id) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if draft prescription already exists for this booking
    const existingDraft = await db.prescription.findFirst({
      where: { bookingId, status: 'Draft', doctorId: doctor.id },
      select: { id: true },
    })

    if (existingDraft) {
      return NextResponse.json({ prescription: { id: existingDraft.id }, isNew: false })
    }

    // ── Real-life consultation lifecycle (PDF-audit Issue 4 root fix) ──
    // The wizard opening IS the moment the doctor calls the patient in.
    // Stamp 'Visited' (the transient "In OPD" state) right here so the
    // reception live queue / TV board / patient queue card all show the
    // patient as being served DURING the consultation — not after the Rx
    // is printed. 'Finish' is stamped by /finalize when the Rx is saved.
    if (booking.status === 'Approve') {
      await db.booking.update({
        where: { id: booking.id },
        data: { status: 'Visited' },
      })

      // Fire-and-forget notification tail — never blocks the wizard open.
      // Same semantics as the doctor status route's 'Visited' branch.
      void (async () => {
        try {
          let departmentName: string | null = null
          if (booking.departmentId) {
            const dept = await db.department.findUnique({
              where: { id: booking.departmentId },
              select: { name: true },
            })
            departmentName = dept?.name || null
          }
          await sendQueueNotification('consultation_started', {
            bookingId: booking.id,
            doctorId: doctor.id,
            patientUserId: booking.userId,
            doctorName: doctor.user.name.replace('Dr. ', ''),
            tokenNumber: booking.tokenNumber,
            departmentName,
          })
          await notifyApproachingPatient(
            doctor.id,
            booking.tokenOrder,
            booking.bookingDate
          )
        } catch (err) {
          console.error('Init notification tail error:', err)
        }
      })()
    }

    // Create new draft prescription
    const prescription = await db.prescription.create({
      data: {
        bookingId,
        doctorId: doctor.id,
        patientName: booking.patientName || '',
        patientAge: booking.age?.toString() || '',
        status: 'Draft',
      },
    })

    return NextResponse.json({ prescription: { id: prescription.id }, isNew: true }, { status: 201 })
  } catch (error) {
    console.error('Prescription init error:', error)
    return NextResponse.json({ error: 'Failed to initialize prescription' }, { status: 500 })
  }
}
