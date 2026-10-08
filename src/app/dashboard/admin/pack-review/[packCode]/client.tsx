'use client'

/**
 * MBBS Dose-Review Console — single pack detail (admin).
 *
 * The reviewer's workspace: every medicine of the pack with its salt,
 * dose options, frequency and safety flags. One click per verdict:
 *   ✓ Verified (dose theek hai)
 *   ✗ Needs change (note ke saath — pack source me fix hone ke baad re-verdict)
 *
 * When all medicines are verified → "Complete Review" stamps the pack
 * as reviewed (reviewer name + timestamp) and strips the UNVERIFIED DOSE
 * notes from every doctor's installed copy of these medicines.
 */

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Loader2,
  ShieldCheck,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface MedicineRow {
  name: string
  salt: string
  doseOptions: string[]
  morning: number
  afternoon: number
  evening: number
  tab: number
  flags: {
    pregnancy: 'safe' | 'caution' | 'avoid' | 'na'
    schedule: string
    verified: boolean
    notes?: string
  } | null
  verdict: 'pending' | 'verified' | 'needs_change'
  notes: string | null
  reviewedAt: string | null
}

interface DetailResponse {
  pack: { code: string; title: string; tier: string; version: string; summary: string }
  review: { status: 'pending' | 'in_progress' | 'needs_changes' | 'reviewed'; reviewedByName: string | null; reviewedAt: string | null }
  medicines: MedicineRow[]
}

const PREG_STYLE: Record<string, string> = {
  safe: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  caution: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  avoid: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
}

function freq(m: MedicineRow): string {
  const parts: string[] = []
  if (m.morning) parts.push('Morning')
  if (m.afternoon) parts.push('Afternoon')
  if (m.evening) parts.push('Evening')
  return parts.join(' · ') || 'SOS'
}

