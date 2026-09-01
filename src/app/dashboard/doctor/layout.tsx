'use client'

/**
 * Doctor dashboard layout — mounts the Dr. Copilot launcher + slide-in
 * panel ONCE for every /dashboard/doctor/* page (dashboard, appointments,
 * prescriptions, patients…), so the assistant follows the doctor around
 * instead of living on a single page.
 *
 * All copilot data stays doctor-scoped on the server (see
 * src/lib/copilot/guard.ts — RULE #1); this component only holds UI state.
 */

import { useState } from 'react'
import { Bot } from 'lucide-react'
import { motion } from 'framer-motion'
import { CopilotPanel } from '@/components/copilot/panel'

export default function DoctorDashboardLayout({ children }: { children: React.ReactNode }) {
  const [copilotOpen, setCopilotOpen] = useState(false)

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
