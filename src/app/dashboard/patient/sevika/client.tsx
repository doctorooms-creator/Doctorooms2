'use client'

/**
 * Sevika — AI Nurse home screen (patient side).
 * AI-NURSE-PLAN.md P1 MVP: today's dose timeline + adherence stats +
 * add/import medicines + AI diet card + personalised slot times.
 */

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  Activity,
  AlertCircle,
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
              <EmptyTimeline onAdd={() => setAddOpen(true)} onImport={() => setImportOpen(true)} />
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

function EmptyTimeline({ onAdd, onImport }: { onAdd: () => void; onImport: () => void }) {
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
      <div className="flex gap-2">
        <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700" onClick={onAdd}>
          <Plus className="mr-1 h-4 w-4" /> Dawai Add Karein
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
