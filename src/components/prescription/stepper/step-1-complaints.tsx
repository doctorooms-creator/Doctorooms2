'use client'

import { useEffect, useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Check, AlertCircle, Star, Pin, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { usePrescriptionStore, type ComplaintWithCategory } from '@/lib/prescription-store'
import {
  useRxFavorites,
  type FavoriteComplaint,
} from '@/lib/use-rx-favorites'

type GroupedComplaints = {
  categoryId: string | null
  categoryName: string
  categoryNameEn: string
  items: ComplaintWithCategory[]
}

// Small star toggle — rendered INSIDE pill chips, so it is a span with
// role="button" (a nested <button> inside <button> is invalid HTML).
// stopPropagation keeps the chip's selection click untouched.
function StarToggle({
  isPinned,
  onToggle,
  label,
}: {
  isPinned: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={isPinned ? `Unpin ${label}` : `Pin ${label}`}
      aria-pressed={isPinned}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          e.stopPropagation()
          onToggle()
        }
      }}
      className="inline-flex items-center justify-center h-4 w-4 rounded-full transition-colors"
      title={isPinned ? 'Unpin (hatao)' : 'Pin to top (top me lagao)'}
    >
      <Star
        className={
          'h-3.5 w-3.5 transition-colors ' +
          (isPinned
            ? 'fill-amber-400 text-amber-500'
            : 'text-muted-foreground/50 hover:text-amber-400')
        }
      />
    </span>
  )
}

