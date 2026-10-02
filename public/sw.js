/*
 * Doctorooms PWA service worker — static & build-independent (works in dev
 * AND production, unlike next-pwa which requires `next build`).
 *
 * STRATEGY MAP
 * ─ HTML navigations ........ network-first → offline.html fallback (auth-aware
 *                              HTML is never cached — logout state / PII safe)
 * ─ /_next/static/* ......... cache-first (immutable, content-hashed)
 * ─ icons / manifest /
 *   public assets ........... stale-while-revalidate (runtime cache)
 * ─ /api/*, /_next/image,
 *   /uploads/* .............. BYPASS — network only.
 *                              RULE #1: patient data (API responses, lab
 *                              report files) must NEVER land in CacheStorage
 *                              where it would survive logout on shared
 *                              devices. SSE/copilot streams are POST → already
 *                              excluded by the GET-only gate.
 *
 * UPDATE FLOW: new SW installs → waits (no auto skipWaiting) → the app's
 * ServiceWorkerRegistrar shows an "Update available — Refresh" toast → user
 * accepts → posts SKIP_WAITING → controllerchange → page reloads once.
 *
 * Push handlers are wired for Phase P3 (web-push) — inert until a
 * push subscription exists.
 */

const VERSION = 'v2'
const IS_DEV = new URL(self.location.href).searchParams.has('dev')
const STATIC_CACHE = `doctorooms-static-${VERSION}`
const RUNTIME_CACHE = `doctorooms-runtime-${VERSION}`
const OFFLINE_URL = '/offline.html'

const PRECACHE = [
  OFFLINE_URL,
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
]

// ─── lifecycle ────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE))
  )
  // No auto-skipWaiting: the user approves updates via the in-app toast.
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
      // Self-heal: re-precache core assets if they were evicted (e.g. user
      // cleared site data or a test wiped caches) so the offline fallback
      // keeps working without waiting for the next version bump.
      const cache = await caches.open(STATIC_CACHE)
      await Promise.all(
        PRECACHE.map(async (url) => {
          if (!(await cache.match(url))) {
            try {
              await cache.add(url)
            } catch (err) {
              /* offline right now — next activate retries */
            }
          }
        })
      )
      await self.clients.claim()
    })()
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

// ─── fetch strategies ─────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return // POST/PATCH/PUT + SSE streams: network only

  const url = new URL(request.url)

  if (url.origin !== self.location.origin) return // cross-origin: browser handles
  if (url.pathname.startsWith('/api/')) return // RULE #1 — never intercept
  if (url.pathname.startsWith('/uploads/')) return // RULE #1 — medical files, network only
  if (url.pathname.startsWith('/_next/image')) return // optimizer may proxy uploads

  // HTML navigations: network-first, offline → cached offline page
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirstNavigation(request))
    return
  }

  // Immutable build assets: cache-first — but ONLY in production where
  // /_next/static URLs are content-hashed. In dev the same URLs are
  // re-emitted with new content on every HMR compile (no hash), so caching
  // them would serve stale CSS/JS. Dev: network only.
  if (url.pathname.startsWith('/_next/static/')) {
    if (IS_DEV) return
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Remaining same-origin GET (icons, manifest, public images): SWR
  event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE))
})

async function networkFirstNavigation(request) {
  try {
    return await fetch(request)
  } catch (err) {
    const cache = await caches.open(STATIC_CACHE)
    const offline = await cache.match(OFFLINE_URL)
    return (
      offline ||
      new Response('You are offline', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' },
      })
    )
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch (err) {
    return (
      cached ||
      new Response('Offline', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' },
      })
    )
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  let cached = await cache.match(request)
  if (!cached) {
    // fall back to the install-time precache (icons, manifest, offline page)
    // so precached assets keep serving when the network is gone
    const staticCache = await caches.open(STATIC_CACHE)
    cached = await staticCache.match(request)
  }
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone())
      return response
    })
    .catch(() => undefined)
  return cached || (await fetchPromise) || Response.error()
}

// ─── push notifications (Phase P3 — inert until subscriptions exist) ──────

self.addEventListener('push', (event) => {
  if (!event.data) return
  let payload = {}
  try {
    payload = event.data.json()
  } catch (err) {
    payload = { body: event.data.text() }
  }
  event.waitUntil(
    self.registration.showNotification(payload.title || 'Doctorooms', {
      body: payload.body || '',
      icon: '/icon-192.png',
      badge: '/icon-maskable-192.png',
      tag: payload.tag || 'doctorooms',
      data: { url: payload.url || '/dashboard' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url =
    (event.notification.data && event.notification.data.url) || '/dashboard'
  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })()
  )
})
