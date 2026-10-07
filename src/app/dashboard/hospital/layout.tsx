'use client'

/**
 * ONBOARDING-1: Hospital dashboard layout guard.
 *
 * Self-serve hospital/clinic owners register WITHOUT a Hospital row (keeps
 * public listings clean). This guard routes them to the onboarding wizard
 * (facility details → plan choice) before the dashboard renders, so they
 * never hit a "hospital not found" wall. Only redirects on a DEFINITIVE
 * hasProfile === false — never flash-redirects owners WITH a hospital.
 *
 * (No Dr. Copilot launcher here — that is doctor-side only.)
 */

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const ONBOARDING_PATH = '/dashboard/hospital/onboarding'

export default function HospitalDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  // 'checking' → spinner; 'ready' → render children. A redirect keeps the
  // spinner up (children never flash) until the wizard route mounts.
  const [gate, setGate] = useState<'checking' | 'ready'>('checking')

  useEffect(() => {
    let cancelled = false

    fetch('/api/dashboard/onboarding-status')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        // Redirect ONLY on a definitive false — fetch errors / 401 fail open
        // (the dashboard proxy handles unauthenticated traffic itself).
        if (d?.success === true && d.hasProfile === false && pathname !== ONBOARDING_PATH) {
          router.replace(ONBOARDING_PATH)
          return
        }
        setGate('ready')
      })
      .catch(() => {
        if (!cancelled) setGate('ready')
      })

    return () => {
      cancelled = true
    }
  }, [pathname, router])

  if (gate === 'checking') {
    return (
      <div
        className="min-h-[70vh] flex items-center justify-center"
        role="status"
        aria-label="Loading dashboard"
      >
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return <>{children}</>
}
