/**
 * Aturseva Agent — TOOLS (Phase 2: booking-via-chat + geolocation).
 *
 * The agent can call these to fetch LIVE data the patient asks about.
 * Every tool is ownership-scoped (patient's own rows only) and returns
 * a plain JSON payload that is BOTH:
 *   1. persisted as an `action` message (rendered as a rich card), and
 *   2. injected back into the LLM context as a TOOL RESULT block.
 *
 * Phase 2 additions:
 *   - get_doctor_slots     (read-only)  → free-slot chips via slot-inventory service
 *   - find_nearby_doctors  (read-only)  → haversine against Doctor.lat/longi using
 *                                        the GPS location the patient shared in the
 *                                        chat POST body (ToolContext.location)
 *   - prepare_booking      (validate-only!) → builds the CONFIRM card; the actual
 *                                        booking happens ONLY when the patient presses
 *                                        the Confirm button → POST /aturseva/book
 *                                        (human confirmation where appointments move).
 *
 * Tools return ToolOutcome: {ok:true, result} → card emitted + persisted;
 * {ok:false, error} → NO card; the error is fed to the LLM so it can react
 * conversationally (ask for the missing reason, suggest another slot, …).
 */

import { db } from '@/lib/db'
import { istDateRange, todayISTStr } from '@/lib/date-utils'
import { slotAwareSort } from '@/lib/queue-ordering'
import { getSlotInventory, isSlotInventoryError, normalizeTimeString } from '@/lib/slot-inventory'

export type AtursevaToolName =
  | 'search_doctors'
  | 'get_my_bookings'
  | 'get_queue_position'
  | 'get_doctor_slots'
  | 'find_nearby_doctors'
  | 'prepare_booking'

export interface ToolCall {
  tool: AtursevaToolName
  args: Record<string, unknown>
}

export interface ActionResult {
  type: AtursevaToolName | string
  title: string
  data: Record<string, unknown>
}

/** Per-request tool context (e.g. the patient's shared GPS location). */
export interface ToolContext {
  location?: { lat: number; lng: number }
}

export type ToolOutcome =
  | { ok: true; result: ActionResult }
  | { ok: false; error: string }

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

async function searchDoctors(args: Record<string, unknown>): Promise<ToolOutcome> {
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
    ok: true,
    result: {
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
): Promise<ToolOutcome> {
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
    ok: true,
    result: {
      type: 'get_my_bookings',
      title: upcoming.length
        ? `${upcoming.length} aane wala appointment${upcoming.length > 1 ? 's' : ''}`
        : 'Abhi koi aane wala appointment nahi',
      data: { bookings: rows },
    },
  }
}

// ─── Tool 3: get_queue_position ─────────────────────────────────────────────

