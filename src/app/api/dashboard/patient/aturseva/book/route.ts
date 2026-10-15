import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { todayISTStr } from '@/lib/date-utils'
import { getSlotInventory, isSlotInventoryError, normalizeTimeString } from '@/lib/slot-inventory'
import { withSerializableTx } from '@/lib/token-utils'
import { logCreate } from '@/lib/audit-log'
import { getAuditContext } from '@/lib/audit-context'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/dashboard/patient/aturseva/book — Phase 2 confirm endpoint.
 *
 * The agent NEVER writes bookings. It only prepares a `prepare_booking`
 * CONFIRM card (validated read-only); the WRITE happens here, exclusively
 * when the patient presses the Confirm button on that card. This keeps the
 * human-in-the-loop rail: appointments move only on an explicit tap.
 *
 * Flow: re-validate (doctor/slot still free — the card may be minutes old)
 * → race-safe Serializable claim (same pattern as POST /api/patient/bookings)
 * → notifications (patient/doctor/reception) → audit log
 * → persist `booking_created` card + deterministic Aturseva reply into the
 * conversation thread → stamp lastReadAt (the patient is right here).
 */

const bodySchema = z.object({
  doctorId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  timeSlot: z.string().min(1).max(10),
  mode: z.enum(['InPerson', 'VideoCall']).default('InPerson'),
  disease: z.string().min(2, 'Booking reason is required').max(200),
})

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function dateLabel(dateStr: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (!m) return dateStr
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const utc = new Date(Date.UTC(y, mo - 1, d))
  const day = DAYS_EN[utc.getUTCDay()] || ''
  return `${day}, ${d} ${MONTHS_EN[mo - 1] || ''}`
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Validation failed' },
        { status: 422 }
      )
    }
    const { doctorId, date, mode, disease } = parsed.data
    const slot = normalizeTimeString(parsed.data.timeSlot)
    if (!slot) {
      return NextResponse.json({ error: 'Invalid time slot' }, { status: 400 })
    }

    if (date < todayISTStr()) {
      return NextResponse.json({ error: 'Beet chuki date par booking nahi ho sakti' }, { status: 400 })
    }

    const doctor = await db.doctor.findUnique({
      where: { id: doctorId },
      include: { user: { select: { name: true, status: true } } },
    })
    if (!doctor || doctor.user.status !== 'Active') {
      return NextResponse.json({ error: 'Ye doctor abhi available nahi hai' }, { status: 404 })
    }

    // Slot must STILL be free (the confirm card may be minutes old).
    let inv: Awaited<ReturnType<typeof getSlotInventory>>
    try {
      inv = await getSlotInventory(doctorId, date)
    } catch (err) {
      if (isSlotInventoryError(err)) {
        return NextResponse.json({ error: err.message }, { status: err.code === 'DOCTOR_NOT_FOUND' ? 404 : 400 })
      }
      throw err
    }
    if (!inv.available) {
      return NextResponse.json({ error: inv.reason || 'Is date par booking available nahi hai' }, { status: 400 })
    }
    const slotStatus = inv.slots.find((s) => s.time === slot)
    if (!slotStatus || slotStatus.status !== 'free') {
      return NextResponse.json(
        { error: slotStatus?.status === 'taken' ? 'Ye slot abhi book ho gaya — koi doosra slot chunein' : 'Ye slot available nahi hai' },
        { status: 409 }
      )
    }

    // Hospital attribution — mirror POST /api/patient/bookings (primary Active link).
    const primaryLink = await db.doctorHospital.findFirst({
      where: { doctorId, status: 'Active' },
      orderBy: { createdAt: 'asc' },
      select: { hospitalId: true, departmentId: true },
    })
    const effectiveHospitalId = primaryLink?.hospitalId
    const effectiveDepartmentId = primaryLink?.departmentId

    // Booking dates follow the app convention: UTC midnight of the IST date
    // (identical to new Date('YYYY-MM-DD') from the form flow). Occupancy is
    // matched on the IST day-window, exactly like the form flow.
    const dateObj = new Date(`${date}T00:00:00.000Z`)
    const dateOnly = new Date(dateObj.getTime() - 5.5 * 3600 * 1000) // IST 00:00 of that date
    const dayEnd = new Date(dateOnly.getTime() + 24 * 3600 * 1000)

    const appointmentNo = `APT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

    const claim = await withSerializableTx(async (tx) => {
      const activeCount = await tx.booking.count({
        where: {
          doctorId,
          bookingDate: { gte: dateOnly, lt: dayEnd },
          status: { in: ['Approve', 'Visited', 'Finish'] },
        },
      })
      if (activeCount >= doctor.dailyLimit) {
        return { kind: 'opd-limit' as const }
      }
      const conflict = await tx.booking.findFirst({
        where: {
          doctorId,
          bookingDate: { gte: dateOnly, lt: dayEnd },
          timeSlot: slot,
          status: { in: ['Approve', 'Visited', 'Finish'] },
        },
      })
      if (conflict) {
        return { kind: 'slot-conflict' as const }
      }
      const booking = await tx.booking.create({
        data: {
          appointmentNo,
          doctorId,
          userId: user.id,
          bookingDate: dateObj,
          timeSlot: slot,
          bookingMode: mode,
          bookingType: 'By Self',
          disease,
          description: 'Booked via Aturseva chat',
          gender: user.gender || 'Male',
          status: 'Pending',
          appointmentCharge: doctor.fees || 0,
          patientName: user.name,
          ...(effectiveHospitalId ? { hospitalId: effectiveHospitalId } : {}),
          ...(effectiveDepartmentId ? { departmentId: effectiveDepartmentId } : {}),
        },
      })
      return { kind: 'created' as const, booking }
    })

    if (claim.kind === 'opd-limit') {
      return NextResponse.json(
        { error: `${doctor.user.name.startsWith("Dr.") ? doctor.user.name : "Dr. " + doctor.user.name} ka OPD limit (${doctor.dailyLimit}) is date par full ho gaya hai` },
        { status: 400 }
      )
    }
    if (claim.kind === 'slot-conflict') {
      return NextResponse.json(
        { error: 'Ye slot abhi kisi aur ne book kar liya — koi doosra slot chunein' },
        { status: 409 }
      )
    }

    const { booking } = claim
    const docName = doctor.user.name.startsWith("Dr.") ? doctor.user.name : `Dr. ${doctor.user.name}`
    const label = dateLabel(date)

    // ── Notifications (same surfaces as the form flow, Aturseva wording) ──
    await db.notification.create({
      data: {
        userId: user.id,
        title: 'Booking Request Sent',
        message: `${docName} se ${label} ko ${slot} ka appointment Aturseva ke through book hua. Reception confirm hone ka intezaar karein.`,
      },
    })
    if (doctor.userId) {
      await db.notification.create({
        data: {
          userId: doctor.userId,
          title: 'New Appointment Booked',
          message: `${user.name} ne Aturseva chat se ${label} ko ${slot} ka appointment book kiya (reason: ${disease}).`,
          status: 'UNREAD',
        },
      })
    }
    if (effectiveHospitalId) {
      const receptionists = await db.receptionist.findMany({ where: { hospitalId: effectiveHospitalId } })
      for (const rec of receptionists) {
        await db.notification.create({
          data: {
            userId: rec.userId,
            title: 'New Appointment Booked',
            message: `${user.name} ne ${label} ko ${slot} ka appointment book kiya (Aturseva).`,
            status: 'UNREAD',
          },
        })
      }
    } else {
      const receptionist = await db.receptionist.findFirst({ where: { doctorId } })
      if (receptionist) {
        await db.notification.create({
          data: {
            userId: receptionist.userId,
            title: 'New Appointment Booked',
            message: `${user.name} ne ${docName} se ${label} ko ${slot} ka appointment book kiya (Aturseva).`,
            status: 'UNREAD',
          },
        })
      }
    }

    // ── Audit (P2.8 parity with the form flow) ──
    try {
      const auditCtx = getAuditContext(req)
      await logCreate(
        'booking',
        booking.id,
        user,
        `Created appointment via Aturseva chat for ${docName} on ${label} at ${slot}`,
        {
          doctorId,
          patientId: user.id,
          bookingDate: booking.bookingDate.toISOString(),
          timeSlot: slot,
          bookingMode: mode,
          source: 'aturseva-chat',
          hospitalId: effectiveHospitalId || null,
        },
        { severity: 'info', ...(effectiveHospitalId ? { hospitalId: effectiveHospitalId } : {}), ...auditCtx }
      )
    } catch (auditErr) {
      console.error('[audit-log] aturseva booking create capture failed:', auditErr)
    }

    // ── Persist into the conversation thread (card + deterministic reply) ──
    const card = {
      type: 'booking_created',
      title: 'Booking ho gayi — approve ka intezaar',
      data: {
        bookingId: booking.id,
        appointmentNo: booking.appointmentNo,
        doctor: docName,
        specialization: doctor.specialization || 'General Physician',
        date,
        dateLabel: label,
        timeSlot: slot,
        mode,
        fees: doctor.fees || 0,
        status: 'Pending',
        statusHi: 'Approve ka intezaar',
      },
    }
    const reply = `Ho gaya! ✅ ${docName} se ${label} ko ${slot} baje ka appointment book ho gaya — abhi approve ka intezaar me hai. Reception confirm karte hi status update ho jayega, aur main aapko bataungi. Poori detail Appointments page par hai.`
    try {
      const conversation = await db.atursevaConversation.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: { updatedAt: new Date() },
      })
      await db.atursevaMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'action',
          content: '',
          actionType: card.type,
          actionJson: JSON.stringify({ title: card.title, data: card.data }),
        },
      })
      await db.atursevaMessage.create({
        data: { conversationId: conversation.id, role: 'aturseva', content: reply },
      })
      // Stamp read AFTER the new rows exist — the patient pressed Confirm in
      // this very thread, so these two messages must NOT light up the badge.
      await db.atursevaConversation.update({
        where: { id: conversation.id },
        data: { lastReadAt: new Date() },
      })
    } catch (persistErr) {
      // The BOOKING itself is created — thread persistence is best-effort.
      console.error('[aturseva/book] thread persistence failed:', persistErr)
    }

    return NextResponse.json({ success: true, booking, card }, { status: 201 })
  } catch (error) {
    console.error('[aturseva/book] error:', error)
    return NextResponse.json({ error: 'Booking banane me dikkat aayi — dobara try karein' }, { status: 500 })
  }
}
