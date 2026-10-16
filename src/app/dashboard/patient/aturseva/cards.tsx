'use client'

/**
 * Aturseva — Phase 2 action-card renderers, shared by the two chat surfaces:
 *   · the FULL-PAGE window  (src/app/dashboard/patient/aturseva/client.tsx)
 *   · the floating FAB sheet (src/app/dashboard/patient/sevika/chat.tsx —
 *     renders compact local variants but reuses useConfirmBooking + the
 *     look-ahead helper from here)
 *
 * Card types covered (backend tool names; hyphenated aliases are normalized
 * by the host surfaces before dispatch):
 *   get_doctor_slots    → SlotsCardBody          (slot chips + other-day chips)
 *   find_nearby_doctors → NearbyDoctorsCardBody  (doctor grid + 📍 distance badges)
 *   prepare_booking     → PrepareBookingCardBody (THE confirm card — the only
 *                         place where the patient's tap moves money/appointments)
 *   booking_created     → BookingCreatedCardBody (emerald success card)
 *
 * Safety rail: the agent NEVER writes bookings. The write happens exclusively
 * in useConfirmBooking() → POST /api/dashboard/patient/aturseva/book, fired by
 * the patient pressing "Confirm & Book" on a prepare_booking card.
 */

import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  HeartPulse,
  Loader2,
  MapPin,
  Stethoscope,
  TrendingUp,
  Video,
  X,
  XCircle,
  Zap,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getAvatarDisplayUrl } from '@/lib/avatar-url'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────

/**
 * Minimal message shape both chat surfaces can provide.
 * Used for the booked-state LOOK-AHEAD (see findLaterBookingCreated).
 */
export interface LookaheadMessage {
  id: string
  role: string
  action?: { type?: string; kind?: string; data?: Record<string, unknown> } | null
}

/** Context handed to every card renderer by the host surface. */
export interface CardRenderCtx {
  /** Ask the host to send a chat message (slot chips / other-day chips). */
  onSend?: (text: string) => void
  /** The live message list — used for booked-state look-ahead. */
  messages: LookaheadMessage[]
  /** Index of THIS card's message inside `messages`. */
  messageIndex: number
}

export interface ConfirmBookingPayload {
  doctorId: string
  date: string
  timeSlot: string
  mode: 'InPerson' | 'VideoCall'
  disease: string
}

// ─── Small shared helpers ───────────────────────────────────────────────────

export function formatMoney(v: unknown): string {
  const n = Number(v)
  return `₹${Number.isFinite(n) ? n.toLocaleString('en-IN') : 0}`
}

