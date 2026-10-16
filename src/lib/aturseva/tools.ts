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
  | 'get_my_symptom_log'
  | 'prepare_check_in'
  | 'get_my_lab_reports'
  | 'get_my_diet_plan'
  | 'get_my_weekly_report'

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

  // DATE GUARD: the LLM occasionally hallucinates past years ("2024-10-21")
  // or far-future dates. Silently obeying wastes a whole turn (the patient
  // clicks a slot chip, then prepare_booking rejects the past date). Reject
  // here with a corrective hint so the model retries with the auto-pick.
  if (dateArg) {
    const today = todayISTStr()
    const maxDate = nextDates(8).pop() || today
    if (dateArg < today) {
      return {
        ok: false,
        error: `DATE_IN_PAST — "${dateArg}" beet chuki hai. Aaj ${today} hai. date argument KO CHHOD DEIN (auto-pick agli available date khud dhoondh lega) ya aaj ke baad ki valid date use karein.`,
      }
    }
    if (dateArg > maxDate) {
      return {
        ok: false,
        error: `DATE_TOO_FAR — "${dateArg}" window se bahar hai (aaj se 7 din tak hi slots dikh sakte hain). date argument chhod dein ya ${today} ke aas-paas ki date use karein.`,
      }
    }
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

// ─── Tool 7 (P3): get_my_symptom_log (read-only, last 14 days) ─────────────

const MOOD_FACES: Record<number, string> = { 1: '😞', 2: '🙁', 3: '😐', 4: '🙂', 5: '😄' }

async function getMySymptomLog(
  userId: string,
  _args: Record<string, unknown>
): Promise<ToolOutcome> {
  const rows = await db.atursevaCheckIn.findMany({
    where: { userId },
    orderBy: { day: 'desc' },
    take: 14,
  })

  if (rows.length === 0) {
    return {
      ok: true,
      result: {
        type: 'get_my_symptom_log',
        title: 'Abhi koi check-in nahi hua',
        data: {
          days: [],
          note: 'Aaj ka check-in card thread me hai — patient mood/symptoms chun kar save kar de to trend banna shuru ho jayega.',
        },
      },
    }
  }

  const avg = (f: (r: (typeof rows)[number]) => number) =>
    Math.round((rows.reduce((s, r) => s + f(r), 0) / rows.length) * 10) / 10

  // Top symptoms across the window
  const counts = new Map<string, number>()
  for (const r of rows) {
    for (const tag of r.symptoms.split(',').map((s) => s.trim()).filter(Boolean)) {
      counts.set(tag, (counts.get(tag) || 0) + 1)
    }
  }
  const topSymptoms = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, n]) => ({ tag, days: n }))

  // Consecutive-day streak (most recent → backwards)
  let streak = 0
  {
    const daySet = new Set(rows.map((r) => r.day))
    const base = new Date(`${todayISTStr()}T00:00:00.000Z`)
    for (let i = 0; i < 30; i++) {
      const d = new Date(base.getTime() - i * 86400000).toISOString().slice(0, 10)
      if (daySet.has(d)) streak++
      else if (i > 0) break // gap — streak ends (today itself may be pending)
    }
  }

  return {
    ok: true,
    result: {
      type: 'get_my_symptom_log',
      title: `${rows.length} din ka symptom diary`,
      data: {
        days: rows.map((r) => ({
          day: r.day,
          mood: r.mood,
          moodFace: MOOD_FACES[r.mood] || '😐',
          energy: r.energy,
          symptoms: r.symptoms,
          note: r.note,
        })),
        summary: {
          daysLogged: rows.length,
          avgMood: avg((r) => r.mood),
          avgEnergy: avg((r) => r.energy),
          topSymptoms,
          streak,
        },
      },
    },
  }
}

// ─── Tool 8 (P3): prepare_check_in (validate → CONFIRM card, NO write) ──────

/**
 * Symptom-tag whitelist-ish normalizer: accepts a comma/space separated string
 * OR an array from the model. Tags are lowercased, trimmed, deduped, capped at
 * 6, each ≤24 chars. Empty input → empty list (symptoms are optional).
 */
function normalizeSymptomTags(v: unknown): string[] {
  const raw: string[] = Array.isArray(v)
    ? v.map((s) => String(s))
    : typeof v === 'string'
      ? v.split(/[,;]/)
      : []
  const seen = new Set<string>()
  const out: string[] = []
  for (let tag of raw) {
    tag = tag.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 24)
    if (tag && !seen.has(tag)) {
      seen.add(tag)
      out.push(tag)
    }
    if (out.length >= 6) break
  }
  return out
}

function clampInt(v: unknown, min: number, max: number): number | null {
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  const i = Math.round(n)
  return i >= min && i <= max ? i : null
}

