/**
 * FIFO queue ordering.
 *
 * RULE (PDF-audit fix, Issue 2 — owner decision):
 *  - Emergency tier (CTO Plan Phase 4): items with `isEmergency === true`
 *    sort FIRST — above everything else — among themselves in arrival
 *    order. An EMR- booking created after normals still jumps to the top.
 *  - Everyone else: pure ARRIVAL order — tokenOrder > 0 ascending (the
 *    per-doctor-per-day sequence stamped when the patient entered the
 *    queue), then createdAt ascending as the stable tiebreak for
 *    tokenOrder = 0 walk-ins. timeSlot is DISPLAY-ONLY info and never
 *    influences order (the old "slotted-first" Mode 2 put an online 09:00
 *    booking above walk-ins already waiting, which broke the first-come-
 *    first-served reality of the owner's clinics).
 *
 * `tokenNumber` is deliberately NOT touched anywhere: token numbers are
 * printed on token slips and displayed on the waiting-room TV board, so they
 * must stay stable identifiers even when the display order changes. Only the
 * ORDER of the list (and derived queue positions) is controlled here.
 */

/**
 * Parse a time string into minutes since midnight.
 *
 * Handles the quirks found in `booking.timeSlot`:
 *  - plain 24h "09:00" → 540, "9:00" → 540, "13:23" → 803
 *  - meridiem "12:30 PM" / "12:30 pm" → 750, "2:15 pm" → 855, "12:30 AM" → 30
 *
 * Returns null for null/undefined/empty/unparseable input (e.g. "ASAP",
 * "later", "25:00", "12:60").
 */
export function timeToMinutes(t?: string | null): number | null {
  if (!t) return null
  const trimmed = t.trim()
  if (!trimmed) return null

  // "H:MM", "HH:MM", optional ":SS", optional trailing AM/PM (any case),
  // optional surrounding whitespace.
  const match = /^(\d{1,2}):(\d{1,2})(?::\d{1,2})?\s*([AaPp][Mm])?$/.exec(trimmed)
  if (!match) return null

  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const meridiem = match[3] ? match[3].toUpperCase() : undefined

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  if (minutes < 0 || minutes > 59) return null

  if (meridiem) {
    // 12-hour clock: 1..12
    if (hours < 1 || hours > 12) return null
    if (meridiem === 'PM' && hours < 12) hours += 12
    else if (meridiem === 'AM' && hours === 12) hours = 0
  } else {
    // 24-hour clock: 0..23
    if (hours > 23) return null
  }

  return hours * 60 + minutes
}

/** Anything the queue APIs can sort: a Prisma booking or a queue DTO. */
export interface SlotSortable {
  timeSlot?: string | null
  tokenOrder?: number | null
  createdAt?: Date | string
  /** Phase 4: emergency bookings (EMR-) jump to the top of the queue. */
  isEmergency?: boolean | null
}

/**
 * Sort a list of bookings/queue items into the DISPLAY order (see the
 * rules at the top of this file).
 *
 * Returns a NEW array — the input is never mutated. All statuses
 * (Approve/Visited/Finish) participate in the same sort; callers derive
 * stats/currentServing from the sorted list exactly as before.
 */
export function slotAwareSort<T extends SlotSortable>(items: T[]): T[] {
  const copy = [...items]
  if (copy.length < 2) return copy

  const createdAtMs = (item: T): number => {
    const c = item ? item.createdAt : undefined
    if (c instanceof Date) return c.getTime()
    if (typeof c === 'string') {
      const parsed = Date.parse(c)
      if (!Number.isNaN(parsed)) return parsed
    }
    return 0
  }

  // Arrival comparator: tokenOrder > 0 first (asc), then createdAt asc.
  const arrivalCompare = (a: T, b: T): number => {
    const aOrder = a && a.tokenOrder && a.tokenOrder > 0 ? a.tokenOrder : Infinity
    const bOrder = b && b.tokenOrder && b.tokenOrder > 0 ? b.tokenOrder : Infinity
    if (aOrder !== bOrder) return aOrder - bOrder
    return createdAtMs(a) - createdAtMs(b)
  }

  // Emergency tier (Phase 4): isEmergency === true sorts above everything
  // else. Among themselves they keep arrival order.
  const emergencyCompare = (a: T, b: T): number => {
    const aEmergency = a?.isEmergency === true
    const bEmergency = b?.isEmergency === true
    if (aEmergency !== bEmergency) return aEmergency ? -1 : 1
    return 0
  }

  // FIFO (PDF-audit fix, Issue 2): pure arrival order — emergencies first,
  // then everyone by token/arrival sequence. timeSlot no longer influences
  // ORDER (it was Mode 2 "slotted-first", which put an online 09:00 booking
  // above walk-ins already waiting — the owner's clinics run first-come-
  // first-served). Slots remain display-only info on cards/rows.
  return copy.sort((a, b) => emergencyCompare(a, b) || arrivalCompare(a, b))
}
