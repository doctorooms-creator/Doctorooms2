'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { differenceInCalendarDays, format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  Clock,
  MapPin,
  Timer,
  Video,
} from 'lucide-react'
import { getAvatarDisplayUrl } from '@/lib/avatar-url'
import { cn } from '@/lib/utils'

/**
 * Soonest upcoming appointment shown in the patient dashboard hero banner.
 * Shape matches items returned by GET /api/dashboard/patient/appointments.
 */
export interface NextAppointment {
  id: string
  doctorName: string
  doctorImg: string
  doctorSpecialization: string
  date: string
  timeSlot: string
  bookingMode: string
  status: string
  videoRoomId: string
}

/** Status badge colors tuned for the teal-emerald gradient (white text parent). */
const bannerStatusBadge: Record<string, string> = {
  Pending: 'bg-amber-400 text-amber-950',
  Approve: 'bg-emerald-400 text-emerald-950',
}

/** Countdown chip label: "Today at 18:00" / "Tomorrow" / "in 6 days". */
function getCountdownLabel(date: string, timeSlot: string): string {
  const days = differenceInCalendarDays(new Date(date), new Date())
  if (days <= 0) return timeSlot ? `Today at ${timeSlot}` : 'Today'
  if (days === 1) return 'Tomorrow'
  return `in ${days} days`
}

/** Frosted info chip used on the gradient banner. */
const chipClass =
  'inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium ring-1 ring-inset ring-white/25 backdrop-blur-sm'

/**
 * Patient dashboard hero banner:
 * - upcoming appointment → teal-emerald gradient card with doctor, date/time,
 *   booking mode, status badge, countdown chip and action buttons
 * - nothing upcoming → friendly dashed-border invite card linking to /doctors
 */
export function NextAppointmentBanner({ appointment }: { appointment: NextAppointment | null }) {
  // ---- Empty state: no upcoming appointments ----
  if (!appointment) {
    return (
      <motion.section
        aria-label="No upcoming appointments"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50/50 p-5 sm:p-6 dark:border-teal-800 dark:bg-teal-950/20"
      >
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/50">
              <CalendarPlus className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="font-semibold">No upcoming appointments</p>
              <p className="text-sm text-muted-foreground">Find a doctor and book your visit</p>
            </div>
          </div>
          <Button
            asChild
            className="shrink-0 bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20 hover:from-teal-600 hover:to-teal-700"
          >
            <Link href="/doctors">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Book Appointment
            </Link>
          </Button>
        </div>
      </motion.section>
    )
  }

  // ---- Upcoming appointment: gradient hero banner ----
  const isVideo = appointment.bookingMode === 'VideoCall'
  const countdown = getCountdownLabel(appointment.date, appointment.timeSlot)
  const detailHref = `/dashboard/patient/appointments/${appointment.id}`
  // If the doctor has already opened a room, join it directly; otherwise the
  // detail page shows the join section as soon as the call starts.
  const joinHref = appointment.videoRoomId
    ? `/dashboard/video-call/${appointment.videoRoomId}`
    : detailHref

  return (
    <motion.section
      aria-label="Next appointment"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 text-white shadow-xl shadow-teal-600/25"
    >
      {/* Decorative blurred circles */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full bg-white/10 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-14 h-60 w-60 rounded-full bg-emerald-300/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 right-1/3 h-28 w-28 rounded-full bg-teal-300/20 blur-2xl"
      />

      <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Doctor identity */}
        <div className="flex min-w-0 items-center gap-4">
          <Avatar className="h-14 w-14 shrink-0 ring-2 ring-white/50">
            <AvatarImage
              src={getAvatarDisplayUrl(appointment.doctorImg)}
              alt={appointment.doctorName}
            />
            <AvatarFallback className="bg-white/20 text-base font-semibold text-white">
              {appointment.doctorName.replace(/^Dr\.?\s*/i, '').charAt(0) || 'D'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-50/90">
                Next Appointment
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ring-white/30 backdrop-blur-sm">
                <Timer className="h-3 w-3" />
                {countdown}
              </span>
            </div>
            <h2 className="mt-0.5 truncate text-lg font-bold leading-snug sm:text-xl">
              {appointment.doctorName}
            </h2>
            <p className="truncate text-sm text-teal-50/90">
              {appointment.doctorSpecialization || 'Doctor'}
            </p>
          </div>
        </div>

        {/* When + how chips + status */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className={cn(chipClass, 'text-sm font-semibold')}>
            <CalendarDays className="h-4 w-4" />
            {format(new Date(appointment.date), 'EEE, MMM d')}
          </span>
          {appointment.timeSlot && (
            <span className={chipClass}>
              <Clock className="h-3.5 w-3.5" />
              {appointment.timeSlot}
            </span>
          )}
          <span className={chipClass}>
            {isVideo ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
            {isVideo ? 'Video Call' : 'In Person'}
          </span>
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm',
              bannerStatusBadge[appointment.status] || 'bg-white/20 text-white'
            )}
          >
            {appointment.status}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
          <Button
            asChild
            className="bg-white font-semibold text-teal-700 shadow-md hover:bg-teal-50"
          >
            <Link href={detailHref}>
              View Details
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          {appointment.status === 'Approve' && isVideo && (
            <Button
              asChild
              variant="ghost"
              className="border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
            >
              <Link href={joinHref}>
                <Video className="mr-2 h-4 w-4" />
                Join Video Call
              </Link>
            </Button>
          )}
        </div>
      </div>
    </motion.section>
  )
}
