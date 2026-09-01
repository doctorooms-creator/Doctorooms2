'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSocket } from '@/hooks/useSocket'
import { useAuthStore } from '@/lib/auth-store'
import { useEffect } from 'react'

interface SidebarBadgeProps {
  /** TanStack Query cache key for the count fetch. */
  queryKey: string[]
  /** URL that returns the count source (e.g. `/api/external-test-orders?status=Ordered`). */
  fetchUrl: string
  /** Socket events that should trigger a refetch (e.g. `['external-test-ordered']`). */
  eventTriggers: string[]
  /**
   * Extracts a count from the API response. Defaults to `(d) => d.count ?? 0`.
   * Override for endpoints that return arrays (e.g. `(d) => d.orders?.length ?? 0`).
   */
  countFn?: (data: unknown) => number
  /** Auth roles that should see this badge. If omitted, badge is visible to all authed users. */
  roles?: string[]
}

const defaultCountFn = (data: unknown): number => {
  if (data && typeof data === 'object' && 'count' in data) {
    const c = (data as { count: unknown }).count
    return typeof c === 'number' ? c : 0
  }
  return 0
}

/**
 * Small rose-coloured count badge rendered inside sidebar items.
 *
 * - Fetches the count via `useQuery` with a 60-second polling fallback.
 * - Subscribes to the listed socket events and invalidates the query on
 *   arrival so the badge updates in real time.
 * - Returns `null` when the count is 0.
 *
 * Multiple SidebarBadge instances on the same page share the singleton
 * socket from `useSocket` (one connection per tab, not one per badge).
 */
export function SidebarBadge({
  queryKey,
  fetchUrl,
  eventTriggers,
  countFn = defaultCountFn,
  roles,
}: SidebarBadgeProps) {
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const enabled = !!user && (!roles || roles.includes(user.role))

  const { data } = useQuery<number>({
    queryKey,
    queryFn: async () => {
      const r = await fetch(fetchUrl)
      if (!r.ok) return 0
      try {
        const json = await r.json()
        return countFn(json)
      } catch {
        return 0
      }
    },
    refetchInterval: 60000,
    enabled,
    staleTime: 30 * 1000,
  })

  // Share the global socket — never creates its own connection.
  const socket = useSocket({
    userId: user?.id,
    role: user?.role,
    name: user?.name,
    enabled,
  })

  useEffect(() => {
    if (!socket || !enabled) return
    const handler = () => qc.invalidateQueries({ queryKey })
    for (const evt of eventTriggers) {
      socket.on(evt, handler)
    }
    return () => {
      for (const evt of eventTriggers) {
        socket.off(evt, handler)
      }
    }
  }, [socket, qc, queryKey, eventTriggers, enabled])

  if (!enabled) return null

  const count = data ?? 0
  if (count <= 0) return null
  return (
    <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
      {count > 99 ? '99+' : count}
    </span>
  )
}
