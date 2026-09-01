'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardFooter } from '@/components/dashboard/dashboard-footer'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import type { AuthUser } from '@/lib/auth-store'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, setUser, logout: clearStore, isLoading, isAuthenticated } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [checking, setChecking] = useState(true)

  // On mount, check if we have auth from Zustand (just came from login) OR from sessionStorage/API (page refresh)
  useEffect(() => {
    async function checkAuth() {
      // 1. If Zustand has user, cookies are httpOnly (set by server, auto-sent by browser)
      if (user && isAuthenticated) {
        setChecking(false)
        return
      }

      // 2. Check sessionStorage (dev mode fallback for page refresh)
      try {
        const stored = sessionStorage.getItem('doctorooms_dev_user')
        if (stored) {
          const parsed = JSON.parse(stored) as AuthUser
          setUser(parsed)
          // Cookies are httpOnly — already set by server during login
          setChecking(false)
          return
        }
      } catch {
        // ignore parse errors
      }

      // 3. Try /api/auth/me (handles both real DB auth and dev mode fallback)
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.success && data.user) {
          setUser(data.user as AuthUser)
          setChecking(false)
          return
        }
      } catch {
        // API failed
      }

      // 4. No auth found → redirect to login (role selector in dev mode)
      setChecking(false)
      router.push('/login')
    }

    checkAuth()
  }, [])

  // Verify the user is on the correct role path
  useEffect(() => {
    if (!user || checking) return
    const routeSlug = user.role === 'lab_technician' ? 'lab-technician' : user.role
    const expectedPath = `/dashboard/${routeSlug}`
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      router.replace(expectedPath)
    }
  }, [user, pathname, checking, router])

  const handleLogout = async () => {
    // Clear all auth state
    sessionStorage.removeItem('doctorooms_dev_user')
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    clearStore()
    router.push('/login')
  }

  if (checking || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAuthenticated) {
    return null
  }

  // `relative` on the root matters: sr-only spans (position:absolute, no
  // closer positioned ancestor) were resolving against the viewport, pushing
  // document scrollHeight past h-screen → big blank white space below the
  // footer that users could scroll into. With `relative` here, the
  // overflow-hidden on this wrapper actually clips them.
  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      <DashboardSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader onMenuClick={() => setMobileOpen(true)} onLogout={handleLogout} />
        {/* flex flex-col + min-h-0 lets the inner content (flex-1) fill the
            available height, while DashboardFooter (mt-auto via flex-col)
            sticks to the bottom on short pages and is pushed down on long ones.
            overflow-y-auto on main keeps the scroll behavior. */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex min-h-full flex-col">
            <div className="flex-1">{children}</div>
            <DashboardFooter />
          </div>
        </main>
      </div>
    </div>
  )
}
