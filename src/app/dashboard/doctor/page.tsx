'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { StatCard } from '@/components/dashboard/stat-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CalendarDays,
  Users,
  FileText,
  Star,
  ArrowRight,
  Clock,
  Stethoscope,
  PenSquare,
  AlertCircle,
  Building2,
  MapPin,
  Briefcase,
  Timer,
  UserCheck,
  CircleCheck,
  UserPlus,
  Loader2,
  Search,
  FileSearch,
  History,
  FlaskConical,
  Video,
  PhoneCall,
  Pause,
  Play,
  UserX,
  Siren,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { getAvatarDisplayUrl } from '@/lib/avatar-url'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PreVisitBriefSheet } from '@/components/copilot/brief-sheet'
import { Sparkles } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────

interface DoctorStats {
  todayAppointments: number
  totalPatients: number
  pendingPrescriptions: number
  averageRating: string
  todayList: {
    id: string
    appointmentNo: string
    patientName: string
    patientImg: string
    disease: string
    date: string
    status: string
    tokenNumber: string | null
    timeSlot?: string | null
    bookingMode?: string
    videoRoomId?: string
  }[]
  recentReviews: {
    id: string
    patientName: string
    patientImg: string
    star: number
    review: string
    date: string
  }[]
}

interface HospitalLink {
  id: string
  designation: string
  fees: number
  opdTimings: string
  isAvailable: boolean
  hospital: { id: string; hospitalName: string; city: string; state: string }
  department: { id: string; name: string; shortCode: string; floorNo: string; opdRoom: string }
}

interface HospitalLinksResponse {
  hospitalLinks: HospitalLink[]
  doctorId: string
  isHospitalMode: boolean
}

interface QueueItem {
  id: string
  tokenNumber: string | null
  tokenOrder: number
  patientName: string
  patientImg: string | null
  disease: string
  timeSlot: string
  status: string
  bookingType: string
  bookingMode?: string
  isEmergency?: boolean
  createdAt: string
  receptionistName: string
}

interface QueueStats {
  total: number
  waiting: number
  inConsultation: number
  completed: number
}

interface QueueResponse {
  doctor: { id: string; name: string; specialization: string; profileImg: string; queuePaused?: boolean }
  department: { id: string; name: string; shortCode: string; floorNo: string; opdRoom: string } | null
  hospital: { id: string; hospitalName: string } | null
  date: string
  queue: QueueItem[]
  stats: QueueStats
  currentServing: { tokenNumber: string | null; patientName: string } | null
  queuePaused?: boolean
}

// ─── Constants ──────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
  Approve: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400',
  Visited: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400',
  Canceled: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400',
  NoShow: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
  Rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400',
  Finish: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400',
  SentForTests: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
}

const QUEUE_REFRESH_INTERVAL = 15_000 // 15 seconds

// ─── Component ──────────────────────────────────────────────────────

