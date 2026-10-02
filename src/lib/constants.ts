export const APP_NAME = 'Doctorooms'

export const SPECIALIZATIONS = [
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Neurologist',
  'Ophthalmologist',
  'Orthopedic',
  'Dentist',
  'General Physician',
  'Gynecologist',
  'ENT Specialist',
  'Psychiatrist',
  'Urologist',
]

export const GENDERS = ['Male', 'Female', 'Other']

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

/**
 * Booking status → Tailwind badge color classes.
 * Shared across all dashboards to keep status palettes consistent.
 * (Previously duplicated across 7+ dashboard files.)
 */
export const BOOKING_STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Approve: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  Visited: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Canceled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Finish: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Extend: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  // Phase 4 "Queue Resilience": NoShow (missed appointment) → amber,
  // Rejected (declined by reception/OPD limit) → rose.
  NoShow: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
}

/** Helper: get badge classes for a booking status (with fallback) */
export function getBookingStatusColor(status: string): string {
  return BOOKING_STATUS_COLORS[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
}

/** All valid booking statuses */
export const BOOKING_STATUSES = [
  'Pending',
  'Approve',
  'Visited',
  'Canceled',
  'Finish',
  'Extend',
  'NoShow',
  'Rejected',
] as const

/** IPD admission statuses */
export const IPD_ADMISSION_STATUSES = ['Admitted', 'Discharged', 'Transferred', 'Expired'] as const

/** Payment methods */
export const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Net Banking', 'Cheque', 'Insurance'] as const
