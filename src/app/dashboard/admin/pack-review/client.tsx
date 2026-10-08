'use client'

/**
 * MBBS Dose-Review Console — pack list (admin).
 *
 * Shows every specialty pack with live verdict progress so the owner +
 * recruited MBBS reviewer can work through the library systematically:
 *   pending → in_progress → needs_changes (fix pack source) → reviewed
 *
 * A reviewed pack flips the doctor-facing amber "unverified dose" badges
 * to green and strips 'UNVERIFIED DOSE' notes from installed medicines.
 */

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Search,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface PackProgress {
  packCode: string
  title: string
  tier: string
  version: string
  totalMedicines: number
  verdicts: { verified: number; needs_change: number; pending: number }
  decided: number
  status: 'pending' | 'in_progress' | 'needs_changes' | 'reviewed'
  reviewedByName: string | null
  reviewedAt: string | null
  summary: string
}

const STATUS_BADGE: Record<PackProgress['status'], { label: string; cls: string }> = {
  pending: {
    label: 'Pending',
    cls: 'bg-muted text-muted-foreground border-border',
  },
  in_progress: {
    label: 'In review',
    cls: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800',
  },
  needs_changes: {
    label: 'Needs changes',
    cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  },
  reviewed: {
    label: 'Reviewed ✓',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  },
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

export default function PackReviewClient({
  basePath = '/dashboard/admin/pack-review',
}: {
  /** Route base for links — reviewer pages pass /dashboard/reviewer/pack-review */
  basePath?: string
} = {}) {
  const [search, setSearch] = useState('')

  const { data, isLoading, isError, refetch } = useQuery<{ packs: PackProgress[] }>({
    queryKey: ['admin-pack-review'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/admin/pack-review')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Load failed')
      }
      return res.json()
    },
  })

  const packs = data?.packs ?? []

  const stats = useMemo(() => {
    const totalMeds = packs.reduce((s, p) => s + p.totalMedicines, 0)
    const verified = packs.reduce((s, p) => s + p.verdicts.verified, 0)
    const needsChange = packs.reduce((s, p) => s + p.verdicts.needs_change, 0)
    return {
      totalPacks: packs.length,
      reviewed: packs.filter((p) => p.status === 'reviewed').length,
      inProgress: packs.filter((p) => p.status === 'in_progress' || p.status === 'needs_changes').length,
      totalMeds,
      verified,
      needsChange,
      pending: totalMeds - verified - needsChange,
    }
  }, [packs])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return packs
    return packs.filter(
      (p) => p.title.toLowerCase().includes(q) || p.packCode.toLowerCase().includes(q)
    )
  }, [packs, search])

  const overallPct = stats.totalMeds ? Math.round(((stats.verified + stats.needsChange) / stats.totalMeds) * 100) : 0

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-teal-600" />
            Pack Dose Reviews
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            MBBS reviewer har pack ki doses verify kare — complete hone par doctors ko green badge
            dikhega aur unverified warnings hat jayenge.
          </p>
        </div>
      </div>

      {/* Overview stats */}
      <section aria-label="Review overview" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-teal-200/60 dark:border-teal-900 h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold leading-none tabular-nums">
                  {isLoading ? '—' : `${stats.reviewed}/${stats.totalPacks}`}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">Packs reviewed</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <Card className="h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Loader2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold leading-none tabular-nums">
                  {isLoading ? '—' : stats.inProgress}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">In review</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <Card className="h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold leading-none tabular-nums">
                  {isLoading ? '—' : `${stats.verified}/${stats.totalMeds}`}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">Medicines verified</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Card className={stats.needsChange > 0 ? 'border-amber-200 dark:border-amber-900 h-full' : 'h-full'}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold leading-none tabular-nums">
                  {isLoading ? '—' : stats.needsChange}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">Corrections flagged</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Overall progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <span className="text-sm font-medium">Overall dose-review progress</span>
            <span className="text-sm text-muted-foreground tabular-nums">
              {stats.verified + stats.needsChange} / {stats.totalMeds} decisions · {overallPct}%
            </span>
          </div>
          <Progress value={overallPct} className="h-2.5" aria-label="Overall review progress" />
          <p className="text-xs text-muted-foreground mt-2">
            ~{stats.pending} medicines ka verdict baaki hai. har verdict ek click hai — reviewer
            doses apne reference books se match karke verify kare.
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pack search karein — e.g. Cardiology, PSY-01…"
          className="pl-9 h-10"
          aria-label="Search packs"
        />
      </div>

      {/* Pack list */}
      <section aria-label="Pack review list" className="flex flex-col gap-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-2.5 w-full max-w-md" />
                </div>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}

        {isError && (
          <Card className="border-destructive/50">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-destructive font-medium">Review list load nahi hui.</p>
              <Button variant="outline" className="mt-3 cursor-pointer" onClick={() => void refetch()}>
                Dobara try karein
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">Koi pack match nahi hua</p>
            </CardContent>
          </Card>
        )}

        {!isLoading &&
          !isError &&
          filtered.map((p, idx) => (
            <motion.div
              key={p.packCode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.03, 0.3) }}
            >
              <Link href={`${basePath}/${p.packCode}`} className="block group">
                <Card className="hover:border-teal-300 dark:hover:border-teal-700 transition-colors">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                          p.status === 'reviewed'
                            ? 'bg-emerald-100 dark:bg-emerald-950'
                            : p.status === 'needs_changes'
                              ? 'bg-amber-100 dark:bg-amber-950'
                              : 'bg-muted'
                        )}
                      >
                        {p.status === 'reviewed' ? (
                          <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Stethoscope className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm truncate">
                            {p.title.replace(' Starter Pack', '')}
                          </span>
                          <Badge variant="outline" className={cn('text-[10px] font-semibold', STATUS_BADGE[p.status].cls)}>
                            {STATUS_BADGE[p.status].label}
                          </Badge>
                          {p.status === 'reviewed' && p.reviewedByName && (
                            <span className="text-[11px] text-muted-foreground truncate">
                              by {p.reviewedByName} · {formatDate(p.reviewedAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress
                            value={p.totalMedicines ? (p.decided / p.totalMedicines) * 100 : 0}
                            className="h-1.5 flex-1 max-w-56"
                            aria-label={`${p.packCode} review progress`}
                          />
                          <span className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
                            {p.decided}/{p.totalMedicines} meds
                          </span>
                          {p.verdicts.needs_change > 0 && (
                            <span className="text-[11px] text-amber-700 dark:text-amber-400 whitespace-nowrap">
                              · {p.verdicts.needs_change} flagged
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1 shrink-0">
                      <span className="text-[11px] text-muted-foreground font-mono">{p.packCode}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 dark:text-teal-400 group-hover:underline">
                        Review karein
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
      </section>
    </div>
  )
}
