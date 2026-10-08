'use client'

/**
 * Specialty Starter Pack — empty-state banner + install CTA.
 * (docs/specialty-packs/03-IMPLEMENTATION-DESIGN.md §6 T4/T5)
 *
 * Placed in the Prescription Settings layout. Behavior:
 *   - masters empty + pack not installed → prominent banner with 1-click install
 *   - installing → spinner + "lag raha hai..." copy
 *   - installed → slim success chip (title · version · counts) + unverified-dose
 *     warning badge until MBBS review sign-off lands
 *   - masters populated + installed → the chip alone
 */

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Backpack,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

interface PackStatus {
  installedPacks: {
    packCode: string
    version: string
    counts: Record<string, number>
    installedAt: string
  }[]
  mastersEmpty: boolean
  suggestedPack: {
    code: string
    title: string
    version: string
    tier: string
    reviewed: boolean
    summary: string
    alreadyInstalled: boolean
  } | null
}

type Phase = 'loading' | 'banner' | 'installing' | 'installed' | 'hidden'

export function PackInstallBanner() {
  const [status, setStatus] = useState<PackStatus | null>(null)
  const [phase, setPhase] = useState<Phase>('loading')
  const [justInstalled, setJustInstalled] = useState(false)
  const queryClient = useQueryClient()

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/doctor/packs')
      if (!res.ok) {
        setPhase('hidden')
        return
      }
      const data: PackStatus = await res.json()
      setStatus(data)

      if (data.suggestedPack?.alreadyInstalled) {
        setPhase('installed')
      } else if (data.mastersEmpty && data.suggestedPack) {
        setPhase('banner')
      } else {
        setPhase('hidden')
      }
    } catch {
      setPhase('hidden')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const install = async () => {
    if (!status?.suggestedPack) return
    setPhase('installing')
    try {
      const res = await fetch('/api/dashboard/doctor/packs/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packCode: status.suggestedPack.code }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        toast.error(data.error || 'Pack install nahi ho paya — dobara try karein')
        setPhase('banner')
        return
      }
      setJustInstalled(true)
      setPhase('installed')
      toast.success(
        `🎒 ${data.title} lag gaya — ${data.summary}${data.skipped ? ` (${data.skipped} items skip — pehle se the)` : ''}`,
        { duration: 6000 }
      )
      // Master data changed under every settings page — invalidate ALL doctor
      // master queries so open lists (complaints, medicines, findings…) refetch.
      void queryClient.invalidateQueries()
      void load() // refresh counts for the chip
    } catch {
      toast.error('Network error — dobara try karein')
      setPhase('banner')
    }
  }

  if (phase === 'loading' || phase === 'hidden') return null

  const pack = status?.suggestedPack
  const installed = status?.installedPacks.find((p) => p.packCode === pack?.code)

  // ── Slim success chip (installed state) ───────────────────────────────
  if (phase === 'installed' && pack) {
    const counts = installed?.counts || {}
    const parts: string[] = []
    if (counts.complaints) parts.push(`${counts.complaints} C/O`)
    if (counts.medicines) parts.push(`${counts.medicines} meds`)
    if (counts.questions) parts.push(`${counts.questions} Q`)
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3 flex-wrap rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/30 px-4 py-2.5"
        role="status"
      >
        <div className="flex items-center gap-2 min-w-0">
          {justInstalled ? (
            <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
          ) : (
            <Backpack className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
          )}
          <span className="text-sm font-medium text-foreground truncate">
            {pack.title}
          </span>
          <Badge variant="outline" className="text-[10px] font-normal border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300">
            v{installed?.version || pack.version}
          </Badge>
          {parts.length > 0 && (
            <span className="hidden sm:inline text-xs text-muted-foreground">
              · {parts.join(' · ')}
            </span>
          )}
        </div>
        {!pack.reviewed && (
          <span className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Doses not yet medically reviewed — verify before prescribing
          </span>
        )}
        <Link
          href="/dashboard/doctor/prescription-settings/packs"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:underline shrink-0"
        >
          All 21 packs
          <ArrowRight className="h-3 w-3" />
        </Link>
      </motion.div>
    )
  }

  // ── Empty-state banner (install CTA) ──────────────────────────────────
  if (phase === 'banner' || phase === 'installing') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="rounded-xl border border-teal-200 dark:border-teal-800 bg-gradient-to-r from-teal-50/80 to-emerald-50/50 dark:from-teal-950/40 dark:to-emerald-950/20 p-4 sm:p-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
                <Backpack className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground">
                  Apni specialty ka ready-made library lagayein
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pack?.summary} — 1 click me. Baad me sab customize kar sakte hain.
                </p>
                {pack && !pack.reviewed && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Starter template — doses aap verify karke hi prescribe karein
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={install}
              disabled={phase === 'installing'}
              className="h-10 px-5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-lg shadow-teal-600/20 cursor-pointer shrink-0"
              aria-label={`Install ${pack?.title || 'starter pack'}`}
            >
              {phase === 'installing' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Installing…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Install Starter Pack
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return null
}