async function prepareCheckIn(
  userId: string,
  args: Record<string, unknown>
): Promise<ToolOutcome> {
  const mood = clampInt(args.mood, 1, 5)
  const energy = clampInt(args.energy, 1, 5)
  const symptoms = normalizeSymptomTags(args.symptoms)
  const note = typeof args.note === 'string' ? args.note.trim().slice(0, 300) : ''

  if (mood === null) {
    return {
      ok: false,
      error: 'CHECKIN_MOOD_MISSING — mood 1 se 5 ke beech chahiye (1 = bahut low, 5 = bahut achha). Pehle patient se poochh lijiye "aaj mood kaisa hai", phir dobara call karein.',
    }
  }
  if (energy === null) {
    return {
      ok: false,
      error: 'CHECKIN_ENERGY_MISSING — energy bhi 1 se 5 ke beech chahiye (1 = thak gaya, 5 = full energized). Patient se poochh kar complete karein.',
    }
  }

  // Today's existing row (upsert semantics — resubmitting a day UPDATES it)
  const today = todayISTStr()
  const existing = await db.atursevaCheckIn.findUnique({
    where: { userId_day: { userId, day: today } },
  })

  return {
    ok: true,
    result: {
      type: 'prepare_check_in',
      title: existing
        ? 'Aaj ka check-in update karein'
        : 'Aaj ka check-in confirm karein',
      data: {
        day: today,
        dayLabel: dateLabel(today),
        mood,
        moodFace: MOOD_FACES[mood] || '😐',
        energy,
        symptoms,
        note,
        updating: !!existing,
        existing: existing
          ? { mood: existing.mood, energy: existing.energy, symptoms: existing.symptoms, note: existing.note }
          : null,
      },
    },
  }
}

// ─── Tool 9 (P4): get_my_lab_reports (read-only, grounded explainer data) ───

/**
 * Fetches the patient's OWN verified lab reports with parameter values +
 * normal ranges + abnormal flags. The card shows the numbers; the LLM is fed
 * the SAME data as a TOOL RESULT and explains it in Hinglish — grounded only
 * in these rows (never invents values, never diagnoses).
 */
async function getMyLabReports(
  userId: string,
  _args: Record<string, unknown>
): Promise<ToolOutcome> {
  const reports = await db.labReport.findMany({
    where: { patientId: userId, status: 'Verified' },
    include: {
      testMaster: { select: { name: true } },
      doctor: { select: { user: { select: { name: true } } } },
      parameterValues: {
        include: { testParameter: true },
        orderBy: { testParameter: { sortOrder: 'asc' } },
      },
    },
    orderBy: { verifiedAt: 'desc' },
    take: 4,
  })

  if (reports.length === 0) {
    return {
      ok: false,
      error:
        'LAB_REPORTS_EMPTY — is patient ke naam par koi verified lab report abhi tak nahi hai. Patient se bata dein: jab tak lab report nahi aati, values explain karne ki zaroorat nahi (sirf unhi reports ki baat karein jo records me hain).',
    }
  }

  let abnormalParams = 0
  const reportRows = reports.map((r) => {
    const female = (r.patientGender || '').toLowerCase().startsWith('f')
    const params = r.parameterValues.map((pv) => {
      if (pv.isAbnormal) abnormalParams++
      const tp = pv.testParameter
      const min = female ? tp.normalFemaleMin : tp.normalMaleMin
      const max = female ? tp.normalFemaleMax : tp.normalMaleMax
      return {
        name: tp.paramName,
        value: pv.value,
        unit: tp.unit || '',
        range: min || max ? `${min}–${max}` : '',
        abnormal: pv.isAbnormal,
        remarks: pv.remarks || '',
      }
    })
    const dt = (r.verifiedAt || r.resultEnteredAt || r.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    })
    return {
      reportNo: r.reportNo || '',
      testName: r.testMaster?.name || 'Lab test',
      dateLabel: dt,
      doctorName: r.doctor?.user?.name || '',
      params,
    }
  })

  return {
    ok: true,
    result: {
      type: 'get_my_lab_reports',
      title: `${reports.length} lab report${reports.length > 1 ? 's' : ''} — ${abnormalParams} value${abnormalParams === 1 ? '' : 's'} normal se bahar`,
      data: { reports: reportRows, totalReports: reports.length, abnormalParams },
    },
  }
}

// ─── Tool 10 (P4): get_my_diet_plan (read-only, today's meals) ──────────────

const MEAL_SLOTS: Array<{ key: keyof import('@/lib/sevika/diet').DietDay; label: string; icon: string }> = [
  { key: 'morning', label: 'Subah', icon: '🌅' },
  { key: 'breakfast', label: 'Nashta', icon: '🥣' },
  { key: 'lunch', label: 'Lunch', icon: '🍛' },
  { key: 'evening', label: 'Shaam', icon: '🍎' },
  { key: 'dinner', label: 'Dinner', icon: '🌙' },
]

