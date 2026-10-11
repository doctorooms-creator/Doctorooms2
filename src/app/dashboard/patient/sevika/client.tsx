'use client'

/**
 * Sevika — AI Nurse home screen (patient side).
 * AI-NURSE-PLAN.md P1 MVP + P2: today's dose timeline + adherence stats +
 * add/import medicines + AI diet card + personalised slot times +
 * photo-RX VLM parse (P2) + weekly report card (P2).
 */

import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  Activity,
  AlertCircle,
  BarChart3,
  Camera,
  Check,
  Clock,
  Flame,
  Heart,
  Loader2,
  Pill,
  Plus,
  RefreshCw,
  Settings2,
  SkipForward,
  Sparkles,
  Timer,
  Upload,
  Utensils,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

// ============ TYPES ============

interface SevikaDose {
  id: string
  slot: string
  dueAt: string
  status: string // Pending | Reminded | Taken | Skipped | Snoozed | Missed
  schedule: { id: string; medicineName: string; dose: string; instructions: string }
}

interface MedicineRow {
  id: string
  medicineName: string
  dose: string
  instructions: string
  morning: number
  afternoon: number
  evening: number
  durationDays: number
  startDate: string
}

interface Adherence {
  todayTotal: number
  todayTaken: number
  todayPending: number
  todayMissed: number
  weekTotal: number
  weekTaken: number
  streakDays: number
  scorePct: number
}

interface DietDay {
  morning: string
  breakfast: string
  lunch: string
  evening: string
  dinner: string
  note?: string
}

interface DietData {
  planId: string
  medicinesSummary: string
  createdAt: string
  plan: { summary: string; disclaimer: string; days: DietDay[]; fallback?: boolean }
}

interface TodayResponse {
  doses: SevikaDose[]
  medicines: MedicineRow[]
  adherence: Adherence
  diet: DietData | null
  slotTimes: { morning: string; afternoon: string; evening: string }
}

interface PrescriptionRow {
  id: string
  disease: string
  doctorName: string
  bookingDate: string | null
  medicinesCount: number
  medicines: { id: string; medicine: string; morning: number; afternoon: number; evening: number }[]
}

// P2: photo-RX parse draft (VLM extracted, patient confirms before saving)
interface DraftMedicine {
  name: string
  dose: string
  morning: number
  afternoon: number
  evening: number
  durationDays: number
  instructions: string
  isSos: boolean
}

// P2: weekly report card
interface WeekDayRow {
  date: string
  dateISO: string
  total: number
  taken: number
  missed: number
  skipped: number
  pct: number
}

interface WeeklyReportData {
  generatedAt: string
  weekTotal: number
  weekTaken: number
  weekMissed: number
  weekSkipped: number
  scorePct: number
  streakDays: number
  bestDay: string | null
  worstDay: string | null
  days: WeekDayRow[]
  medicines: string[]
  narrative: string
  narrativeAI: boolean
}

const SLOT_META: Record<string, { hi: string; icon: string; timeKey: 'morning' | 'afternoon' | 'evening' }> = {
  morning: { hi: 'सुबह', icon: '🌅', timeKey: 'morning' },
  afternoon: { hi: 'दोपहर', icon: '☀️', timeKey: 'afternoon' },
  evening: { hi: 'रात', icon: '🌙', timeKey: 'evening' },
}
const SLOT_ORDER = ['morning', 'afternoon', 'evening']

// ============ COMPONENT ============

