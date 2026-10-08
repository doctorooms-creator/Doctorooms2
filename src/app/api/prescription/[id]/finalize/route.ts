import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { sendQueueNotification, notifyApproachingPatient } from '@/lib/queue-notifications'
import { emitNotification } from '@/lib/emit-notification'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { nextVisit } = body

    // Verify prescription ownership
    const prescription = await db.prescription.findUnique({
      where: { id },
      select: { id: true, doctorId: true, bookingId: true },
    })
    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    const doctor = await db.doctor.findUnique({
      where: { id: prescription.doctorId, userId: user.id },
      select: {
        id: true,
        user: { select: { name: true } },
      },
    })
    if (!doctor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Read the booking BEFORE the status flip — the notification block below
    // must only fire when this finalize is what moved it off Approve.
    const bookingBeforeUpdate = await db.booking.findUnique({
      where: { id: prescription.bookingId },
      select: {
        id: true,
        status: true,
        userId: true,
        tokenNumber: true,
        tokenOrder: true,
        bookingDate: true,
        doctorId: true,
        departmentId: true,
      },
    })

    // ── P4-G: critical writes in ONE transaction ──
    // Prescription → Active (+ next visit) and booking → Visited commit
    // atomically; a failure can never leave the Rx finalized while the
    // booking still shows Approve (or vice-versa).
    await db.$transaction([
      db.prescription.update({
        where: { id },
        data: {
          status: 'Active',
          nextVisit: nextVisit ? new Date(nextVisit) : null,
        },
      }),
      db.booking.update({
        where: { id: prescription.bookingId },
        data: { status: 'Visited' },
      }),
    ])

    // ── P4-G: fire-and-forget tail (never blocks the print) ──
    // Queue notifications (patient-side "consultation started" + approaching
    // alert), department name lookup and the Rx #50 celebration are all
    // side-effects the doctor must NOT wait for — the old route awaited the
    // two notification sends inline before responding. Errors are swallowed
    // individually so one failing side-effect can't kill the rest.
    void (async () => {
      try {
        if (bookingBeforeUpdate && bookingBeforeUpdate.status === 'Approve') {
          // Booking has no `department` relation — fetch the name inline.
          let departmentName: string | null = null
          if (bookingBeforeUpdate.departmentId) {
            const dept = await db.department.findUnique({
              where: { id: bookingBeforeUpdate.departmentId },
              select: { name: true },
            })
            departmentName = dept?.name || null
          }

          const doctorName = doctor.user.name.replace('Dr. ', '')
          await sendQueueNotification('consultation_started', {
            bookingId: bookingBeforeUpdate.id,
            doctorId: doctor.id,
            patientUserId: bookingBeforeUpdate.userId,
            doctorName,
            tokenNumber: bookingBeforeUpdate.tokenNumber,
            departmentName,
          })
          await notifyApproachingPatient(
            doctor.id,
            bookingBeforeUpdate.tokenOrder,
            bookingBeforeUpdate.bookingDate
          )
        }
      } catch (err) {
        console.error('Finalize notification tail error:', err)
      }

      // ── Celebration moment: Rx #50 (roadmap) ─────────────────────────
      // Exactly-once: fires only when this finalize makes the doctor's ACTIVE
      // prescription count hit 50.
      try {
        const rxCount = await db.prescription.count({
          where: { doctorId: prescription.doctorId, status: 'Active' },
        })
        if (rxCount !== 50) return
        emitNotification('celebration', [`user:${user.id}`], {
          title: '🏆 50th Prescription!',
          message:
            'Aapne 50 prescriptions Doctorooms par likhi — practice fully digital ho gayi! Ye achievement celebrate karein 🎉',
          kind: 'rx50',
        })
        await db.notification.create({
          data: {
            userId: user.id,
            title: '🏆 50th Prescription Completed',
            message:
              'Congrats! Aapne apni 50th prescription Doctorooms par finalize ki. Practice fully digital ho gayi!',
          },
        })
      } catch {
        // Celebration must never surface as a finalize failure.
      }
    })()

    // ── Light response: the only client (step-6) never reads the body — it
    // immediately opens the print overlay, which fetches /print on its own.
    // The old route re-fetched the ENTIRE prescription (10+ relations) for
    // a payload nobody consumed.
    return NextResponse.json({
      ok: true,
      prescription: {
        id,
        status: 'Active',
        nextVisit: nextVisit || null,
        bookingStatus: 'Visited',
      },
    })
  } catch (error) {
    console.error('Finalize prescription error:', error)
    return NextResponse.json({ error: 'Failed to finalize prescription' }, { status: 500 })
  }
}
