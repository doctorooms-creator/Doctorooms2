/**
 * Aturseva Agent — TOOLS (Phase 1, read-only).
 *
 * The agent can call these to fetch LIVE data the patient asks about.
 * Every tool is ownership-scoped (patient's own rows only) and returns
 * a plain JSON payload that is BOTH:
 *   1. persisted as an `action` message (rendered as a rich card), and
 *   2. injected back into the LLM context as a TOOL RESULT block.
 *
 * Phase 1 tools are strictly READ-ONLY — booking creation/cancellation via
 * chat needs an explicit human-confirm step (Phase 2, see plan §5).
 */

import { db } from '@/lib/db'
import { istDateRange } from '@/lib/date-utils'
import { slotAwareSort } from '@/lib/queue-ordering'

export type AtursevaToolName = 'search_doctors' | 'get_my_bookings' | 'get_queue_position'

export interface ToolCall {
  tool: AtursevaToolName
  args: Record<string, unknown>
}

export interface ActionResult {
  type: AtursevaToolName
  title: string
  data: Record<string, unknown>
}

// ─── Tool 1: search_doctors ─────────────────────────────────────────────────

interface DoctorHit {
  id: string
  name: string
  specialization: string
  city: string
  state: string
  fees: number
  experience: string
  profileImg: string | null
}

async function searchDoctors(args: Record<string, unknown>): Promise<ActionResult> {
  const query = typeof args.query === 'string' ? args.query.trim() : ''
  const specialization = typeof args.specialization === 'string' ? args.specialization.trim() : ''
  const city = typeof args.city === 'string' ? args.city.trim() : ''

  const where: Record<string, unknown> = {
    user: { status: 'Active' },
  }
  if (specialization || query) {
    where.OR = [
      ...(specialization
        ? [{ specialization: { contains: specialization} }]
        : []),
      ...(query
        ? [
            { specialization: { contains: query} },
            { user: { name: { contains: query} } },
          ]
        : []),
    ]
  }
  if (city) {
    where.city = { contains: city}
  }

  const doctors = await db.doctor.findMany({
    where,
    select: {
      id: true,
      specialization: true,
      city: true,
      state: true,
      fees: true,
      experience: true,
      user: { select: { name: true, profileImg: true } },
    },
    take: 6,
    orderBy: { createdAt: 'asc' },
  })

  const hits: DoctorHit[] = doctors.map((d) => ({
    id: d.id,
    name: d.user.name,
    specialization: d.specialization || 'General Physician',
    city: d.city || '',
    state: d.state || '',
    fees: d.fees || 0,
    experience: d.experience || '',
    profileImg: d.user.profileImg || null,
  }))

  return {
    type: 'search_doctors',
    title: hits.length
      ? `${hits.length} doctor${hits.length > 1 ? 's' : ''} mile`
      : 'Koi doctor nahi mila',
    data: {
      doctors: hits,
      note: hits.length
        ? undefined
        : 'Filters badal kar dobara poochhein — ya specialization/city batayein.',
    },
  }
}

// ─── Tool 2: get_my_bookings ────────────────────────────────────────────────

const STATUS_HI: Record<string, string> = {
  Pending: 'Approve ka intezaar',
  Approve: 'Confirm hai',
  Visited: 'Visit ho gayi',
  Finish: 'Complete',
  Canceled: 'Cancel ho gaya',
  Rejected: 'Reject hua',
}

async function getMyBookings(
  userId: string,
  _args: Record<string, unknown>
): Promise<ActionResult> {
  const now = new Date()
  const [upcoming, recentPast] = await Promise.all([
    db.booking.findMany({
      where: {
        userId,
        bookingDate: { gte: new Date(now.getTime() - 24 * 3600 * 1000) },
        status: { in: ['Pending', 'Approve'] },
      },
      include: {
        doctor: { select: { specialization: true, user: { select: { name: true } } } },
      },
      orderBy: { bookingDate: 'asc' },
      take: 6,
    }),
    db.booking.findMany({
      where: {
        userId,
        status: { in: ['Visited', 'Finish', 'Canceled', 'Rejected'] },
      },
      include: {
        doctor: { select: { specialization: true, user: { select: { name: true } } } },
      },
      orderBy: { bookingDate: 'desc' },
      take: 3,
    }),
  ])

  const rows = [...upcoming, ...recentPast].map((b) => ({
    id: b.id,
    doctor: b.doctor?.user?.name || 'Doctor',
    specialization: b.doctor?.specialization || '',
    dateIST: b.bookingDate.toISOString().slice(0, 10),
    timeSlot: b.timeSlot || '',
    mode: b.bookingMode || 'InPerson',
    status: b.status,
    statusHi: STATUS_HI[b.status] || b.status,
    tokenNumber: b.tokenNumber || null,
  }))

  return {
    type: 'get_my_bookings',
    title: upcoming.length
      ? `${upcoming.length} aane wala appointment${upcoming.length > 1 ? 's' : ''}`
      : 'Abhi koi aane wala appointment nahi',
    data: { bookings: rows },
  }
}