async function getMyDietPlan(
  userId: string,
  _args: Record<string, unknown>
): Promise<ToolOutcome> {
  const { getLatestDietPlan } = await import('@/lib/sevika/diet')
  const latest = await getLatestDietPlan(userId)

  if (!latest) {
    return {
      ok: false,
      error:
        'DIET_PLAN_EMPTY — is patient ka koi diet plan generate nahi hua hai. Patient ko Dawai page par "Diet Plan" section ki taraf guide karein (wahan AI plan ban sakta hai). Aap khud plan generate NAHI kar sakti.',
    }
  }

  // days[] is Mon→Sun order (lib/sevika/diet.ts contract)
  const weekdayEn = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: 'Asia/Kolkata',
  })
  const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(weekdayEn)
  const day = latest.plan.days[Math.max(0, Math.min(dayIndex, latest.plan.days.length - 1))]

  const meals = MEAL_SLOTS.map((s) => ({
    slot: s.key as string,
    label: s.label,
    icon: s.icon,
    items: String((day as Record<string, unknown>)[s.key as string] || ''),
  })).filter((m) => m.items)

  return {
    ok: true,
    result: {
      type: 'get_my_diet_plan',
      title: `Aaj (${weekdayEn}) ka diet plan`,
      data: {
        summary: latest.plan.summary,
        disclaimer: latest.plan.disclaimer,
        medicinesSummary: latest.medicinesSummary,
        dayLabel: weekdayEn,
        note: day.note || '',
        meals,
        generatedLabel: latest.createdAt.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          timeZone: 'Asia/Kolkata',
        }),
      },
    },
  }
}

// ─── Tool 11 (P4): get_my_weekly_report (read-only, last 7 days) ────────────

/**
 * Shared weekly-report builder — used BOTH by the get_my_weekly_report tool
 * (patient asks in chat) AND the Sunday-evening proactive push (scheduler.ts).
 * Pure computation + DB reads; returns the card ActionResult.
 */
export async function buildWeeklyReportCard(
  userId: string
): Promise<{ result: ActionResult }> {
  const { computeAdherence } = await import('@/lib/sevika/schedule')
  const today = todayISTStr()
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    days.push(new Date(Date.parse(`${today}T00:00:00.000Z`) - i * 86400000).toISOString().slice(0, 10))
  }

  const [checkIns, adherence, bookings, labs] = await Promise.all([
    db.atursevaCheckIn.findMany({ where: { userId, day: { in: days } } }),
    computeAdherence(userId),
    db.booking.findMany({
      where: { userId, bookingDate: { gte: new Date(Date.now() - 6 * 86400000) } },
      select: { status: true },
    }),
    db.labReport.count({
      where: { patientId: userId, verifiedAt: { gte: new Date(Date.now() - 7 * 86400000) } },
    }),
  ])

  const avg = (f: (r: (typeof checkIns)[number]) => number) =>
    checkIns.length === 0
      ? 0
      : Math.round((checkIns.reduce((s, r) => s + f(r), 0) / checkIns.length) * 10) / 10

  const counts = new Map<string, number>()
  for (const r of checkIns) {
    for (const tag of r.symptoms.split(',').map((s) => s.trim()).filter(Boolean)) {
      counts.set(tag, (counts.get(tag) || 0) + 1)
    }
  }
  const topSymptoms = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag, n]) => ({ tag, days: n }))

  const upcoming = bookings.filter((b) => b.status === 'Pending' || b.status === 'Approve').length

  // Deterministic headline (no LLM guesswork in the card itself)
  const weekAvg = (avg((r) => r.mood) + avg((r) => r.energy)) / 2
  const headline =
    checkIns.length >= 3 && weekAvg >= 3.5
      ? 'Achha week raha — mood aur energy dono theek rahi 👏'
      : checkIns.length >= 3 && weekAvg < 2.5
        ? 'Thoda dheema week — body ko aaram chahiye tha'
        : checkIns.length > 0
          ? 'Theek-thaak week — kuch din achhe, kuch aise hi'
          : 'Is hafte check-ins nahi hue — agle hafte se shuru karein?'

  const startLabel = new Date(Date.parse(`${days[0]}T00:00:00.000Z`)).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
  const endLabel = new Date(Date.parse(`${days[6]}T00:00:00.000Z`)).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })

  return {
    result: {
      type: 'get_my_weekly_report',
      title: `Weekly report — ${startLabel} se ${endLabel}`,
      data: {
        weekLabel: `${startLabel} – ${endLabel}`,
        headline,
        checkIns: {
          days: checkIns.length,
          avgMood: avg((r) => r.mood),
          avgEnergy: avg((r) => r.energy),
          topSymptoms,
        },
        adherence: {
          weekTaken: adherence.weekTaken,
          weekTotal: adherence.weekTotal,
          scorePct: adherence.scorePct,
          streakDays: adherence.streakDays,
        },
        appointments: { total: bookings.length, upcoming },
        labsNew: labs,
      },
    },
  }
}

