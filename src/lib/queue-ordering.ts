/**
 * Slot-aware queue ordering (CTO Plan Phase 2, item 2d).
 *
 * DUAL-MODE RULE (risk mitigation for existing hospitals without slots):
 *  - Mode 1 (legacy, no parseable timeSlot anywhere in the list): the order
 *    is EXACTLY the historical one — tokenOrder > 0 first (ascending), then
 *    tokenOrder = 0 walk-ins by createdAt ascending (createdAt asc as the
 *    stable tiebreak). Hospitals that never use time slots see zero change.
 *  - Mode 2 (at least one parseable timeSlot in the list): slotted patients
 *    come first, sorted by timeSlot ascending (minutes since midnight);
 *    unparseable/empty timeSlots count as UNslotted. The remaining unslotted
 *    walk-ins follow in legacy order (tokenOrder asc, then createdAt asc).
 *
 * EMERGENCY TIER (CTO Plan Phase 4, "Queue Resilience"): items with
 * `isEmergency === true` sort FIRST — above the slotted and unslotted tiers —
 * among themselves in the same legacy order (tokenOrder asc, createdAt asc).
 * An EMR- booking created after normals still jumps to the top of the queue.
 *
 * `tokenNumber` is deliberately NOT touched anywhere: token numbers are
 * printed on token slips and displayed on the waiting-room TV board, so they
 * must stay stable identifiers even when the display order becomes
 * slot-aware. Only the ORDER of the list (and derived queue positions)
 * changes.
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
 * Sort a list of bookings/queue items into slot-aware display order
 * (see the dual-mode + emergency rules at the top of this file).
 *
 * Returns a NEW array — the input is never mutated. All statuses
 * (Approve/Visited/Finish) participate in the same sort; callers derive
 * stats/currentServing from the sorted list exactly as before.
 */
export function slotAwareSort<T extends SlotSortable>(items: T[]): T[] {
  const copy = [...items]
  if (copy.length < 2) return copy

  // Cache minutes-since-midnight per item and detect whether ANY item is
  // slotted (decides legacy vs dual mode).
  const minutesByItem = new Map<T, number | null>()
  let hasSlotted = false
  for (const item of copy) {
    const minutes = timeToMinutes(item ? item.timeSlot : null)
    minutesByItem.set(item, minutes)
    if (minutes !== null) hasSlotted = true
  }

  const createdAtMs = (item: T): number => {
    const c = item ? item.createdAt : undefined
    if (c instanceof Date) return c.getTime()
    if (typeof c === 'string') {
      const parsed = Date.parse(c)
      if (!Number.isNaN(parsed)) return parsed
    }
    return 0
  }

  // Legacy comparator: tokenOrder > 0 first (asc), then createdAt asc.
  const legacyCompare = (a: T, b: T): number => {
    const aOrder = a && a.tokenOrder && a.tokenOrder > 0 ? a.tokenOrder : Infinity
    const bOrder = b && b.tokenOrder && b.tokenOrder > 0 ? b.tokenOrder : Infinity
    if (aOrder !== bOrder) return aOrder - bOrder
    return createdAtMs(a) - createdAtMs(b)
  }

  // Emergency tier (Phase 4): isEmergency === true sorts above everything
  // else (both the slotted and unslotted tiers). Among themselves they keep
  // the legacy order. Non-emergency items are unaffected relative to each
  // other — the tier only prepends.
  const emergencyCompare = (a: T, b: T): number => {
    const aEmergency = a?.isEmergency === true
    const bEmergency = b?.isEmergency === true
    if (aEmergency !== bEmergency) return aEmergency ? -1 : 1
    return 0
  }

  // Mode 1: nothing is slotted → EXACT legacy order (emergencies still first).
  if (!hasSlotted) {
    return copy.sort((a, b) => emergencyCompare(a, b) || legacyCompare(a, b))
  }

  // Mode 2 (dual): slotted first by time asc (legacy order as tiebreak for
  // identical slots), then unslotted in legacy order. Emergencies first over
  // both tiers.
  return copy.sort((a, b) => {
    const emergencyDelta = emergencyCompare(a, b)
    if (emergencyDelta !== 0) return emergencyDelta

    const aMinutes = minutesByItem.get(a) ?? null
    const bMinutes = minutesByItem.get(b) ?? null
    if (aMinutes !== null && bMinutes !== null) {
      if (aMinutes !== bMinutes) return aMinutes - bMinutes
      return legacyCompare(a, b)
    }
    if (aMinutes !== null) return -1 // a slotted → first
    if (bMinutes !== null) return 1 // b slotted → first
    return legacyCompare(a, b) // both unslotted
  })
}