export function modeLabel(mode: unknown): string {
  return mode === 'VideoCall' ? 'Video call' : 'Clinic visit'
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

// ─── useConfirmBooking (shared Confirm-button POST) ─────────────────────────

/**
 * The confirm POST, extracted so the full window AND the FAB sheet reuse the
 * exact same rail. On 201: success toast + ['aturseva-chat'] refetch (the
 * booking_created card + reply were persisted server-side) + ['aturseva-unread']
 * reset. On 400/409 (slot gone / conflict): error toast, card stays active so
 * the patient can retry with another slot.
 */
export function useConfirmBooking() {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState(false)

  const confirm = useCallback(
    async (payload: ConfirmBookingPayload): Promise<boolean> => {
      setPending(true)
      try {
        const res = await fetch('/api/dashboard/patient/aturseva/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = (await res.json().catch(() => ({}))) as {
          success?: boolean
          error?: string
        }
        if (res.ok && (res.status === 201 || json.success)) {
          toast.success('Booking ho gayi! Approve ka intezaar karein')
          void queryClient.invalidateQueries({ queryKey: ['aturseva-chat'] })
          void queryClient.invalidateQueries({ queryKey: ['aturseva-unread'] })
          return true
        }
        toast.error(json.error || 'Booking banane me dikkat aayi — dobara try karein')
        return false
      } catch {
        toast.error('Booking banane me dikkat aayi — dobara try karein')
        return false
      } finally {
        setPending(false)
      }
    },
    [queryClient]
  )

  return { confirm, pending }
}

// ─── Look-ahead: was this confirm card actually booked later? ───────────────

/**
 * Scan the message list AFTER `fromIndex` for a `booking_created` card whose
 * doctor+date+timeSlot matches the given prepare_booking data. Used when
 * rendering history: an old prepare_booking card renders as a disabled
 * "Booked ✓" success state instead of live buttons. Works identically on the
 * live surface right after the refetch that follows a confirmed booking.
 */
export function findLaterBookingCreated(
  messages: readonly LookaheadMessage[],
  fromIndex: number,
  prepare: { doctorId?: string; doctor?: string; date?: string; timeSlot?: string }
): Record<string, unknown> | null {
  for (let i = fromIndex + 1; i < messages.length; i++) {
    const m = messages[i]
    if (!m || m.role !== 'action' || !m.action) continue
    const a = m.action
    // Live SSE/history rows carry the tool name; client.tsx normalizes to kind.
    const isCreated =
      a.type === 'booking_created' || a.type === 'booking-created' || a.kind === 'created'
    if (!isCreated) continue
    const d = a.data && typeof a.data === 'object' ? a.data : {}
    if (isBookingCreatedMatch(d, prepare)) return d
  }
  return null
}

function isBookingCreatedMatch(
  created: Record<string, unknown>,
  prepare: { doctorId?: string; doctor?: string; date?: string; timeSlot?: string }
): boolean {
  const date = str(created.date)
  const slot = str(created.timeSlot)
  if (!date || !slot || !prepare.date || !prepare.timeSlot) return false
  if (date !== prepare.date || slot !== prepare.timeSlot) return false
  // booking_created rows carry the doctor NAME (not id) — match on whichever
  // identifier pair is available; date+slot already make this near-exact.
  const createdName = str(created.doctor)
  const prepareName = str(prepare.doctor)
  if (createdName && prepareName) return createdName === prepareName
  const createdId = str(created.doctorId)
  const prepareId = str(prepare.doctorId)
  if (createdId && prepareId) return createdId === prepareId
  return true
}

// ─── 1) get_doctor_slots ────────────────────────────────────────────────────

interface SlotEntry {
  time: string
  status?: string
}

interface OtherDay {
  date?: string
  label?: string
  freeCount?: number
}

export function SlotsCardBody({
  data,
  ctx,
}: {
  data: Record<string, unknown>
  ctx?: CardRenderCtx
}) {
  const doctor = str(data.doctor)
  const specialization = str(data.specialization)
  const city = str(data.city)
  const dateLabel = str(data.dateLabel) || str(data.date)
  const slots = arr<SlotEntry>(data.slots)
  const otherDays = arr<OtherDay>(data.otherDays)
  const freeCount = Number(data.freeCount) || 0

  if (slots.length === 0) {
    const note =
      str(data.note) || 'Is din ke free slots khatam ho gaye hain — doosri date try karein.'
    return (
      <p className="rounded-xl border bg-background px-3 py-2.5 text-xs text-muted-foreground">
        {note}
      </p>
    )
  }

  return (
    <div className="rounded-xl border bg-background p-3">
      {/* header: doctor + specialization + fees */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">{doctor}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {specialization}
            {city ? ` · ${city}` : ''}
          </p>
        </div>
        <p className="shrink-0 text-sm font-bold text-teal-700 dark:text-teal-400">
          {formatMoney(data.fees)}
        </p>
      </div>

      {/* sub-header: date */}
      <p className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300">
        <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="truncate">{dateLabel}</span>
        {freeCount > 0 && (
          <span className="ml-auto shrink-0 text-[10px] font-medium text-muted-foreground">
            {freeCount} free
          </span>
        )}
      </p>

      {/* slot chips — tap = send the pick back through the agent */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {slots.map((s) => {
          const label = str(s.time)
          if (!label) return null
          const free = s.status !== 'taken' && s.status !== 'past'
          if (!free) {
            return (
              <span
                key={label}
                aria-label={`${label} slot book ho chuka hai`}
                className="inline-flex min-h-[36px] items-center rounded-full border border-border bg-muted/60 px-3 text-xs font-medium text-muted-foreground line-through"
              >
                {label}
              </span>
            )
          }
          return (
            <button
              key={label}
              type="button"
              onClick={() => ctx?.onSend?.(`${dateLabel} ko ${label} ka slot final karo`)}
              aria-label={`${dateLabel} ko ${label} baje ka slot chunein`}
              className="inline-flex min-h-[36px] items-center rounded-full border border-teal-300 bg-teal-50/60 px-3 text-xs font-semibold text-teal-700 transition-colors hover:border-teal-600 hover:bg-teal-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-400 dark:hover:bg-teal-600 dark:hover:text-white"
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* other bookable days — small secondary chips */}
      {otherDays.length > 0 && (
        <div className="mt-2.5 border-t pt-2.5 dark:border-teal-900/60">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Doosri dates
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {otherDays.map((d, i) => {
              const label = str(d.label) || str(d.date)
              if (!label) return null
              return (
                <button
                  key={`${label}-${i}`}
                  type="button"
                  onClick={() => ctx?.onSend?.(`${label} ke slots dikhao`)}
                  aria-label={`${label} ke free slots dekhein`}
                  className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-border bg-background px-3 text-[11px] font-medium text-muted-foreground transition-colors hover:border-teal-400 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:hover:border-teal-700 dark:hover:text-teal-400"
                >
                  <span className="truncate">{label}</span>
                  {Number(d.freeCount) > 0 && (
                    <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400">
                      {Number(d.freeCount)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 2) find_nearby_doctors ─────────────────────────────────────────────────

interface NearbyDoc {
  id: string
  name: string
  specialization?: string
  city?: string
  state?: string
  fees?: number | string
  experience?: string
  profileImg?: string | null
  distanceKm?: number
}

export function NearbyDoctorsCardBody({
  data,
}: {
  data: Record<string, unknown>
  ctx?: CardRenderCtx
}) {
  const doctors = arr<NearbyDoc>(data.doctors)

  if (doctors.length === 0) {
    const note =
      str(data.note) || 'Aapke paas koi doctor nahi mila — city ya specialization se search karein.'
    return (
      <p className="rounded-xl border bg-background px-3 py-2.5 text-xs text-muted-foreground">
        {note}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {doctors.slice(0, 6).map((d) => (
        <div
          key={d.id}
          className="flex h-full flex-col rounded-xl border bg-background p-3 transition-colors hover:border-teal-400/70 hover:shadow-sm dark:hover:border-teal-700"
        >
          <div className="flex items-start gap-2.5">
            <Avatar className="h-10 w-10 shrink-0 border bg-muted/40">
              <AvatarImage src={getAvatarDisplayUrl(d.profileImg)} alt={d.name} />
              <AvatarFallback className="rounded-lg bg-teal-50 dark:bg-teal-950/40">
                <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">{d.name}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {d.specialization}
                {d.city ? ` · ${d.city}` : ''}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {typeof d.distanceKm === 'number' && Number.isFinite(d.distanceKm) && (
                  <Badge
                    variant="outline"
                    className="border-teal-300 bg-teal-50 text-[10px] font-medium text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-400"
                  >
                    📍 {d.distanceKm} km
                  </Badge>
                )}
                {d.experience && (
                  <span className="truncate text-[11px] text-muted-foreground/80">
                    {d.experience}
                  </span>
                )}
              </div>
            </div>
            <p className="shrink-0 text-sm font-bold text-teal-700 dark:text-teal-400">
              {formatMoney(d.fees)}
            </p>
          </div>
          <Button
            asChild
            size="sm"
            className="mt-2.5 h-11 w-full rounded-lg bg-teal-600 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 sm:h-10"
          >
            <Link href={`/dashboard/patient/book/${d.id}`} aria-label={`${d.name} ko book karein`}>
              Book Appointment
              <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
            </Link>
          </Button>
        </div>
      ))}
    </div>
  )
}

// ─── 3) prepare_booking — THE CONFIRM CARD ──────────────────────────────────

export function PrepareBookingCardBody({
  data,
  ctx,
}: {
  data: Record<string, unknown>
  ctx?: CardRenderCtx
}) {
  const { confirm, pending } = useConfirmBooking()
  const [confirmed, setConfirmed] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const doctorId = str(data.doctorId)
  const doctor = str(data.doctor)
  const specialization = str(data.specialization)
  const date = str(data.date)
  const dateLabel = str(data.dateLabel) || date
  const timeSlot = str(data.timeSlot)
  const mode = data.mode === 'VideoCall' ? ('VideoCall' as const) : ('InPerson' as const)
  const disease = str(data.disease)

  // Look-ahead: a later booking_created row for the same doctor+date+slot
  // (history rendering, and live right after the post-confirm refetch).
  const booked =
    !!ctx &&
    findLaterBookingCreated(ctx.messages, ctx.messageIndex, { doctorId, doctor, date, timeSlot }) !==
      null
  const isBooked = booked || confirmed

  const handleConfirm = async () => {
    const ok = await confirm({ doctorId, date, timeSlot, mode, disease })
    if (ok) setConfirmed(true) // optimistic until the refetch replaces the card
  }

  return (
    <div className={cn('rounded-xl border bg-background p-3', !isBooked && dismissed && 'opacity-60')}>
      {/* doctor + fees */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">{doctor}</p>
          {specialization && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{specialization}</p>
          )}
        </div>
        <p className="shrink-0 text-sm font-bold text-teal-700 dark:text-teal-400">
          {formatMoney(data.fees)}
        </p>
      </div>

      {/* date · time · mode */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="flex min-w-0 items-center gap-1">
          <CalendarDays className="h-3 w-3 shrink-0" aria-hidden />
          <span className="truncate">{dateLabel}</span>
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3 shrink-0" aria-hidden />
          {timeSlot}
        </span>
        <span className="flex items-center gap-1">
          {mode === 'VideoCall' ? (
            <Video className="h-3 w-3 shrink-0" aria-hidden />
          ) : (
            <MapPin className="h-3 w-3 shrink-0" aria-hidden />
          )}
          {modeLabel(mode)}
        </span>
      </div>

      {disease && (
        <p className="mt-1.5 truncate text-xs text-muted-foreground">Reason: {disease}</p>
      )}

      {/* footer: confirm / dismissed / booked */}
      <div className="mt-3">
        {isBooked ? (
          <p
            role="status"
            className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
            Booked ✓
          </p>
        ) : dismissed ? (
          <p
            role="status"
            className="flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-2.5 text-xs text-muted-foreground"
          >
            <X className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Aapne cancel kar diya
          </p>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={pending}
              aria-label="Booking confirm karein"
              className="h-11 flex-1 rounded-lg bg-teal-600 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
            >
              {pending ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Check className="mr-1 h-4 w-4" aria-hidden />
              )}
              Confirm &amp; Book
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDismissed(true)}
              disabled={pending}
              aria-label="Booking cancel karein, kuch badalna hai"
              className="h-11 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <X className="mr-1 h-4 w-4" aria-hidden />
              Nahi, badalna hai
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 4) booking_created ─────────────────────────────────────────────────────

export function BookingCreatedCardBody({
  data,
}: {
  data: Record<string, unknown>
  ctx?: CardRenderCtx
}) {
  const doctor = str(data.doctor)
  const specialization = str(data.specialization)
  const dateLabel = str(data.dateLabel) || str(data.date)
  const timeSlot = str(data.timeSlot)
  const mode = data.mode
  const status = str(data.status) || 'Pending'
  const statusHi = str(data.statusHi)
  const appointmentNo = str(data.appointmentNo)

  return (
    <div className="rounded-xl border border-emerald-200 bg-background p-3 dark:border-emerald-800/70">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50"
          aria-hidden
        >
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </span>
        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Booking ho gayi!</p>
        <Badge
          variant="outline"
          className="ml-auto border-amber-300 bg-amber-50 text-[10px] font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
        >
          {statusHi ? `${status} — ${statusHi}` : status}
        </Badge>
      </div>

      <p className="mt-2 truncate text-sm font-semibold leading-tight">{doctor}</p>
      {specialization && (
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{specialization}</p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="flex min-w-0 items-center gap-1">
          <CalendarDays className="h-3 w-3 shrink-0" aria-hidden />
          <span className="truncate">{dateLabel}</span>
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3 shrink-0" aria-hidden />
          {timeSlot}
        </span>
        <span className="flex items-center gap-1">{modeLabel(mode)}</span>
        <span className="font-semibold text-teal-700 dark:text-teal-400">
          {formatMoney(data.fees)}
        </span>
      </div>

      <Button
        asChild
        variant="outline"
        size="sm"
        className="mt-2.5 h-10 w-full rounded-lg border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-400 dark:hover:bg-teal-950/40"
      >
        <Link href="/dashboard/patient/appointments" aria-label="Appointments page kholein">
          Appointments page dekhein
          <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
        </Link>
      </Button>

      {appointmentNo && (
        <p className="mt-2 truncate text-[10px] text-muted-foreground">{appointmentNo}</p>
      )}
    </div>
  )
}

// ═════════════════════════ PHASE 3 (proactive + check-in) ═══════════════════

// ─── useSubmitCheckIn (shared Save-button POST) ─────────────────────────────

export interface CheckInPayload {
  mood: number
  energy: number
  symptoms: string[]
  note?: string
}

/**
 * The check-in write rail (twin of useConfirmBooking): POST
 * /api/dashboard/patient/aturseva/check-in on the patient's Save tap. On 201:
 * success toast + ['aturseva-chat'] + ['aturseva-checkin'] refetch (the
 * check_in_saved card + mood-aware reply were persisted server-side).
 */
export function useSubmitCheckIn() {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState(false)

  const submit = useCallback(
    async (payload: CheckInPayload): Promise<boolean> => {
      setPending(true)
      try {
        const res = await fetch('/api/dashboard/patient/aturseva/check-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string }
        if (res.ok && (res.status === 201 || json.success)) {
          toast.success('Aaj ka check-in save ho gaya ✓')
          void queryClient.invalidateQueries({ queryKey: ['aturseva-chat'] })
          void queryClient.invalidateQueries({ queryKey: ['aturseva-checkin'] })
          return true
        }
        toast.error(json.error || 'Check-in save nahi hua — dobara try karein')
        return false
      } catch {
        toast.error('Check-in save nahi hua — dobara try karein')
        return false
      } finally {
        setPending(false)
      }
    },
    [queryClient]
  )

  return { submit, pending }
}

// ─── 5) booking_update (proactive: approved / rejected) ─────────────────────

export function BookingUpdateCardBody({ data }: { data: Record<string, unknown> }) {
  const status = str(data.status)
  const isApproved = status === 'Approve'
  const doctor = str(data.doctor)
  const specialization = str(data.specialization)
  const dateLabel = str(data.dateLabel) || str(data.date)
  const timeSlot = str(data.timeSlot)
  const statusHi = str(data.statusHi)
  const tokenNumber = str(data.tokenNumber)
  const queuePosition = Number(data.queuePosition)
  const reason = str(data.reason)
  const mode = data.mode

  return (
    <div
      className={cn(
        'rounded-xl border p-3',
        isApproved
          ? 'border-emerald-200 bg-background dark:border-emerald-800/70'
          : 'border-rose-200 bg-background dark:border-rose-900/70'
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
            isApproved
              ? 'bg-emerald-100 dark:bg-emerald-950/50'
              : 'bg-rose-100 dark:bg-rose-950/50'
          )}
          aria-hidden
        >
          {isApproved ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          )}
        </span>
        <p
          className={cn(
            'text-sm font-bold',
            isApproved
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-rose-700 dark:text-rose-400'
          )}
        >
          {isApproved ? 'Appointment confirm ho gaya!' : 'Appointment reject ho gaya'}
        </p>
        <Badge
          variant="outline"
          className={cn(
            'ml-auto text-[10px] font-medium',
            isApproved
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
              : 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
          )}
        >
          {statusHi ? `${status} — ${statusHi}` : status}
        </Badge>
      </div>

      <p className="mt-2 truncate text-sm font-semibold leading-tight">{doctor}</p>
      {specialization && (
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{specialization}</p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="flex min-w-0 items-center gap-1">
          <CalendarDays className="h-3 w-3 shrink-0" aria-hidden />
          <span className="truncate">{dateLabel}</span>
        </span>
        {timeSlot && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 shrink-0" aria-hidden />
            {timeSlot}
          </span>
        )}
        {mode ? <span className="flex items-center gap-1">{modeLabel(mode)}</span> : null}
      </div>

      {isApproved && (tokenNumber || Number.isFinite(queuePosition)) && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {tokenNumber && (
            <span className="rounded-lg border border-teal-300 bg-teal-50 px-2.5 py-1.5 text-xs font-bold text-teal-800 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300">
              Token {tokenNumber}
            </span>
          )}
          {Number.isFinite(queuePosition) && queuePosition > 0 && (
            <span className="rounded-lg border border-teal-300 bg-teal-50 px-2.5 py-1.5 text-xs font-bold text-teal-800 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300">
              Queue #{queuePosition}
            </span>
          )}
          {Number.isFinite(Number(data.fees)) && Number(data.fees) > 0 && (
            <span className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground">
              {formatMoney(data.fees)}
            </span>
          )}
        </div>
      )}

      {!isApproved && reason && (
        <p className="mt-1.5 text-xs text-muted-foreground">Reason: {reason}</p>
      )}

      <Button
        asChild
        variant="outline"
        size="sm"
        className={cn(
          'mt-2.5 h-10 w-full rounded-lg',
          isApproved
            ? 'border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-400 dark:hover:bg-teal-950/40'
            : 'text-muted-foreground hover:bg-muted'
        )}
      >
        <Link href="/dashboard/patient/appointments" aria-label="Appointments page kholein">
          Appointments page dekhein
          <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
        </Link>
      </Button>
    </div>
  )
}

// ─── 6) get_my_symptom_log (14-day diary trend) ─────────────────────────────

interface LogDay {
  day?: string
  mood?: number
  moodFace?: string
  energy?: number
  symptoms?: string
  note?: string
}

export function SymptomLogCardBody({ data }: { data: Record<string, unknown> }) {
  const days = arr<LogDay>(data.days)
  const summary =
    data.summary && typeof data.summary === 'object'
      ? (data.summary as { daysLogged?: number; avgMood?: number; avgEnergy?: number; streak?: number; topSymptoms?: { tag?: string; days?: number }[] })
      : null

  if (days.length === 0) {
    return (
      <p className="rounded-xl border bg-background px-3 py-2.5 text-xs text-muted-foreground">
        {str(data.note) || 'Abhi koi check-in nahi hua — aaj ka card thread me hai.'}
      </p>
    )
  }

  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
        <p className="text-sm font-semibold leading-tight">
          {summary?.daysLogged ?? days.length} din ka symptom diary
        </p>
        {typeof summary?.streak === 'number' && summary.streak >= 2 && (
          <Badge
            variant="outline"
            className="ml-auto border-teal-300 bg-teal-50 text-[10px] font-medium text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-400"
          >
            🔥 {summary.streak}-day streak
          </Badge>
        )}
      </div>

      {/* summary stats */}
      <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
        <div className="rounded-lg bg-muted/60 px-1.5 py-2">
          <p className="text-[10px] text-muted-foreground">Avg mood</p>
          <p className="text-sm font-bold text-teal-700 dark:text-teal-400">
            {summary?.avgMood ?? '—'}/5
          </p>
        </div>
        <div className="rounded-lg bg-muted/60 px-1.5 py-2">
          <p className="text-[10px] text-muted-foreground">Avg energy</p>
          <p className="text-sm font-bold text-teal-700 dark:text-teal-400">
            {summary?.avgEnergy ?? '—'}/5
          </p>
        </div>
        <div className="rounded-lg bg-muted/60 px-1.5 py-2">
          <p className="text-[10px] text-muted-foreground">Din logged</p>
          <p className="text-sm font-bold text-teal-700 dark:text-teal-400">
            {summary?.daysLogged ?? days.length}
          </p>
        </div>
      </div>

      {/* day rows (scrollable — long list handling) */}
      <div className="mt-2 max-h-44 space-y-1.5 overflow-y-auto pr-0.5">
        {days.map((d, i) => (
          <div
            key={`${d.day ?? i}`}
            className="flex items-center gap-2 rounded-lg border border-dashed px-2 py-1.5"
          >
            <span className="shrink-0 text-base leading-none" aria-hidden>
              {d.moodFace || '😐'}
            </span>
            <span className="w-[86px] shrink-0 truncate text-[10px] text-muted-foreground">
              {d.day?.slice(5) || ''}
            </span>
            <span className="flex shrink-0 items-center gap-0.5 text-[10px] text-muted-foreground">
              <Zap className="h-2.5 w-2.5" aria-hidden />
              {d.energy ?? '—'}/5
            </span>
            <span className="min-w-0 flex-1 truncate text-[11px] text-foreground">
              {d.symptoms || '—'}
            </span>
          </div>
        ))}
      </div>

      {summary?.topSymptoms && summary.topSymptoms.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {summary.topSymptoms.map((s) => (
            <Badge
              key={s.tag}
              variant="secondary"
              className="text-[10px] font-medium"
            >
              {s.tag} ×{s.days}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── 7) prepare_check_in (confirm card — LLM prepared, patient Saves) ───────

export function PrepareCheckInCardBody({ data }: { data: Record<string, unknown> }) {
  const { submit, pending } = useSubmitCheckIn()
  const [saved, setSaved] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const mood = Number(data.mood)
  const energy = Number(data.energy)
  const moodFace = str(data.moodFace) || '😐'
  const dayLabel = str(data.dayLabel) || str(data.day) || ''
  const symptoms = arr<string>(data.symptoms)
  const note = str(data.note)
  const updating = !!data.updating

  const handleSave = async () => {
    const ok = await submit({ mood, energy, symptoms, note })
    if (ok) setSaved(true)
  }

  if (saved) {
    return (
      <p
        role="status"
        className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
      >
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
        Check-in save ho gaya ✓
      </p>
    )
  }

  return (
    <div className={cn('rounded-xl border bg-background p-3', dismissed && 'opacity-60')}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold leading-tight">
            <HeartPulse className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
            {updating ? 'Aaj ka check-in update karein' : 'Aaj ka check-in'}
          </p>
          {dayLabel && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{dayLabel}</p>
          )}
        </div>
        <span className="shrink-0 text-2xl leading-none" aria-label={`Mood ${mood} out of 5`}>
          {moodFace}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1.5 text-center text-xs">
        <div className="rounded-lg bg-muted/60 px-2 py-1.5">
          <span className="text-muted-foreground">Mood</span>{' '}
          <span className="font-bold text-teal-700 dark:text-teal-400">{mood}/5</span>
        </div>
        <div className="rounded-lg bg-muted/60 px-2 py-1.5">
          <span className="text-muted-foreground">Energy</span>{' '}
          <span className="font-bold text-teal-700 dark:text-teal-400">{energy}/5</span>
        </div>
      </div>

      {symptoms.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {symptoms.map((s) => (
            <Badge key={s} variant="secondary" className="text-[10px] font-medium">
              {s}
            </Badge>
          ))}
        </div>
      )}
      {note && <p className="mt-1.5 text-xs italic text-muted-foreground">“{note}”</p>}

      {dismissed ? (
        <p
          role="status"
          className="mt-3 flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-2.5 text-xs text-muted-foreground"
        >
          <X className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Aapne cancel kar diya
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={pending}
            aria-label="Check-in save karein"
            className="h-11 flex-1 rounded-lg bg-teal-600 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
          >
            {pending ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Check className="mr-1 h-4 w-4" aria-hidden />
            )}
            Save {updating ? 'Update' : 'Check-in'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setDismissed(true)}
            disabled={pending}
            aria-label="Check-in cancel karein"
            className="h-11 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            <X className="mr-1 h-4 w-4" aria-hidden />
            Nahi, badalna hai
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── 8) check_in_saved (persisted summary card) ─────────────────────────────

export function CheckInSavedCardBody({ data }: { data: Record<string, unknown> }) {
  const moodFace = str(data.moodFace) || '😐'
  const dayLabel = str(data.dayLabel) || str(data.day)
  const mood = Number(data.mood)
  const energy = Number(data.energy)
  const symptoms = arr<string>(data.symptoms)
  const note = str(data.note)
  const streak = Number(data.streak)

  return (
    <div className="rounded-xl border border-teal-200 bg-background p-3 dark:border-teal-800/70">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xl leading-none" aria-hidden>
          {moodFace}
        </span>
        <p className="text-sm font-bold text-teal-700 dark:text-teal-400">
          {dayLabel ? `${dayLabel} ka check-in` : 'Aaj ka check-in'}
        </p>
        {Number.isFinite(streak) && streak >= 2 && (
          <Badge
            variant="outline"
            className="ml-auto border-teal-300 bg-teal-50 text-[10px] font-medium text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-400"
          >
            🔥 {streak} din streak
          </Badge>
        )}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>Mood <b className="text-foreground">{Number.isFinite(mood) ? mood : '—'}/5</b></span>
        <span className="flex items-center gap-1">
          <Zap className="h-3 w-3 shrink-0" aria-hidden />
          Energy <b className="text-foreground">{Number.isFinite(energy) ? energy : '—'}/5</b>
        </span>
      </div>
      {symptoms.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {symptoms.map((s) => (
            <Badge key={s} variant="secondary" className="text-[10px] font-medium">
              {s}
            </Badge>
          ))}
        </div>
      )}
      {note && <p className="mt-1.5 text-xs italic text-muted-foreground">“{note}”</p>}
    </div>
  )
}

// ─── 9) CheckInCard — the interactive DAILY NUDGE (thread-inline) ───────────

const MOOD_OPTIONS = [
  { value: 1, face: '😞', label: 'Bahut low' },
  { value: 2, face: '🙁', label: 'Thoda low' },
  { value: 3, face: '😐', label: 'Theek' },
  { value: 4, face: '🙂', label: 'Achha' },
  { value: 5, face: '😄', label: 'Bahut achha' },
]

const SYMPTOM_CHIPS = [
  'bukhar',
  'sardad',
  'khansi',
  'thakan',
  'neend',
  'pet',
  'chakkar',
  'dard',
]

/**
 * The daily check-in card rendered INLINE at the end of the thread when
 * today's check-in is still pending (GET /check-in → today === null).
 * Mood + energy selectors, symptom chips, optional note → Save (human-tap
 * write). After saving it collapses to a one-line confirmation.
 */
export function CheckInCard({ compact = false }: { compact?: boolean }) {
  const { submit, pending } = useSubmitCheckIn()
  const [mood, setMood] = useState<number | null>(null)
  const [energy, setEnergy] = useState<number | null>(null)
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  const toggleSymptom = (tag: string) => {
    setSymptoms((prev) =>
      prev.includes(tag) ? prev.filter((s) => s !== tag) : prev.length < 6 ? [...prev, tag] : prev
    )
  }

  const handleSave = async () => {
    if (mood === null || energy === null) return
    const ok = await submit({ mood, energy, symptoms, note: note.trim() || undefined })
    if (ok) setSaved(true)
  }

  if (saved) {
    return (
      <p
        role="status"
        className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
      >
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Aaj ka check-in ho gaya — kal phir milenge! 🩺
      </p>
    )
  }

  return (
    <div className="rounded-xl border border-teal-200 bg-background p-3 dark:border-teal-800/70">
      <div className="flex items-center gap-1.5">
        <HeartPulse className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
        <p className="text-sm font-semibold leading-tight">Aaj ka check-in</p>
        <span className="ml-auto text-[10px] text-muted-foreground">1 minute lagta hai</span>
      </div>

      {/* mood selector */}
      <p className="mt-2 text-[11px] font-medium text-muted-foreground">Aaj mood kaisa hai?</p>
      <div className="mt-1 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Aaj ka mood">
        {MOOD_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={mood === o.value}
            aria-label={`${o.label} (${o.value}/5)`}
            onClick={() => setMood(o.value)}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg border text-lg transition-colors',
              mood === o.value
                ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/30 dark:border-teal-600 dark:bg-teal-950/50'
                : 'border-border hover:bg-muted/60'
            )}
          >
            {o.face}
          </button>
        ))}
      </div>

      {/* energy selector */}
      <p className="mt-2.5 text-[11px] font-medium text-muted-foreground">Energy kitni hai?</p>
      <div className="mt-1 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Aaj ki energy">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={energy === v}
            aria-label={`Energy ${v}/5`}
            onClick={() => setEnergy(v)}
            className={cn(
              'flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition-colors',
              energy === v
                ? 'border-teal-500 bg-teal-50 text-teal-700 ring-2 ring-teal-500/30 dark:border-teal-600 dark:bg-teal-950/50 dark:text-teal-300'
                : 'border-border text-muted-foreground hover:bg-muted/60'
            )}
          >
            <Zap className="mr-0.5 h-3 w-3" aria-hidden />
            {v}
          </button>
        ))}
      </div>

      {/* symptom chips */}
      <p className="mt-2.5 text-[11px] font-medium text-muted-foreground">
        Koi symptom? (optional — multiple chun sakte hain)
      </p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {SYMPTOM_CHIPS.map((tag) => (
          <button
            key={tag}
            type="button"
            aria-pressed={symptoms.includes(tag)}
            onClick={() => toggleSymptom(tag)}
            className={cn(
              'h-7 rounded-full border px-2.5 text-[11px] font-medium transition-colors',
              symptoms.includes(tag)
                ? 'border-teal-500 bg-teal-50 text-teal-700 dark:border-teal-600 dark:bg-teal-950/50 dark:text-teal-300'
                : 'border-border text-muted-foreground hover:bg-muted/60'
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* note */}
      {!compact && (
        <>
          <label
            htmlFor="checkin-note"
            className="mt-2.5 block text-[11px] font-medium text-muted-foreground"
          >
            Kuch aur note karna hai? (optional)
          </label>
          <input
            id="checkin-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 300))}
            placeholder="jaise: subah se sar halka dard tha…"
            className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-teal-500/40"
          />
        </>
      )}

      <Button
        type="button"
        onClick={() => void handleSave()}
        disabled={pending || mood === null || energy === null}
        aria-label="Aaj ka check-in save karein"
        className="mt-3 h-11 w-full rounded-lg bg-teal-600 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Check className="mr-1 h-4 w-4" aria-hidden />
        )}
        Save Check-in
      </Button>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// Phase 4 — lab reports / diet plan / weekly report cards
// ═════════════════════════════════════════════════════════════════════════════

// ─── 9) get_my_lab_reports (grounded explainer card) ────────────────────────

interface LabParam {
  name?: string
  value?: string
  unit?: string
  range?: string
  abnormal?: boolean
  remarks?: string
}

interface LabReportRow {
  reportNo?: string
  testName?: string
  dateLabel?: string
  doctorName?: string
  params?: LabParam[]
}

export function LabReportsCardBody({ data }: { data: Record<string, unknown> }) {
  const reports = arr<LabReportRow>(data.reports)
  const abnormal = Number(data.abnormalParams) || 0

  if (reports.length === 0) {
    return (
      <p className="rounded-xl border bg-background px-3 py-2.5 text-xs text-muted-foreground">
        Abhi koi verified lab report nahi hai.
      </p>
    )
  }

  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="flex items-center gap-2">
        <HeartPulse className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
        <p className="text-sm font-semibold leading-tight">Lab reports</p>
        {abnormal > 0 && (
          <Badge
            variant="outline"
            className="ml-auto border-amber-300 bg-amber-50 text-[10px] font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
          >
            {abnormal} value{abnormal > 1 ? 's' : ''} normal se bahar
          </Badge>
        )}
      </div>

      {/* report blocks (scrollable — long list handling) */}
      <div className="mt-2 max-h-72 space-y-2 overflow-y-auto pr-0.5">
        {reports.map((r, i) => (
          <div key={r.reportNo || i} className="rounded-lg border border-dashed p-2">
            <div className="flex items-baseline gap-1.5">
              <p className="text-xs font-semibold">{r.testName || 'Lab test'}</p>
              <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
                {r.dateLabel || ''}
              </span>
            </div>
            {r.doctorName && (
              <p className="text-[10px] text-muted-foreground">
                <Stethoscope className="mr-0.5 inline h-2.5 w-2.5" aria-hidden />
                {r.doctorName}
              </p>
            )}
            <table className="mt-1 w-full border-collapse text-[11px]">
              <tbody>
                {(r.params || []).map((p, j) => (
                  <tr key={j} className="border-t border-border/60 first:border-t-0">
                    <td className="py-1 pr-1 text-muted-foreground">{p.name || '—'}</td>
                    <td
                      className={cn(
                        'py-1 pr-1 text-right font-semibold tabular-nums',
                        p.abnormal
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-foreground'
                      )}
                    >
                      {p.value || '—'}
                      {p.unit ? <span className="ml-0.5 text-[9px] font-normal text-muted-foreground">{p.unit}</span> : null}
                      {p.abnormal && (
                        <span
                          className="ml-1 align-middle"
                          title="Normal se bahar"
                          aria-label="normal se bahar"
                        >
                          <XCircle className="inline h-3 w-3 text-rose-500" aria-hidden />
                        </span>
                      )}
                    </td>
                    <td className="py-1 text-right text-[10px] tabular-nums text-muted-foreground">
                      {p.range ? `${p.range}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {abnormal > 0 && i === 0 && (
              <p className="mt-1.5 rounded-md bg-muted/60 px-1.5 py-1 text-[10px] leading-snug text-muted-foreground">
                In values ko apne doctor se discuss karein — main sirf samjhaati hoon, ilaaj doctor
                batayenge.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 10) get_my_diet_plan (today's meals) ───────────────────────────────────

interface DietMeal {
  slot?: string
  label?: string
  icon?: string
  items?: string
}

export function DietPlanCardBody({ data }: { data: Record<string, unknown> }) {
  const meals = arr<DietMeal>(data.meals)
  const summary = str(data.summary)

  if (meals.length === 0) {
    return (
      <p className="rounded-xl border bg-background px-3 py-2.5 text-xs text-muted-foreground">
        Diet plan abhi available nahi hai — Dawai page par generate karein.
      </p>
    )
  }

  return (
    <div className="rounded-xl border border-amber-200/70 bg-background p-3 dark:border-amber-800/50">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
        <p className="text-sm font-semibold leading-tight">
          Aaj ka diet plan
          {data.dayLabel ? <span className="ml-1 text-[11px] font-normal text-muted-foreground">({str(data.dayLabel)})</span> : null}
        </p>
        {data.generatedLabel && (
          <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
            {str(data.generatedLabel)}
          </span>
        )}
      </div>

      {summary && (
        <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{summary}</p>
      )}

      <ul className="mt-2 space-y-1.5">
        {meals.map((m, i) => (
          <li
            key={m.slot || i}
            className="flex items-start gap-2 rounded-lg border border-dashed px-2 py-1.5"
          >
            <span className="shrink-0 text-sm leading-none" aria-hidden>
              {m.icon || '🍽️'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {m.label || m.slot}
              </p>
              <p className="text-[11px] leading-snug text-foreground">{m.items || '—'}</p>
            </div>
          </li>
        ))}
      </ul>

      {str(data.note) && (
        <p className="mt-1.5 rounded-md bg-amber-50 px-2 py-1 text-[10px] leading-snug text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
          💡 {str(data.note)}
        </p>
      )}
      <p className="mt-1.5 text-[9px] leading-snug text-muted-foreground/80">
        AI-suggested plan — doctor se confirm karke follow karein.
      </p>
    </div>
  )
}

// ─── diet_nudge (proactive meal-time push — compact) ────────────────────────

export function DietNudgeCardBody({ data }: { data: Record<string, unknown> }) {
  const items = str(data.items)
  return (
    <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 p-3 dark:border-amber-800/50 dark:bg-amber-950/20">
      <div className="flex items-center gap-2">
        <span className="text-base leading-none" aria-hidden>
          {str(data.icon) || '🍽️'}
        </span>
        <p className="text-sm font-semibold leading-tight">
          {str(data.label) || 'Meal'} ka waqt
        </p>
      </div>
      <p className="mt-1 text-[11px] leading-snug text-foreground">{items}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">
        Poora din ka plan poochh lijiye — "aaj ka diet plan dikhao"
      </p>
    </div>
  )
}

// ─── 11) get_my_weekly_report (7-day summary) ───────────────────────────────

interface WeeklyCheckIns {
  days?: number
  avgMood?: number
  avgEnergy?: number
  topSymptoms?: { tag?: string; days?: number }[]
}

interface WeeklyAdherence {
  weekTaken?: number
  weekTotal?: number
  scorePct?: number
  streakDays?: number
}

export function WeeklyReportCardBody({ data }: { data: Record<string, unknown> }) {
  const checkIns =
    data.checkIns && typeof data.checkIns === 'object' ? (data.checkIns as WeeklyCheckIns) : {}
  const adherence =
    data.adherence && typeof data.adherence === 'object' ? (data.adherence as WeeklyAdherence) : {}
  const appointments =
    data.appointments && typeof data.appointments === 'object'
      ? (data.appointments as { total?: number; upcoming?: number })
      : {}
  const labsNew = Number(data.labsNew) || 0
  const headline = str(data.headline)

  return (
    <div className="rounded-xl border border-teal-200 bg-background p-3 dark:border-teal-800/70">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
        <p className="text-sm font-semibold leading-tight">
          Weekly report
          {data.weekLabel ? (
            <span className="ml-1 text-[11px] font-normal text-muted-foreground">
              {str(data.weekLabel)}
            </span>
          ) : null}
        </p>
        {(adherence.streakDays ?? 0) >= 2 && (
          <Badge
            variant="outline"
            className="ml-auto border-teal-300 bg-teal-50 text-[10px] font-medium text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-400"
          >
            🔥 {adherence.streakDays}-day streak
          </Badge>
        )}
      </div>

      {headline && (
        <p className="mt-1.5 text-[11px] font-medium leading-snug text-foreground/90">
          {headline}
        </p>
      )}

      {/* stat grid */}
      <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <div className="rounded-lg bg-muted/60 px-1.5 py-2 text-center">
          <p className="text-[10px] text-muted-foreground">Check-ins</p>
          <p className="text-sm font-bold text-teal-700 dark:text-teal-400">
            {checkIns.days ?? 0}<span className="text-[10px] font-normal text-muted-foreground">/7</span>
          </p>
        </div>
        <div className="rounded-lg bg-muted/60 px-1.5 py-2 text-center">
          <p className="text-[10px] text-muted-foreground">Avg mood</p>
          <p className="text-sm font-bold text-teal-700 dark:text-teal-400">
            {checkIns.avgMood ?? '—'}<span className="text-[10px] font-normal text-muted-foreground">/5</span>
          </p>
        </div>
        <div className="rounded-lg bg-muted/60 px-1.5 py-2 text-center">
          <p className="text-[10px] text-muted-foreground">Dawai</p>
          <p className="text-sm font-bold text-teal-700 dark:text-teal-400">
            {adherence.scorePct ?? '—'}<span className="text-[10px] font-normal text-muted-foreground">%</span>
          </p>
        </div>
        <div className="rounded-lg bg-muted/60 px-1.5 py-2 text-center">
          <p className="text-[10px] text-muted-foreground">Appointments</p>
          <p className="text-sm font-bold text-teal-700 dark:text-teal-400">
            {appointments.total ?? 0}
          </p>
        </div>
      </div>

      {/* details row */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
        <Badge variant="secondary" className="font-medium">
          Dawai {adherence.weekTaken ?? 0}/{adherence.weekTotal ?? 0}
        </Badge>
        {labsNew > 0 && (
          <Badge variant="secondary" className="font-medium">
            🧪 {labsNew} nayi report{labsNew > 1 ? 's' : ''}
          </Badge>
        )}
        {checkIns.avgEnergy !== undefined && (
          <Badge variant="secondary" className="font-medium">
            Energy {checkIns.avgEnergy}/5
          </Badge>
        )}
      </div>

      {checkIns.topSymptoms && checkIns.topSymptoms.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {checkIns.topSymptoms.map((s) => (
            <Badge
              key={s.tag}
              variant="outline"
              className="border-border text-[10px] font-medium text-muted-foreground"
            >
              {s.tag} ×{s.days}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
