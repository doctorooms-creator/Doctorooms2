/**
 * E2E realtime verification against PRODUCTION:
 *   1. Login on https://doctorooms-hms.vercel.app (NextAuth credentials flow)
 *   2. GET /api/auth/socket-token with the session cookie
 *   3. Connect socket.io client to https://doctorooms-realtime.onrender.com/notif
 *      using the app-issued token (strict auth must accept it)
 *   4. Server-side emit via POST /emit with REALTIME_EMIT_SECRET → client must receive it
 *
 * Usage: bun scripts/e2e-socket.ts [email] [password]
 * Needs REALTIME_EMIT_SECRET in env (loaded from .env when run via bun).
 */
import { io } from 'socket.io-client'

const APP = process.env.APP_URL || 'https://doctorooms-hms.vercel.app'
const RT = process.env.RT_URL || 'https://doctorooms-realtime.onrender.com'
const EMIT_SECRET = process.env.REALTIME_EMIT_SECRET || ''
const email = process.argv[2] || 'admin@doctorooms.com'
const password = process.argv[3] || 'admin123'

function fail(msg: string): never {
  console.log('FAIL:', msg)
  process.exit(1)
}

// ── 1. Login (app's custom /api/auth/login — sets doctorooms_session JWT cookie) ──
const loginRes = await fetch(`${APP}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})
const loginBody = (await loginRes.json().catch(() => ({}))) as { success?: boolean; message?: string }
if (!loginRes.ok || !loginBody.success) fail(`login failed (${loginRes.status}): ${loginBody.message ?? 'unknown'}`)
const sessionCookie = (loginRes.headers.get('set-cookie') || '')
  .split(/,(?=[^;]+=)/)
  .map((c) => c.split(';')[0])
  .filter((c) => c.startsWith('doctorooms_'))
  .join('; ')
if (!sessionCookie) fail('login ok but no doctorooms_* cookies received')
console.log('2. login ok (doctorooms_session cookie received)')

// ── 2. Socket token ──
const tokenRes = await fetch(`${APP}/api/auth/socket-token`, {
  headers: { Cookie: sessionCookie },
})
if (!tokenRes.ok) fail(`socket-token fetch failed: ${tokenRes.status}`)
const { socketToken } = (await tokenRes.json()) as { socketToken: string }
console.log('3. socket-token minted by PRODUCTION app ok')

// ── 3. Connect to Render realtime with strict auth ──
const socket = io(`${RT}/notif`, {
  auth: { socketToken },
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  reconnection: false,
  timeout: 15000,
})

const connected = await new Promise<boolean>((resolve) => {
  socket.on('connect', () => resolve(true))
  socket.on('connect_error', (err: Error) => {
    console.log('   connect_error:', err.message)
    resolve(false)
  })
})
if (!connected) fail('could not connect to Render socket with app-issued token')
console.log('4. Render socket CONNECTED with app-issued token (strict auth passed)')

// ── 4. Round-trip: server emit → client receive ──
const gotEvent = await new Promise<boolean>((resolve) => {
  const t = setTimeout(() => resolve(false), 10000)
  socket.on('queue-updated', (p: Record<string, unknown>) => {
    console.log('   received queue-updated payload:', JSON.stringify(p).slice(0, 120))
    clearTimeout(t)
    resolve(true)
  })
  // emit via authenticated HTTP endpoint
  fetch(`${RT}/emit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-emit-secret': EMIT_SECRET },
    body: JSON.stringify({
      event: 'queue-updated',
      rooms: ['role:admin'],
      payload: { message: 'E2E test event', timestamp: new Date().toISOString() },
    }),
  }).catch(() => {})
})
if (!gotEvent) fail('event did not round-trip in 10s')
console.log('5. EVENT ROUND-TRIP ok (server → Render → client)')

socket.disconnect()
console.log('\nALL E2E CHECKS PASSED ✅')
process.exit(0)
