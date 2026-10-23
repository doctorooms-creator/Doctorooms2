import { redirect } from 'next/navigation'

/**
 * RETIRED (One-Form Booking Home redesign).
 * Walk-ins now happen directly on the receptionist HOME page — the one
 * smart-form booking desk (type mobile/name → Enter → auto-reset).
 * Old bookmarks land there.
 */
export default function WalkInPage() {
  redirect('/dashboard/receptionist')
}
