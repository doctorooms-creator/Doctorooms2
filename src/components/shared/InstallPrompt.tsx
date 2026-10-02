'use client'

import { useCallback, useEffect, useState } from 'react'
import { X, Smartphone, Share, PlusSquare, Home, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/**
 * Floating "Install App" pill (bottom-left, clear of the Copilot FAB which
 * lives bottom-right).
 *
 * Android (Chrome/Edge/Samsung Internet): captures the native
 * `beforeinstallprompt` event and triggers the system install sheet directly.
 *
 * iOS (Safari 16.4+ / PWA-capable): no programmatic prompt exists, so we show
 * a short "Share → Add to Home Screen" instruction sheet instead.
 *
 * Auto-hides when: already installed (standalone display-mode / appinstalled),
 * or dismissed by the user (remembers for 7 days).
 */

const DISMISS_KEY = 'doctorooms-install-dismissed'
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone ===
      true
  )
}

function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [iosSheetOpen, setIosSheetOpen] = useState(false)
  const [iosEligible, setIosEligible] = useState(false)
  const [dismissed, setDismissed] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(DISMISS_KEY)
      if (!raw || Date.now() - Number(raw) > DISMISS_TTL_MS) setDismissed(false)
    } catch {
      setDismissed(false)
    }
    if (isIOS() && !isStandalone()) {
      // Give Chrome-style beforeinstallprompt a moment — iOS never fires it
      setTimeout(() => setIosEligible(true), 1500)
    }
  }, [])

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault() // stop the mini-infobar; we own the UX
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setDeferredPrompt(null)
      setIosEligible(false)
    }
    const onDisplayMode = (e: MediaQueryListEvent) => {
      if (e.matches) setDeferredPrompt(null)
    }
    const mql = window.matchMedia('(display-mode: standalone)')
    mql.addEventListener('change', onDisplayMode)

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
      mql.removeEventListener('change', onDisplayMode)
    }
  }, [])

  const dismiss = useCallback(() => {
    setDismissed(true)
    setDeferredPrompt(null)
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      /* private mode — session-only dismiss */
    }
  }, [])

  const install = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
          setDeferredPrompt(null)
        }
      } catch {
        /* prompt unavailable — pill remains */
      }
      return
    }
    if (iosEligible) setIosSheetOpen(true)
  }, [deferredPrompt, iosEligible])

  if (!mounted) return null
  if (isStandalone() || dismissed) return null
  if (!deferredPrompt && !iosEligible) return null

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Install Doctorooms app on your device"
        onClick={install}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') install()
        }}
        className="fixed bottom-4 left-4 z-[60] flex cursor-pointer select-none items-center gap-2.5 rounded-full border border-teal-600/30 bg-gradient-to-r from-teal-600 to-teal-700 py-3 pr-3 pl-4 text-white shadow-lg shadow-teal-900/30 transition-all duration-200 hover:scale-[1.03] hover:shadow-xl hover:shadow-teal-900/40 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none active:scale-100"
      >
        <Smartphone className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="text-[13px] leading-none font-semibold whitespace-nowrap">
          Install App
        </span>
        <Download className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />
        <button
          type="button"
          aria-label="Dismiss install suggestion"
          onClick={(e) => {
            e.stopPropagation()
            dismiss()
          }}
          className="ml-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/30"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>

      <Dialog open={iosSheetOpen} onOpenChange={setIosSheetOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-teal-700">
              <Smartphone className="h-5 w-5" aria-hidden="true" />
              Add Doctorooms to Home Screen
            </DialogTitle>
            <DialogDescription>
              Install the app on your iPhone or iPad in three quick steps.
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-4 pt-2">
            {[
              {
                icon: Share,
                title: 'Open the Share menu',
                desc: 'Tap the Share button in Safari\u2019s toolbar at the bottom.',
              },
              {
                icon: PlusSquare,
                title: 'Tap "Add to Home Screen"',
                desc: 'Scroll the list and choose Add to Home Screen.',
              },
              {
                icon: Home,
                title: 'Launch like any app',
                desc: 'The Doctorooms icon appears on your home screen — full screen, no browser bars.',
              },
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <step.icon className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {i + 1}. {step.title}
                  </p>
                  <p className="text-[13px] leading-snug text-muted-foreground">
                    {step.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <Button
            onClick={() => setIosSheetOpen(false)}
            className="mt-2 w-full bg-teal-600 hover:bg-teal-700"
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
