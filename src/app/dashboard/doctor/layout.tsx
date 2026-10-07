'use client'

/**
 * Doctor dashboard layout — mounts the Dr. Copilot launcher + slide-in
 * panel ONCE for every /dashboard/doctor/* page (dashboard, appointments,
 * prescriptions, patients…), so the assistant follows the doctor around
 * instead of living on a single page.
 *
 * ONBOARDING-1: self-serve doctors register WITHOUT a Doctor profile row
 * (keeps public listings clean). This layout guard routes them to the
 * onboarding wizard before the dashboard renders, so they never hit a
 * "profile not found" wall. Only redirects on a DEFINITIVE
 * hasProfile === false — never flash-redirects doctors WITH profiles.
 *
 * All copilot data stays doctor-scoped on the server (see
 * src/lib/copilot/guard.ts — RULE #1); this component only holds UI state.
 */

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Bot, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { CopilotPanel } from '@/components/copilot/panel'

const ONBOARDING_PATH = '/dashboard/doctor/onboarding'

export default function DoctorDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  // 'checking' → spinner; 'ready' → render children. A redirect keeps the
  // spinner up (children never flash) until the wizard route mounts.
  const [gate, setGate] = useState<'checking' | 'ready'>('checking')
  const [copilotOpen, setCopilotOpen] = useState(false)

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

  return (
    <>
      {children}

      {/* Dr. Copilot launcher (floating) */}
      <button
        type="button"
        onClick={() => setCopilotOpen(true)}
        aria-label="Open Dr. Copilot AI assistant"
        title="Dr. Copilot — AI assistant"
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-600/30 transition-transform hover:scale-105 active:scale-95 md:bottom-6 md:right-6"
      >
        <motion.span
          className="absolute inset-0 rounded-full bg-teal-400/40"
          animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          aria-hidden
        />
        <Bot className="relative h-5 w-5" aria-hidden />
      </button>

      {/* Slide-in panel (mobile full-screen / desktop side panel) */}
      <CopilotPanel open={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </>
  )
}
