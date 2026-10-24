import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * POST /api/opd/repeat-rx — the "Repeat Last Rx" suggest→execute bridge.
 *
 * Phase D of PLAN-OPD-COCKPIT (decision D5): the cockpit chart rail SHOWS a
 * repeat suggestion for revisit-pattern patients; when the doctor taps it,
 * this route clones the patient's LAST completed Rx (medicines with doses,
 * diagnosis, advice) into a DRAFT for today's booking. The wizard auto-resumes
 * existing drafts (see /api/prescription/init), so the doctor lands in a
 * fully reviewable, editable copy — nothing is finalized or printed without
 * them. Safeguard law: the system suggests, the doctor executes.
 *
 * Rules:
 * - Booking must belong to THIS doctor and be live (Approve/Visited).
 * - Source Rx must be this doctor's, for the SAME patient (userId match),
 *   status Active, and attached to a DIFFERENT (earlier) booking.
 * - If a draft already exists for today's booking, it is returned as-is —
 *   an existing draft is NEVER overwritten.
 */

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { bookingId } = body as { bookingId?: string }
    if (!bookingId) return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })

    const doctor = await db.doctor.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })

    const booking = await db.booking.findFirst({
      where: { id: bookingId, doctorId: doctor.id, status: { in: ['Approve', 'Visited'] } },
      select: { id: true, patientName: true, age: true, userId: true },
    })
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    if (!booking.userId) {
      return NextResponse.json(
        { error: 'No past prescriptions for walk-ins without an account' },
        { status: 409 }
      )
    }

    // Never overwrite an existing draft for today's booking.
    const existingDraft = await db.prescription.findFirst({
      where: { bookingId: booking.id, status: 'Draft', doctorId: doctor.id },
      select: { id: true },
    })
    if (existingDraft) {
      return NextResponse.json({
        prescriptionId: existingDraft.id,
        created: false,
        medicineCount: null,
      })
    }

    // The patient's last completed Rx with THIS doctor (a different booking).
    const lastRx = await db.prescription.findFirst({
      where: {
        doctorId: doctor.id,
        status: 'Active',
        booking: { userId: booking.userId },
        bookingId: { not: booking.id },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        medicines: true,
        suggestions: true,
      },
    })
    if (!lastRx || lastRx.medicines.length === 0) {
      return NextResponse.json({ error: 'No past prescription with medicines to repeat' }, { status: 409 })
    }

    // Clone into a reviewable draft. Vitals are deliberately NOT cloned —
    // every visit measures fresh; only the therapeutic core carries over.
    const prescription = await db.prescription.create({
      data: {
        bookingId: booking.id,
        doctorId: doctor.id,
        patientName: booking.patientName || lastRx.patientName || '',
        patientAge: booking.age?.toString() || lastRx.patientAge || '',
        disease: lastRx.disease || '',
        description: lastRx.description || '',
        status: 'Draft',
        medicines: {
          create: lastRx.medicines.map((m) => ({
            medicine: m.medicine,
            morning: m.morning,
            afternoon: m.afternoon,
            evening: m.evening,
            tab: m.tab,
            dose: m.dose,
            description: m.description,
            createdById: m.createdById || null,
          })),
        },
        ...(lastRx.suggestions.length > 0
          ? {
              suggestions: {
                create: lastRx.suggestions.map((s) => ({
                  coId: s.coId || null,
                  question: s.question,
                  questionEn: s.questionEn,
                  suggestions: s.suggestions,
                  suggestionsEn: s.suggestionsEn,
                  createdById: s.createdById || null,
                })),
              },
            }
          : {}),
      },
    })

    return NextResponse.json(
      { prescriptionId: prescription.id, created: true, medicineCount: lastRx.medicines.length },
      { status: 201 }
    )
  } catch (error) {
    console.error('OPD repeat-rx POST error:', error)
    return NextResponse.json({ error: 'Failed to create repeat Rx draft' }, { status: 500 })
  }
}
