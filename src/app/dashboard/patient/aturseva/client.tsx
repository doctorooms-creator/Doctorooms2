'use client'

/**
 * Aturseva — FULL-PAGE AI nurse chat window (the patient's primary interface).
 *
 * ChatGPT-style persistent thread at /dashboard/patient/aturseva. History is
 * stored server-side (AtursevaConversation) and shared with the floating FAB
 * sheet — this page and the sheet read/write the same thread.
 *
 * API contract (/api/dashboard/patient/aturseva/chat):
 *   GET ?markRead=1 → { success, sessionExists, greeting, messages[] } (oldest→
 *            newest) — markRead stamps the thread SEEN (sidebar badge reset)
 *   POST   → SSE stream: delta {text} · action {id,type,title,data} · done · error
 *            body { message, location?: {lat,lng} } — location comes from the
 *            composer 📍 GPS chip (feeds the find_nearby_doctors tool)
 *   DELETE → clears the thread (AlertDialog-confirmed, then refetch)
 *
 * Quirks handled here:
 *   - Action `type` is the TOOL name (`search_doctors` | `get_my_bookings` |
 *     `get_queue_position` | `get_doctor_slots` | `find_nearby_doctors` |
 *     `prepare_booking` | `booking_created`); hyphenated aliases too.
 *   - History action rows serialize `title` empty with the real
 *     `{ title, data }` payload nested inside `data` — normalizeAction unwraps.
 *   - The narrated reply streams with a leading "\n" — display trims it.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  MessageCircle,
  Pill,
  RefreshCw,
  Send,
  Sparkles,
  Stethoscope,
  Ticket,
  Trash2,
  Users,
  Video,
} from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getAvatarDisplayUrl } from '@/lib/avatar-url'
import { cn } from '@/lib/utils'

import {
  BookingCreatedCardBody,
  NearbyDoctorsCardBody,
  PrepareBookingCardBody,
  SlotsCardBody,
  type CardRenderCtx,
} from './cards'

// ─── Types ──────────────────────────────────────────────────────────────────

type Role = 'user' | 'aturseva' | 'action'
type ActionKind = 'doctors' | 'bookings' | 'queue' | 'slots' | 'nearby' | 'confirm' | 'created' | 'other'

interface ActionCard {
  kind: ActionKind
  title: string
  data: Record<string, unknown>
}

interface ChatMsg {
  id: string
  role: Role
  content: string
  action?: ActionCard
  streaming?: boolean
}

interface HistoryResponse {
  success: boolean
  sessionExists: boolean
  greeting: string | null
  messages: {
    id: string
    role: Role
    content: string
    actionJson?: { type: string; title: string; data: Record<string, unknown> }
    createdAt: string
  }[]
}

interface DoctorHit {
  id: string
  name: string
  specialization: string
  city?: string
  fees: number | string
  experience?: string
  profileImg?: string | null
}

interface BookingRow {
  id: string
  doctor: string
  specialization?: string
  dateIST: string
  timeSlot?: string
  mode?: string
  status: string
  statusHi?: string
  tokenNumber?: string | null
}

// ─── Constants & helpers ─────────────────────────────────────────────────────

const QUICK_CHIPS = [
  'Aaj ki dawaiyaan kaunsi hain?',
  'Mera booking approve hua?',
  'Achhe doctor dikhao',
  'Mera queue number?',
]

/** localStorage key persisting ONLY the GPS "Nearby" enabled flag. */
const GPS_STORAGE_KEY = 'aturseva-gps-enabled'

