/**
 * Slot Inventory Service — the single source of truth for slot availability.
 *
 * Given a doctor + a YYYY-MM-DD date (IST), returns the full inventory:
 * holiday/schedule/OPD-limit availability, the ordered slot list with
 * per-slot status (free / taken / past), and the next bookable slot.
 *
 * Consumers: /api/slots (reception slot grid, patient booking), and the
 * Round 13 queue engine (race-safe claims, slot-aware ordering).
 *
 * Timezone contract: the server runs UTC, users are IST (+5:30). All date
 * math uses src/lib/date-utils.ts (istDateRange / todayISTStr / nowIST).
 * Occupancy matches bookings by NORMALIZED "HH:MM" 24h string equality —
 * a booking stored as "9:00" or "12:30 PM" still blocks the "09:00" /
 * "12:30" slot.
 */
import { db } from '@/lib/db'
import { istDateRange, nowIST, todayISTStr } from '@/lib/date-utils'

/** Booking statuses that occupy a slot / count toward the daily OPD limit. */
export const ACTIVE_BOOKING_STATUSES = ['Approve', 'Visited', 'Finish'] as const

export interface SlotStatus {
  /** Normalized "HH:MM" 24h slot start time. */
  time: string
  /** taken = an active booking occupies it (beats past); past = earlier today; free = bookable. */
  status: 'free' | 'taken' | 'past'
  bookingRef?: string
  patientName?: string
}

export interface SlotInventory {
  doctorId: string
  /** YYYY-MM-DD (IST) as passed in. */
  date: string
  /** Full English day name of the IST date, e.g. "Monday" (matches DoctorSchedule.day). */
  dayName: string
  available: boolean
  /** Present when available === false: holiday / no-schedule / OPD-limit reason. */
  reason?: string
  isHoliday: boolean
  hasSchedule: boolean
  startTime: string
  endTime: string
  slotDuration: number
  /** true when the doctor's manual timeSlots list was used instead of generated slots. */
  usesManualSlots: boolean
  /** Sorted by start time (ascending). Empty on holiday / no schedule. */
  slots: SlotStatus[]
  /** Count of ALL active bookings that day (not only slotted ones). */
  opdCount: number
  opdLimit: number
  /** First slot with status 'free' (list order), or null when none is bookable. */
  nextFreeSlot?: string | null
}

/** Typed error so API routes can map INVALID_DATE → 400 and DOCTOR_NOT_FOUND → 404. */
export class SlotInventoryError extends Error {
  readonly code: 'INVALID_DATE' | 'DOCTOR_NOT_FOUND'

  constructor(code: 'INVALID_DATE' | 'DOCTOR_NOT_FOUND', message: string) {
    super(message)
    this.name = 'SlotInventoryError'
    this.code = code
  }
}

/** Type guard that does not rely on instanceof (robust across dev HMR module reloads). */
export function isSlotInventoryError(error: unknown): error is SlotInventoryError {
  if (typeof error !== 'object' || error === null) return false
  const code = (error as { code?: unknown }).code
  return code === 'INVALID_DATE' || code === 'DOCTOR_NOT_FOUND'
}

/**
 * Normalize a time string to "HH:MM" 24h format, or null when unparseable.
 *
 * Accepted inputs (case-insensitive meridiem, optional padding):
 *   "9:00"      → "09:00"
 *   "09:00"     → "09:00"
 *   "13:45"     → "13:45"
 *   "12:30 PM"  → "12:30"
 *   "2:15 pm"   → "14:15"
 *   "12:15 AM"  → "00:15"
 *   "11:60" / "25:00" / "noon" → null
 */
export function normalizeTimeString(s: string): string | null {
  if (typeof s !== 'string') return null
  const str = s.trim()
  if (!str) return null

  const match = str.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i)
  if (!match) return null

  let hours = Number(match[1])
  const minutes = Number(match[2])
  const meridiem = match[3]?.toUpperCase()

  if (minutes > 59) return null

  if (meridiem) {
    if (hours < 1 || hours > 12) return null
    if (meridiem === 'PM' && hours !== 12) hours += 12
    if (meridiem === 'AM' && hours === 12) hours = 0
  } else if (hours > 23) {
    return null
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/** Minutes since midnight for an already-normalized "HH:MM" string. */
function timeToMinutes(t: string): number {
  return Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
}

/** Full English day name ("Monday".."Sunday") of a YYYY-MM-DD date, computed in IST. */
function dayNameForDate(dateStr: string): string {
  // 12:00 IST (06:30 UTC) — mid-day anchor avoids any timezone edge shifting the date.
  return new Date(`${dateStr}T12:00:00+05:30`).toLocaleDateString('en-US', { weekday: 'long' })
}

/** Validate YYYY-MM-DD shape AND that it is a real calendar date. */
function assertValidDateStr(dateStr: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new SlotInventoryError('INVALID_DATE', 'Invalid date format. Expected YYYY-MM-DD.')
  }
  const [y, m, d] = dateStr.split('-').map(Number)
  const utc = new Date(Date.UTC(y, m - 1, d))
  if (
    utc.getUTCFullYear() !== y ||
    utc.getUTCMonth() !== m - 1 ||
    utc.getUTCDate() !== d
  ) {
    throw new SlotInventoryError('INVALID_DATE', 'Invalid date. Not a real calendar date.')
  }
}

