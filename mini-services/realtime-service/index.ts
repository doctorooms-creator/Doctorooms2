/**
 * Doctorooms Realtime Service (merged)
 * ====================================
 * ONE process, ONE port — replaces the old chat-service (:3004) and
 * notification-service (:3005). Designed to deploy as a single Render web
 * service (persistent process, long-lived WebSocket connections).
 *
 * Socket namespaces:
 *   /notif  — presence, doctor-online/offline, event fan-out to rooms
 *   /chat   — booking-scoped chat rooms with DB persistence (Prisma)
 *
 * HTTP endpoints (same port):
 *   POST /emit            — API routes emit events to rooms (auth: none, internal)
 *   GET  /online-doctors  — currently connected doctors
 *   GET  /stats           — connection stats (debugging)
 *   GET  /health          — uptime + DB ping (for Render/uptime monitors)
 *
 * Auth: clients present a short-lived JWT (minted by the Next.js app at
 * /api/auth/socket-token, signed with NEXTAUTH_SECRET). Verified here with the
 * same secret. When REALTIME_STRICT_AUTH=1 (production), the token is
 * REQUIRED — clients can no longer self-declare arbitrary identities.
 *
 * Env vars:
 *   PORT                     — injected by Render (fallback 3006 for sandbox dev)
 *   DATABASE_URL             — Supabase pooler URL (session pooler, port 5432)
 *   NEXTAUTH_SECRET          — must match the Next.js app's secret
 *   REALTIME_STRICT_AUTH     — "1" = require signed socketToken (production)
 *   REALTIME_ALLOWED_ORIGINS — comma-separated CORS allowlist
 *   CRON_SECRET / CRON_URL   — triggers the app's referral daily jobs
 */

import { createServer } from 'http'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

// ── Config ─────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT || 3006)
const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET || 'doctorooms-dev-secret-change-in-production'
const STRICT_AUTH = process.env.REALTIME_STRICT_AUTH === '1'
// Shared secret with the Next.js app (Vercel). When set, POST /emit requires
// a matching x-emit-secret header — prevents random internet callers from
// broadcasting fake events to connected clients.
const EMIT_SECRET = process.env.REALTIME_EMIT_SECRET || ''
const ALLOWED_ORIGINS = (process.env.REALTIME_ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const db = new PrismaClient({
  log: ['error'],
})

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS.length
      ? ALLOWED_ORIGINS
      : '*', // dev fallback when no allowlist configured
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Default path so our own HTTP handler below stays free for /emit etc.
  path: '/socket.io/',
})

// ── Shared auth middleware factory ─────────────────────────────────────────
interface HandshakeAuth {
  userId?: string
  role?: string
  name?: string
  hospitalId?: string
  socketToken?: string
}

