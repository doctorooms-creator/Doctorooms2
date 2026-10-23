/// <reference lib="webworker" />

/**
 * NOTE (v3, Oct 2026): the service worker actually served in production is
 * the static, build-independent `public/sw.js` (registered as /sw.js by
 * ServiceWorkerRegistrar). This file is NOT a Next.js special file, so the
 * router ignores it — it is kept only as a mirrored source of truth.
 *
 * Mirror of public/sw.js strategy (see that file for full docs):
 *   ─ HTML navigations: network-first → offline.html fallback (never cached)
 *   ─ /_next/static/*:  cache-first (immutable, content-hashed)
 *   ─ icons/manifest:   stale-while-revalidate (runtime cache)
 *   ─ /api/*, /uploads/*, /_next/image: BYPASS — never cached (PII rule #1)
 *   ─ install: skipWaiting immediately (waiting strand users on old builds)
 *   ─ activate: purge every cache not matching the current version
 */

declare const self: ServiceWorkerGlobalScope

const VERSION = 'v3'
const STATIC_CACHE = `doctorooms-static-${VERSION}`
const RUNTIME_CACHE = `doctorooms-runtime-${VERSION}`
const OFFLINE_URL = '/offline.html'

const PRECACHE = [
  OFFLINE_URL,
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return
  if (url.pathname.startsWith('/uploads/')) return
  if (url.pathname.startsWith('/_next/image')) return

  // HTML navigations: network-first, offline → cached offline page.
  // HTML itself is NEVER cached (auth-aware pages / PII rule #1).
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(STATIC_CACHE)
        const offline = await cache.match(OFFLINE_URL)
        return (
          offline ||
          new Response('You are offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          })
        )
      })
    )
    return
  }

  // Immutable build assets: cache-first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        const response = await fetch(request)
        if (response.ok) cache.put(request, response.clone())
        return response
      })
    )
    return
  }

  // Remaining same-origin GET (icons, manifest): SWR
  event.respondWith(
    caches.open(RUNTIME_CACHE).then(async (cache) => {
      const cached = await cache.match(request)
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone())
          return response
        })
        .catch(() => undefined)
      return cached || (await fetchPromise) || Response.error()
    })
  )
})

export {}