export default function DoctorDashboardPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  // ── Data fetching ──
  const { data: stats, isLoading, error } = useQuery<DoctorStats>({
    queryKey: ['doctor-stats'],
    queryFn: () => fetch('/api/dashboard/doctor/stats').then((r) => {
      if (!r.ok) throw new Error('Failed to load stats')
      return r.json()
    }),
    retry: 1,
  })

  // ── Sent-for-Tests patients (auto-refresh) ──
  const { data: sentForTestsData } = useQuery<{ bookings: { id: string; patientName: string; disease: string; appointmentNo: string; tokenNumber: string | null }[] }>({
    queryKey: ['doctor-sent-for-tests'],
    queryFn: () => fetch('/api/dashboard/doctor/sent-for-tests').then((r) => {
      if (!r.ok) return { bookings: [] }
      return r.json()
    }),
    refetchInterval: QUEUE_REFRESH_INTERVAL,
  })

  const sentForTests = sentForTestsData?.bookings || []

  const { data: hospitalData } = useQuery<HospitalLinksResponse>({
    queryKey: ['doctor-hospital-links'],
    queryFn: () => fetch('/api/dashboard/doctor/hospital-links').then((r) => {
      if (!r.ok) throw new Error('Failed to load hospital links')
      return r.json()
    }),
    retry: 1,
    staleTime: 60_000,
  })

  const isHospitalMode = hospitalData?.isHospitalMode === true
  const primaryLink = hospitalData?.hospitalLinks?.[0] ?? null
  const doctorId = hospitalData?.doctorId ?? ''

  // ── Queue fetching with auto-refresh ──
  const { data: queueData } = useQuery<QueueResponse>({
    queryKey: ['doctor-opd-queue', doctorId],
    queryFn: () =>
      fetch(`/api/queue/doctor/${doctorId}`).then((r) => {
        if (!r.ok) throw new Error('Failed to load queue')
        return r.json()
      }),
    enabled: isHospitalMode && !!doctorId,
    refetchInterval: QUEUE_REFRESH_INTERVAL,
    staleTime: 10_000,
  })

  // ── Start video call from Today's Schedule (CTO Plan Phase 3) ──
  const videoCallMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await fetch('/api/dashboard/doctor/video-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to start video call')
      }
      return data as { success: boolean; roomId: string; joinUrl: string }
    },
    onSuccess: (data) => {
      toast.success('Video call started')
      queryClient.invalidateQueries({ queryKey: ['doctor-stats'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-opd-queue'] })
      router.push(data.joinUrl)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // ── Loading / Error ──
  if (isLoading) return <DoctorDashboardSkeleton />

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-lg font-medium text-muted-foreground">Failed to load dashboard</p>
        <p className="text-sm text-muted-foreground/70 mt-1">Please try re-logging in or refresh the page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Hospital & Department Banner (Hospital Mode) ── */}
      <AnimatePresence>
        {isHospitalMode && primaryLink && (
          <HospitalBanner link={primaryLink} />
        )}
      </AnimatePresence>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Appointments"
          value={stats?.todayAppointments ?? 0}
          icon={CalendarDays}
          trend={{ value: 12, label: 'from yesterday' }}
          gradient="from-teal-500 to-teal-600"
          iconBg="bg-teal-100 dark:bg-teal-900/50"
        />
        <StatCard
          title="Total Patients"
          value={stats?.totalPatients ?? 0}
          icon={Users}
          trend={{ value: 8, label: 'this month' }}
          gradient="from-emerald-500 to-emerald-600"
          iconBg="bg-emerald-100 dark:bg-emerald-900/50"
        />
        <StatCard
          title="Pending Prescriptions"
          value={stats?.pendingPrescriptions ?? 0}
          icon={FileText}
          gradient="from-amber-500 to-amber-600"
          iconBg="bg-amber-100 dark:bg-amber-900/50"
        />
        <StatCard
          title="Average Rating"
          value={stats?.averageRating ?? '0.0'}
          icon={Star}
          trend={{ value: 5, label: 'this month' }}
          gradient="from-amber-500 to-amber-600"
          iconBg="bg-amber-100 dark:bg-amber-900/50"
        />
      </div>

      {/* ── OPD Queue Section (Hospital Mode) ── */}
      <AnimatePresence>
        {isHospitalMode && queueData && (
          <OPDQueueSection queueData={queueData} />
        )}
      </AnimatePresence>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's appointments */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Today's Schedule
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 dark:text-teal-400" asChild>
              <Link href="/dashboard/doctor/appointments">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
              {stats?.todayList?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <CalendarDays className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-sm">No appointments today</p>
                </div>
              )}
              {stats?.todayList?.map((appt, i) => (
                <motion.div
                  key={appt.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-teal-50/50 dark:hover:bg-teal-950/20 cursor-pointer group"
                  onMouseEnter={() => {
                    // Warm the route while the doctor hovers — click then feels instant
                    router.prefetch(`/dashboard/doctor/prescriptions/new?bookingId=${appt.id}`)
                  }}
                  onClick={() => {
                    // Doctor clicks patient name → go directly to 6-step prescription wizard
                    // (client-side navigation — no full browser reload)
                    router.push(`/dashboard/doctor/prescriptions/new?bookingId=${appt.id}`)
                  }}
                >
                  {/* Slot-time chip (CTO Plan Phase 2, 2d): slotted patients
                      carry their appointment time; queue-tail walk-ins show none */}
                  {appt.timeSlot && (
                    <Badge className="shrink-0 gap-1 bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 text-[11px] font-mono px-2 py-0.5 border border-teal-200 dark:border-teal-800">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {appt.timeSlot}
                    </Badge>
                  )}
                  {/* Token badge in hospital mode */}
                  {isHospitalMode && appt.tokenNumber && (
                    <Badge className="shrink-0 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-[11px] font-mono px-2 py-0.5 border-0">
                      {appt.tokenNumber}
                    </Badge>
                  )}
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={getAvatarDisplayUrl(appt.patientImg)} />
                    <AvatarFallback className="text-xs bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                      {appt.patientName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-teal-700 dark:text-teal-400 group-hover:underline">
                      {appt.patientName}
                    </p>
                    <p className="text-xs text-muted-foreground">{appt.disease || 'General checkup'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(appt.date), 'h:mm a')}
                    </p>
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {appt.bookingMode === 'VideoCall' && (
                        <Badge className="gap-1 bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 text-[10px] px-1.5 py-0 border-0">
                          <Video className="h-3 w-3" aria-hidden="true" />
                          Video
                        </Badge>
                      )}
                      <Badge
                        className={cn(
                          'text-[10px] px-1.5 py-0',
                          statusColors[appt.status] || 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {appt.status}
                      </Badge>
                      {/* Start Video Call — approved video appointments only */}
                      {appt.status === 'Approve' && appt.bookingMode === 'VideoCall' && (
                        <Button
                          size="icon"
                          variant="outline"
                          title="Start Video Call"
                          aria-label="Start Video Call"
                          className="h-7 w-7 rounded-full border-teal-300 text-teal-600 hover:bg-teal-50 hover:text-teal-700 dark:border-teal-700 dark:text-teal-400 dark:hover:bg-teal-950/40"
                          disabled={videoCallMutation.isPending && videoCallMutation.variables === appt.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            videoCallMutation.mutate(appt.id)
                          }}
                        >
                          {videoCallMutation.isPending && videoCallMutation.variables === appt.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Video className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                      {/* Join Call — room already started */}
                      {appt.status === 'Visited' && appt.bookingMode === 'VideoCall' && appt.videoRoomId && (
                        <Button
                          size="sm"
                          title="Join Call"
                          className="h-7 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1 px-2.5 text-[11px]"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/video-call/${appt.videoRoomId}`)
                          }}
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Join</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Recent Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
              {stats?.recentReviews?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Star className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-sm">No reviews yet</p>
                </div>
              )}
              {stats?.recentReviews?.map((rev, i) => (
                <motion.div
                  key={rev.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="space-y-1.5 rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={getAvatarDisplayUrl(rev.patientImg)} />
                      <AvatarFallback className="text-[10px] bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                        {rev.patientName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium truncate">{rev.patientName}</span>
                    <div className="ml-auto flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          className={cn(
                            'h-3 w-3',
                            s < rev.star
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-muted-foreground/30'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  {rev.review && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{rev.review}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Sent for Tests Section ── */}
      {sentForTests.length > 0 && (
        <Card className="border-amber-200/50 dark:border-amber-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Sent for Tests
              <Badge className="text-xs px-1.5 py-0 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                {sentForTests.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sentForTests.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-lg border border-amber-200/50 dark:border-amber-900/30 p-3 hover:bg-amber-50/30 dark:hover:bg-amber-950/10 cursor-pointer transition-colors group"
                  onMouseEnter={() => {
                    router.prefetch(`/dashboard/doctor/prescriptions/new?bookingId=${p.id}`)
                  }}
                  onClick={() => {
                    // Client-side navigation — no full browser reload
                    router.push(`/dashboard/doctor/prescriptions/new?bookingId=${p.id}`)
                  }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 shrink-0">
                    <FlaskConical className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-amber-700 dark:text-amber-400 group-hover:underline">
                      {p.patientName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.appointmentNo} · {p.disease || 'Tests ordered'}
                    </p>
                  </div>
                  <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                    Waiting for reports
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'New Prescription', icon: PenSquare, href: '/dashboard/doctor/prescriptions/new', color: 'text-teal-600 dark:text-teal-400' },
          { label: 'Manage Schedule', icon: Clock, href: '/dashboard/doctor/schedule', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'My Patients', icon: Users, href: '/dashboard/doctor/patients', color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Edit Profile', icon: Stethoscope, href: '/dashboard/doctor/profile', color: 'text-rose-600 dark:text-rose-400' },
        ].map((action, i) => (
          <motion.a
            key={action.label}
            href={action.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
          >
            <action.icon className={cn('h-5 w-5', action.color)} />
            <span className="text-sm font-medium">{action.label}</span>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </motion.a>
        ))}
      </div>

      {/* ── Search Appointment / Patient History ── */}
      <SearchSection />
    </div>
  )
}

// ─── Search Section Sub-component ────────────────────────────────────
// Doctor can search by Appointment ID (shows that 1 visit's prescription)
// or by Mobile Number (shows ALL prescriptions for that patient across all visits).

function SearchSection() {
  const router = useRouter()
  const [searchType, setSearchType] = useState<'appointment' | 'mobile'>('appointment')
  const [searchValue, setSearchValue] = useState('')
  const [searchResults, setSearchResults] = useState<{
    patientName: string
    patientMobile: string
    prescriptions: {
      id: string
      appointmentNo: string
      disease: string
      date: string
      status: string
      medicinesCount: number
      description: string
      bookingId: string
    }[]
  } | null>(null)
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error('Please enter a value to search')
      return
    }
    setSearching(true)
    setSearched(true)
    try {
      const res = await fetch(
        `/api/dashboard/doctor/search-prescriptions?type=${searchType}&value=${encodeURIComponent(searchValue.trim())}`
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Search failed')
      }
      const data = await res.json()
      setSearchResults(data)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Search failed')
      setSearchResults(null)
    } finally {
      setSearching(false)
    }
  }

  return (
    <Card className="border-teal-200/50 dark:border-teal-900/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <FileSearch className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          Search Patient History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search type toggle */}
        <div className="flex gap-2">
          <Button
            variant={searchType === 'appointment' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setSearchType('appointment'); setSearchResults(null); setSearched(false) }}
            className={searchType === 'appointment' ? 'bg-teal-600 hover:bg-teal-700' : ''}
          >
            By Appointment ID
          </Button>
          <Button
            variant={searchType === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setSearchType('mobile'); setSearchResults(null); setSearched(false) }}
            className={searchType === 'mobile' ? 'bg-teal-600 hover:bg-teal-700' : ''}
          >
            By Mobile Number
          </Button>
        </div>

        {/* Search input */}
        <div className="flex gap-2">
          <Input
            placeholder={searchType === 'appointment' ? 'Enter Appointment ID (e.g. APMT-496)' : 'Enter Mobile Number (e.g. 9876543210)'}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={searching} className="bg-teal-600 hover:bg-teal-700">
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </Button>
        </div>

        {/* Search results */}
        {searched && !searching && !searchResults && (
          <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No results found. Check the {searchType === 'appointment' ? 'Appointment ID' : 'mobile number'} and try again.</p>
          </div>
        )}

        {searchResults && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Patient header */}
            <div className="flex items-center gap-3 rounded-lg border border-teal-200/50 dark:border-teal-900/30 bg-teal-50/30 dark:bg-teal-950/10 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 font-medium">
                {searchResults.patientName?.charAt(0) || '?'}
              </div>
              <div>
                <p className="text-sm font-medium">{searchResults.patientName || 'Unknown Patient'}</p>
                <p className="text-xs text-muted-foreground">{searchResults.patientMobile || 'No mobile'}</p>
              </div>
              <Badge className="ml-auto bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                {searchResults.prescriptions.length} {searchResults.prescriptions.length === 1 ? 'prescription' : 'prescriptions'}
              </Badge>
            </div>

            {/* Prescriptions list */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {searchResults.prescriptions.map((rx, i) => (
                <motion.div
                  key={rx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  onMouseEnter={() => {
                    router.prefetch(`/dashboard/doctor/prescriptions/${rx.id}`)
                  }}
                  onClick={() => {
                    // Click on prescription → open it in the wizard (view/edit mode)
                    // (client-side navigation — no full browser reload)
                    router.push(`/dashboard/doctor/prescriptions/${rx.id}`)
                  }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{rx.disease || 'General consultation'}</p>
                    <p className="text-xs text-muted-foreground">
                      {rx.appointmentNo} · {format(new Date(rx.date), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge className="text-[10px] px-1.5 py-0 bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                      {rx.medicinesCount} meds
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* New prescription for mobile search */}
            {searchType === 'mobile' && searchResults.prescriptions.length > 0 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                Click any prescription to view/edit. Create a new one from the patient's appointment in the queue above.
              </p>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Hospital Banner Sub-component ──────────────────────────────────

function HospitalBanner({ link }: { link: HospitalLink }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-gradient-to-r from-amber-50 via-amber-50/80 to-orange-50/60 dark:from-amber-950/30 dark:via-amber-950/20 dark:to-orange-950/20 p-4 sm:p-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Hospital icon + name */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
            <Building2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-amber-900 dark:text-amber-200 truncate">
              {link.hospital.hospitalName}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              {link.department.shortCode && (
                <Badge className="bg-amber-200/80 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 text-[10px] font-mono px-1.5 py-0 border-0">
                  {link.department.shortCode}
                </Badge>
              )}
              <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                {link.department.name}
              </span>
              {(link.department.floorNo || link.department.opdRoom) && (
                <span className="text-xs text-amber-600/80 dark:text-amber-500/70 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {[link.department.floorNo, link.department.opdRoom].filter(Boolean).join(' · ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side: designation + timings */}
        <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
          {link.designation && (
            <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
              <Briefcase className="h-3.5 w-3.5" />
              <span className="font-medium">{link.designation}</span>
            </div>
          )}
          {link.opdTimings && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Timer className="h-3.5 w-3.5" />
              <span>{link.opdTimings}</span>
            </div>
          )}
          {link.fees > 0 && (
            <Badge variant="outline" className="text-[10px] border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300">
              ₹{link.fees}
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── OPD Queue Section Sub-component ────────────────────────────────

function OPDQueueSection({ queueData }: { queueData: QueueResponse }) {
  const { queue, stats, currentServing } = queueData
  const queryClient = useQueryClient()

  const waitingItems = queue.filter((q) => q.status === 'Approve')
  const inConsultationItems = queue.filter((q) => q.status === 'Visited')

  const nextPatient = waitingItems[0]

  // ── Queue pause state (CTO Plan Phase 4) ──
  // Read defensively: the backend may expose the flag on the doctor object
  // or top-level; both are optional (default false).
  const apiPaused = queueData.doctor?.queuePaused === true || queueData.queuePaused === true
  // Optimistic override while a pause/resume round-trip is in flight or
  // until the refetched queue catches up with the toggled value.
  const [pausedOverride, setPausedOverride] = useState<boolean | null>(null)
  useEffect(() => {
    if (pausedOverride !== null && apiPaused === pausedOverride) {
      setPausedOverride(null)
    }
  }, [apiPaused, pausedOverride])
  const isPaused = pausedOverride ?? apiPaused

  const pauseMutation = useMutation({
    mutationFn: async (paused: boolean) => {
      const res = await fetch('/api/dashboard/doctor/queue-pause', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paused }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.success !== true) {
        throw new Error(data?.error || 'Failed to update queue pause')
      }
      return data as { success: boolean; paused: boolean }
    },
    onMutate: (paused) => {
      // Optimistic flip — reverted in onError
      setPausedOverride(paused)
    },
    onSuccess: (data, paused) => {
      setPausedOverride(typeof data.paused === 'boolean' ? data.paused : paused)
      toast.success(paused ? 'Queue paused — patients will be informed' : 'Queue resumed')
      queryClient.invalidateQueries({ queryKey: ['doctor-opd-queue'] })
    },
    onError: (err: Error) => {
      setPausedOverride(null) // revert to server truth
      toast.error(err.message || 'Could not update queue pause')
    },
  })

  // ── Call-Next auto-brief (Dr. Copilot hook, plan §API-5) ──
  // Opens the deterministic pre-visit brief sheet the moment the next
  // patient is called, so the doctor can scan it while they walk in.
  const [briefBookingId, setBriefBookingId] = useState<string | null>(null)

  const prefetchBrief = (bookingId: string) => {
    // Warm the cache in parallel with the status update → instant sheet open
    void queryClient.prefetchQuery({
      queryKey: ['copilot-brief', bookingId],
      queryFn: async () => {
        const res = await fetch(`/api/copilot/brief/${bookingId}`)
        if (!res.ok) throw new Error('Brief not available')
        return res.json()
      },
      staleTime: 60_000,
    })
  }

  const callNextMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await fetch(`/api/dashboard/doctor/appointments/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Visited' }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed')
      }
      return res.json()
    },
    onSuccess: (_data, bookingId) => {
      toast.success('Patient called — consultation started')
      setBriefBookingId(bookingId) // auto-open the pre-visit brief
      queryClient.invalidateQueries({ queryKey: ['doctor-opd-queue'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-stats'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="space-y-4"
    >
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/50">
            <UserPlus className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Today's OPD Queue</h3>
            <p className="text-[11px] text-muted-foreground">Auto-refreshes every 15s</p>
          </div>
          {isPaused && (
            <Badge className="ml-1 gap-1 border border-amber-300 dark:border-amber-700 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
              <Pause className="h-3 w-3" aria-hidden="true" />
              PAUSED
            </Badge>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => pauseMutation.mutate(!isPaused)}
          disabled={pauseMutation.isPending}
          title={isPaused ? 'Resume accepting queue patients' : 'Temporarily stop calling new patients'}
          className={cn(
            'h-8 gap-1.5 rounded-full border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/40',
            isPaused &&
              'border-amber-500 bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-900/70'
          )}
        >
          {pauseMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : isPaused ? (
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Pause className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {isPaused ? 'Resume Queue' : 'Pause Queue'}
        </Button>
      </div>

      {/* Current Serving Banner */}
      {currentServing && (
        <motion.div
          key={currentServing.tokenNumber || 'serving'}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border-2 border-teal-300 dark:border-teal-700 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/20 p-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/60">
              <UserCheck className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                Currently Serving
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {currentServing.tokenNumber && (
                  <span className="text-lg font-bold font-mono text-teal-700 dark:text-teal-300">
                    {currentServing.tokenNumber}
                  </span>
                )}
                <span className="text-sm font-medium text-foreground truncate">
                  {currentServing.patientName}
                </span>
              </div>
            </div>
            {/* Re-open the auto-brief for the in-consultation patient */}
            {inConsultationItems[0] && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 rounded-full border-teal-300 bg-white/70 text-[11px] font-semibold text-teal-700 hover:bg-white hover:text-teal-800 dark:border-teal-700 dark:bg-teal-950/60 dark:text-teal-300 dark:hover:bg-teal-900/60"
                onClick={() => {
                  prefetchBrief(inConsultationItems[0].id)
                  setBriefBookingId(inConsultationItems[0].id)
                }}
                title="View the pre-visit brief for this patient"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Brief
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Queue stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
            <Timer className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{stats.waiting}</p>
            <p className="text-[11px] text-muted-foreground leading-none">Waiting</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/40">
            <UserCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-teal-700 dark:text-teal-300">{stats.inConsultation}</p>
            <p className="text-[11px] text-muted-foreground leading-none">In Consultation</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
            <CircleCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{stats.completed}</p>
            <p className="text-[11px] text-muted-foreground leading-none">Done</p>
          </div>
        </div>
      </div>

      {/* Queue list */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[420px] overflow-y-auto">
            {queue.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <UserPlus className="h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm">No patients in queue</p>
              </div>
            )}
            {queue.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 transition-colors hover:bg-muted/40',
                  item.status === 'Visited' && 'bg-teal-50/50 dark:bg-teal-950/20',
                  item.status === 'Finish' && 'opacity-60',
                )}
              >
                {/* Token number badge */}
                <Badge
                  className={cn(
                    'shrink-0 font-mono text-xs px-2.5 py-0.5 border-0 min-w-[3.5rem] justify-center',
                    item.isEmergency && item.status === 'Approve'
                      ? 'bg-rose-500 text-white'
                      : item.status === 'Visited'
                        ? 'bg-teal-500 text-white'
                        : item.status === 'Finish'
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                  )}
                >
                  {item.tokenNumber || `#${item.tokenOrder || i + 1}`}
                </Badge>

                {/* Emergency chip (Phase 4 — waiting rows only) */}
                {item.isEmergency && item.status === 'Approve' && (
                  <Badge className="shrink-0 gap-0.5 border-0 bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 text-[9px] px-1.5 py-0">
                    <Siren className="h-2.5 w-2.5" aria-hidden="true" />
                    EMERGENCY
                  </Badge>
                )}

                <Avatar className="h-8 w-8">
                  <AvatarImage src={getAvatarDisplayUrl(item.patientImg)} />
                  <AvatarFallback className="text-[11px] bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                    {item.patientName.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.patientName}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground truncate">
                      {item.disease || 'General checkup'}
                    </p>
                    {item.bookingType !== 'By Self' && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 border-dashed">
                        {item.bookingType}
                      </Badge>
                    )}
                    {item.bookingMode === 'VideoCall' && (
                      <Badge className="gap-0.5 bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 text-[9px] px-1 py-0 border-0">
                        <Video className="h-2.5 w-2.5" aria-hidden="true" />
                        Video
                      </Badge>
                    )}
                  </div>
                  {item.receptionistName && (
                    <p className="text-xs text-muted-foreground mt-0.5">via R. {item.receptionistName}</p>
                  )}
                </div>

                <Badge
                  className={cn(
                    'text-[10px] px-1.5 py-0 shrink-0',
                    statusColors[item.status] || 'bg-gray-100 text-gray-700'
                  )}
                >
                  {item.status === 'Visited' ? 'In Progress' : item.status}
                </Badge>

                {/* No-show action (Phase 4 — waiting rows) */}
                {item.status === 'Approve' && <NoShowButton bookingId={item.id} />}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call Next Patient Button */}
      {waitingItems.length > 0 && (
        <div className="flex flex-col items-center gap-1.5">
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-base font-semibold shadow-lg shadow-teal-600/20"
            disabled={inConsultationItems.length > 0 || callNextMutation.isPending || isPaused}
            title={isPaused ? 'Queue is paused — resume the queue to call the next patient' : undefined}
            onClick={() => {
              if (!nextPatient) return
              prefetchBrief(nextPatient.id)
              callNextMutation.mutate(nextPatient.id)
            }}
          >
            {callNextMutation.isPending ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Calling...</>
            ) : (
              <>
                <UserPlus className="h-5 w-5 mr-2" />
                {isPaused
                  ? 'Queue is paused'
                  : inConsultationItems.length > 0
                    ? 'Patient in consultation'
                    : `Call Next Patient${nextPatient?.tokenNumber ? ` (${nextPatient.tokenNumber})` : ''}`}
              </>
            )}
          </Button>
          {isPaused && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Queue is paused — resume the queue to call the next patient
            </p>
          )}
        </div>
      )}

      {/* Dr. Copilot — auto pre-visit brief on Call Next */}
      <PreVisitBriefSheet
        bookingId={briefBookingId}
        onClose={() => setBriefBookingId(null)}
      />
    </motion.div>
  )
}

// ─── No-Show Button (two-click confirm) ─────────────────────────────

function NoShowButton({ bookingId }: { bookingId: string }) {
  const queryClient = useQueryClient()
  const [confirming, setConfirming] = useState(false)

  // Reset the confirm state after 3s if not acted on
  useEffect(() => {
    if (!confirming) return
    const t = setTimeout(() => setConfirming(false), 3000)
    return () => clearTimeout(t)
  }, [confirming])

  const noShowMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/dashboard/doctor/appointments/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'NoShow' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to mark no-show')
      }
      return data
    },
    onSuccess: () => {
      toast.success('Marked as no-show')
      setConfirming(false)
      queryClient.invalidateQueries({ queryKey: ['doctor-opd-queue'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-stats'] })
    },
    onError: (err: Error) => {
      setConfirming(false)
      toast.error(err.message || 'Failed to mark no-show')
    },
  })

  return (
    <Button
      type="button"
      size="sm"
      variant={confirming ? 'default' : 'outline'}
      disabled={noShowMutation.isPending}
      title={confirming ? 'Click again to confirm no-show' : 'Mark as no-show'}
      onClick={(e) => {
        e.stopPropagation()
        if (noShowMutation.isPending) return
        if (!confirming) {
          setConfirming(true)
          return
        }
        noShowMutation.mutate()
      }}
      className={cn(
        'h-7 shrink-0 gap-1 rounded-full px-2.5 text-[10px]',
        confirming
          ? 'bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700'
          : 'border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/40'
      )}
    >
      {noShowMutation.isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
      ) : (
        <UserX className="h-3 w-3" aria-hidden="true" />
      )}
      {confirming ? 'Confirm?' : 'No-show'}
    </Button>
  )
}

// ─── Skeleton ───────────────────────────────────────────────────────

function DoctorDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hospital banner skeleton (show by default — will collapse if no hospital) */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
          <div className="space-y-1.5">
            <div className="h-5 w-48 animate-pulse rounded bg-muted" />
            <div className="h-3 w-36 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 animate-pulse rounded-xl bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
            <div className="mt-3 h-8 w-20 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-4 w-28 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <div className="h-5 w-36 animate-pulse rounded bg-muted" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-6 w-14 animate-pulse rounded-full bg-muted" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-4 h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}