export function Step1Complaints({ onSaveComplete }: { onSaveComplete: () => void }) {
  const prescriptionId = usePrescriptionStore((s) => s.prescriptionId)
  const selectedComplaintIds = usePrescriptionStore((s) => s.selectedComplaintIds)
  const setSelectedComplaintIds = usePrescriptionStore((s) => s.setSelectedComplaintIds)
  const toggleComplaint = usePrescriptionStore((s) => s.toggleComplaint)
  const isSaving = usePrescriptionStore((s) => s.isSaving)
  const setIsSaving = usePrescriptionStore((s) => s.setIsSaving)
  const markStepCompleted = usePrescriptionStore((s) => s.markStepCompleted)
  const goToNext = usePrescriptionStore((s) => s.goToNext)

  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  // Pinned + most-prescribed quick rows (P3)
  const {
    data: favData,
    pinnedComplaintIds,
    pin,
    unpin,
  } = useRxFavorites()

  const handleTogglePin = (complaint: { id: string; coDetail: string }) => {
    const isPinned = pinnedComplaintIds.has(complaint.id)
    if (isPinned) {
      unpin.mutate({ kind: 'complaint', refId: complaint.id })
      toast.success(`Unpinned "${complaint.coDetail}"`)
    } else {
      pin.mutate({ kind: 'complaint', refId: complaint.id })
      toast.success(`"${complaint.coDetail}" pinned — ab wizard ke top me rahega`)
    }
  }

  // Fetch complaints grouped by category
  const { data, isLoading, isError } = useQuery<{ complaints: ComplaintWithCategory[] }>({
    queryKey: ['rx-complaints'],
    staleTime: 5 * 60 * 1000, // P4-F: master data — warm across the consultation
    queryFn: () =>
      fetch('/api/dashboard/doctor/prescription-settings/complaints?status=Active').then((r) => r.json()),
    placeholderData: keepPreviousData,
  })

  const complaints = data?.complaints || []

  // Group complaints by category
  const grouped = useMemo((): GroupedComplaints[] => {
    const filtered = search.trim()
      ? complaints.filter(
          (c) =>
            c.coDetail.toLowerCase().includes(search.toLowerCase()) ||
            c.coDetailEn.toLowerCase().includes(search.toLowerCase()) ||
            c.coCode.toLowerCase().includes(search.toLowerCase())
        )
      : complaints

    const map = new Map<string, GroupedComplaints>()
    for (const c of filtered) {
      const catId = c.categoryId || '__uncategorized__'
      if (!map.has(catId)) {
        map.set(catId, {
          categoryId: c.categoryId,
          categoryName: c.category?.name || 'Uncategorized',
          categoryNameEn: c.category?.nameEn || '',
          items: [],
        })
      }
      map.get(catId)!.items.push(c)
    }
    return Array.from(map.values())
  }, [complaints, search])

  // Quick rows: pinned (explicit) + most-prescribed (auto, pins filtered out).
  // Only shown when search is empty — searching already filters everything.
  const pinnedList = favData?.favorites.complaints || []
  const mostUsedList = (favData?.mostUsed.complaints || []).filter(
    (c) => !pinnedComplaintIds.has(c.id)
  )
  const showQuickRows = !search.trim() && (pinnedList.length > 0 || mostUsedList.length > 0)

  // P4-F: read the full Rx through the SHARED query cache key — deduped
  // across steps (was: a raw fetch per step mount ≈ 6-7 full-Rx GETs per
  // consultation). Saves invalidate this key, so data stays fresh after edit.
  const { data: rxData } = useQuery<{ prescription: { chiefComplaints?: Array<{ coId: string }> } }>({
    queryKey: ['rx-prescription-data', prescriptionId],
    queryFn: () => fetch(`/api/prescription/${prescriptionId}`).then((r) => r.json()),
    enabled: !!prescriptionId,
  })

  // Fetch existing saved complaints to initialize selection
  useEffect(() => {
    const pco = rxData?.prescription?.chiefComplaints || []
    if (pco.length > 0) {
      setSelectedComplaintIds(pco.map((c) => c.coId))
    }
  }, [rxData, setSelectedComplaintIds])

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/prescription/${prescriptionId}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaintIds: selectedComplaintIds }),
      }).then((r) => {
        // Hard-reject non-2xx so onError fires — no fake success toasts.
        if (!r.ok) throw new Error(`Save failed (HTTP ${r.status})`)
        return r.json()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rx-prescription-data'] })
      markStepCompleted(1)
      toast.success('Complaints saved')
      goToNext()
    },
    onError: () => {
      toast.error('Failed to save complaints')
    },
  })

  const handleSave = () => {
    setIsSaving(true)
    saveMutation.mutate(undefined, {
      onSettled: () => setIsSaving(false),
    })
  }

  const renderQuickChip = (complaint: FavoriteComplaint & { count?: number }) => {
    const isSelected = selectedComplaintIds.includes(complaint.id)
    const isPinned = pinnedComplaintIds.has(complaint.id)
    return (
      <motion.button
        key={`quick-${complaint.id}`}
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => toggleComplaint(complaint.id)}
        className={
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ' +
          (isSelected
            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
            : 'bg-card border-border hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30')
        }
      >
        {isSelected && <Check className="h-3 w-3" />}
        <span>{complaint.coDetail}</span>
        {complaint.count !== undefined && complaint.count > 0 && (
          <span
            className={
              'text-[10px] font-semibold px-1.5 py-0.5 rounded-full ' +
              (isSelected ? 'bg-teal-500/40 text-teal-50' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300')
            }
            title={`Prescribed ${complaint.count} times`}
          >
            ×{complaint.count}
          </span>
        )}
        <StarToggle
          isPinned={isPinned}
          onToggle={() => handleTogglePin(complaint)}
          label={complaint.coDetail}
        />
      </motion.button>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-8 w-48" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 p-6 text-red-500">
        <AlertCircle className="h-5 w-5" />
        <p>Failed to load complaints. Please try again.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search complaints..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {selectedComplaintIds.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">
            {selectedComplaintIds.length} selected
          </Badge>
        </div>
      )}

      {/* ── Quick rows: Pinned + Most prescribed (one tap, no scrolling) ── */}
      {showQuickRows && (
        <div className="space-y-3">
          {pinnedList.length > 0 && (
            <Card className="border-amber-200/70 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20">
              <CardContent className="pt-4 pb-4 space-y-2">
                <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <Pin className="h-3.5 w-3.5" />
                  <span>Pinned — aapke top complaints</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {pinnedList.map(renderQuickChip)}
                </div>
              </CardContent>
            </Card>
          )}
          {mostUsedList.length > 0 && (
            <Card className="border-teal-200/70 dark:border-teal-900/40 bg-teal-50/40 dark:bg-teal-950/20">
              <CardContent className="pt-4 pb-4 space-y-2">
                <h4 className="text-sm font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Most prescribed — aapki history se</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {mostUsedList.map(renderQuickChip)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
        <AnimatePresence mode="popLayout">
          {grouped.map((group) => (
            <motion.div
              key={group.categoryId}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <span>{group.categoryName}</span>
                {group.categoryNameEn && (
                  <span className="font-normal text-xs">({group.categoryNameEn})</span>
                )}
              </h4>
              <div className="flex flex-wrap gap-2">
                {group.items.map((complaint) => {
                  const isSelected = selectedComplaintIds.includes(complaint.id)
                  const isPinned = pinnedComplaintIds.has(complaint.id)
                  return (
                    <motion.button
                      key={complaint.id}
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => toggleComplaint(complaint.id)}
                      className={
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ' +
                        (isSelected
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-card border-border hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30')
                      }
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      <span>{complaint.coDetail}</span>
                      {complaint.coDetailEn && (
                        <span className={
                          isSelected
                            ? 'text-teal-100 text-xs'
                            : 'text-muted-foreground text-xs'
                        }>
                          ({complaint.coDetailEn})
                        </span>
                      )}
                      <StarToggle
                        isPinned={isPinned}
                        onToggle={() => handleTogglePin(complaint)}
                        label={complaint.coDetail}
                      />
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {grouped.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {search ? 'No complaints match your search' : 'No complaints configured. Add them in Prescription Settings.'}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Tip: <Star className="inline h-3 w-3 text-amber-400 fill-amber-400" /> tap the star on any complaint to pin it — pinned complaints appear at the top for one-tap selection.
      </p>

      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={handleSave}
          disabled={isSaving || saveMutation.isPending}
          className="bg-teal-600 hover:bg-teal-700"
        >
          {isSaving || saveMutation.isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </span>
          ) : (
            <>Save & Continue</>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
