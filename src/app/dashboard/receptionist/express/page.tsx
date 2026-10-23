import { redirect } from 'next/navigation'

/**
 * RETIRED (One-Form Booking Home redesign).
 * Quick/express walk-ins now happen directly on the receptionist HOME page —
 * the one smart-form booking desk (name-only → straight to queue).
 * Full express auto-doctor lives under Advanced Booking (/booking).
 */
export default function ExpressWalkinPage() {
  redirect('/dashboard/receptionist')
}