function authMiddleware(namespace: string) {
  return (socket: { handshake: { auth: HandshakeAuth }; data: unknown }, next: (err?: Error) => void) => {
    const a = socket.handshake.auth

    // 1) Preferred: verify the signed token from /api/auth/socket-token
    if (a.socketToken) {
      try {
        const payload = jwt.verify(a.socketToken, NEXTAUTH_SECRET) as {
          userId: string
          role: string
          name?: string
        }
        socket.data = {
          userId: payload.userId,
          role: payload.role,
          name: payload.name || a.name || 'User',
          hospitalId: a.hospitalId,
        }
        return next()
      } catch {
        return next(new Error('invalid or expired token'))
      }
    }

    // 2) Strict mode (production): no token → reject
    if (STRICT_AUTH) {
      return next(new Error('token required'))
    }

    // 3) Dev fallback: trust declared identity (sandbox convenience only)
    if (!a.userId || !a.role) {
      return next(new Error('Authentication required'))
    }
    socket.data = {
      userId: a.userId,
      role: a.role,
      name: a.name || 'User',
      hospitalId: a.hospitalId,
    }
    next()
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION NAMESPACE (/notif)
// ═══════════════════════════════════════════════════════════════════════════
const VALID_EVENTS = [
  'new-admission',
  'vital-recorded',
  'sample-ordered',
  'lab-result-ready',
  'bill-generated',
  'payment-received',
  'discharge-advised',
  'low-stock-alert',
  'external-test-ordered',
  'external-test-accepted',
  'external-test-rejected',
  'external-report-uploaded',
  'commission-paid',
  'queue-updated',
  'bed-status-changed',
  'prescription-shared',
  'doctor-online',
  'doctor-offline',
  'video-call-started',
  'video-call-ended',
  'ot-scheduled',
  'ot-started',
  'ot-started',
  'ot-completed',
  'ot-cancelled',
  'queue-paused',
  'referral-reward',
  'celebration',
] as const
type ValidEvent = (typeof VALID_EVENTS)[number]

const notif = io.of('/notif')
notif.use(authMiddleware('/notif'))

const connectedClients = new Map<
  string,
  { userId: string; role: string; name: string; hospitalId?: string }
>()
const userConnectionCount = new Map<string, number>()
const offlineTimers = new Map<string, NodeJS.Timeout>()

notif.on('connection', (socket) => {
  const { userId, role, name, hospitalId } = socket.data as {
    userId: string
    role: string
    name: string
    hospitalId?: string
  }
  console.log(`[Notif] Connected: ${name} (${role}) - ${socket.id}`)
  connectedClients.set(socket.id, { userId, role, name, hospitalId })
  userConnectionCount.set(userId, (userConnectionCount.get(userId) || 0) + 1)

  // Cancel pending offline timer (reconnect within grace period)
  const pendingTimer = offlineTimers.get(userId)
  if (pendingTimer) {
    clearTimeout(pendingTimer)
    offlineTimers.delete(userId)
  }

  socket.join(`user:${userId}`)
  socket.join(`role:${role}`)
  if (hospitalId) socket.join(`hospital:${hospitalId}`)

  // Doctor online broadcast (first connection for this user only)
  if (role === 'doctor' && userConnectionCount.get(userId) === 1) {
    notif.to('role:patient').emit('doctor-online', {
      doctorUserId: userId,
      doctorName: name,
      isOnline: true,
      timestamp: new Date().toISOString(),
    })
    console.log(`[Notif] Doctor online broadcast: ${name}`)
  }

  socket.on('disconnect', () => {
    connectedClients.delete(socket.id)
    const newCount = (userConnectionCount.get(userId) || 1) - 1
    if (newCount <= 0) {
      userConnectionCount.delete(userId)
      if (role === 'doctor') {
        const timer = setTimeout(() => {
          notif.to('role:patient').emit('doctor-offline', {
            doctorUserId: userId,
            doctorName: name,
            isOnline: false,
            timestamp: new Date().toISOString(),
          })
          offlineTimers.delete(userId)
        }, 5000)
        offlineTimers.set(userId, timer)
      }
    } else {
      userConnectionCount.set(userId, newCount)
    }
    console.log(`[Notif] Disconnected: ${name} - ${socket.id}`)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// CHAT NAMESPACE (/chat) — booking-scoped rooms, DB-persisted messages
// ═══════════════════════════════════════════════════════════════════════════
const chat = io.of('/chat')
chat.use(authMiddleware('/chat'))

chat.on('connection', (socket) => {
  const { userId, role, name } = socket.data as {
    userId: string
    role: string
    name: string
  }
  console.log(`[Chat] Connected: ${name} (${role}) - ${socket.id}`)

  socket.on('join-room', async (data: { bookingId: string }) => {
    const roomName = `chat:${data.bookingId}`
    try {
      const booking = await db.booking.findFirst({
        where: {
          id: data.bookingId,
          OR: [
            { userId }, // patient owns this booking
            { doctor: { userId } }, // doctor owns this booking
          ],
        },
      })
      if (!booking) {
        socket.emit('error', { message: 'Not authorized for this chat' })
        return
      }
      await socket.join(roomName)
      const sockets = await chat.in(roomName).fetchSockets()
      chat.to(roomName).emit('room-joined', {
        onlineCount: sockets.length,
        userId,
        name,
      })
      console.log(`[Chat] ${name} joined ${roomName} (${sockets.length} online)`)
    } catch (err) {
      console.error('[Chat] Error joining room:', err)
    }
  })

  socket.on('leave-room', async (data: { bookingId: string }) => {
    const roomName = `chat:${data.bookingId}`
    await socket.leave(roomName)
    const sockets = await chat.in(roomName).fetchSockets()
    chat.to(roomName).emit('user-left', {
      onlineCount: sockets.length,
      userId,
      name,
    })
  })

  socket.on('send-message', async (data: { bookingId: string; message: string }) => {
    const { bookingId, message } = data
    const roomName = `chat:${bookingId}`
    if (!message?.trim()) return
    try {
      const booking = await db.booking.findFirst({
        where: {
          id: bookingId,
          OR: [{ userId }, { doctor: { userId } }],
        },
      })
      if (!booking) return

      const chatMsg = await db.bookingChat.create({
        data: { bookingId, fromId: userId, message: message.trim() },
        include: { from: { select: { name: true, role: true, profileImg: true } } },
      })
      chat.to(roomName).emit('new-message', {
        id: chatMsg.id,
        bookingId,
        fromId: userId,
      })
      console.log(`[Chat] Message in ${roomName} from ${name}`)
    } catch (err) {
      console.error('[Chat] Error sending message:', err)
    }
  })

  socket.on('typing', (data: { bookingId: string }) => {
    socket.to(`chat:${data.bookingId}`).emit('user-typing', { name })
  })
  socket.on('stop-typing', (data: { bookingId: string }) => {
    socket.to(`chat:${data.bookingId}`).emit('user-stop-typing', { name })
  })

  socket.on('mark-read', async (data: { bookingId: string }) => {
    const roomName = `chat:${data.bookingId}`
    try {
      await db.bookingChat.updateMany({
        where: {
          bookingId: data.bookingId,
          fromId: { not: userId },
          status: 'SENT',
        },
        data: { status: 'READ' },
      })
      socket.to(roomName).emit('messages-read', { userId, name })
    } catch (err) {
      console.error('[Chat] Error marking read:', err)
    }
  })

  socket.on('disconnect', () => {
    console.log(`[Chat] Disconnected: ${name} - ${socket.id}`)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// HTTP ENDPOINTS (API routes call these server-to-server)
// ═══════════════════════════════════════════════════════════════════════════
httpServer.on('request', async (req, res) => {
  const url = req.url || ''
  const method = req.method || 'GET'

  // Never touch socket.io's own path (it registered its listener first)
  if (url.startsWith('/socket.io/')) return

  // CORS (env-driven allowlist; * in dev when unset)
  const origin = req.headers.origin
  if (ALLOWED_ORIGINS.length && origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  } else if (!ALLOWED_ORIGINS.length) {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  // ── GET /health — uptime + DB ping (for Render checks & keep-alive pings) ──
  if (method === 'GET' && (url === '/health' || url.startsWith('/health?'))) {
    let dbOk = false
    try {
      await db.$queryRaw`select 1`
      dbOk = true
    } catch {
      dbOk = false
    }
    const body = JSON.stringify({
      status: 'ok',
      service: 'doctorooms-realtime',
      uptimeSec: Math.round(process.uptime()),
      db: dbOk ? 'up' : 'down',
      strictAuth: STRICT_AUTH,
      namespaces: ['/notif', '/chat'],
      timestamp: new Date().toISOString(),
    })
    res.writeHead(dbOk ? 200 : 503, { 'Content-Type': 'application/json' })
    res.end(body)
    return
  }

  // ── POST /emit — emit an event to one or more rooms (notif namespace) ──
  if (method === 'POST' && url === '/emit') {
    if (EMIT_SECRET) {
      const provided = (req.headers['x-emit-secret'] || '').toString()
      if (provided !== EMIT_SECRET) {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'unauthorized' }))
        return
      }
    }
    let body = ''
    for await (const chunk of req) body += chunk
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
      if (rooms && rooms.length > 0) {
        for (const room of rooms) {
          notif.to(room).emit(event, payload)
          console.log(`[Notif] Emitted '${event}' to room '${room}'`)
        }
      } else {
        notif.emit(event, payload)
        console.log(`[Notif] Broadcast '${event}' to all clients`)
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

  // ── GET /online-doctors ──────────────────────────────────────────────
  if (method === 'GET' && url === '/online-doctors') {
    const onlineDoctors = Array.from(connectedClients.values())
      .filter((c) => c.role === 'doctor')
      .filter((c, idx, arr) => arr.findIndex((x) => x.userId === c.userId) === idx)
      .map((c) => ({ userId: c.userId, name: c.name, hospitalId: c.hospitalId || null }))
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ onlineDoctors, count: onlineDoctors.length }))
    return
  }

  // ── GET /stats — debugging endpoint ──────────────────────────────────
  if (method === 'GET' && url === '/stats') {
    const byRole: Record<string, number> = {}
    for (const c of connectedClients.values()) byRole[c.role] = (byRole[c.role] || 0) + 1
    const uniqueUsers = new Set(Array.from(connectedClients.values()).map((c) => c.userId)).size
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        totalConnections: connectedClients.size,
        uniqueUsers,
        byRole,
        validEvents: VALID_EVENTS,
      })
    )
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(
    JSON.stringify({
      error: 'Not found. Use POST /emit, GET /online-doctors, GET /stats, GET /health',
    })
  )
})

// ═══════════════════════════════════════════════════════════════════════════
// Referral daily-jobs trigger (idempotent; app endpoint does the work)
// ═══════════════════════════════════════════════════════════════════════════
const CRON_SECRET = process.env.CRON_SECRET || ''
const CRON_URL =
  process.env.CRON_URL || 'http://localhost:3000/api/cron/referral-daily'
let lastCronRun = 0

async function runReferralDailyCron() {
  if (!CRON_SECRET) {
    console.log('[Cron] CRON_SECRET not set — referral daily jobs disabled')
    return
  }
  try {
    const r = await fetch(CRON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-cron-secret': CRON_SECRET },
    })
    const data = (await r.json().catch(() => ({}))) as Record<string, unknown>
    if (r.ok) {
      lastCronRun = Date.now()
      console.log(`[Cron] referral daily jobs OK → ${JSON.stringify(data)}`)
    } else {
      console.log(`[Cron] referral daily jobs failed (${r.status})`)
    }
  } catch (err) {
    console.log('[Cron] referral daily jobs error:', err)
  }
}

setTimeout(() => void runReferralDailyCron(), 45_000)
setInterval(() => {
  if (Date.now() - lastCronRun > 20 * 60 * 60 * 1000) void runReferralDailyCron()
}, 6 * 60 * 60 * 1000)

// ── Boot ───────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`[Realtime] Merged service on port ${PORT}`)
  console.log(`[Realtime] Namespaces: /notif, /chat (path /socket.io/)`)
  console.log(`[Realtime] HTTP: POST /emit | GET /online-doctors | GET /stats | GET /health`)
  console.log(`[Realtime] Strict auth: ${STRICT_AUTH ? 'ON (token required)' : 'OFF (dev fallback active)'}`)
  console.log(`[Realtime] CORS origins: ${ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS.join(', ') : '*'}`)
})

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`[Realtime] ${signal} received, shutting down...`)
  io.close()
  await db.$disconnect().catch(() => {})
  httpServer.close()
  process.exit(0)
}
process.on('SIGTERM', () => void shutdown('SIGTERM'))
process.on('SIGINT', () => void shutdown('SIGINT'))