async function getMyWeeklyReport(
  userId: string,
  _args: Record<string, unknown>
): Promise<ToolOutcome> {
  const { result } = await buildWeeklyReportCard(userId)
  return { ok: true, result }
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
    case 'get_my_symptom_log':
      return getMySymptomLog(userId, call.args)
    case 'prepare_check_in':
      return prepareCheckIn(userId, call.args)
    case 'get_my_lab_reports':
      return getMyLabReports(userId, call.args)
    case 'get_my_diet_plan':
      return getMyDietPlan(userId, call.args)
    case 'get_my_weekly_report':
      return getMyWeeklyReport(userId, call.args)
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
7. get_my_symptom_log — pichhle 14 din ke check-ins + mood/energy/symptom trend (args: {}) — "mera symptom log", "tabiyat ka trend", "kal se kaisa feel hua"
8. prepare_check_in — aaj ka check-in CONFIRM CARD banata hai (args: {mood 1-5, energy 1-5, symptoms? "comma,tags", note?}) — jab patient mood/tabiyat/symptoms bataye ya check-in maange. Ye save NAHI karta — patient card par button dabayega tabhi save hoga (din me kabhi bhi update ho sakta hai).
9. get_my_lab_reports — patient ke OWN verified lab reports + values + ranges + abnormal flags (args: {}) — "mera lab report", "blood test ka result", "report samjhao". GROUNDED EXPLANATION: sirf card/TOOL RESULT me di gayi values ka matlab samjhao (Hb 11.2 low hai aise), koi diagnosis NAHI, aur values ko doctor se discuss karne ko kahein.
10. get_my_diet_plan — aaj ka diet plan meals ke saath (args: {}) — "aaj kya khaun", "diet plan dikhao", "khane me kya lena chahiye"
11. get_my_weekly_report — pichhle 7 din ka summary card (args: {}) — "meri weekly report", "is hafte kaisa raha", "week summary"

LAB REPORT RULES (important):
- "report samjhao / kya matlab hai" → pehle get_my_lab_reports chalayein, phir TOOL RESULT ki values ko simple Hinglish me samjhayein (kya normal hai, kya thoda bahar hai, kya mean kar sakta hai COMMON-SENSE level par).
- KABHI bhi diagnosis ya ilaaj suggest na karein. Serious abnormal (bahut high/low) ho to doctor se jaldi milne ko kahein.
- Jis report ki values NAHI hain uske baare me andaza kabhi na lagaayein — "ye report abhi mere paas nahi hai" bolein.

DIET RULES: diet nurse-nutritionist level par hi — ghar-ka-khana, hydration, light meals. Dawai ka dose/timing kabhi na chhoohein. Plan na ho to Dawai page ka Diet Plan section bataayein.

BOOKING FLOW (important):
- Patient doctor chune → get_doctor_slots chalayein → slots card dikhega → patient slot chune (reason na ho to pehle poochh lein: "kis wajah se?") → prepare_booking chalayein → confirm card patient ko dikh raha hoga → bolein "Confirm kar dijiye".
- CRITICAL: card sirf TOOL CALL se banta hai. "main card dikha rahi hoon" / "confirm card taiyaar hai" jaisa PROSE likhna USELESS hai — patient ko kuch nahi dikhega. Jab patient ne slot + reason dono clearly de diye, aapka POORA jawab SIRF ye line honi chahiye: [[TOOL]]{"tool":"prepare_booking","args":{...}} (doctorId/date/timeSlot/mode/disease ke saath). Prose iske baad system khud handle karega.
- Booking tab maani jaati hai jab BOOKING CREATED confirm ho jaye (patient ne button dabaya). Tab tak "book ho gaya" KABHI mat bolo — sirf "confirm kar dijiye, main book kar dungi".
- Booking cancel karne ke liye appointments page par jaane ko bolein — aap cancel NAHI kar sakti.

CHECK-IN FLOW (daily diary):
- "aaj ka check-in", "tabiyat kaisi hai" + patient mood/symptoms bataye → prepare_check_in chalayein (mood + energy zaroori; symptoms comma-tags me; note optional). Card par patient khud Save karega.
- "mera symptom log / trend / kal se kaisa raha" → get_my_symptom_log chalayein.
- DATA BLOCK me aaj ka check-in PENDING ho to patient ko EK baar gently nudge kar sakte hain (din me ek hi baar — spam nahi). Logged ho to seedha baat karein, dobara save karwana zaroori nahi.`
