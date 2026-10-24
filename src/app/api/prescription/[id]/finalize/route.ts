import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { sendQueueNotification, notifyNextPatient } from '@/lib/queue-notifications'
import { emitNotification } from '@/lib/emit-notification'
import { callNextPatient, firstWaitingPatient, anyInConsultation, readAutoAdvanceCookie } from '@/lib/queue-lifecycle'

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
        queuePaused: true,
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
    // Prescription → Active (+ next visit) and booking → Finish commit
    // atomically; a failure can never leave the Rx finalized while the
    // booking still shows an active consultation status (or vice-versa).
    //
    // Real-life consultation lifecycle (PDF-audit Issue 4 root fix):
    // 'Save & Print' is the moment the patient LEAVES with the printed Rx —
    // the booking must close ('Finish') so the live queue / TV board /
    // reception desk immediately free the slot. The transient 'Visited'
    // ("In OPD") state is stamped when the wizard OPENS (see
    // /api/prescription/init), not when it closes.
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
        data: { status: 'Finish' },
      }),
    ])

    // ── Phase C: AUTO-ADVANCE (the crown jewel — 04 §2.2) ──
    // After the transaction, the consultation slot is free. If the doctor
    // has auto-advance ON (cookie v1, default on), the queue is NOT paused,
    // and nobody else is mid-consultation: call the next waiting patient
    // NOW — flip them to Visited + notify — and return them so the cockpit
    // swaps the hero card without waiting for a poll.
    // Safeguards: every failure here is swallowed — finalize NEVER fails
    // because auto-advance hiccuped.
    let nextBooking: { id: string; tokenNumber: string | null; patientName: string } | null = null
    let autoCalledNext = false
    try {
      const autoAdvanceOn = readAutoAdvanceCookie(req)
      if (autoAdvanceOn && !(doctor as { queuePaused?: boolean }).queuePaused) {
        const busy = await anyInConsultation(doctor.id)
        if (!busy) {
          const next = await firstWaitingPatient(doctor.id)
          if (next) {
            const called = await callNextPatient({
              doctorId: doctor.id,
              doctorName: doctor.user.name,
              bookingId: next.id,
            })
            if (called) {
              nextBooking = called
              autoCalledNext = true
            }
          }
        }
      }
    } catch (advErr) {
      console.error('Auto-advance error (non-fatal):', advErr)
    }

    // ── P4-G: fire-and-forget tail (never blocks the print) ──
    // Queue notifications (patient-side "consultation complete" + next
    // patient "your turn"), department name lookup and the Rx #50 celebration
    // are all side-effects the doctor must NOT wait for — the old route
    // awaited the two notification sends inline before responding. Errors
    // are swallowed individually so one failing side-effect can't kill the rest.
    void (async () => {
      try {
        // Consultation just COMPLETED (any pre-finalize active state counts:
        // normal flow = 'Visited' set by wizard init; legacy/edge = 'Approve'
        // if the wizard was opened before the init fix deployed).
        if (
          bookingBeforeUpdate &&
          ['Visited', 'Approve'].includes(bookingBeforeUpdate.status)
        ) {
          let departmentName: string | null = null
          if (bookingBeforeUpdate.departmentId) {
            const dept = await db.department.findUnique({
              where: { id: bookingBeforeUpdate.departmentId },
              select: { name: true },
            })
            departmentName = dept?.name || null
          }

          const doctorName = doctor.user.name.replace('Dr. ', '')
          await sendQueueNotification('consultation_completed', {
            bookingId: bookingBeforeUpdate.id,
            doctorId: doctor.id,
            patientUserId: bookingBeforeUpdate.userId,
            doctorName,
            tokenNumber: bookingBeforeUpdate.tokenNumber,
            departmentName,
          })
          // The consultation slot just freed — tell the very next waiting
          // patient it's their turn. When auto-advance already CALLED the
          // next patient (consultation_started sent there), this would be a
          // redundant second ping to the same person — skip it.
          if (!autoCalledNext) {
            await notifyNextPatient(
              doctor.id,
              bookingBeforeUpdate.tokenOrder,
              bookingBeforeUpdate.bookingDate
            )
          }
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
        bookingStatus: 'Finish',
      },
      // Phase C: the called-next patient (or null — queue empty / paused /
      // toggle off / someone mid-consultation). The cockpit hero swap and
      // the print overlay's "Next patient →" button consume this.
      nextBooking,
      autoCalledNext,
    })
  } catch (error) {
    console.error('Finalize prescription error:', error)
    return NextResponse.json({ error: 'Failed to finalize prescription' }, { status: 500 })
  }
}