/** Action `type` → renderer kind. Tool names AND hyphenated aliases. */
const KIND_BY_TYPE: Record<string, ActionKind> = {
  search_doctors: 'doctors',
  'doctor-search': 'doctors',
  get_my_bookings: 'bookings',
  'bookings-status': 'bookings',
  get_queue_position: 'queue',
  'queue-position': 'queue',
  // Phase 2
  get_doctor_slots: 'slots',
  'doctor-slots': 'slots',
  find_nearby_doctors: 'nearby',
  'nearby-doctors': 'nearby',
  prepare_booking: 'confirm',
  'booking-confirm': 'confirm',
  booking_created: 'created',
  'booking-created': 'created',
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2026-10-15" → "15 Oct 2026" (no TZ math — the string IS the IST date). */
function formatISTDate(dateIST: unknown): string {
  const s = typeof dateIST === 'string' ? dateIST.trim() : ''
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return s
  const month = MONTHS_SHORT[Number(m[2]) - 1] || ''
  return `${Number(m[3])} ${month} ${m[1]}`
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

/**
 * Normalize an action payload from EITHER the live SSE frame
 * ({type, title, data} — flat) or a persisted history row
 * ({type, title: '', data: {title, data}} — nested wrapper).
 */
function normalizeAction(raw: {
  type?: unknown
  title?: unknown
  data?: unknown
}): ActionCard {
  let type = asString(raw.type).trim()
  let title = asString(raw.title).trim()
  let data: Record<string, unknown> =
    raw.data && typeof raw.data === 'object' ? (raw.data as Record<string, unknown>) : {}

  // History quirk: real { title, data } nested inside `data`.
  if (!title && typeof data.title === 'string' && data.data && typeof data.data === 'object') {
    title = data.title
    data = data.data as Record<string, unknown>
  }

  const kind: ActionKind = KIND_BY_TYPE[type] || 'other'

  return { kind, title, data }
}

function bookingStatusClass(status: string): string {
  switch (status) {
    case 'Approve':
      return 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
    case 'Pending':
      return 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
    case 'Visited':
    case 'Finish':
      return 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400'
    case 'Canceled':
    case 'Rejected':
      return 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
    default:
      return 'border-border bg-muted text-muted-foreground'
  }
}

// ─── Action card bodies ──────────────────────────────────────────────────────

function DoctorCell({ doctor }: { doctor: DoctorHit }) {
  return (
    <div className="flex h-full flex-col rounded-xl border bg-background p-3 transition-colors hover:border-teal-400/70 hover:shadow-sm dark:hover:border-teal-700">
      <div className="flex items-start gap-2.5">
        <Avatar className="h-10 w-10 shrink-0 border bg-muted/40">
          <AvatarImage src={getAvatarDisplayUrl(doctor.profileImg)} alt={doctor.name} />
          <AvatarFallback className="rounded-lg bg-teal-50 dark:bg-teal-950/40">
            <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">{doctor.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {doctor.specialization}
            {doctor.city ? ` · ${doctor.city}` : ''}
          </p>
          {doctor.experience && (
            <p className="mt-0.5 text-[11px] text-muted-foreground/80">{doctor.experience}</p>
          )}
        </div>
        <p className="shrink-0 text-sm font-bold text-teal-700 dark:text-teal-400">
          ₹{Number(doctor.fees) || 0}
        </p>
      </div>
      <Button
        asChild
        size="sm"
        className="mt-2.5 h-11 w-full rounded-lg bg-teal-600 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 sm:h-10"
      >
        <Link
          href={`/dashboard/patient/book/${doctor.id}`}
          aria-label={`${doctor.name} ko book karein`}
        >
          Book Appointment
          <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
        </Link>
      </Button>
    </div>
  )
}

function BookingRowCard({ booking }: { booking: BookingRow }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-background px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-tight">{booking.doctor}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3 w-3 shrink-0" aria-hidden />
          {formatISTDate(booking.dateIST)}
          {booking.timeSlot ? (
            <>
              <span aria-hidden>·</span>
              <Clock className="h-3 w-3 shrink-0" aria-hidden />
              {booking.timeSlot}
            </>
          ) : null}
        </p>
        {booking.tokenNumber && (
          <p className="mt-0.5 text-[11px] font-medium text-teal-700 dark:text-teal-400">
            Token #{booking.tokenNumber}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {booking.mode === 'VideoCall' && (
          <Badge
            variant="outline"
            className="gap-1 border-slate-300 bg-slate-50 text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400"
          >
            <Video className="h-3 w-3" aria-hidden /> Video
          </Badge>
        )}
        <Badge variant="outline" className={cn('text-[10px] font-medium', bookingStatusClass(booking.status))}>
          {booking.statusHi || booking.status}
        </Badge>
      </div>
    </div>
  )
}

function QueueHero({ data, title }: { data: Record<string, unknown>; title: string }) {
  const token = asString(data.tokenNumber)
  if (!token) {
    const note = asString(data.note) || title
    return (
      <p className="rounded-xl border bg-background px-3 py-3 text-sm leading-relaxed text-muted-foreground">
        {note}
      </p>
    )
  }

  const position = Number(data.position) || 0
  const ahead = Number(data.patientsAhead) || 0
  const wait = Number(data.estimatedWaitMinutes) || 0
  const currentlyServing = asString(data.currentlyServing)
  const status = asString(data.status)

  return (
    <div className="overflow-hidden rounded-xl border border-teal-200/70 dark:border-teal-800/60">
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-4 text-white dark:from-teal-700 dark:to-teal-800">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-teal-100/90">
              Aapka token
            </p>
            <p className="text-4xl font-extrabold leading-tight tracking-tight">#{token}</p>
            <p className="mt-1 truncate text-xs text-teal-100/90">
              {asString(data.doctor)}
              {data.dateIST ? ` · ${formatISTDate(data.dateIST)}` : ''}
              {asString(data.timeSlot) ? ` · ${asString(data.timeSlot)}` : ''}
            </p>
            {status && (
              <Badge
                variant="outline"
                className="mt-1.5 border-white/30 bg-white/15 text-[10px] font-medium text-white"
              >
                {status === 'Approve' ? 'Confirm hai' : status}
              </Badge>
            )}
          </div>
          {currentlyServing && (
            <div className="shrink-0 rounded-lg bg-white/15 px-2.5 py-1.5 text-right text-[11px] leading-tight">
              <span className="block text-teal-100/90">Abhi chal raha</span>
              <span className="block text-sm font-bold">#{currentlyServing}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-x border-b bg-background px-3 py-2.5 text-xs">
        <span className="flex min-w-0 items-center gap-1.5 font-semibold text-teal-700 dark:text-teal-400">
          <Users className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">position {position}</span>
        </span>
        <span className="shrink-0 text-muted-foreground">{ahead} pehle</span>
        <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" aria-hidden />~{wait} min
        </span>
      </div>
    </div>
  )
}

function ActionCardBody({ action, ctx }: { action: ActionCard; ctx?: CardRenderCtx }) {
  switch (action.kind) {
    case 'doctors': {
      const doctors = asArray<DoctorHit>(action.data.doctors)
      if (doctors.length === 0) {
        const note =
          asString(action.data.note) || 'Koi doctor nahi mila — city ya specialization badal kar poochhein.'
        return (
          <p className="rounded-xl border bg-background px-3 py-2.5 text-xs text-muted-foreground">
            {note}
          </p>
        )
      }
      return (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {doctors.slice(0, 6).map((d) => (
            <DoctorCell key={d.id} doctor={d} />
          ))}
        </div>
      )
    }
    case 'bookings': {
      const bookings = asArray<BookingRow>(action.data.bookings)
      if (bookings.length === 0) {
        const note = asString(action.data.note) || 'Abhi koi appointment record nahi mila.'
        return (
          <p className="rounded-xl border bg-background px-3 py-2.5 text-xs text-muted-foreground">
            {note}
          </p>
        )
      }
      return (
        <div className="space-y-2">
          {bookings.map((b) => (
            <BookingRowCard key={b.id} booking={b} />
          ))}
        </div>
      )
    }
    case 'queue':
      return <QueueHero data={action.data} title={action.title} />
    case 'slots':
      return <SlotsCardBody data={action.data} ctx={ctx} />
    case 'nearby':
      return <NearbyDoctorsCardBody data={action.data} ctx={ctx} />
    case 'confirm':
      return <PrepareBookingCardBody data={action.data} ctx={ctx} />
    case 'created':
      return <BookingCreatedCardBody data={action.data} ctx={ctx} />
    default:
      return (
        <p className="rounded-xl border bg-background px-3 py-2.5 text-xs text-muted-foreground">
          {asString(action.data.note) || action.title || 'Aturseva card'}
        </p>
      )
  }
}

function ActionCardShell({ action, ctx }: { action: ActionCard; ctx?: CardRenderCtx }) {
  // booking_created gets an emerald success shell; everything else stays teal.
  const isCreated = action.kind === 'created'
  const icon =
    action.kind === 'doctors' ? (
      <Stethoscope className="h-3.5 w-3.5 shrink-0" aria-hidden />
    ) : action.kind === 'bookings' ? (
      <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
    ) : action.kind === 'queue' ? (
      <Ticket className="h-3.5 w-3.5 shrink-0" aria-hidden />
    ) : action.kind === 'slots' ? (
      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
    ) : action.kind === 'nearby' ? (
      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
    ) : action.kind === 'confirm' ? (
      <CalendarCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
    ) : action.kind === 'created' ? (
      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
    ) : (
      <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
    )
  return (
    <div
      className={cn(
        'w-full rounded-2xl rounded-tl-md border p-3 shadow-sm',
        isCreated
          ? 'border-emerald-300/80 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30'
          : 'border-teal-200/80 bg-teal-50/60 dark:border-teal-900 dark:bg-teal-950/30'
      )}
    >
      <p
        className={cn(
          'mb-2 flex items-center gap-1.5 text-xs font-semibold',
          isCreated
            ? 'text-emerald-800 dark:text-emerald-300'
            : 'text-teal-800 dark:text-teal-300'
        )}
      >
        {icon}
        <span className="truncate">{action.title || 'Aturseva card'}</span>
      </p>
      <ActionCardBody action={action} ctx={ctx} />
    </div>
  )
}

// ─── Sub-views: loading / error skeletons ────────────────────────────────────

function HistorySkeleton() {
  return (
    <div className="space-y-4" aria-label="Chat history load ho rahi hai" role="status">
      <div className="flex justify-start gap-2">
        <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-56 rounded-full" />
          <Skeleton className="h-4 w-40 rounded-full" />
        </div>
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-48 rounded-2xl rounded-br-md" />
      </div>
      <div className="flex justify-start gap-2">
        <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-64 rounded-full" />
      </div>
      <div className="flex justify-start gap-2">
        <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
        <Skeleton className="h-24 w-full max-w-md rounded-2xl rounded-tl-md" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-36 rounded-2xl rounded-br-md" />
      </div>
    </div>
  )
}

function HistoryError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/40">
        <RefreshCw className="h-6 w-6 text-rose-500" aria-hidden />
      </span>
      <div>
        <p className="text-sm font-semibold">Chat load nahi ho payi</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Network ya server me dikkat aayi — thodi der baad dobara try karein.
        </p>
      </div>
      <Button
        onClick={onRetry}
        variant="outline"
        className="h-11 rounded-xl border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-400 dark:hover:bg-teal-950/40"
      >
        <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
        Dobara try karein
      </Button>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function AtursevaChatClient() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['aturseva-chat'],
    queryFn: async (): Promise<HistoryResponse> => {
      // markRead=1 stamps the thread SEEN — resets the sidebar unread badge.
      const res = await fetch('/api/dashboard/patient/aturseva/chat?markRead=1')
      if (!res.ok) {
        if (res.status === 401) throw new Error('Session expired — dobara login kariye')
        throw new Error('Chat history load nahi ho payi')
      }
      return (await res.json()) as HistoryResponse
    },
    retry: 1,
  })

  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [showJump, setShowJump] = useState(false)

  // ── GPS "Nearby" chip state (Phase 2) ──
  // Only the ENABLED flag persists (localStorage); coords are re-acquired
  // silently on mount. When coords exist, every POST body carries `location`.
  const [gpsEnabled, setGpsEnabled] = useState(false)
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const atBottomRef = useRef(true)
  // Only sync local state when the QUERY DATA itself changes — never on
  // `sending` flips (that would momentarily revert the just-streamed turn).
  const lastSyncedDataRef = useRef<HistoryResponse | null>(null)

  // Sync messages from server history (initial load, refetch after done, clear).
  useEffect(() => {
    if (!data || sending) return
    if (lastSyncedDataRef.current === data) return
    lastSyncedDataRef.current = data

    const next: ChatMsg[] = data.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      ...(m.actionJson ? { action: normalizeAction(m.actionJson) } : {}),
    }))
    if (next.length === 0 && data.greeting) {
      next.push({ id: 'greeting', role: 'aturseva', content: data.greeting })
    }
    atBottomRef.current = true
    setShowJump(false)
    setMessages(next)
  }, [data, sending])

  // Auto-scroll on new content — only when the user is already near the bottom.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (atBottomRef.current) el.scrollTop = el.scrollHeight
  }, [messages])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 90
    atBottomRef.current = near
    setShowJump((prev) => (prev === !near ? prev : !near))
  }, [])

  const jumpToLatest = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    atBottomRef.current = true
    setShowJump(false)
  }, [])

  // ── GPS "Nearby" chip (Phase 2) ──

  const acquireGps = useCallback((silent: boolean) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      if (!silent) toast.error('Location permission nahi mili — city se search kar sakte ho')
      return
    }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGpsLoading(false)
        if (!silent) toast.success("Location on — ab 'paas ke doctor' poochh sakte ho")
      },
      () => {
        setGpsLoading(false)
        if (!silent) toast.error('Location permission nahi mili — city se search kar sakte ho')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  // Restore the persisted enabled flag; silently re-acquire coordinates.
  useEffect(() => {
    let enabled = false
    try {
      enabled = window.localStorage.getItem(GPS_STORAGE_KEY) === '1'
    } catch {
      enabled = false
    }
    if (enabled) {
      setGpsEnabled(true)
      acquireGps(true)
    }
  }, [acquireGps])

  const toggleGps = useCallback(() => {
    if (gpsLoading) return
    if (gpsEnabled) {
      // Off: drop coords (POSTs stop carrying location) + forget the flag.
      setGpsEnabled(false)
      setGpsCoords(null)
      try {
        window.localStorage.removeItem(GPS_STORAGE_KEY)
      } catch {
        // private mode — state alone is fine
      }
      return
    }
    setGpsEnabled(true)
    try {
      window.localStorage.setItem(GPS_STORAGE_KEY, '1')
    } catch {
      // private mode — state alone is fine
    }
    acquireGps(false)
  }, [gpsEnabled, gpsLoading, acquireGps])

  // ── Send one turn (SSE) ──
  const send = useCallback(
    async (text?: string) => {
      const message = (text ?? input).trim()
      if (!message || sending || isLoading) return

      setInput('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
      setSending(true)
      atBottomRef.current = true
      setShowJump(false)

      const aiId = `a-${Date.now()}`
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== 'greeting'),
        { id: `u-${Date.now()}`, role: 'user', content: message },
        { id: aiId, role: 'aturseva', content: '', streaming: true },
      ])

      const finishBubble = () =>
        setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, streaming: false } : m)))

      try {
        // History lives server-side — the body carries ONLY the new message
        // (plus GPS coords when the 📍 Nearby chip is on).
        const res = await fetch('/api/dashboard/patient/aturseva/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gpsCoords ? { message, location: gpsCoords } : { message }),
        })

        if (!res.ok || !res.body) {
          const errData = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(
            res.status === 401
              ? 'Session expired — dobara login kariye'
              : errData.error || 'Aturseva abhi available nahi hai'
          )
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let finished = false

        while (!finished) {
          const { done: rdDone, value } = await reader.read()
          if (rdDone) break
          buffer += decoder.decode(value, { stream: true })
          const frames = buffer.split('\n\n')
          buffer = frames.pop() || ''

          for (const frame of frames) {
            let event = ''
            let dataLine = ''
            for (const line of frame.split('\n')) {
              if (line.startsWith('event:')) event = line.slice(6).trim()
              else if (line.startsWith('data:')) dataLine = line.slice(5).trim()
            }
            if (!event || !dataLine) continue
            let payload: Record<string, unknown>
            try {
              payload = JSON.parse(dataLine) as Record<string, unknown>
            } catch {
              continue
            }

            if (event === 'delta') {
              const t = asString(payload.text)
              if (!t) continue
              setMessages((prev) =>
                prev.map((m) => (m.id === aiId ? { ...m, content: m.content + t } : m))
              )
            } else if (event === 'action') {
              // Rich card arrives BEFORE the narrated text — insert above the bubble.
              const card = normalizeAction(payload)
              const actionMsg: ChatMsg = {
                id: asString(payload.id) || `act-${Date.now()}`,
                role: 'action',
                content: '',
                action: card,
              }
              setMessages((prev) => {
                const idx = prev.findIndex((m) => m.id === aiId)
                if (idx === -1) return [...prev, actionMsg]
                return [...prev.slice(0, idx), actionMsg, ...prev.slice(idx)]
              })
            } else if (event === 'done') {
              finished = true
              finishBubble()
              // Refresh the cache (page + FAB sheet read the same thread).
              void queryClient.invalidateQueries({ queryKey: ['aturseva-chat'] })
              // The reply just landed in THIS window — reset the sidebar
              // unread badge too (the refetch re-stamps lastReadAt).
              void queryClient.invalidateQueries({ queryKey: ['aturseva-unread'] })
            } else if (event === 'error') {
              finished = true
              const msgText = asString(payload.message) || 'Kuch dikkat aayi — dobara try karein'
              setMessages((prev) =>
                prev.map((m) => (m.id === aiId ? { ...m, content: msgText, streaming: false } : m))
              )
              toast.error(msgText)
            }
          }
        }
        finishBubble()
      } catch (err) {
        const msgText = err instanceof Error ? err.message : 'Kuch dikkat aayi — dobara try karein'
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, content: msgText, streaming: false } : m))
        )
        toast.error(msgText)
      } finally {
        setSending(false)
        finishBubble()
      }
    },
    [input, sending, isLoading, queryClient, gpsCoords]
  )

  // Card interactions (slot chips / other-day chips) ride the same turn pipeline.
  const handleCardSend = useCallback(
    (text: string) => {
      void send(text)
    },
    [send]
  )

  // ── Clear the thread (AlertDialog-confirmed) ──
  const clearChat = useCallback(async () => {
    if (clearing) return
    setClearing(true)
    try {
      const res = await fetch('/api/dashboard/patient/aturseva/chat', { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Nayi shuruaat — purani chat clear ho gayi')
      setMessages([])
      await queryClient.invalidateQueries({ queryKey: ['aturseva-chat'] })
    } catch {
      toast.error('Chat clear nahi ho payi — dobara try karein')
    } finally {
      setClearing(false)
    }
  }, [clearing, queryClient])

  const hasUserMessages = messages.some((m) => m.role === 'user')
  const showChips = !isLoading && !isError && !hasUserMessages && !sending
  // Nothing to clear when the thread holds only the greeting bubble.
  const canClear =
    !clearing && !isLoading && !isError && messages.some((m) => m.id !== 'greeting')

  return (
    // Height = viewport minus the dashboard chrome, MEASURED per breakpoint
    // (agent-browser, 1280x800 etc.): header h-16 (64) + main padding (32
    // <md / 48 >=md) + DashboardFooter footprint (105 <sm / 73 sm-lg / 89 md
    // band / 57 xl+). Rounding UP the footer keeps the card from ever
    // overshooting (a few px gap under the footer beats a double scrollbar);
    // min-h-[560px] is the spec floor and may scroll on very short viewports.
    // A plain `h-full` does NOT work here - the layout's `div.flex-1` sizes
    // from its own content (circular), so percentage heights resolve to auto.
    <div
      data-aturseva-root
      className="flex h-[calc(100vh-12.5625rem)] min-h-[560px] w-full flex-col overflow-hidden rounded-2xl border bg-background shadow-sm sm:h-[calc(100vh-10.5625rem)] md:h-[calc(100vh-12.5625rem)] xl:h-[calc(100vh-10.5625rem)]"
    >
      {/* ── Header bar ── */}
      <header className="flex shrink-0 items-center gap-3 border-b bg-gradient-to-br from-teal-50 to-white px-3 py-3 dark:from-teal-950/40 dark:to-background sm:px-4">
        <span
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white shadow-md shadow-teal-600/20"
          aria-hidden
        >
          <Stethoscope className="h-6 w-6" />
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-400" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="truncate text-base font-bold leading-tight sm:text-lg">Aturseva</h1>
            <Badge className="gap-1 border-teal-300 bg-teal-50 text-[10px] font-semibold text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-400">
              <Sparkles className="h-3 w-3" aria-hidden /> AI Nurse
            </Badge>
          </div>
          <p className="mt-0.5 hidden truncate text-xs text-muted-foreground sm:block">
            Dawai · Appointments · Queue · Diet — sab yaad hai
          </p>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-11 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:border-teal-400 hover:text-teal-700 dark:hover:border-teal-700 dark:hover:text-teal-400 sm:h-9 sm:px-3"
          >
            <Link href="/dashboard/patient/sevika" aria-label="Dawai reminders page kholein">
              <Pill className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden />
              <span className="hidden sm:inline">Dawai page</span>
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Chat clear karke nayi shuruaat karein"
                disabled={!canClear}
                className="h-11 w-11 rounded-lg text-muted-foreground hover:border-rose-300 hover:text-rose-600 dark:hover:border-rose-800 dark:hover:text-rose-400 sm:h-9 sm:w-9"
              >
                {clearing ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Nayi shuruaat?</AlertDialogTitle>
                <AlertDialogDescription>
                  Purani saari Aturseva chat hamesha ke liye delete ho jayegi. Aapki dawai
                  reminders aur appointments safe rahenge.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="h-10">Nahi, rakhein</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => void clearChat()}
                  className="h-10 bg-rose-600 hover:bg-rose-700"
                >
                  Haan, clear karein
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      {/* ── Messages area (internal scrolling only) ── */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          role="log"
          aria-live="polite"
          aria-label="Aturseva ke saath conversation"
          className="sevika-chat-scroll flex-1 overflow-y-auto px-3 py-4 sm:px-6"
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:gap-4">
            {isLoading ? (
              <HistorySkeleton />
            ) : isError ? (
              <HistoryError onRetry={() => void refetch()} />
            ) : (
              messages.map((m, i) =>
                m.role === 'action' && m.action ? (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'flex w-full justify-start',
                      m.action.kind === 'doctors' || m.action.kind === 'nearby'
                        ? 'sm:max-w-xl lg:max-w-2xl'
                        : 'max-w-md'
                    )}
                  >
                    <ActionCardShell
                      action={m.action}
                      ctx={{ onSend: handleCardSend, messages, messageIndex: i }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    {m.role === 'aturseva' && (
                      <span
                        className="mr-2 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm dark:bg-teal-900/50"
                        aria-hidden
                      >
                        🩺
                      </span>
                    )}
                    <div
                      className={cn(
                        'max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm sm:max-w-[75%]',
                        m.role === 'user'
                          ? 'rounded-br-md bg-teal-600 text-white'
                          : 'rounded-bl-md border bg-muted/60 text-foreground'
                      )}
                    >
                      {m.content.replace(/^\s+/, '') ||
                        (m.streaming ? (
                          <span
                            className="flex items-center gap-1 py-0.5"
                            role="status"
                            aria-label="Aturseva type kar rahi hai"
                          >
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:0ms]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:150ms]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:300ms]" />
                          </span>
                        ) : null)}
                    </div>
                  </motion.div>
                )
              )
            )}

            {showChips && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="flex flex-wrap gap-2 pt-1"
              >
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => void send(chip)}
                    className="min-h-[44px] rounded-full border border-teal-200 bg-teal-50/60 px-4 py-2 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-400 dark:hover:bg-teal-900/40"
                  >
                    {chip}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Floating "jump to latest" — only when the user has scrolled up */}
        <AnimatePresence>
          {showJump && (
            <motion.button
              key="aturseva-jump-latest"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              type="button"
              onClick={jumpToLatest}
              aria-label="Sabse naye message par jayein"
              className="absolute bottom-3 left-1/2 z-10 flex h-11 -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-teal-200 bg-background/95 px-4 text-xs font-semibold text-teal-700 shadow-lg backdrop-blur transition-colors hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-teal-800 dark:text-teal-400 dark:hover:bg-teal-950/60"
            >
              <ArrowDown className="h-3.5 w-3.5" aria-hidden />
              Latest
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Composer ── */}
      <div className="shrink-0 border-t bg-background px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-4">
        {/* GPS "Nearby" chip — shares coordinates with every chat POST */}
        <div className="mx-auto mb-2 flex w-full max-w-3xl items-center gap-2">
          <button
            type="button"
            onClick={toggleGps}
            disabled={gpsLoading}
            aria-label="Paas ke doctors ke liye location on karein"
            aria-pressed={gpsEnabled}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-wait',
              gpsEnabled
                ? 'border-teal-600 bg-teal-600 text-white hover:bg-teal-700'
                : 'border-border bg-background text-muted-foreground hover:border-teal-400 hover:text-teal-700 dark:hover:border-teal-700 dark:hover:text-teal-400'
            )}
          >
            {gpsLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <MapPin className="h-3.5 w-3.5" aria-hidden />
            )}
            <span>Nearby</span>
            {gpsEnabled && !gpsLoading && (
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300"
                aria-hidden
              />
            )}
          </button>
          {gpsEnabled && gpsCoords && (
            <span className="hidden truncate text-[10px] text-muted-foreground sm:inline">
              📍 {gpsCoords.lat.toFixed(3)}, {gpsCoords.lng.toFixed(3)} — "paas ke doctor" poochhein
            </span>
          )}
        </div>
        <form
          className="mx-auto flex w-full max-w-3xl items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            void send()
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send()
              }
            }}
            onInput={(e) => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = `${Math.min(el.scrollHeight, 128)}px`
            }}
            rows={1}
            maxLength={1000}
            placeholder="Aturseva se kuch bhi poochhein…"
            aria-label="Aturseva ko message likhein"
            disabled={isLoading}
            className="max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-xl border bg-background px-3.5 py-2.5 text-sm leading-relaxed outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-teal-500 disabled:opacity-60"
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Message bhejein"
            disabled={sending || isLoading || !input.trim()}
            className="h-11 w-11 shrink-0 rounded-xl bg-teal-600 text-white shadow-sm hover:bg-teal-700"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
          </Button>
        </form>
        <p className="mx-auto mt-2 flex w-full max-w-3xl flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <MessageCircle className="h-3 w-3 shrink-0" aria-hidden />
          <span>Aturseva AI jaankari deti hai — dawai/dose change par doctor se poochhein.</span>
          {input.length > 900 && (
            <span className="font-medium text-teal-600 dark:text-teal-400">
              {input.length}/1000
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
