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
  Loader2,
  MapPin,
  Stethoscope,
  Video,
  X,
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
