import { redirect } from 'next/navigation'

/**
 * RETIRED (Reception Panel P2 — booking unification).
 * Walk-in is now a mode of the unified Booking Desk. Redirect old
 * bookmarks/sidebar links for one release before the route is deleted.
 */
export default function WalkInPage() {
  redirect('/dashboard/receptionist/booking')
}
