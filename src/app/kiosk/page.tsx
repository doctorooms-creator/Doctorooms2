import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

// Bare /kiosk entry point — sends visitors straight to the first active
// hospital's kiosk (the same hospital /hospitals lists first), so QR posters
// and manual visits to /kiosk never dead-end on a 404.
export const dynamic = 'force-dynamic'

export default async function KioskIndexPage() {
  // Mirror the public hospital APIs' convention: only hospitals whose linked
  // user is Active are reachable (see /api/hospitals and /api/hospitals/[id]).
  const hospital = await db.hospital.findFirst({
    where: { user: { status: 'Active' } },
    select: { id: true },
    orderBy: { user: { createdAt: 'desc' } },
  })

  redirect(hospital ? `/kiosk/${hospital.id}` : '/hospitals')
}
