import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Display name for a doctor that never double-prefixes. Doctor names in the
 * DB are stored both with ("Dr. Anita Desai") and without ("Rajesh Sharma")
 * the honorific — this helper guarantees exactly one "Dr." prefix.
 */
export function doctorDisplayName(name?: string | null): string {
  const trimmed = (name || '').trim()
  if (!trimmed) return '—'
  if (/^dr\.?\s/i.test(trimmed)) return trimmed
  return `Dr. ${trimmed}`
}
