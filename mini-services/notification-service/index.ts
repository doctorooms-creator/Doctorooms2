import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: { origin: '*' },
  // IMPORTANT: use the default path `/socket.io/` so socket.io's request
  // listener only intercepts requests starting with `/socket.io/`. This
  // leaves all other HTTP paths (POST /emit, GET /online-doctors, GET /stats)
  // free for our own httpServer request handler below.
  //
  // Previously `path: '/'` was used — that made socket.io prefix-match
  // every URL (since every URL starts with `/`), silently breaking all
  // HTTP endpoints. The fix requires the client (useSocket.ts) to also
  // use `path: '/socket.io/'` (which is the socket.io-client default).
  path: '/socket.io/',
})

const VALID_EVENTS = [
  // Original 9 events
  'new-admission',
  'vital-recorded',
  'sample-ordered',
  'lab-result-ready',
  'bill-generated',
  'payment-received',
  'discharge-advised',
  'low-stock-alert',
  // Lab Module events (5)
  'external-test-ordered',
  'external-test-accepted',
  'external-test-rejected',
  'external-report-uploaded',
  'commission-paid',
  // General system events (5)
  'queue-updated',
  'bed-status-changed',
  'prescription-shared',
  'doctor-online',
  'doctor-offline',
  // Video consultation events (Phase 3) — 'video-call-ended' is whitelisted
  // for future use; nothing emits it yet.
  'video-call-started',
  'video-call-ended',
  // Operation Theater events (4)
  'ot-scheduled',
  'ot-started',
  'ot-completed',
  'ot-cancelled',
  // Queue resilience events (Phase 4) — doctor paused/resumed their queue.
  'queue-paused',
  // Referral & points system (docs/REFERRAL-SYSTEM-PLAN.md)
  'referral-reward',
] as const

type ValidEvent = (typeof VALID_EVENTS)[number]

// Track connected clients — keyed by socket.id
const connectedClients = new Map<
  string,
  { userId: string; role: string; name: string; hospitalId?: string }
>()

// Track per-user connection counts (so a user with 2 tabs doesn't show as offline when one closes)
const userConnectionCount = new Map<string, number>()

// Doctor offline debounce timers (5-second grace period for network blips)
const offlineTimers = new Map<string, NodeJS.Timeout>()

io.use((socket, next) => {
  const { userId, role, name, hospitalId } = socket.handshake.auth as {
    userId?: string
    role?: string
    name?: string
    hospitalId?: string
  }
  if (!userId || !role) {
    return next(new Error('Authentication required'))
  }
  socket.data = { userId, role, name: name || 'User', hospitalId }
  next()
})

io.on('connection', (socket) => {
  const { userId, role, name, hospitalId } = socket.data
  console.log(`[Notification] Connected: ${name} (${role}) - ${socket.id}`)
  connectedClients.set(socket.id, { userId, role, name, hospitalId })

  // Track per-user connection count
  userConnectionCount.set(userId, (userConnectionCount.get(userId) || 0) + 1)

  // Cancel any pending offline timer for this user (reconnect within 5s)
  const pendingTimer = offlineTimers.get(userId)
  if (pendingTimer) {
    clearTimeout(pendingTimer)
    offlineTimers.delete(userId)
  }

  // Join rooms: user-specific, role-specific, hospital-specific
  socket.join(`user:${userId}`)
  socket.join(`role:${role}`)
  if (hospitalId) {
    socket.join(`hospital:${hospitalId}`)
  }

  // ── Doctor online broadcast ────────────────────────────────────────────
  // When a doctor connects (first connection for this user), broadcast
  // doctor-online to all patient-role clients. Patients use this to show
  // a green "online" dot on the booking page.
  if (role === 'doctor' && userConnectionCount.get(userId) === 1) {
    // Look up doctor's name from the connection (already provided in auth)
    io.to('role:patient').emit('doctor-online', {
      doctorUserId: userId,
      doctorName: name,
      isOnline: true,
      timestamp: new Date().toISOString(),
    })
    console.log(`[Notification] Doctor online broadcast: ${name} (${userId})`)
  }

  // Leave rooms on disconnect
  socket.on('disconnect', () => {
    connectedClients.delete(socket.id)

    const newCount = (userConnectionCount.get(userId) || 1) - 1
    if (newCount <= 0) {
      userConnectionCount.delete(userId)

      // Doctor offline — debounce 5 seconds to avoid flapping on network blips
      if (role === 'doctor') {
        const timer = setTimeout(() => {
          io.to('role:patient').emit('doctor-offline', {
            doctorUserId: userId,
            doctorName: name,
            isOnline: false,
            timestamp: new Date().toISOString(),
          })
          console.log(`[Notification] Doctor offline broadcast: ${name} (${userId})`)
          offlineTimers.delete(userId)
        }, 5000)
        offlineTimers.set(userId, timer)
      }
    } else {
      userConnectionCount.set(userId, newCount)
    }

    console.log(`[Notification] Disconnected: ${name} - ${socket.id}`)
  })
})

// ── HTTP endpoints for API routes ─────────────────────────────────────────

