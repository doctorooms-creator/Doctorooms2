'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// RX wizard favorites (P3): shared hook powering the "Pinned" + "Most
// prescribed" quick rows in steps 1 (complaints) and 4 (medicines).

export interface FavoriteComplaint {
  id: string
  coDetail: string
  coDetailEn: string
  coCode: string
  categoryId: string | null
  category: { id: string; name: string; nameEn: string } | null
}

export interface FavoriteMedicine {
  id: string
  name: string
  doseArray: string[]
  morning: number
  afternoon: number
  evening: number
  tab: number
  description: string
}

export interface RxFavoritesData {
  favorites: {
    complaints: FavoriteComplaint[]
    medicines: FavoriteMedicine[]
  }
  mostUsed: {
    complaints: (FavoriteComplaint & { count: number })[]
    medicines: (FavoriteMedicine & { count: number })[]
  }
}

export type FavoriteKind = 'complaint' | 'medicine'

async function fetchFavorites(): Promise<RxFavoritesData> {
  const r = await fetch('/api/dashboard/doctor/rx-favorites')
  if (!r.ok) throw new Error(`Failed to load favorites (HTTP ${r.status})`)
  return r.json()
}

export function useRxFavorites() {
  const queryClient = useQueryClient()

  const query = useQuery<RxFavoritesData>({
    queryKey: ['rx-favorites'],
    queryFn: fetchFavorites,
    // P4-F: was 30s — favorites fired on BOTH step 1 and step 4 (and the
    // endpoint is the slowest in prod at ~10 sequential queries). 2 minutes
    // keeps it warm across the whole consultation; pin/unpin mutations
    // invalidate immediately so edits stay instant.
    staleTime: 2 * 60_000,
  })

  const pin = useMutation({
    mutationFn: ({ kind, refId }: { kind: FavoriteKind; refId: string }) =>
      fetch('/api/dashboard/doctor/rx-favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, refId }),
      }).then((r) => {
        if (!r.ok) throw new Error(`Pin failed (HTTP ${r.status})`)
        return r.json()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rx-favorites'] })
    },
  })

  const unpin = useMutation({
    mutationFn: ({ kind, refId }: { kind: FavoriteKind; refId: string }) =>
      fetch(
        `/api/dashboard/doctor/rx-favorites?kind=${encodeURIComponent(kind)}&refId=${encodeURIComponent(refId)}`,
        { method: 'DELETE' }
      ).then((r) => {
        if (!r.ok) throw new Error(`Unpin failed (HTTP ${r.status})`)
        return r.json()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rx-favorites'] })
    },
  })

  const pinnedComplaintIds = new Set(
    query.data?.favorites.complaints.map((c) => c.id) || []
  )
  const pinnedMedicineIds = new Set(query.data?.favorites.medicines.map((m) => m.id) || [])

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    pinnedComplaintIds,
    pinnedMedicineIds,
    pin,
    unpin,
  }
}

export function togglePin(
  kind: FavoriteKind,
  refId: string,
  isPinned: boolean,
  pin: { mutate: (v: { kind: FavoriteKind; refId: string }) => void },
  unpin: { mutate: (v: { kind: FavoriteKind; refId: string }) => void }
) {
  if (isPinned) {
    unpin.mutate({ kind, refId })
  } else {
    pin.mutate({ kind, refId })
  }
}