async function getQueuePosition(
  userId: string,
  args: Record<string, unknown>
): Promise<ToolOutcome> {
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
      ok: true,
      result: {
        type: 'get_queue_position',
        title: 'Aaj koi token nahi mila',
        data: {
          note: 'Aaj ke liye koi approve/pending appointment nahi hai. Booking karne me madad chahiye?',
        },
      },
    }
  }

  const doctor = booking.doctor?.user?.name || 'Doctor'

  if (!booking.tokenNumber || booking.tokenOrder <= 0) {
    return {
      ok: true,
      result: {
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
    ok: true,
    result: {
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
    },
  }
}

// ─── Tool 4 (P2): get_doctor_slots ──────────────────────────────────────────

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** "2026-10-16" → "Fri, 16 Oct" (pure string math — the string IS the IST date). */
function dateLabel(dateStr: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (!m) return dateStr
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const utc = new Date(Date.UTC(y, mo - 1, d))
  const day = DAYS_EN[utc.getUTCDay()] || ''
  return `${day}, ${d} ${MONTHS_EN[mo - 1] || ''}`
}

/** Next N IST dates after today (inclusive of today). */
function nextDates(count: number): string[] {
  const out: string[] = []
  const base = new Date(`${todayISTStr()}T00:00:00.000Z`)
  for (let i = 0; i < count; i++) {
    const d = new Date(base.getTime() + i * 86400000)
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

/**
 * Free-slot chips for a doctor. Without a date arg it auto-picks the NEXT day
 * (within 7) that actually has free slots, and lists the following options as
 * `otherDays` so the model can steer the patient forward.
 */
async function getDoctorSlots(
  userId: string,
  args: Record<string, unknown>
): Promise<ToolOutcome> {
  const doctorId = typeof args.doctorId === 'string' ? args.doctorId.trim() : ''
  const dateArg = typeof args.date === 'string' ? args.date.trim() : ''

  if (!doctorId) {
    return {
      ok: false,
      error:
        'DOCTOR_ID_MISSING — doctorId nahi mila. Pehle search_doctors ya find_nearby_doctors chalayein, patient doctor chune, phir unka doctorId use karein.',
    }
  }

  const doctor = await db.doctor.findUnique({
    where: { id: doctorId },
    select: {
      id: true,
      specialization: true,
      city: true,
      fees: true,
      dailyLimit: true,
      user: { select: { name: true, status: true } },
    },
  })
  if (!doctor || doctor.user.status !== 'Active') {
    return { ok: false, error: 'DOCTOR_NOT_FOUND — ye doctor abhi available nahi hai.' }
  }

  const candidates = dateArg
    ? [dateArg]
    : nextDates(7) // auto: today → +6, first bookable day wins

  let primary: Awaited<ReturnType<typeof getSlotInventory>> | null = null
  const otherDays: { date: string; label: string; freeCount: number }[] = []
  let lastReason = ''

  for (const dateStr of candidates) {
    let inv: Awaited<ReturnType<typeof getSlotInventory>>
    try {
      inv = await getSlotInventory(doctorId, dateStr)
    } catch (err) {
      if (isSlotInventoryError(err)) {
        return { ok: false, error: `SLOT_LOOKUP_FAILED — ${err.message}` }
      }
      throw err
    }
    const freeCount = inv.slots.filter((s) => s.status === 'free').length
    if (!primary && inv.available && freeCount > 0) {
      primary = inv
      continue
    }
    if (primary && otherDays.length < 3 && freeCount > 0) {
      otherDays.push({ date: dateStr, label: dateLabel(dateStr), freeCount })
    }
    if (!primary) lastReason = inv.reason || 'No free slots'
  }

  const docName = doctor.user.name.startsWith("Dr.") ? doctor.user.name : `Dr. ${doctor.user.name}`
  const doctorMeta = {
    doctorId: doctor.id,
    doctor: docName,
    specialization: doctor.specialization || 'General Physician',
    city: doctor.city || '',
    fees: doctor.fees || 0,
  }

  if (!primary) {
    // No bookable day in the window — still answer honestly (no card noise).
    return {
      ok: false,
      error: `NO_SLOTS — ${docName} ki agli 7 din ki dates par koi free slot nahi mila (${lastReason}). Patient se bolein kisi aur doctor ya agle hafte ki date try karein.`,
    }
  }

  const freeSlots = primary.slots.filter((s) => s.status === 'free').slice(0, 14)
  const takenCount = primary.slots.filter((s) => s.status === 'taken').length

  return {
    ok: true,
    result: {
      type: 'get_doctor_slots',
      title: `${docName} — ${dateLabel(primary.date)} ke free slots`,
      data: {
        ...doctorMeta,
        date: primary.date,
        dateLabel: dateLabel(primary.date),
        dayName: primary.dayName,
        slots: freeSlots.map((s) => ({ time: s.time, status: s.status })),
        freeCount: primary.slots.filter((s) => s.status === 'free').length,
        takenCount,
        opdCount: primary.opdCount,
        otherDays,
        note:
          freeSlots.length === 0
            ? 'Aaj ke free slots khatam ho gaye hain — otherDays dekhein.'
            : undefined,
      },
    },
  }
}

// ─── Tool 5 (P2): find_nearby_doctors (GPS haversine) ──────────────────────

const EARTH_RADIUS_KM = 6371

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

const NEARBY_RADIUS_KM = 30

async function findNearbyDoctors(
  _userId: string,
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<ToolOutcome> {
  if (!ctx.location || !Number.isFinite(ctx.location.lat) || !Number.isFinite(ctx.location.lng)) {
    return {
      ok: false,
      error:
        'PATIENT_LOCATION_MISSING — patient ne abhi GPS location share nahi ki hai. Patient ko chat window ke composer ke paas 📍 location chip dabane ko bolein (permission allow karein), uske baad patient dobara "paas ke doctor" poochhega.',
    }
  }

  const specialization = typeof args.specialization === 'string' ? args.specialization.trim() : ''
  const query = typeof args.query === 'string' ? args.query.trim() : ''

  const where: Record<string, unknown> = { user: { status: 'Active' } }
  if (specialization || query) {
    where.OR = [
      ...(specialization ? [{ specialization: { contains: specialization } }] : []),
      ...(query
        ? [{ specialization: { contains: query } }, { user: { name: { contains: query } } }]
        : []),
    ]
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
      lat: true,
      longi: true,
      user: { select: { name: true, profileImg: true } },
    },
    take: 200,
    orderBy: { createdAt: 'asc' },
  })

  const { lat, lng } = ctx.location
  const hits = doctors
    .filter((d) => (d.lat !== 0 || d.longi !== 0) && Number.isFinite(d.lat) && Number.isFinite(d.longi))
    .map((d) => ({
      id: d.id,
      name: d.user.name,
      specialization: d.specialization || 'General Physician',
      city: d.city || '',
      state: d.state || '',
      fees: d.fees || 0,
      experience: d.experience || '',
      profileImg: d.user.profileImg || null,
      distanceKm: Math.round(haversineKm(lat, lng, d.lat, d.longi) * 10) / 10,
    }))
    .filter((d) => d.distanceKm <= NEARBY_RADIUS_KM)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 6)

  if (hits.length === 0) {
    return {
      ok: false,
      error: `NO_NEARBY_DOCTORS — patient ke ${NEARBY_RADIUS_KM} km me koi doctor nahi mila (GPS: ${lat.toFixed(3)}, ${lng.toFixed(3)}). Patient se bolein city ya specialization batayein taaki normal search se dhoondh sakein.`,
    }
  }

  return {
    ok: true,
    result: {
      type: 'find_nearby_doctors',
      title: `Aapke paas ke ${hits.length} doctor${hits.length > 1 ? 's' : ''}`,
      data: {
        doctors: hits,
        radiusKm: NEARBY_RADIUS_KM,
      },
    },
  }
}

// ─── Tool 6 (P2): prepare_booking (validate → CONFIRM card, NO write) ───────

async function prepareBooking(
  _userId: string,
  args: Record<string, unknown>
): Promise<ToolOutcome> {
  const doctorId = typeof args.doctorId === 'string' ? args.doctorId.trim() : ''
  const date = typeof args.date === 'string' ? args.date.trim() : ''
  const rawSlot = typeof args.timeSlot === 'string' ? args.timeSlot.trim() : ''
  const mode = args.mode === 'VideoCall' ? 'VideoCall' : 'InPerson'
  const disease = typeof args.disease === 'string' ? args.disease.trim().slice(0, 120) : ''

  if (!doctorId) {
    return { ok: false, error: 'DOCTOR_ID_MISSING — doctorId ke bina booking prepare nahi ho sakti.' }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return {
      ok: false,
      error: 'BOOKING_DATE_MISSING — date "YYYY-MM-DD" format me chahiye (get_doctor_slots card se lein).',
    }
  }
  const slot = normalizeTimeString(rawSlot)
  if (!slot) {
    return {
      ok: false,
      error: `BOOKING_SLOT_INVALID — timeSlot "${rawSlot}" samajh nahi aaya. 24h "HH:MM" format use karein (jaise "10:30").`,
    }
  }
  if (disease.length < 2) {
    return {
      ok: false,
      error:
        'BOOKING_REASON_MISSING — booking ke liye patient ka short reason (problem/disease) zaroori hai. Pehle patient se poochh lijiye "kis wajah se appointment chahiye", phir prepare_booking call karein.',
    }
  }

  const doctor = await db.doctor.findUnique({
    where: { id: doctorId },
    select: {
      id: true,
      specialization: true,
      city: true,
      fees: true,
      user: { select: { name: true, status: true } },
    },
  })
  if (!doctor || doctor.user.status !== 'Active') {
    return { ok: false, error: 'DOCTOR_NOT_FOUND — ye doctor available nahi hai.' }
  }

  if (date < todayISTStr()) {
    return { ok: false, error: 'BOOKING_DATE_PAST — beet chuki date par booking nahi ho sakti.' }
  }

  let inv: Awaited<ReturnType<typeof getSlotInventory>>
  try {
    inv = await getSlotInventory(doctorId, date)
  } catch (err) {
    if (isSlotInventoryError(err)) {
      return { ok: false, error: `SLOT_LOOKUP_FAILED — ${err.message}` }
    }
    throw err
  }

  if (!inv.available) {
    return {
      ok: false,
      error: `DAY_UNAVAILABLE — ${dateLabel(date)} par ${inv.reason || 'booking available nahi hai'}. Doosri date suggest karein (otherDays dekhein).`,
    }
  }

  const slotStatus = inv.slots.find((s) => s.time === slot)
  if (!slotStatus) {
    return {
      ok: false,
      error: `SLOT_NOT_IN_SCHEDULE — "${slot}" is din ki schedule me nahi hai. get_doctor_slots ke free slots me se hi choose karein.`,
    }
  }
  if (slotStatus.status === 'taken') {
    return {
      ok: false,
      error: `SLOT_TAKEN — ${slot} par already booking hai. Card ke doosre free slots suggest karein.`,
    }
  }
  if (slotStatus.status === 'past') {
    return {
      ok: false,
      error: `SLOT_PAST — ${slot} beet chuka hai. Aaj ke baad ki ya agle din ki slots suggest karein.`,
    }
  }

  const docName = doctor.user.name.startsWith("Dr.") ? doctor.user.name : `Dr. ${doctor.user.name}`
  return {
    ok: true,
    result: {
      type: 'prepare_booking',
      title: `Confirm karein — ${docName} · ${dateLabel(date)} · ${slot}`,
      data: {
        doctorId: doctor.id,
        doctor: docName,
        specialization: doctor.specialization || 'General Physician',
        city: doctor.city || '',
        fees: doctor.fees || 0,
        date,
        dateLabel: dateLabel(date),
        timeSlot: slot,
        mode,
        disease,
      },
    },
  }
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────

export async function executeTool(
  userId: string,
  call: ToolCall,
  ctx: ToolContext = {}
): Promise<ToolOutcome> {
  switch (call.tool) {
    case 'search_doctors':
      return searchDoctors(call.args)
    case 'get_my_bookings':
      return getMyBookings(userId, call.args)
    case 'get_queue_position':
      return getQueuePosition(userId, call.args)
    case 'get_doctor_slots':
      return getDoctorSlots(userId, call.args)
    case 'find_nearby_doctors':
      return findNearbyDoctors(userId, call.args, ctx)
    case 'prepare_booking':
      return prepareBooking(userId, call.args)
    default:
      return {
        ok: false,
        error: `UNKNOWN_TOOL — "${call.tool}" exist nahi karta. Catalogue ke tools hi use karein.`,
      }
  }
}

/** Compact tool catalogue for the system prompt. */
export const TOOL_CATALOGUE = `TOOLS — jab live data chahiye to SIRF inhi ko use karein:
1. search_doctors — doctor directory (args: {query?, specialization?, city?}) — "doctor dikhao", "Delhi me skin doctor"
2. get_my_bookings — mere appointments + status (args: {}) — "mera booking approve hua?", "agli appointment kab"
3. get_queue_position — aaj ka token/queue (args: {bookingId?}) — "mera number", "kitne log pehle hain"
4. get_doctor_slots — kisi doctor ke free slots (args: {doctorId, date? "YYYY-MM-DD"}) — "slots dikhao", "kab milenge". Patient date na bataye ya "koi bhi/aaj/kal" bole to date omit karke DIRECTLY call karein — system agli available date khud la degi. Date ke liye mat poochhein.
5. find_nearby_doctors — GPS location se PAAS ke doctors (args: {specialization?, query?}) — "paas ke doctor", "nearby doctor"; patient ke shared GPS se distance ke hisaab se
6. prepare_booking — booking ka CONFIRM CARD banata hai (args: {doctorId, date "YYYY-MM-DD", timeSlot "HH:MM" 24h, mode "InPerson"|"VideoCall", disease}) — SIRF tab jab patient ne doctor + date + slot + reason clearly chun liya ho. Ye book NAHI karta — patient card par Confirm button dabayega tabhi booking hogi.

BOOKING FLOW (important):
- Patient doctor chune → get_doctor_slots chalayein → slots card dikhega → patient slot chune (reason na ho to pehle poochh lein: "kis wajah se?") → prepare_booking chalayein → confirm card patient ko dikh raha hoga → bolein "Confirm kar dijiye".
- CRITICAL: card sirf TOOL CALL se banta hai. "main card dikha rahi hoon" / "confirm card taiyaar hai" jaisa PROSE likhna USELESS hai — patient ko kuch nahi dikhega. Jab patient ne slot + reason dono clearly de diye, aapka POORA jawab SIRF ye line honi chahiye: [[TOOL]]{"tool":"prepare_booking","args":{...}} (doctorId/date/timeSlot/mode/disease ke saath). Prose iske baad system khud handle karega.
- Booking tab maani jaati hai jab BOOKING CREATED confirm ho jaye (patient ne button dabaya). Tab tak "book ho gaya" KABHI mat bolo — sirf "confirm kar dijiye, main book kar dungi".
- Booking cancel karne ke liye appointments page par jaane ko bolein — aap cancel NAHI kar sakti.`
