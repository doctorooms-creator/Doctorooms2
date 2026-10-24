'use client'

/**
 * Data hook for the OPD Cockpit — ONE query, ONE truth.
 * 15s poll (matches today's doctor-queue cadence; socket push is a
 * progressive enhancement when realtime :3006 is up, never a dependency).
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { OpdCockpitData } from './types'

export const OPD_QUERY_KEY = ['opd-cockpit'] as const
const POLL_MS = 15_000

export function useOpdData() {
  return useQuery<OpdCockpitData>({
    queryKey: OPD_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch('/api/opd/cockpit')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Cockpit unavailable (HTTP ${res.status})`)
      }
      return res.json() as Promise<OpdCockpitData>
    },
    staleTime: 10_000,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
    retry: 1,
  })
}

/** Invalidate the cockpit after any local action (call/pause/no-show/…). */
export function useInvalidateOpd() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: OPD_QUERY_KEY })
}

/** Optional realtime nudge — silently degrades to polling on Vercel prod. */
export function useOpdRealtimeNudge() {
  const qc = useQueryClient()
  useEffect(() => {
    let socket: { disconnect: () => void } | null = null
    let disposed = false

    async function connect() {
      try {
        const { io } = await import('socket.io-client')
        if (disposed) return
        socket = io('/?XTransformPort=3006', { transports: ['websocket'], reconnectionAttempts: 2, timeout: 4000 })
        socket.on('queue:update', () => qc.invalidateQueries({ queryKey: OPD_QUERY_KEY }))
        socket.on('notification:new', () => qc.invalidateQueries({ queryKey: OPD_QUERY_KEY }))
      } catch {
        /* polling carries us */
      }
    }
    connect()
    return () => {
      disposed = true
      socket?.disconnect()
    }
  }, [qc])
}
