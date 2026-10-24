'use client'

/**
 * /opd — the Doctor "Dashboard 2" (OPD Cockpit).
 *
 * Full-screen, chrome-free route OUTSIDE /dashboard/* (that tree mounts the
 * app sidebar/header/footer — the whole point here is to escape them).
 * Own auth guard follows the dashboard-layout pattern (Zustand →
 * sessionStorage → /api/auth/me), doctor-role-asserted, with the same
 * onboarding gate as the doctor layout (self-serve doctors without a
 * Doctor profile get routed to the wizard instead of a broken screen).
 *
 * The doctor identity is resolved server-side by /api/opd/cockpit from the
 * session — no doctorId travels through the URL (shareable-bookmark-safe).
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import type { AuthUser } from '@/lib/auth-store'
import { OpdCockpit } from '@/components/opd/opd-cockpit'

type Gate = 'checking' | 'redirecting' | 'ready'

export default function OpdPage() {
  const router = useRouter()
  const { user, setUser, isAuthenticated } = useAuthStore()
  const [gate, setGate] = useState<Gate>('checking')

  useEffect(() => {
    let cancelled = false

    async function check() {
      // 1. Zustand (fresh login) → 2. sessionStorage (dev refresh) → 3. /api/auth/me
      let u: AuthUser | null = user && isAuthenticated ? user : null
      if (!u) {
        try {
          const stored = sessionStorage.getItem('doctorooms_dev_user')
          if (stored) u = JSON.parse(stored) as AuthUser
        } catch {
          /* ignore */
        }
      }
      if (!u) {
        try {
          const res = await fetch('/api/auth/me')
          const data = await res.json()
          if (data.success && data.user) {
            u = data.user as AuthUser
            setUser(u)
          }
        } catch {
          /* fall through */
        }
      }

      if (cancelled) return

      if (!u) {
        setGate('redirecting')
        router.replace('/login')
        return
      }
      if (u.role !== 'doctor') {
        // Not a doctor → back to their own dashboard (no error screen needed).
        setGate('redirecting')
        router.replace(`/dashboard/${u.role === 'lab_technician' ? 'lab-technician' : u.role}`)
        return
      }

      // Onboarding gate (same guard as doctor layout): doctors without a
      // profile row cannot have a queue — send them to the wizard.
      try {
        const res = await fetch('/api/dashboard/onboarding-status')
        const data = await res.json()
        if (data?.success && data?.hasProfile === false) {
          if (!cancelled) {
            setGate('redirecting')
            router.replace('/dashboard/doctor/onboarding')
          }
          return
        }
      } catch {
        /* fall through — cockpit itself will surface API errors honestly */
      }
      if (!cancelled) setGate('ready')
    }

    check()
    return () => {
      cancelled = true
    }
  }, [])

  if (gate !== 'ready') {
    return (
      <div
        style={{ background: 'var(--opd-ground, #f7f8f8)' }}
        className="flex h-screen items-center justify-center"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-teal-600" />
          <p className="text-sm text-muted-foreground">Opening OPD cockpit…</p>
        </div>
      </div>
    )
  }

  return <OpdCockpit />
}