// ─── Tool 3: get_queue_position ─────────────────────────────────────────────

async function getQueuePosition(
  userId: string,
  args: Record<string, unknown>
): Promise<ActionResult> {
  const bookingId = typeof args.bookingId === 'string' ? args.bookingId : null
  const today = new Date().toISOString().slice(0, 10)
  const { start, end } = istDateRange(today)

  // Prefer the bookingId the model supplied; else today's own Approved/Pending booking.
  const booking = bookingId
    ? await db.booking.findFirst({
        where: { id: bookingId, userId },
        include: { doctor: { select: { specialization: true, user: { select: { name: true } } } } },
      })
    : await db.booking.findFirst({
        where: {
          userId,
          status: { in: ['Approve', 'Pending'] },
          bookingDate: { gte: start, lte: end },
        },
        include: { doctor: { select: { specialization: true, user: { select: { name: true } } } } },
        orderBy: { tokenOrder: 'asc' },
      })

  if (!booking) {
    return {
      type: 'get_queue_position',
      title: 'Aaj koi token nahi mila',
      data: {
        note: 'Aaj ke liye koi approve/pending appointment nahi hai. Booking karne me madad chahiye?',
      },
    }
  }

  const doctor = booking.doctor?.user?.name || 'Doctor'

  if (!booking.tokenNumber || booking.tokenOrder <= 0) {
    return {
      type: 'get_queue_position',
      title: 'Token abhi assign nahi hua',
      data: {
        bookingId: booking.id,
        doctor,
        dateIST: booking.bookingDate.toISOString().slice(0, 10),
        timeSlot: booking.timeSlot || '',
        status: booking.status,
        note: 'Clinic pahunch kar check-in/reception par token number milega — phir main live position bata sakti hoon.',
      },
    }
  }

  // Same computation as /api/patient/bookings/queue (slot-aware, must match the doctor's list)
  const dayRange = istDateRange(booking.bookingDate.toISOString().slice(0, 10))
  const queueBookings = await db.booking.findMany({
    where: {
      doctorId: booking.doctorId,
      bookingDate: { gte: dayRange.start, lte: dayRange.end },
      status: { in: ['Approve', 'Visited'] },
    },
    select: { id: true, tokenOrder: true, timeSlot: true, createdAt: true, isEmergency: true },
  })
  const sortedQueue = slotAwareSort(queueBookings)
  const myIndex = sortedQueue.findIndex((b) => b.id === booking.id)
  const patientsAhead = myIndex >= 0 ? myIndex : queueBookings.length
  const currentlyServing = await db.booking.findFirst({
    where: {
      doctorId: booking.doctorId,
      bookingDate: { gte: dayRange.start, lte: dayRange.end },
      status: 'Visited',
    },
    orderBy: { createdAt: 'desc' },
    select: { tokenNumber: true },
  })

  return {
    type: 'get_queue_position',
    title: `Aapka token #${booking.tokenNumber}`,
    data: {
      bookingId: booking.id,
      tokenNumber: booking.tokenNumber,
      position: patientsAhead + 1,
      patientsAhead,
      estimatedWaitMinutes: patientsAhead * 10,
      currentlyServing: currentlyServing?.tokenNumber || null,
      doctor,
      specialization: booking.doctor?.specialization || '',
      dateIST: booking.bookingDate.toISOString().slice(0, 10),
      timeSlot: booking.timeSlot || '',
      status: booking.status,
    },
  }
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────

export async function executeTool(userId: string, call: ToolCall): Promise<ActionResult> {
  switch (call.tool) {
    case 'search_doctors':
      return searchDoctors(call.args)
    case 'get_my_bookings':
      return getMyBookings(userId, call.args)
    case 'get_queue_position':
      return getQueuePosition(userId, call.args)
    default:
      return { type: 'search_doctors', title: 'Tool nahi mila', data: { note: 'Unknown tool' } }
  }
}

/** Compact tool catalogue for the system prompt. */
export const TOOL_CATALOGUE = `TOOLS — jab live data chahiye to SIRF inhi ko use karein:
1. search_doctors — doctor directory (args: {query?, specialization?, city?}) — "doctor dikhao", "Delhi me skin doctor"
2. get_my_bookings — mere appointments + status (args: {}) — "mera booking approve hua?", "agli appointment kab"
3. get_queue_position — aaj ka token/queue (args: {bookingId?}) — "mera number", "kitne log pehle hain"`
