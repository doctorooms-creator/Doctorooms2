'use client'

/**
 * CelebrationOverlay — full-screen confetti moment for BIG wins.
 *
 * Roadmap "celebration moments": milestone unlocks (5th/10th conversion),
 * Referral Champion, redemption success, Rx #50, Patient #100, Pro trial
 * activation. Listens on the authenticated socket for the `celebration`
 * event and renders a rich overlay: multi-burst confetti + glowing card +
 * kind-specific emoji art + auto-dismiss (or click to dismiss).
 *
 * Mounted once in the root layout — no per-page wiring needed.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { useAuthSocket } from '@/hooks/useSocket'
import { playChime } from '@/lib/play-chime'

interface CelebrationPayload {
  title?: string
  message?: string
  kind?: 'milestone' | 'redeem' | 'rx50' | 'patient100' | 'trial' | string
  points?: number
  timestamp?: string
}

interface Celebration extends CelebrationPayload {
  id: number
}

const KIND_ART: Record<string, { emoji: string; ring: string; chip: string }> = {
  milestone: { emoji: '🏆', ring: 'from-amber-400/50 to-orange-500/30', chip: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  redeem: { emoji: '🎁', ring: 'from-emerald-400/50 to-teal-500/30', chip: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  rx50: { emoji: '💉', ring: 'from-teal-400/50 to-cyan-500/30', chip: 'bg-teal-500/15 text-teal-600 dark:text-teal-400' },
  patient100: { emoji: '👨‍⚕️', ring: 'from-rose-400/50 to-red-500/30', chip: 'bg-rose-500/15 text-rose-600 dark:text-rose-400' },
  trial: { emoji: '🚀', ring: 'from-violet-400/50 to-purple-500/30', chip: 'bg-violet-500/15 text-violet-600 dark:text-violet-400' },
}

const DEFAULT_ART = { emoji: '🎉', ring: 'from-amber-400/50 to-orange-500/30', chip: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' }

/** Multi-burst cinematic confetti volley. */
function fireCelebrationConfetti() {
  const colors = ['#f59e0b', '#10b981', '#14b8a6', '#f43f5e', '#8b5cf6', '#fbbf24']

  // Center grand burst
  confetti({
    particleCount: 160,
    spread: 100,
    startVelocity: 45,
    origin: { y: 0.6 },
    colors,
    zIndex: 99999,
  })

  // Left + right side cannons (slight delay for wave effect)
  setTimeout(() => {
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.7 },
      colors,
      zIndex: 99999,
    })
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.7 },
      colors,
      zIndex: 99999,
    })
  }, 180)

  // Falling sparkle drizzle from the top
  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 160,
      startVelocity: 12,
      gravity: 0.7,
      origin: { y: 0 },
      colors: ['#fbbf24', '#f59e0b', '#fff'],
      scalar: 0.8,
      zIndex: 99999,
    })
  }, 420)
}

let celebrationCounter = 0

export function CelebrationOverlay() {
  const socket = useAuthSocket()
  const [celebration, setCelebration] = useState<Celebration | null>(null)
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dismiss = useCallback(() => {
    setCelebration(null)
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current)
      dismissTimer.current = null
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    const handler = (payload: CelebrationPayload) => {
      const c: Celebration = { ...payload, id: ++celebrationCounter }
      setCelebration(c)
      fireCelebrationConfetti()
      playChime()

      // Auto-dismiss after 6s
      if (dismissTimer.current) clearTimeout(dismissTimer.current)
      dismissTimer.current = setTimeout(() => setCelebration(null), 6000)
    }

    socket.on('celebration', handler)
    return () => {
      socket.off('celebration', handler)
      if (dismissTimer.current) clearTimeout(dismissTimer.current)
    }
  }, [socket])

  if (!celebration) return null

  const art = KIND_ART[celebration.kind ?? ''] ?? DEFAULT_ART

  return (
    <div
      role="dialog"
      aria-label={celebration.title || 'Celebration'}
      className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={dismiss}
    >
      <div
        className={`relative mx-4 max-w-md overflow-hidden rounded-3xl border border-amber-200/50 bg-gradient-to-br ${art.ring} p-1 shadow-2xl animate-in zoom-in-95 duration-300 dark:border-amber-500/30`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-[calc(1.5rem-4px)] bg-background px-8 py-10 text-center">
          {/* Emoji art */}
          <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-amber-400/20" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-500/20 dark:to-orange-500/10" />
            <span className="relative text-5xl drop-shadow-sm" role="img" aria-hidden="true">
              {art.emoji}
            </span>
          </div>

          {/* Title + message */}
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
            {celebration.title || '🎉 Celebration!'}
          </h2>
          <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {celebration.message || 'A big milestone just unlocked!'}
          </p>

          {/* Points chip (when the celebration carries points) */}
          {typeof celebration.points === 'number' && celebration.points > 0 && (
            <span
              className={`mb-6 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold ${art.chip}`}
            >
              <span aria-hidden="true">✨</span>
              {celebration.points.toLocaleString('en-IN')} points
            </span>
          )}

          <button
            onClick={dismiss}
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Continue 🚀
          </button>

          <p className="mt-4 text-[11px] text-muted-foreground/70">
            Tap anywhere to dismiss
          </p>
        </div>
      </div>
    </div>
  )
}