/** Parse the schedule's manual timeSlots JSON string into normalized, deduped, sorted times. */
function parseManualSlots(timeSlotsJson: string): string[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(timeSlotsJson)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []

  const seen = new Set<string>()
  const times: string[] = []
  for (const entry of parsed) {
    if (typeof entry !== 'string') continue
    const normalized = normalizeTimeString(entry)
    if (!normalized || seen.has(normalized)) continue // skip unparseable + duplicate entries defensively
    seen.add(normalized)
    times.push(normalized)
  }
  return times.sort((a, b) => timeToMinutes(a) - timeToMinutes(b))
}

/** Generate "HH:MM" slots from startTime → endTime stepping slotDuration minutes. */
function generateSlots(startTime: string, endTime: string, slotDuration: number): string[] {
  const start = normalizeTimeString(startTime)
  const end = normalizeTimeString(endTime)
  if (!start || !end) return []
  if (!Number.isFinite(slotDuration) || slotDuration < 1) return []

  const startMin = timeToMinutes(start)
  const endMin = timeToMinutes(end)
  if (endMin <= startMin) return []

  const times: string[] = []
  for (let m = startMin; m < endMin; m += slotDuration) {
    times.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
  }
  return times
}

/**
 * Build the slot inventory for a doctor on a given IST date.
 *
 * Throws SlotInventoryError (INVALID_DATE / DOCTOR_NOT_FOUND) for bad input —
 * API callers should map those to 400 / 404 respectively.
 */
export async function getSlotInventory(
  doctorId: string,
  dateStr: string
): Promise<SlotInventory> {
  assertValidDateStr(dateStr)

  const doctor = await db.doctor.findUnique({ where: { id: doctorId } })
  if (!doctor) {
    throw new SlotInventoryError('DOCTOR_NOT_FOUND', 'Doctor not found')
  }

  const dayName = dayNameForDate(dateStr)
  const range = istDateRange(dateStr)

  // Holiday lookup: app code historically stores the doctor's USER id in
  // DoctorHoliday.userId, but the actual DB FK enforces Doctor.id (verified
  // via PRAGMA foreign_key_list). Match EITHER id so the inventory is correct
  // under both conventions. (Notably: with the FK active, the existing holiday
  // write routes that pass doctor.userId would fail with P2003 — pre-existing
  // issue, flagged for a follow-up; this read stays defensive.)
  const [holiday, schedule, bookings] = await Promise.all([
    db.doctorHoliday.findFirst({
      where: { userId: { in: [doctor.userId, doctorId] }, date: { gte: range.start, lte: range.end } },
    }),
    db.doctorSchedule.findFirst({ where: { doctorId, day: dayName } }),
    // Single query for BOTH occupancy and opdCount: opdCount must count ALL
    // active bookings that day, so we don't filter on timeSlot here.
    db.booking.findMany({
      where: {
        doctorId,
        bookingDate: { gte: range.start, lte: range.end },
        status: { in: [...ACTIVE_BOOKING_STATUSES] },
      },
      select: { id: true, timeSlot: true, patientName: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  const isHoliday = Boolean(holiday)
  const hasSchedule = Boolean(schedule)

  // Occupancy map keyed by NORMALIZED time (a booking stored "9:00" blocks "09:00").
  // Earliest booking wins on (disabled-unique) duplicate slots — deterministic.
  const occupancy = new Map<string, { bookingRef: string; patientName: string }>()
  for (const b of bookings) {
    if (!b.timeSlot) continue
    const normalized = normalizeTimeString(b.timeSlot)
    if (!normalized || occupancy.has(normalized)) continue
    occupancy.set(normalized, { bookingRef: b.id, patientName: b.patientName || 'Booked' })
  }

  const opdCount = bookings.length
  const opdLimit = doctor.dailyLimit

  let slots: SlotStatus[] = []
  let slotTimes: string[] = []
  let usesManualSlots = false
  let startTime = ''
  let endTime = ''
  let slotDuration = 0

  if (schedule) {
    startTime = schedule.startTime
    endTime = schedule.endTime
    slotDuration = schedule.slotDuration

    slotTimes = parseManualSlots(schedule.timeSlots)
    if (slotTimes.length > 0) {
      usesManualSlots = true
    } else {
      slotTimes = generateSlots(startTime, endTime, slotDuration)
    }
  }

  if (!isHoliday && hasSchedule) {
    const isToday = dateStr === todayISTStr()
    const nowMinutes = isToday ? nowIST().getUTCHours() * 60 + nowIST().getUTCMinutes() : -1

    slots = slotTimes.map((time) => {
      const occupied = occupancy.get(time)
      if (occupied) {
        return {
          time,
          status: 'taken' as const,
          bookingRef: occupied.bookingRef,
          patientName: occupied.patientName,
        }
      }
      if (isToday && timeToMinutes(time) < nowMinutes) {
        return { time, status: 'past' as const }
      }
      return { time, status: 'free' as const }
    })
  }

  const available = !isHoliday && hasSchedule && opdCount < opdLimit

  let reason: string | undefined
  if (isHoliday) {
    reason = holiday?.remark
      ? `Doctor is on holiday — ${holiday.remark}`
      : 'Doctor is on holiday'
  } else if (!hasSchedule) {
    reason = 'No schedule for this day'
  } else if (opdCount >= opdLimit) {
    reason = `OPD limit (${opdLimit}) reached`
  }

  const nextFreeSlot = slots.find((s) => s.status === 'free')?.time ?? null

  return {
    doctorId,
    date: dateStr,
    dayName,
    available,
    reason,
    isHoliday,
    hasSchedule,
    startTime,
    endTime,
    slotDuration,
    usesManualSlots,
    slots,
    opdCount,
    opdLimit,
    nextFreeSlot,
  }
}
