'use client'

/**
 * Live slot grid for the reception walk-in page (CTO Plan Phase 2, item 2c).
 *
 * Renders the day's slot inventory (GET /api/slots?doctorId=&date= — see
 * src/lib/slot-inventory.ts, the single source of truth) as a wrapping chip
 * grid instead of a blind dropdown: free slots are selectable, taken slots
 * show who booked them, past slots are struck through. An extra
 * "No slot — queue tail" chip lets reception skip the grid entirely (the
 * POST then stores an empty timeSlot — the patient joins the tail in token order).
 */

import { AlertCircle, Clock, RefreshCw, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ============ Types (mirrors the GET /api/slots JSON contract) ============

export interface SlotChip {
  time: string
  status: 'free' | 'taken' | 'past'
  bookingRef?: string
  patientName?: string
}

export interface SlotInventory {
  doctorId: string
  date: string
  dayName: string
  available: boolean
  reason?: string
  isHoliday: boolean
  hasSchedule: boolean
  startTime: string
  endTime: string
  slotDuration: number
  usesManualSlots: boolean
  slots: SlotChip[]
  opdCount: number
  opdLimit: number
  nextFreeSlot: string | null
}

interface SlotGridProps {
  inventory: SlotInventory | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  selectedTime: string
  /** Select a slot time, or '' to join the queue tail without a slot */
  onSelect: (time: string) => void
  /** true while the current selection came from the "next free slot" auto-pick */
  autoHint: boolean
  disabled?: boolean
  /** Label text of the queue-tail chip (default "No slot — queue tail") */
  queueTailLabel?: string
  /** Tooltip of the queue-tail chip */
  queueTailTitle?: string
  /** Hide the queue-tail chip entirely (default false) */
  queueTailHidden?: boolean
}

// ============ Component ============

export function SlotGrid({
  inventory,
  isLoading,
  isError,
  onRetry,
  selectedTime,
  onSelect,
  autoHint,
  disabled = false,
  queueTailLabel = 'No slot — queue tail',
  queueTailTitle = 'Add to the queue without a fixed slot — the patient joins the tail in token order',
  queueTailHidden = false,
}: SlotGridProps) {
  // OPD limit reached → the POST handler rejects any new booking, so every
  // chip (including queue tail) is disabled and a rose banner explains why.
  const limitReached =
    !!inventory && inventory.hasSchedule && !inventory.available

  // Queue-tail chip — always the last option. Selecting it sends timeSlot: ''
  // so the backend stamps the booking with the current IST time. Label/tooltip
  // are overridable per surface (e.g. patient booking uses a friendlier copy);
  // queueTailHidden removes the chip entirely for surfaces without a queue.
  const queueTailChip = queueTailHidden ? null : (
    <button
      type="button"
      aria-pressed={selectedTime === ''}
      disabled={disabled || limitReached}
      onClick={() => onSelect('')}
      title={queueTailTitle}
      className={cn(
        'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
        selectedTime === ''
          ? 'border-slate-700 bg-slate-700 text-white dark:border-slate-500 dark:bg-slate-600 dark:text-white'
          : 'border-slate-300 bg-transparent text-slate-600 hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:bg-slate-900/40'
      )}
    >
      {queueTailLabel}
    </button>
  )

  // ── Loading: pulse chip row ──
  if (isLoading) {
    return (
      <div
        className="space-y-2"
        aria-busy="true"
        aria-label="Loading slot availability"
      >
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 w-14 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
        <div className="h-3 w-44 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  // ── API error: retry card ──
  if (isError) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-900/60 dark:bg-rose-950/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-rose-700 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Could not load slot availability</span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="h-7 gap-1 border-rose-300 px-2 text-xs text-rose-700 hover:bg-rose-100 hover:text-rose-800 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // ── No inventory yet (query disabled / doctor not resolvable) ──
  if (!inventory) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Slot availability unavailable — you can still register to the queue
          tail.
        </p>
        <div className="flex flex-wrap gap-1.5">{queueTailChip}</div>
      </div>
    )
  }

  // ── Holiday: booking is rejected by the backend — no chips ──
  if (inventory.isHoliday) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-medium">
            Doctor is on holiday today ({inventory.dayName})
          </p>
          {inventory.reason && <p className="mt-0.5">{inventory.reason}</p>}
        </div>
      </div>
    )
  }

  // ── No schedule today: queue tail still usable ──
  if (!inventory.hasSchedule) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            No schedule found for today ({inventory.dayName}) — walk-ins join
            the queue tail.
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">{queueTailChip}</div>
      </div>
    )
  }

  // ── Normal grid ──
  return (
    <div className="space-y-2">
      {/* OPD limit banner (limit reached — POST rejects new bookings) */}
      {limitReached && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {inventory.reason || 'OPD limit reached for today'}
        </div>
      )}

      {/* Schedule meta */}
      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Clock className="h-3 w-3 shrink-0" />
        Dr. schedule {inventory.startTime}–{inventory.endTime} ·{' '}
        {inventory.slotDuration}min slots
      </p>

      {/* Chip grid (wraps safely at 375px) */}
      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label="Time slots"
      >
        {inventory.slots.map((slot) => {
          const isSelected = slot.time === selectedTime
          const isTaken = slot.status === 'taken'
          const isPast = slot.status === 'past'

          return (
            <button
              key={slot.time}
              type="button"
              aria-pressed={isSelected}
              disabled={disabled || isTaken || isPast || limitReached}
              title={
                isTaken
                  ? `Booked: ${slot.patientName || 'patient'}`
                  : isPast
                    ? 'Past slot'
                    : undefined
              }
              onClick={() => onSelect(slot.time)}
              className={cn(
                'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                isSelected && !isTaken && !isPast
                  ? // selected free slot: solid emerald + ring
                    'border-emerald-600 bg-emerald-600 text-white ring-2 ring-emerald-500/30 hover:bg-emerald-700 dark:border-emerald-500 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600'
                  : isTaken
                    ? // taken: rose, disabled
                      'cursor-not-allowed border-rose-200 bg-rose-100 text-rose-500/70 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400/70'
                    : isPast
                      ? // past: muted, disabled, struck through
                        'cursor-not-allowed border-border bg-muted text-muted-foreground line-through'
                      : // free slot: emerald outline
                        'border-emerald-300 bg-transparent text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/40'
              )}
            >
              {slot.time}
            </button>
          )
        })}
        {queueTailChip}
      </div>

      {/* Legend + OPD meta */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span
            className="h-2 w-2 rounded-full bg-emerald-500"
            aria-hidden="true"
          />
          Free
        </span>
        <span className="flex items-center gap-1">
          <span
            className="h-2 w-2 rounded-full bg-rose-500"
            aria-hidden="true"
          />
          Booked
        </span>
        <span className="flex items-center gap-1">
          <span
            className="h-2 w-2 rounded-full bg-muted-foreground/40"
            aria-hidden="true"
          />
          Past
        </span>
        {autoHint && selectedTime !== '' && (
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
            <Zap className="h-3 w-3" aria-hidden="true" />
            Auto: next free slot
          </span>
        )}
        <span className="ml-auto font-medium">
          OPD {inventory.opdCount}/{inventory.opdLimit}
        </span>
      </div>
    </div>
  )
}