export default function PatientSevikaClient() {
  const queryClient = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [timesOpen, setTimesOpen] = useState(false)
  const [photoOpen, setPhotoOpen] = useState(false)

  const {
    data,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<TodayResponse>({
    queryKey: ['sevika-today'],
    queryFn: () => fetch('/api/dashboard/patient/sevika/today').then((r) => r.json()),
    refetchInterval: 60_000, // gentle live refresh
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['sevika-today'] })
    queryClient.invalidateQueries({ queryKey: ['sevika-schedules'] })
  }

  // ── mutations ──
  const doseAction = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      fetch(`/api/dashboard/patient/sevika/doses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || 'Failed')
        return r.json()
      }),
    onSuccess: (_d, v) => {
      if (v.action === 'taken') toast.success('Bahut accha! Dawai note kar li ✅')
      if (v.action === 'snooze') toast.info('Theek hai — 10 minute baad yaad dilayenge ⏰')
      if (v.action === 'skipped') toast.info('Skip note kar liya')
      invalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const dietGenerate = useMutation({
    mutationFn: () =>
      fetch('/api/dashboard/patient/sevika/diet', { method: 'POST' }).then(async (r) => {
        if (!r.ok) throw new Error('Diet plan banane me dikkat aayi')
        return r.json()
      }),
    onSuccess: (d: { usedFallback?: boolean }) => {
      if (d.usedFallback)
        toast.info('AI abhi busy hai — default healthy diet plan dikha rahe hain')
      else toast.success('AI diet plan taiyar hai! 🍎')
      invalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  // ── derived ──
  const adherence = data?.adherence
  const slotTimes = data?.slotTimes || { morning: '08:00', afternoon: '14:00', evening: '21:00' }
  const todayDoses = data?.doses || []
  const medicines = data?.medicines || []
  const diet = data?.diet

  const bySlot: Record<string, SevikaDose[]> = {}
  for (const d of todayDoses) {
    ;(bySlot[d.slot] = bySlot[d.slot] || []).push(d)
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
              <Pill className="h-5 w-5" />
            </span>
            Sevika
            <Badge className="border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-400">
              Aapki AI Nurse
            </Badge>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dawai ka time, diet ka khayal — sab yaad rakha jayega 🩺
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('mr-1 h-4 w-4', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => setTimesOpen(true)}>
            <Settings2 className="mr-1 h-4 w-4" /> Time Settings
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPhotoOpen(true)}>
            <Camera className="mr-1 h-4 w-4" /> Photo se Add
          </Button>
          <Button
            size="sm"
            className="bg-teal-600 text-white hover:bg-teal-700"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" /> Dawai Add Karein
          </Button>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <StatCard
              icon={<Check className="h-4 w-4" />}
              label="Aaj ki Dawai"
              value={`${adherence?.todayTaken ?? 0}/${adherence?.todayTotal ?? 0}`}
              sub="le li"
              tone="teal"
            />
            <StatCard
              icon={<Flame className="h-4 w-4" />}
              label="Streak"
              value={`${adherence?.streakDays ?? 0} din`}
              sub="bina miss"
              tone="amber"
            />
            <StatCard
              icon={<Activity className="h-4 w-4" />}
              label="7-din Score"
              value={`${adherence?.scorePct ?? 100}%`}
              sub="adherence"
              tone="emerald"
            />
            <StatCard
              icon={<Pill className="h-4 w-4" />}
              label="Active Dawai"
              value={`${medicines.length}`}
              sub="chalu course"
              tone="rose"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── LEFT: today's timeline ── */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-teal-600" /> Aaj ki Timeline
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-teal-700 dark:text-teal-400"
                onClick={() => setImportOpen(true)}
              >
                <Upload className="mr-1 h-4 w-4" /> Rx se Import
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))
            ) : todayDoses.length === 0 ? (
              <EmptyTimeline
                onAdd={() => setAddOpen(true)}
                onImport={() => setImportOpen(true)}
                onPhoto={() => setPhotoOpen(true)}
              />
            ) : (
              SLOT_ORDER.map((slot) => {
                const doses = bySlot[slot] || []
                const meta = SLOT_META[slot]
                return (
                  <div key={slot}>
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <span className="text-lg">{meta.icon}</span>
                      {meta.hi}
                      <span className="text-xs font-normal text-muted-foreground">
                        {slotTimes[meta.timeKey]}
                      </span>
                      {doses.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-auto text-[10px]"
                        >{`${doses.filter((d) => d.status === 'Taken').length}/${doses.length}`}</Badge>
                      )}
                    </div>
                    {doses.length === 0 ? (
                      <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
                        Is slot me koi dawai nahi hai
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {doses.map((dose) => (
                          <DoseCard
                            key={dose.id}
                            dose={dose}
                            busy={doseAction.isPending}
                            onAction={(action) =>
                              doseAction.mutate({ id: dose.id, action })
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* ── RIGHT column ── */}
        <div className="space-y-6">
          {/* Active medicines */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Pill className="h-4 w-4 text-teal-600" /> Meri Dawaiya
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-32 rounded-xl" />
              ) : medicines.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Abhi koi active course nahi hai. Doctor ki prescription import karein ya khud add karein.
                </p>
              ) : (
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {medicines.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{m.medicineName}</p>
                        <div className="flex gap-1 text-[10px]">
                          {SLOT_ORDER.map((s) =>
                            [m.morning, m.afternoon, m.evening][SLOT_ORDER.indexOf(s)] === 1 ? (
                              <span key={s} title={SLOT_META[s].hi}>
                                {SLOT_META[s].icon}
                              </span>
                            ) : null
                          )}
                        </div>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {[m.dose, m.instructions].filter(Boolean).join(' • ') ||
                          `${m.durationDays} din ka course`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* P2: weekly report card */}
          <WeeklyReportCard />

          {/* AI Diet plan */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-teal-600" /> AI Diet Plan
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8"
                  disabled={dietGenerate.isPending}
                  onClick={() => dietGenerate.mutate()}
                >
                  {dietGenerate.isPending ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-1 h-4 w-4" />
                  )}
                  {diet ? 'Banayein Dobara' : 'Plan Banayein'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!diet ? (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Aapki dawaiyon ke hisaab se 7-din ka desi diet plan AI banayega.</p>
                  <Button
                    size="sm"
                    className="w-full bg-teal-600 text-white hover:bg-teal-700"
                    disabled={dietGenerate.isPending}
                    onClick={() => dietGenerate.mutate()}
                  >
                    {dietGenerate.isPending ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-1 h-4 w-4" />
                    )}
                    Diet Plan Generate Karein
                  </Button>
                </div>
              ) : (
                <DietPlanCard diet={diet} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Dialogs ── */}
      <AddMedicineDialog open={addOpen} onOpenChange={setAddOpen} onDone={invalidate} />
      <PhotoRxDialog open={photoOpen} onOpenChange={setPhotoOpen} onDone={invalidate} />
      <ImportPrescriptionDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onDone={invalidate}
      />
      <SlotTimesDialog
        open={timesOpen}
        onOpenChange={setTimesOpen}
        current={slotTimes}
        onDone={invalidate}
      />
    </div>
  )
}

// ============ SUB-COMPONENTS ============

function StatCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  tone: 'teal' | 'amber' | 'emerald' | 'rose'
}) {
  const tones: Record<string, string> = {
    teal: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card p-4"
    >
      <div className="flex items-center gap-2">
        <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', tones[tone])}>
          {icon}
        </span>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </motion.div>
  )
}

function statusBadge(status: string) {
  switch (status) {
    case 'Taken':
      return <Badge className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">Le Li ✓</Badge>
    case 'Skipped':
    case 'Missed':
      return <Badge variant="destructive">Miss</Badge>
    case 'Reminded':
      return <Badge className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">Yaad dilaya</Badge>
    case 'Snoozed':
      return <Badge variant="secondary">Snooze</Badge>
    default:
      return <Badge variant="outline">Baaki</Badge>
  }
}

function DoseCard({
  dose,
  busy,
  onAction,
}: {
  dose: SevikaDose
  busy: boolean
  onAction: (action: string) => void
}) {
  const done = dose.status === 'Taken'
  const gone = dose.status === 'Skipped' || dose.status === 'Missed'
  return (
    <motion.div
      layout
      className={cn(
        'rounded-xl border p-3 transition-all',
        done && 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20',
        gone && 'opacity-60'
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white',
                done ? 'bg-emerald-600' : gone ? 'bg-muted' : 'bg-teal-600'
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : <Pill className="h-3.5 w-3.5" />}
            </span>
            <span className="truncate">{dose.schedule.medicineName}</span>
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {format(new Date(dose.dueAt), 'hh:mm a')}
            </span>
            {dose.schedule.dose && <span>• {dose.schedule.dose}</span>}
            {dose.schedule.instructions && (
              <span className="italic">• {dose.schedule.instructions}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {statusBadge(dose.status)}
          {!done && !gone && (
            <div className="flex gap-1">
              <Button
                size="sm"
                className="h-8 bg-emerald-600 px-3 text-xs text-white hover:bg-emerald-700"
                disabled={busy}
                onClick={() => onAction('taken')}
              >
                <Check className="mr-1 h-3.5 w-3.5" /> Li
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2 text-xs"
                disabled={busy}
                title="10 minute baad yaad dilaye"
                onClick={() => onAction('snooze')}
              >
                <Timer className="mr-1 h-3.5 w-3.5" /> 10m
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs text-muted-foreground"
                disabled={busy}
                onClick={() => onAction('skipped')}
              >
                <SkipForward className="mr-1 h-3.5 w-3.5" /> Skip
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function EmptyTimeline({
  onAdd,
  onImport,
  onPhoto,
}: {
  onAdd: () => void
  onImport: () => void
  onPhoto: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-10 text-center">
      <span className="text-4xl">🩺</span>
      <div>
        <p className="font-semibold">Aaj koi dawai schedule nahi hai</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Doctor ki prescription import karein ya khud dawai add karein —
          Sevika time pe yaad dilayegi.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700" onClick={onAdd}>
          <Plus className="mr-1 h-4 w-4" /> Dawai Add Karein
        </Button>
        <Button size="sm" variant="outline" onClick={onPhoto}>
          <Camera className="mr-1 h-4 w-4" /> Rx ki Photo
        </Button>
        <Button size="sm" variant="outline" onClick={onImport}>
          <Upload className="mr-1 h-4 w-4" /> Rx Import
        </Button>
      </div>
    </div>
  )
}

function DietPlanCard({ diet }: { diet: DietData }) {
  const [activeDay, setActiveDay] = useState(0)
  const days = diet.plan.days
  const day = days[Math.min(activeDay, days.length - 1)]
  const meals: Array<[string, string]> = [
    ['🌅 Subah', day.morning],
    ['🥣 Nashta', day.breakfast],
    ['🍛 Lunch', day.lunch],
    ['🍎 Shaam', day.evening],
    ['🍽️ Dinner', day.dinner],
  ]
  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-muted-foreground">{diet.plan.summary}</p>
      <div className="flex flex-wrap gap-1">
        {days.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
              i === activeDay
                ? 'bg-teal-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            )}
          >
            Din {i + 1}
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        {meals.map(([label, val]) =>
          val ? (
            <div key={label} className="flex items-start justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <span className="shrink-0 text-xs font-medium text-foreground">{label}</span>
              <span className="text-right text-xs text-muted-foreground">{val}</span>
            </div>
          ) : null
        )}
        {day.note && (
          <p className="px-1 text-[11px] italic text-muted-foreground">💡 {day.note}</p>
        )}
      </div>
      <p className="flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {diet.plan.disclaimer}
      </p>
    </div>
  )
}

// ============ DIALOGS ============

function AddMedicineDialog({
  open,
  onOpenChange,
  onDone,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onDone: () => void
}) {
  const [name, setName] = useState('')
  const [dose, setDose] = useState('')
  const [instructions, setInstructions] = useState('')
  const [slots, setSlots] = useState({ morning: true, afternoon: false, evening: true })
  const [duration, setDuration] = useState(5)
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!name.trim()) {
      toast.error('Medicine ka naam likhiye')
      return
    }
    if (!slots.morning && !slots.afternoon && !slots.evening) {
      toast.error('Kam se kam ek slot chuniye')
      return
    }
    setSaving(true)
    try {
      const r = await fetch('/api/dashboard/patient/sevika/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineName: name,
          dose,
          instructions,
          morning: slots.morning ? 1 : 0,
          afternoon: slots.afternoon ? 1 : 0,
          evening: slots.evening ? 1 : 0,
          durationDays: duration,
        }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Failed')
      toast.success(`${name} add ho gayi — ${data.doses} reminders set! 💊`)
      setName('')
      setDose('')
      setInstructions('')
      setSlots({ morning: true, afternoon: false, evening: true })
      setDuration(5)
      onOpenChange(false)
      onDone()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-4 w-4 text-teal-600" /> Nayi Dawai Add Karein
          </DialogTitle>
          <DialogDescription>
            Sevika khud reminders set kar legi — subah / dopahar / raat ke time pe.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="med-name">Medicine ka naam *</Label>
            <Input
              id="med-name"
              placeholder="e.g. Paracetamol 500mg"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="med-dose">Dose</Label>
              <Input
                id="med-dose"
                placeholder="e.g. 1 tablet"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="med-duration">Kitne din *</Label>
              <Input
                id="med-duration"
                type="number"
                min={1}
                max={90}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Kab lena hai *</Label>
            <div className="flex flex-wrap gap-4 pt-1">
              {(['morning', 'afternoon', 'evening'] as const).map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={slots[s]}
                    onCheckedChange={(v) => setSlots((p) => ({ ...p, [s]: v === true }))}
                  />
                  {SLOT_META[s].icon} {SLOT_META[s].hi}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="med-instr">Instructions (optional)</Label>
            <Input
              id="med-instr"
              placeholder="e.g. khane ke baad, khoob paani ke saath"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-teal-600 text-white hover:bg-teal-700"
            onClick={submit}
            disabled={saving}
          >
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}
            Add Karein
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ImportPrescriptionDialog({
  open,
  onOpenChange,
  onDone,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onDone: () => void
}) {
  const [duration, setDuration] = useState(5)
  const [importing, setImporting] = useState<string | null>(null)

  const { data, isLoading } = useQuery<{ prescriptions: PrescriptionRow[] }>({
    queryKey: ['sevika-rx-list'],
    queryFn: () =>
      fetch('/api/dashboard/patient/prescriptions?pageSize=10').then((r) => r.json()),
    enabled: open,
  })

  const importRx = async (prescriptionId: string) => {
    setImporting(prescriptionId)
    try {
      const r = await fetch('/api/dashboard/patient/sevika/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId, durationDays: duration }),
      })
      const res = await r.json()
      if (!r.ok) throw new Error(res.error || 'Import failed')
      toast.success(`${res.imported} medicines import ho gayi — ${res.doses} reminders set! 💊`)
      onOpenChange(false)
      onDone()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setImporting(null)
    }
  }

  const rxs = data?.prescriptions || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-teal-600" /> Prescription se Import
          </DialogTitle>
          <DialogDescription>
            Doctor ke Rx ki dawaiyaan select karein — Sevika schedule khud bana legi.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Course duration:</span>
          {[3, 5, 7, 10].map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                d === duration
                  ? 'bg-teal-600 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              )}
            >
              {d} din
            </button>
          ))}
        </div>

        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {isLoading ? (
            <Skeleton className="h-20 rounded-xl" />
          ) : rxs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Koi prescription nahi mili. Pehle doctor visit ke baad try karein.
            </p>
          ) : (
            rxs.map((rx) => (
              <div key={rx.id} className="rounded-xl border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {rx.disease || 'Prescription'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Dr. {rx.doctorName}
                      {rx.bookingDate ? ` • ${format(new Date(rx.bookingDate), 'dd MMM yyyy')}` : ''}
                      {' • '}
                      {rx.medicinesCount} medicines
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 shrink-0 border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-400 dark:hover:bg-teal-950/40"
                    disabled={importing === rx.id}
                    onClick={() => importRx(rx.id)}
                  >
                    {importing === rx.id ? (
                      <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="mr-1 h-3.5 w-3.5" />
                    )}
                    Import
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {rx.medicines
                    .filter((m) => m.morning || m.afternoon || m.evening)
                    .slice(0, 5)
                    .map((m) => (
                      <Badge key={m.id} variant="secondary" className="text-[10px] font-normal">
                        {m.medicine || 'Medicine'}
                      </Badge>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SlotTimesDialog({
  open,
  onOpenChange,
  current,
  onDone,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  current: { morning: string; afternoon: string; evening: string }
  onDone: () => void
}) {
  const [times, setTimes] = useState(current)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const r = await fetch('/api/dashboard/patient/sevika/times', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(times),
      })
      const res = await r.json()
      if (!r.ok) throw new Error(res.error || 'Failed')
      toast.success('Time settings save ho gayi ✓')
      onOpenChange(false)
      onDone()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-teal-600" /> Apne Time Set Karein
          </DialogTitle>
          <DialogDescription>
            Nayi dawaiyon ke reminders in times pe aayenge (aapki daily routine ke hisaab se).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {(['morning', 'afternoon', 'evening'] as const).map((s) => (
            <div key={s} className="flex items-center justify-between gap-3">
              <Label className="flex items-center gap-2">
                {SLOT_META[s].icon} {SLOT_META[s].hi}
              </Label>
              <Input
                type="time"
                className="w-32"
                value={times[s]}
                onChange={(e) => setTimes((p) => ({ ...p, [s]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="mr-1 h-4 w-4" /> Cancel
          </Button>
          <Button
            className="bg-teal-600 text-white hover:bg-teal-700"
            onClick={save}
            disabled={saving}
          >
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Check className="mr-1 h-4 w-4" />}
            Save Karein
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============ P2: PHOTO-RX DIALOG (VLM parse → patient confirms) ============

function PhotoRxDialog({
  open,
  onOpenChange,
  onDone,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onDone: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null) // dataURL (display)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState('image/jpeg')
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [note, setNote] = useState('')
  const [drafts, setDrafts] = useState<DraftMedicine[] | null>(null)

  const reset = () => {
    setPreview(null)
    setImageBase64(null)
    setDrafts(null)
    setNote('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const pickFile = (f: File | null) => {
    if (!f) return
    if (!f.type.startsWith('image/')) {
      toast.error('Sirf photo upload karein (JPG / PNG)')
      return
    }
    // CSP note: the app's img-src allows data: but NOT blob:, so we read the
    // file via FileReader (data URL) and downscale through a canvas — every
    // image in this flow stays a data: URL.
    const reader = new FileReader()
    reader.onerror = () => toast.error('Photo load nahi hui — dusri try karein')
    reader.onload = () => {
      const raw = typeof reader.result === 'string' ? reader.result : null
      if (!raw) {
        toast.error('Photo load nahi hui — dusri try karein')
        return
      }
      const img = document.createElement('img')
      img.onload = () => {
        try {
          const max = 1600
          const scale = Math.min(1, max / Math.max(img.width, img.height))
          const canvas = document.createElement('canvas')
          canvas.width = Math.max(1, Math.round(img.width * scale))
          canvas.height = Math.max(1, Math.round(img.height * scale))
          const ctx = canvas.getContext('2d')
          if (!ctx) throw new Error('canvas')
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
          setPreview(dataUrl)
          setImageBase64(dataUrl.split(',')[1] || '')
          setMimeType('image/jpeg')
          setDrafts(null)
          setNote('')
        } catch {
          toast.error('Photo process nahi hui — dusri photo try karein')
        }
      }
      img.onerror = () => toast.error('Photo load nahi hui — dusri try karein')
      img.src = raw
    }
    reader.readAsDataURL(f)
  }

  const parse = async () => {
    if (!imageBase64) return
    setParsing(true)
    try {
      const r = await fetch('/api/dashboard/patient/sevika/parse-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType }),
      })
      const res = await r.json()
      if (!r.ok) throw new Error(res.error || 'Parse fail ho gaya')
      setDrafts(res.medicines as DraftMedicine[])
      const dn = String(res.doctorName || '').replace(/^dr\.?\s*/i, '')
      const head = dn ? `Dr. ${dn}` : ''
      setNote([head, res.patientNote].filter(Boolean).join(' — '))
      toast.success(`${res.medicines.length} dawaiyaan padh li — check karke confirm karein 📋`)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setParsing(false)
    }
  }

  const updateDraft = (i: number, patch: Partial<DraftMedicine>) => {
    setDrafts((p) => (p ? p.map((d, idx) => (idx === i ? { ...d, ...patch } : d)) : p))
  }

  const toggleSlot = (i: number, slot: 'morning' | 'afternoon' | 'evening') => {
    setDrafts((p) =>
      p
        ? p.map((d, idx) =>
            idx === i ? { ...d, [slot]: d[slot] === 1 ? 0 : 1, isSos: false } : d
          )
        : p
    )
  }

  const removeDraft = (i: number) => {
    setDrafts((p) => (p ? p.filter((_, idx) => idx !== i) : p))
  }

  const confirm = async () => {
    if (!drafts) return
    const schedulable = drafts.filter((d) => d.morning + d.afternoon + d.evening > 0)
    if (schedulable.length === 0) {
      toast.error('Kam se kam ek dawai ka slot chuniye (सुबह / दोपहर / रात)')
      return
    }
    setSaving(true)
    let ok = 0
    let doses = 0
    try {
      for (const d of schedulable) {
        const r = await fetch('/api/dashboard/patient/sevika/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            medicineName: d.name,
            dose: d.dose,
            instructions: d.instructions,
            morning: d.morning,
            afternoon: d.afternoon,
            evening: d.evening,
            durationDays: d.durationDays,
          }),
        })
        if (r.ok) {
          const res = await r.json()
          ok++
          doses += res.doses || 0
        }
      }
      if (ok === 0) throw new Error('Koi dawai add nahi ho payi — phir try karein')
      toast.success(`${ok} dawaiyaan add ho gayi — ${doses} reminders set! 💊`)
      onOpenChange(false)
      reset()
      onDone()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset()
        onOpenChange(v)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-teal-600" /> Photo se Dawai Add Karein
          </DialogTitle>
          <DialogDescription>
            Prescription ya dawai ke packet ki photo upload karein — AI padh kar
            draft bana dega, aap confirm kareinge.
          </DialogDescription>
        </DialogHeader>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] || null)}
        />

        {/* STEP 1: pick photo */}
        {!preview && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-teal-300 bg-teal-50/50 px-4 py-10 text-center transition-colors hover:bg-teal-50 dark:border-teal-800 dark:bg-teal-950/20 dark:hover:bg-teal-950/40"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-white">
              <Camera className="h-6 w-6" />
            </span>
            <p className="text-sm font-semibold">Photo lein ya choose karein</p>
            <p className="text-xs text-muted-foreground">
              Paper prescription / medicine strip — saaf aur seedhi photo behtar padhi jaati hai
            </p>
          </button>
        )}

        {/* STEP 2: preview + parse */}
        {preview && !drafts && (
          <div className="space-y-3">
            <img
              src={preview}
              alt="Uploaded prescription preview"
              className="max-h-64 w-full rounded-xl border object-contain"
            />
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-teal-600 text-white hover:bg-teal-700"
                disabled={parsing}
                onClick={parse}
              >
                {parsing ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Padh rahe hain…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1 h-4 w-4" /> Padhna Shuru Karein
                  </>
                )}
              </Button>
              <Button variant="outline" disabled={parsing} onClick={() => fileRef.current?.click()}>
                <RefreshCw className="mr-1 h-4 w-4" /> Badalna
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: review drafts */}
        {drafts && (
          <div className="space-y-3">
            {note && (
              <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                📋 {note}
              </p>
            )}
            <p className="flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              AI ne photo se padha hai — galat kuch ho to sudhaar ke hi confirm karein.
              Reminder sirf aapke confirm karne ke baad set hoga.
            </p>

            <div className="max-h-[45vh] space-y-3 overflow-y-auto pr-1">
              {drafts.map((d, i) => (
                <div key={i} className="rounded-xl border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <Input
                      value={d.name}
                      onChange={(e) => updateDraft(i, { name: e.target.value })}
                      className="h-8 flex-1 text-sm font-semibold"
                      aria-label="Medicine name"
                    />
                    <button
                      type="button"
                      onClick={() => removeDraft(i)}
                      className="mt-1 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                      title="Hataayein"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Input
                      value={d.dose}
                      onChange={(e) => updateDraft(i, { dose: e.target.value })}
                      placeholder="Dose (e.g. 1 tablet)"
                      className="h-8 text-xs"
                      aria-label="Dose"
                    />
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={d.durationDays}
                      onChange={(e) =>
                        updateDraft(i, { durationDays: parseInt(e.target.value) || 1 })
                      }
                      placeholder="Din"
                      className="h-8 text-xs"
                      aria-label="Duration in days"
                    />
                  </div>
                  {d.isSos ? (
                    <p className="mt-2 rounded-lg bg-muted/60 px-2 py-1.5 text-[11px] text-muted-foreground">
                      🆘 SOS dawai — reminder set nahi hoga (zaroorat padne pe leni hai)
                    </p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(['morning', 'afternoon', 'evening'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSlot(i, s)}
                          className={cn(
                            'rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
                            d[s] === 1
                              ? 'bg-teal-600 text-white'
                              : 'bg-muted text-muted-foreground hover:bg-muted/70'
                          )}
                        >
                          {SLOT_META[s].icon} {SLOT_META[s].hi}
                        </button>
                      ))}
                    </div>
                  )}
                  <Input
                    value={d.instructions}
                    onChange={(e) => updateDraft(i, { instructions: e.target.value })}
                    placeholder="Instructions (optional) — e.g. khane ke baad"
                    className="mt-2 h-8 text-xs"
                    aria-label="Instructions"
                  />
                </div>
              ))}
              {drafts.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Koi dawai draft me nahi bachi.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-teal-600 text-white hover:bg-teal-700"
                disabled={saving || drafts.filter((d) => d.morning + d.afternoon + d.evening > 0).length === 0}
                onClick={confirm}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Add ho rahi hain…
                  </>
                ) : (
                  <>
                    <Check className="mr-1 h-4 w-4" /> Confirm kar Add Karein
                  </>
                )}
              </Button>
              <Button variant="outline" disabled={saving} onClick={reset}>
                <Camera className="mr-1 h-4 w-4" /> Nayi Photo
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ============ P2: WEEKLY REPORT CARD ============

function WeeklyReportCard() {
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  const { data, isLoading } = useQuery<WeeklyReportData>({
    queryKey: ['sevika-weekly'],
    queryFn: () =>
      fetch('/api/dashboard/patient/sevika/weekly-report').then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || 'Failed')
        return r.json()
      }),
    staleTime: 10 * 60_000,
    retry: 1,
  })

  const refresh = async () => {
    setRefreshing(true)
    try {
      const r = await fetch('/api/dashboard/patient/sevika/weekly-report?refresh=1')
      if (!r.ok) throw new Error('Report banane me dikkat aayi')
      await queryClient.invalidateQueries({ queryKey: ['sevika-weekly'] })
      toast.success('Nayi hafta report taiyar hai 📝')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setRefreshing(false)
    }
  }

  const score = data?.scorePct ?? 0
  const scoreTone =
    score >= 90
      ? 'text-emerald-600 dark:text-emerald-400'
      : score >= 70
        ? 'text-teal-600 dark:text-teal-400'
        : score >= 50
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-rose-600 dark:text-rose-400'

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-teal-600" /> Hafta Report
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            disabled={refreshing || isLoading}
            onClick={refresh}
            title="AI se nayi report banwaein"
          >
            {refreshing ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-1 h-4 w-4" />
            )}
            Nayi Report
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 rounded-xl" />
        ) : !data || data.weekTotal === 0 ? (
          <p className="text-sm text-muted-foreground">
            Is hafte koi dose record nahi hui. Dawai add karein — agli hafte
            yahan aapka scorecard aayega. 📊
          </p>
        ) : (
          <div className="space-y-4">
            {/* Score + streak */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={cn('text-3xl font-bold tracking-tight', scoreTone)}>{score}%</p>
                <p className="text-[11px] text-muted-foreground">
                  {data.weekTaken}/{data.weekTotal} doses time pe
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-amber-500" /> {data.streakDays} din streak
                </span>
                {data.bestDay && <span>🏅 Best: {data.bestDay}</span>}
                {data.worstDay && data.worstDay !== data.bestDay && <span>📉 Kam: {data.worstDay}</span>}
              </div>
            </div>

            {/* Day-wise bars */}
            <div className="flex items-end justify-between gap-1">
              {data.days.map((d) => {
                const inactive = d.total === 0
                const barTone = inactive
                  ? 'bg-muted'
                  : d.pct >= 90
                    ? 'bg-emerald-500'
                    : d.pct >= 60
                      ? 'bg-teal-500'
                      : d.pct >= 30
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                return (
                  <div key={d.dateISO} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[9px] font-medium text-muted-foreground">
                      {d.total > 0 ? `${d.taken}/${d.total}` : '—'}
                    </span>
                    <div className="flex h-16 w-full items-end justify-center rounded-md bg-muted/60 dark:bg-muted/30">
                      <motion.div
                        initial={{ height: 4 }}
                        animate={{ height: `${Math.max(6, d.pct)}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className={cn('w-full rounded-md', barTone)}
                        style={{ maxHeight: '100%' }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{d.date}</span>
                  </div>
                )
              })}
            </div>

            {/* Nurse narrative */}
            <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3 dark:border-teal-900 dark:bg-teal-950/30">
              <p className="text-xs leading-relaxed text-foreground/90">
                <span className="mr-1" aria-hidden>🩺</span>
                {data.narrative}
              </p>
              <p className="mt-1.5 text-[10px] text-muted-foreground">
                {data.narrativeAI ? 'Sevika ki taraf se — AI summary' : 'Sevika ki taraf se'} •
                Koi bhi dawai change karne se pehle doctor se salah lein.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