export default function PackReviewDetailClient({ packCode }: { packCode: string }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'needs_change'>('pending')
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({})
  const [noteOpenFor, setNoteOpenFor] = useState<string | null>(null)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [reviewerName, setReviewerName] = useState('')

  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery<DetailResponse>({
    queryKey: ['admin-pack-review', packCode],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/admin/pack-review/${packCode}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Load failed')
      }
      return res.json()
    },
  })

  const verdictMutation = useMutation({
    mutationFn: async (vars: {
      medicineName: string
      verdict: 'verified' | 'needs_change' | 'pending'
      notes?: string
    }) => {
      const res = await fetch(`/api/dashboard/admin/pack-review/${packCode}/verdict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vars),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || !body.ok) throw new Error(body.error || 'Verdict save nahi hua')
      return body
    },
    onSuccess: (_r, vars) => {
      toast.success(
        vars.verdict === 'verified'
          ? `✓ ${vars.medicineName} verified`
          : vars.verdict === 'needs_change'
            ? `⚠ ${vars.medicineName} — correction note save ho gaya`
            : `${vars.medicineName} pending par wapas`
      )
      void queryClient.invalidateQueries({ queryKey: ['admin-pack-review'] })
      void refetch()
    },
    onError: (e: Error) => toast.error(e.message, { duration: 6000 }),
  })

  const completeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/dashboard/admin/pack-review/${packCode}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewedByName: reviewerName }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || !body.ok) throw new Error(body.error || 'Complete fail ho gaya')
      return body as { title: string; medicinesVerified: number; updatedRows: number }
    },
    onSuccess: (r) => {
      setCompleteOpen(false)
      toast.success(
        `🛡️ ${r.title} reviewed! ${r.medicinesVerified} medicines verified · ${r.updatedRows} installed rows clean hui`,
        { duration: 7000 }
      )
      void queryClient.invalidateQueries({ queryKey: ['admin-pack-review'] })
      void refetch()
    },
    onError: (e: Error) => toast.error(e.message, { duration: 8000 }),
  })

  const meds = data?.medicines ?? []
  const counts = useMemo(
    () => ({
      verified: meds.filter((m) => m.verdict === 'verified').length,
      needs_change: meds.filter((m) => m.verdict === 'needs_change').length,
      pending: meds.filter((m) => m.verdict === 'pending').length,
    }),
    [meds]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return meds.filter((m) => {
      if (filter !== 'all' && m.verdict !== filter) return false
      if (!q) return true
      return m.name.toLowerCase().includes(q) || m.salt.toLowerCase().includes(q)
    })
  }, [meds, search, filter])

  const reviewed = data?.review.status === 'reviewed'
  const allDecided = counts.pending === 0 && meds.length > 0
  const canComplete = allDecided && counts.needs_change === 0 && !reviewed

  const setVerdict = (m: MedicineRow, verdict: 'verified' | 'needs_change' | 'pending') => {
    if (verdict === 'needs_change') {
      setNoteOpenFor(m.name)
      return
    }
    verdictMutation.mutate({ medicineName: m.name, verdict })
  }

  const saveNote = () => {
    if (!noteOpenFor) return
    const note = (noteDraft[noteOpenFor] || '').trim()
    if (!note) {
      toast.error('Correction note likhna zaroori hai — kya change karna hai?')
      return
    }
    verdictMutation.mutate({ medicineName: noteOpenFor, verdict: 'needs_change', notes: note })
    setNoteOpenFor(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Link
          href="/dashboard/admin/pack-review"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          All packs
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 flex-wrap">
              <ClipboardCheck className="h-6 w-6 text-teal-600 shrink-0" />
              {data?.pack.title || packCode}
            </h1>
            {data && (
              <p className="text-sm text-muted-foreground mt-1">
                {data.pack.code} · v{data.pack.version} · {meds.length} medicines ·{' '}
                {data.pack.tier} tier
              </p>
            )}
          </div>
          <Button
            onClick={() => setCompleteOpen(true)}
            disabled={!canComplete || completeMutation.isPending}
            className="h-10 px-5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg shadow-emerald-600/20 cursor-pointer shrink-0"
            aria-label="Complete pack review"
          >
            {completeMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Completing…
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Complete Review
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress + status */}
      <Card className={reviewed ? 'border-emerald-200 dark:border-emerald-900' : ''}>
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {reviewed ? (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 font-medium">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Reviewed{data?.review.reviewedByName ? ` by ${data.review.reviewedByName}` : ''}
                </Badge>
              ) : data?.review.status === 'needs_changes' ? (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 font-medium">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Corrections pending — pack source fix hone ke baad re-verdict karein
                </Badge>
              ) : (
                <Badge variant="secondary" className="font-medium">
                  {counts.pending > 0 ? `${counts.pending} medicines pending` : 'Sab verdicts ho gaye'}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                ✓ {counts.verified} verified · ⚠ {counts.needs_change} flagged · ⏳ {counts.pending} pending
              </span>
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {meds.length - counts.pending}/{meds.length} decided
            </span>
          </div>
          <Progress
            value={meds.length ? ((meds.length - counts.pending) / meds.length) * 100 : 0}
            className="h-2"
            aria-label="Pack review progress"
          />
          {!canComplete && !reviewed && (
            <p className="text-xs text-muted-foreground">
              {counts.pending > 0
                ? 'Complete karne ke liye sab medicines ka verdict chahiye.'
                : counts.needs_change > 0
                  ? 'Jab tak corrections resolve nahi hote, pack review complete nahi ho sakta.'
                  : ''}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Medicine ya salt search karein…"
            className="pl-9 h-10"
            aria-label="Search medicines"
          />
        </div>
        <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1 self-start">
          {(
            [
              ['pending', `Pending (${counts.pending})`],
              ['needs_change', `Flagged (${counts.needs_change})`],
              ['verified', `Verified (${counts.verified})`],
              ['all', `All (${meds.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer',
                filter === key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-pressed={filter === key}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Medicine list */}
      <section aria-label="Medicine review list" className="flex flex-col gap-3">
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-8 w-36" />
              </CardContent>
            </Card>
          ))}

        {isError && (
          <Card className="border-destructive/50">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-destructive font-medium">Pack detail load nahi hui.</p>
              <Button variant="outline" className="mt-3 cursor-pointer" onClick={() => void refetch()}>
                Dobara try karein
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-medium">
                {filter === 'pending' && counts.pending === 0
                  ? 'Is pack me koi pending medicine nahi bachi! 🎉'
                  : 'Koi medicine is filter me nahi hai.'}
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading &&
          !isError &&
          filtered.map((m, idx) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.02, 0.25) }}
            >
              <Card
                className={cn(
                  m.verdict === 'verified' && 'border-emerald-200/70 dark:border-emerald-900/70 bg-emerald-50/30 dark:bg-emerald-950/20',
                  m.verdict === 'needs_change' && 'border-amber-200/70 dark:border-amber-900/70 bg-amber-50/30 dark:bg-amber-950/20'
                )}
              >
                <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{m.name}</span>
                      {m.flags?.pregnancy && m.flags.pregnancy !== 'na' && (
                        <Badge variant="outline" className={`text-[10px] ${PREG_STYLE[m.flags.pregnancy]}`}>
                          Preg: {m.flags.pregnancy}
                        </Badge>
                      )}
                      {m.flags?.schedule && m.flags.schedule !== 'na' && (
                        <Badge variant="outline" className="text-[10px]">
                          Sch: {m.flags.schedule}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate" title={m.salt}>
                      {m.salt}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        {m.doseOptions[0] || '—'}
                        {m.doseOptions.length > 1 ? ` (+${m.doseOptions.length - 1})` : ''}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        {freq(m)} · {m.tab}×
                      </Badge>
                      {m.notes && (
                        <span
                          className="text-[11px] text-amber-700 dark:text-amber-400 truncate max-w-64"
                          title={m.notes}
                        >
                          ⚠ {m.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                    <Button
                      size="sm"
                      variant={m.verdict === 'verified' ? 'default' : 'outline'}
                      disabled={verdictMutation.isPending || reviewed}
                      onClick={() => setVerdict(m, 'verified')}
                      className={cn(
                        'h-8 cursor-pointer',
                        m.verdict === 'verified'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-400'
                      )}
                      aria-label={`Verify ${m.name}`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      variant={m.verdict === 'needs_change' ? 'default' : 'outline'}
                      disabled={verdictMutation.isPending || reviewed}
                      onClick={() => setVerdict(m, 'needs_change')}
                      className={cn(
                        'h-8 cursor-pointer',
                        m.verdict === 'needs_change'
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'hover:border-amber-400 hover:text-amber-700 dark:hover:text-amber-400'
                      )}
                      aria-label={`Flag ${m.name} for correction`}
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Change
                    </Button>
                    {m.verdict !== 'pending' && !reviewed && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={verdictMutation.isPending}
                        onClick={() => setVerdict(m, 'pending')}
                        className="h-8 text-muted-foreground cursor-pointer"
                        aria-label={`Reset ${m.name} verdict`}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
      </section>

      {/* Needs-change note dialog */}
      <Dialog open={noteOpenFor !== null} onOpenChange={(o) => !o && setNoteOpenFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-amber-600" />
              Correction note — {noteOpenFor}
            </DialogTitle>
            <DialogDescription>
              Kya galat hai aur kya sahi hona chahiye? Ye note pack maintainers ko dikhega —
              pack source me fix hone ke baad medicine re-verify hogi.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={noteOpenFor ? noteDraft[noteOpenFor] || '' : ''}
            onChange={(e) =>
              noteOpenFor && setNoteDraft((d) => ({ ...d, [noteOpenFor]: e.target.value }))
            }
            placeholder="e.g. Dose 500mg likha hai par standard 250mg TDS hona chahiye — CIMS ke anusar…"
            rows={4}
            aria-label="Correction note"
          />
          <DialogFooter>
            <Button variant="outline" className="cursor-pointer" onClick={() => setNoteOpenFor(null)}>
              Cancel
            </Button>
            <Button
              onClick={saveNote}
              disabled={verdictMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
            >
              {verdictMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Flag Correction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete review dialog */}
      <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              {data?.pack.title} — review complete karein?
            </DialogTitle>
            <DialogDescription>
              Isse pack <span className="font-medium text-foreground">reviewed</span> mark hoga —
              doctors ko green badge dikhega aur unke installed medicines se{' '}
              <span className="font-medium text-foreground">UNVERIFIED DOSE</span> note hat jayega.
              Ye action audit log me record hota hai.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label htmlFor="reviewerName" className="text-sm font-medium">
              Reviewer ka poora naam (MBBS/MD)
            </label>
            <Input
              id="reviewerName"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="e.g. Dr. Aarti Shah, MBBS"
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Ye naam doctors ko dikhega: “Reviewed by {reviewerName || 'Dr. …'}”
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" className="cursor-pointer" onClick={() => setCompleteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending || reviewerName.trim().length < 3}
              className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            >
              {completeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completing…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Mark Reviewed
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