httpServer.on('request', async (req, res) => {
  const url = req.url || ''
  const method = req.method || 'GET'

  // ── Guard: never touch socket.io's own path ──────────────────────────
  // socket.io attached its request listener when `new Server(httpServer, …)`
  // ran ABOVE, BEFORE this handler was registered. Node therefore calls BOTH
  // listeners for every request. Without this guard, this handler's 404
  // fallback fires on top of socket.io's handshake responses, corrupting
  // them (clients then fail with endless "Connection error: timeout").
  if (url.startsWith('/socket.io/')) {
    return
  }

  // Set CORS headers for all responses (mini-service is called from Next.js
  // server-side, but the /online-doctors proxy needs CORS too just in case)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  // ── POST /emit — emit an event to one or more rooms ─────────────────
  if (method === 'POST' && url === '/emit') {
    let body = ''
    for await (const chunk of req) {
      body += chunk
    }

    try {
      const data = JSON.parse(body)
      const { event, rooms, payload } = data as {
        event: string
        rooms?: string[]
        payload: Record<string, unknown>
      }

      if (!event || !VALID_EVENTS.includes(event as ValidEvent)) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: `Invalid event. Valid: ${VALID_EVENTS.join(', ')}` }))
        return
      }

      if (!payload) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'payload is required' }))
        return
      }

      // Emit to specific rooms or broadcast
      if (rooms && rooms.length > 0) {
        for (const room of rooms) {
          io.to(room).emit(event, payload)
          console.log(`[Notification] Emitted '${event}' to room '${room}'`)
        }
      } else {
        io.emit(event, payload)
        console.log(`[Notification] Broadcast '${event}' to all clients`)
      }

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ success: true, event, rooms: rooms || ['broadcast'] }))
      return
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Invalid JSON body' }))
      return
    }
  }

  // ── GET /online-doctors — list currently-connected doctors ──────────
  if (method === 'GET' && url === '/online-doctors') {
    const onlineDoctors = Array.from(connectedClients.values())
      .filter((c) => c.role === 'doctor')
      // Deduplicate by userId (a doctor with 2 tabs should only appear once)
      .filter(
        (c, idx, arr) => arr.findIndex((x) => x.userId === c.userId) === idx
      )
      .map((c) => ({
        userId: c.userId,
        name: c.name,
        hospitalId: c.hospitalId || null,
      }))

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ onlineDoctors, count: onlineDoctors.length }))
    return
  }

  // ── GET /stats — debugging endpoint ─────────────────────────────────
  if (method === 'GET' && url === '/stats') {
    const byRole: Record<string, number> = {}
    const byHospital: Record<string, number> = {}
    for (const c of connectedClients.values()) {
      byRole[c.role] = (byRole[c.role] || 0) + 1
      if (c.hospitalId) {
        byHospital[c.hospitalId] = (byHospital[c.hospitalId] || 0) + 1
      }
    }
    const uniqueUsers = new Set(Array.from(connectedClients.values()).map((c) => c.userId)).size

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        totalConnections: connectedClients.size,
        uniqueUsers,
        byRole,
        byHospital,
        validEvents: VALID_EVENTS,
      })
    )
    return
  }

  // ── 404 fallback ─────────────────────────────────────────────────────
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found. Use POST /emit, GET /online-doctors, or GET /stats' }))
})

// ── Referral daily-jobs scheduler (Phase 2) ────────────────────────────────
// The Next.js app has no internal cron — this long-running service triggers
// the idempotent cron endpoint once after boot and at most once per 20h.
// The endpoint does the actual work: pending-referral expiry sweeps, FIFO
// points-expiry materialization, stage progression.
// CRON_SECRET lives in this service's own .env (gitignored) and must match
// the root app's .env.
const CRON_SECRET = process.env.CRON_SECRET || ''
const CRON_URL = 'http://localhost:3000/api/cron/referral-daily'
let lastCronRun = 0

async function runReferralDailyCron() {
  if (!CRON_SECRET) {
    console.log('[Cron] CRON_SECRET not set — referral daily jobs disabled')
    return
  }
  try {
    const res = await fetch(CRON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-cron-secret': CRON_SECRET },
    })
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (res.ok) {
      lastCronRun = Date.now()
      console.log(`[Cron] referral daily jobs OK → ${JSON.stringify(data)}`)
    } else {
      console.log(`[Cron] referral daily jobs failed (${res.status}) → ${JSON.stringify(data)}`)
    }
  } catch (err) {
    console.log('[Cron] referral daily jobs error:', err)
  }
}

// 45s boot delay lets the Next.js dev server warm up first.
setTimeout(() => {
  void runReferralDailyCron()
}, 45_000)

// Re-check every 6h; the 20h gate keeps it effectively daily (idempotent anyway).
setInterval(() => {
  if (Date.now() - lastCronRun > 20 * 60 * 60 * 1000) {
    void runReferralDailyCron()
  }
}, 6 * 60 * 60 * 1000)

const PORT = 3005
httpServer.listen(PORT, () => {
  console.log(`[Notification Service] Socket.io + HTTP on port ${PORT}`)
  console.log(`[Notification Service] HTTP endpoints:`)
  console.log(`  POST /emit            — emit an event to rooms`)
  console.log(`  GET  /online-doctors  — list currently online doctors`)
  console.log(`  GET  /stats           — connection stats (debugging)`)
  console.log(`[Notification Service] Valid events (${VALID_EVENTS.length}): ${VALID_EVENTS.join(', ')}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Notification Service] SIGTERM, shutting down...')
  io.close()
  httpServer.close()
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('[Notification Service] SIGINT, shutting down...')
  io.close()
  httpServer.close()
  process.exit(0)
})
