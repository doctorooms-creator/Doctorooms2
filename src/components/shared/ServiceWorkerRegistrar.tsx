'use client'

import { useEffect } from 'react'

/**
 * Registers the PWA service worker at /sw.js.
 *
 * The service worker is only built for production (`next build` emits sw.js
 * from src/app/sw.ts). In dev mode the file is not served, so every page load
 * produced a console error + a 404 request. We now skip registration in dev
 * and also probe the file first, so a missing /sw.js never logs an error.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    // Skip in development — sw.js is not emitted by `next dev`
    if (process.env.NODE_ENV !== 'production') return

    let cancelled = false

    // Probe /sw.js before registering to avoid noisy console errors
    fetch('/sw.js', { method: 'HEAD' })
      .then((res) => {
        if (cancelled) return
        if (!res.ok) {
          console.log('SW skipped: /sw.js not available')
          return
        }
        return navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('SW registered:', reg.scope)
          })
          .catch((err) => {
            console.log('SW registration failed:', err)
          })
      })
      .catch(() => {
        /* network unavailable — retry on next load */
      })

    return () => {
      cancelled = true
    }
  }, [])

  return null
}
