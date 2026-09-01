'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/lib/auth-store'

interface UseSocketOptions {
  userId?: string
  role?: string
  name?: string
  hospitalId?: string
  enabled?: boolean
}

// ─── Module-level singleton ────────────────────────────────────────────────
//
// Multiple components on the same page (RealtimeNotification + many
// SidebarBadge instances + OnlineDoctorDot + prescription wizard) all want
// to subscribe to socket events. Creating one socket.io connection per
// component would (a) inflate the server's per-user connection count,
// triggering spurious doctor-online / doctor-offline broadcasts, and
// (b) waste resources. Instead, we share ONE connection per browser tab.
//
// Reference counting + a short disconnect debounce lets the socket live
// across route transitions (which briefly drop old components before the
// new ones mount) without churning the connection.

let globalSocket: Socket | null = null
let globalConfig: { userId: string; role: string; name?: string; hospitalId?: string } | null = null
let refCount = 0
let disconnectTimer: ReturnType<typeof setTimeout> | null = null
const listeners = new Set<(s: Socket | null) => void>()

function notifyListeners() {
  for (const l of listeners) l(globalSocket)
}

function clearDisconnectTimer() {
  if (disconnectTimer) {
    clearTimeout(disconnectTimer)
    disconnectTimer = null
  }
}

function teardownGlobalSocket() {
  if (!globalSocket) return
  try {
    globalSocket.disconnect()
  } catch {
    // ignore
  }
  globalSocket = null
  globalConfig = null
  notifyListeners()
}

function ensureGlobalSocket(opts: {
  userId: string
  role: string
  name?: string
  hospitalId?: string
}) {
  clearDisconnectTimer()
  // If the user identity changed (e.g. dev-login as a different role),
  // tear down the existing socket so the new auth handshake happens.
  if (
    globalSocket &&
    globalConfig &&
    (globalConfig.userId !== opts.userId || globalConfig.role !== opts.role)
  ) {
    teardownGlobalSocket()
  }
  if (!globalSocket) {
    const socket = io('/?XTransformPort=3005', {
      auth: { userId: opts.userId, role: opts.role, name: opts.name, hospitalId: opts.hospitalId },
      // Must match the server's path config (`/socket.io/`). This is also
      // the socket.io-client default, but explicit here for clarity.
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    })

    if (typeof console !== 'undefined') {
      socket.on('connect', () => console.log('[useSocket] Connected'))
      socket.on('disconnect', () => console.log('[useSocket] Disconnected'))
      socket.on('connect_error', (err: Error) =>
        console.warn('[useSocket] Connection error:', err.message)
      )
    }

    globalSocket = socket
    globalConfig = {
      userId: opts.userId,
      role: opts.role,
      name: opts.name,
      hospitalId: opts.hospitalId,
    }
    notifyListeners()
  }
  refCount += 1
}

function releaseGlobalSocket() {
  refCount = Math.max(0, refCount - 1)
  if (refCount === 0 && globalSocket) {
    // Debounce disconnect so route transitions (which briefly drop a
    // component before remounting) don't churn the connection.
    clearDisconnectTimer()
    disconnectTimer = setTimeout(() => {
      if (refCount === 0) teardownGlobalSocket()
    }, 800)
  }
}

/**
 * Subscribe to the global socket. Returns the shared Socket instance, or
 * `null` while not connected. Multiple callers in the same tab share one
 * underlying connection (see module-level singleton notes above).
 */
export function useSocket(options: UseSocketOptions = {}): Socket | null {
  const { userId, role, name, hospitalId, enabled = true } = options
  const [socket, setSocket] = useState<Socket | null>(globalSocket)

  useEffect(() => {
    if (!enabled || !userId || !role) {
      setSocket(null)
      return
    }

    ensureGlobalSocket({ userId, role, name, hospitalId })
    setSocket(globalSocket)

    const listener = (s: Socket | null) => setSocket(s)
    listeners.add(listener)

    return () => {
      listeners.delete(listener)
      releaseGlobalSocket()
    }
    // We intentionally exclude name/hospitalId from deps — they don't
    // require a new connection (only userId + role do, handled inside
    // ensureGlobalSocket). Including them would cause unnecessary
    // subscribe/unsubscribe churn on every render.
  }, [userId, role, enabled])

  return socket
}

/** Hook that auto-resolves auth from Zustand store (works with httpOnly cookies) */
export function useAuthSocket() {
  const user = useAuthStore((s) => s.user)

  return useSocket({
    userId: user?.id ?? '',
    role: user?.role ?? '',
    name: user?.name ?? '',
    enabled: !!user?.id,
  })
}
