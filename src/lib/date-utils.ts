/**
 * Timezone-aware date utilities.
 * The server runs in UTC but the app serves users in IST (Asia/Calcutta).
 * All "today" boundaries must be computed in IST, not UTC.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000 // +5:30

/**
 * Get the current date/time in IST as a JS Date.
 */
export function nowIST(): Date {
  return new Date(Date.now() + IST_OFFSET_MS)
}

/**
 * Get YYYY-MM-DD string for today in IST.
 */
export function todayISTStr(): string {
  const ist = nowIST()
  const y = ist.getUTCFullYear()
  const m = String(ist.getUTCMonth() + 1).padStart(2, '0')
  const d = String(ist.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Get start-of-day (00:00:00.000) and end-of-day (23:59:59.999) in IST,
 * returned as UTC Date objects suitable for Prisma queries.
 *
 * Example: If IST today is Aug 12, then:
 *   start = 2026-08-11T18:30:00.000Z  (Aug 12 00:00 IST)
 *   end   = 2026-08-12T18:29:59.999Z  (Aug 12 23:59:59 IST)
 */
export function todayISTRange(): { start: Date; end: Date } {
  const ist = nowIST()
  const y = ist.getUTCFullYear()
  const m = ist.getUTCMonth()
  const d = ist.getUTCDate()

  // IST midnight as UTC
  const start = new Date(Date.UTC(y, m, d, 0, 0, 0, 0) - IST_OFFSET_MS)
  // IST 23:59:59.999 as UTC
  const end = new Date(Date.UTC(y, m, d, 23, 59, 59, 999) - IST_OFFSET_MS)

  return { start, end }
}

/**
 * Convert any Date (or parseable date string) to its IST YYYY-MM-DD string.
 * Mirrors todayISTStr()'s UTC+offset math — never uses the local timezone.
 * 'YYYY-MM-DD' strings pass through unchanged.
 *
 * Future-date token fix (CTO Plan Phase 2, item 2e): lets callers derive the
 * correct IST day-window for a booking's OWN date instead of always "today".
 */
export function istDateStrFromDate(d: Date | string): string {
  if (typeof d === 'string') {
    const iso = d.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
    d = new Date(d)
  }
  if (isNaN(d.getTime())) {
    throw new Error(`istDateStrFromDate: invalid date: ${d}`)
  }
  const ist = new Date(d.getTime() + IST_OFFSET_MS)
  const y = ist.getUTCFullYear()
  const m = String(ist.getUTCMonth() + 1).padStart(2, '0')
  const day = String(ist.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Get IST date range for a given YYYY-MM-DD string.
 */
export function istDateRange(dateStr: string): { start: Date; end: Date } {
  const [y, m, d] = dateStr.split('-').map(Number)
  const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0) - IST_OFFSET_MS)
  const end = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999) - IST_OFFSET_MS)
  return { start, end }
}

/**
 * Format a Date for display in IST timezone.
 * Returns something like "Aug 12, 2026, 5:30 PM".
 */
export function formatIST(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    ...options,
  })
}

/**
 * Get current time in HH:MM format in IST.
 */
export function currentTimeIST(): string {
  const ist = nowIST()
  return `${String(ist.getUTCHours()).padStart(2, '0')}:${String(ist.getUTCMinutes()).padStart(2, '0')}`
}
