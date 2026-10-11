import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { getSlotTimes, nextOccurrence, SLOT_LABELS } from '@/lib/sevika/schedule'

export const dynamic = 'force-dynamic'

/** P3 adaptive rail: how long after dueAt a Missed/Skipped dose stays catchable. */
const CATCHUP_WINDOW_MS = 2 * 60 * 60 * 1000

const actionSchema = z.object({
  action: z.enum(['taken', 'skipped', 'snooze', 'reschedule']),
  toSlot: z.enum(['morning', 'afternoon', 'evening']).optional(),
})

/**
 * PATCH /api/dashboard/patient/sevika/doses/[id]
 * Patient marks a dose: taken / skipped / snooze (+10 min).
 * Snooze keeps the dose Pending with a new dueAt — the ticker will
 * gently remind again in 10 minutes.
 *
 * P3 (adaptive reschedule):
 *  - taken on a Missed/Skipped dose is allowed within the 2h CATCH-UP window
 *    ("der se lene me bhi faida hai") — response carries lateTaken: true.
 *  - action=reschedule moves a not-yet-decided dose to the patient's next
 *    personalised slot time (today if still ahead, else tomorrow).
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const dose = await db.sevikaDose.findFirst({
      where: { id, userId: user.id },
    })
    if (!dose) return NextResponse.json({ error: 'Dose not found' }, { status: 404 })

    const body = await req.json().catch(() => null)
    const parsed = actionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }
    const { action, toSlot } = parsed.data
    const now = new Date()
    const undecided = ['Pending', 'Reminded', 'Snoozed'].includes(dose.status)

    let data: { status: string; actionAt?: Date; dueAt?: Date; remindedAt?: Date | null; slot?: string }
    let extra: { lateTaken?: boolean; rescheduledTo?: string } = {}

    switch (action) {
      case 'taken': {
        if (dose.status === 'Taken') {
          return NextResponse.json({ dose, alreadyTaken: true })
        }
        if (!undecided) {
          // Missed / Skipped → only within the catch-up window
          const lateBy = now.getTime() - new Date(dose.dueAt).getTime()
          if (lateBy > CATCHUP_WINDOW_MS) {
            return NextResponse.json(
              {
                error:
                  '2 ghante se zyada ho gaye — is dose ko ab count nahi kar sakte. Agli dose time pe le lijiye.',
              },
              { status: 422 }
            )
          }
          extra = { lateTaken: true }
        }
        data = { status: 'Taken', actionAt: now }
        break
      }

      case 'skipped': {
        data = { status: 'Skipped', actionAt: now }
        break
      }

      case 'reschedule': {
        if (!undecided) {
          return NextResponse.json(
            { error: 'Ye dose already decide ho chuki hai — sirf baaki doses shift ho sakti hain.' },
            { status: 422 }
          )
        }
        if (!toSlot) {
          return NextResponse.json(
            { error: 'Kaunsa slot? (morning / afternoon / evening)' },
            { status: 422 }
          )
        }
        const slotTimes = await getSlotTimes(user.id)
        const target = nextOccurrence(slotTimes[toSlot])
        data = { status: 'Pending', dueAt: target, remindedAt: null, slot: toSlot }
        extra = { rescheduledTo: target.toISOString() }
        break
      }

      case 'snooze':
      default: {
        data = { status: 'Pending', dueAt: new Date(now.getTime() + 10 * 60 * 1000) }
        break
      }
    }

    const updated = await db.sevikaDose.update({
      where: { id: dose.id },
      data,
    })

    return NextResponse.json({
      dose: updated,
      slotLabel: toSlot ? SLOT_LABELS[toSlot]?.hi : undefined,
      ...extra,
    })
  } catch (err) {
    console.error('[sevika/doses/[id] PATCH] error:', err)
    return NextResponse.json({ error: 'Failed to update dose' }, { status: 500 })
  }
}
