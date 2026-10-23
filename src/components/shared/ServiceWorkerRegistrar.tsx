'use client'

import { useEffect } from 'react'

/**
 * Registers the PWA service worker at /sw.js and keeps the app
 * self-updating across deploys.
 *
 * WHY THE AUTO-UPDATE FLOW EXISTS (v3, Oct 2026): sw.js previously relied on
 * an in-app "Update available" toast that never shipped. New workers sat in
 * the `waiting` state forever while the old worker kept serving stale HTML —
 * users stayed locked on an old build even after production deploys.
 *
 * Current flow:
 *   1. register('/sw.js')
 *   2. if a worker is ALREADY waiting (stuck from an earlier deploy) →
 *      post SKIP_WAITING to it now
 *   3. watch `updatefound` → new worker reaches `installed` → post
 *      SKIP_WAITING (sw.js v3 also self-skips, older ones need the nudge)
 *   4. on `controllerchange` → reload the page ONCE so the fresh build boots
 *
 * The service worker is only built for production (`next dev` doesn't emit
 * it). We skip registration in dev and probe the file first, so a missing
 * /sw.js never logs an error.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    // Skip in development — sw.js is not emitted by `next dev`
    if (process.env.NODE_ENV !== 'production') return

    let cancelled = false
    let reloaded = false
    // Only reload when this page was already controlled by a worker (i.e. an
    // UPDATE just took over). First-ever registration doesn't need a reload.
    const wasControlled = !!navigator.serviceWorker.controller

    const nudgeWaitingWorker = (reg: ServiceWorkerRegistration) => {
      const worker = reg.waiting || reg.installing
      if (worker) {
        worker.postMessage({ type: 'SKIP_WAITING' })
      }
    }

    const onControllerChange = () => {
      if (reloaded || cancelled || !wasControlled) return
      reloaded = true
      // Fresh build is now controlling this page — boot it once, cleanly.
      window.location.reload()
    }

    // Attach BEFORE registering so a fast takeover is never missed
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    fetch('/sw.js', { method: 'HEAD' })
      .then((res) => {
        if (cancelled || !res.ok) return undefined
        return navigator.serviceWorker.register('/sw.js')
      })
      .then((reg) => {
        if (!reg || cancelled) return

        // Case 1 — a worker from a previous deploy is already waiting:
        // activate it immediately (self-heal stuck browsers).
        if (reg.waiting && navigator.serviceWorker.controller) {
          nudgeWaitingWorker(reg)
        }

        // Case 2 — watch for updates discovered on later navigations.
        reg.addEventListener('updatefound', () => {
          const incoming = reg.installing
          if (!incoming) return
          incoming.addEventListener('statechange', () => {
            if (incoming.state === 'installed' && navigator.serviceWorker.controller) {
              nudgeWaitingWorker(reg)
            }
          })
        })
      })
      .catch(() => {
        /* network unavailable — retry on next load */
      })

    return () => {
      cancelled = true
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  return null
}
