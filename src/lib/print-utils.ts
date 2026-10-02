/**
 * Print Engine — shared utilities for A4 print templates.
 * Used by all /print/<doc>/[id] routes.
 */

import { format, formatDistanceToNow, parseISO } from 'date-fns'

/** Format a number as Indian Rupees (₹) with proper grouping. */
export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '₹0'
  return '₹' + Number(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })
}

/** Format an ISO date string as "15 Aug 2026, 10:30 AM" (or just date if no time). */
export function formatDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return '—'
  try {
    const d = typeof iso === 'string' ? parseISO(iso) : iso
    return format(d, 'dd MMM yyyy, h:mm a')
  } catch {
    return '—'
  }
}

/** Format an ISO date string as "15 Aug 2026" (date only). */
export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return '—'
  try {
    const d = typeof iso === 'string' ? parseISO(iso) : iso
    return format(d, 'dd MMM yyyy')
  } catch {
    return '—'
  }
}

/** Format an ISO date as "Aug 2026" (for commission period display). */
export function formatPeriod(period: string): string {
  if (!period) return '—'
  try {
    const [y, m] = period.split('-').map(Number)
    if (!y || !m) return period
    const d = new Date(y, m - 1, 1)
    return format(d, 'MMM yyyy')
  } catch {
    return period
  }
}

/** Time-ago formatter: "2 hours ago", "3 days ago" */
export function timeAgo(iso: string | Date | null | undefined): string {
  if (!iso) return '—'
  try {
    const d = typeof iso === 'string' ? parseISO(iso) : iso
    return formatDistanceToNow(d, { addSuffix: true })
  } catch {
    return '—'
  }
}

/** Truncate a long string with ellipsis. */
export function truncate(s: string | null | undefined, max: number = 60): string {
  if (!s) return ''
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

/** Generate a unique receipt / invoice number. */
export function makeReceiptNo(prefix: string, id: string): string {
  // Use the last 8 chars of the cuid for a short, unique suffix.
  const suffix = id.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()
  return `${prefix}-${suffix}`
}

/** Status → CSS color (for badges in print templates). */
export function statusColor(status: string): { bg: string; text: string } {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'completed':
    case 'approve':
    case 'active':
    case 'verified':
      return { bg: '#dcfce7', text: '#166534' }
    case 'pending':
    case 'ordered':
    case 'progress':
    case 'inprogress':
      return { bg: '#fef3c7', text: '#92400e' }
    case 'cancelled':
    case 'rejected':
    case 'inactive':
      return { bg: '#fee2e2', text: '#991b1b' }
    case 'partial':
      return { bg: '#e0e7ff', text: '#3730a3' }
    default:
      return { bg: '#f1f5f9', text: '#475569' }
  }
}
