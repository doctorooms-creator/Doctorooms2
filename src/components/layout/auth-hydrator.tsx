'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/auth-store'

/**
 * Hydrates the Zustand auth store from the server session on mount.
 *
 * Why: the auth store is in-memory only. After a full page reload the store
 * is empty (isAuthenticated=false) even when the httpOnly session cookie is
 * perfectly valid. Public pages that gate actions on `isAuthenticated`
 * (e.g. the Book Appointment button on a doctor profile) would then bounce
 * a logged-in patient to /login for no reason.
 *
 * Mount this once per public layout: it silently checks /api/auth/me and
 * populates the store if a valid session exists. No-op otherwise.
 */
export function AuthHydrator() {
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    let cancelled = false

    async function hydrate() {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && data?.success && data.user) {
          setUser(data.user)
        }
      } catch {
        // No session / network error — leave the store as-is
      }
    }

    hydrate()
    return () => {
      cancelled = true
    }
  }, [setUser])

  return null
}
