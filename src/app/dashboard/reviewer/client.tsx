'use client'

/**
 * Reviewer home (scoped role, P3-BATCH5).
 *
 * The MBBS dose reviewer lands here after login. Shows live review progress
 * across all 27 library packs + a guided "how review works" panel + a
 * continue-reviewing CTA that deep-links to the next un-reviewed pack.
 *
 * Scope: this role can ONLY reach the pack-review console (sidebar has just
 * Dashboard / Pack Reviews / Change Password) and the pack-review APIs
 * (requireAnyRole(['admin', 'reviewer'])). Everything else returns 401.
 */

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ClipboardCheck,
  ShieldCheck,
  CheckCircle2,
  Hourglass,
  ListTodo,
  ArrowRight,
  Loader2,
  Stethoscope,
  BookOpen,
  PenLine,
  Lock,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/lib/auth-store'

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

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

export default function ReviewerHomeClient() {
  const user = useAuthStore((s) => s.user)

  const { data, isLoading, isError, refetch, isRefetching } = useQuery<{
    packs: PackProgress[]
  }>({
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
      inProgress: packs.filter(
        (p) => p.status === 'in_progress' || p.status === 'needs_changes'
      ).length,
      totalMeds,
      verified,
      needsChange,
      pending: totalMeds - verified - needsChange,
    }
  }, [packs])

  const overallPct = stats.totalMeds
    ? Math.round(((stats.verified + stats.needsChange) / stats.totalMeds) * 100)
    : 0

  // Next pack to work on: needs_changes first (corrections pending), then
  // in_progress (partially reviewed), then untouched packs.
  const nextPack = useMemo(() => {
    const needsChanges = packs.find((p) => p.status === 'needs_changes')
    if (needsChanges) return needsChanges
    const inProgress = packs.find((p) => p.status === 'in_progress')
    if (inProgress) return inProgress
    return packs.find((p) => p.status === 'pending')
  }, [packs])

  const greeting = user?.name?.split(',')[0] || 'Doctor'

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="border-red-200 dark:border-red-900">
        <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-muted-foreground">
            Review progress load nahi hua. Please retry.
          </p>
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <motion.section
        {...fadeUp}
        transition={{ duration: 0.35 }}
        aria-labelledby="reviewer-welcome"
        className="relative overflow-hidden rounded-2xl border border-teal-200/60 dark:border-teal-900 bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-teal-950/40 dark:via-gray-900 dark:to-emerald-950/30 p-6 sm:p-8"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.07] dark:opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, #0d9488 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800 hover:bg-teal-100">
                <ShieldCheck className="h-3 w-3 mr-1" aria-hidden="true" />
                Scoped access · Dose reviews only
              </Badge>
            </div>
            <h1
              id="reviewer-welcome"
              className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25">
                <Stethoscope className="h-6 w-6 text-white" aria-hidden="true" />
              </span>
              Namaste, {greeting}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-xl">
              Aap ka aaj ka kaam: specialty packs ki medicine doses verify karna. Har
              reviewed pack par doctors ko green{' '}
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                verified
              </span>{' '}
              badge dikhta hai aur unverified warnings hat jaate hain.
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-lg shadow-teal-500/25 gap-2"
            >
              <Link href="/dashboard/reviewer/pack-review">
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                Open review console
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="gap-2 text-muted-foreground"
              disabled={isRefetching}
              aria-label="Refresh review progress"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              Refresh progress
            </Button>
          </div>
        </div>
      </motion.section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section
        aria-label="Review progress summary"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.05 }}>
          <Card className="h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-md shrink-0">
                <BookOpen className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold tabular-nums">{stats.totalPacks}</p>
                <p className="text-xs text-muted-foreground">Total packs</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className="h-full border-emerald-200/60 dark:border-emerald-900">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                <CheckCircle2 className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {stats.reviewed}
                </p>
                <p className="text-xs text-muted-foreground">Reviewed ✓</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.15 }}>
          <Card className="h-full border-amber-200/60 dark:border-amber-900">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                <Hourglass className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
                  {stats.inProgress}
                </p>
                <p className="text-xs text-muted-foreground">In review</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.2 }}>
          <Card className="h-full border-teal-200/60 dark:border-teal-900">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
                <ListTodo className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold tabular-nums text-teal-600 dark:text-teal-400">
                  {stats.pending}
                </p>
                <p className="text-xs text-muted-foreground">Pending verdicts</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* ── Overall progress + next pack ──────────────────────────────────── */}
      <motion.section
        {...fadeUp}
        transition={{ duration: 0.3, delay: 0.25 }}
        aria-labelledby="overall-progress"
        className="grid gap-4 lg:grid-cols-5"
      >
        <Card className="lg:col-span-3">
          <CardContent className="p-5 sm:p-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2
                id="overall-progress"
                className="text-base font-semibold flex items-center gap-2"
              >
                <ShieldCheck className="h-4 w-4 text-teal-600" aria-hidden="true" />
                Overall dose-verification progress
              </h2>
              <span className="text-2xl font-bold tabular-nums text-teal-600 dark:text-teal-400">
                {overallPct}%
              </span>
            </div>
            <Progress
              value={overallPct}
              aria-label={`${overallPct}% doses decided`}
              className="h-3"
            />
            <dl className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900 p-2.5">
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Verified
                </dt>
                <dd className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {stats.verified}
                </dd>
              </div>
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900 p-2.5">
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Needs change
                </dt>
                <dd className="text-lg font-bold tabular-nums text-amber-600 dark:text-amber-400">
                  {stats.needsChange}
                </dd>
              </div>
              <div className="rounded-lg bg-muted border border-border p-2.5">
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Pending
                </dt>
                <dd className="text-lg font-bold tabular-nums">
                  {stats.pending}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-teal-200/60 dark:border-teal-900 bg-gradient-to-br from-teal-50/80 to-white dark:from-teal-950/30 dark:to-gray-900">
          <CardContent className="p-5 sm:p-6 flex flex-col gap-3 h-full">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-teal-600" aria-hidden="true" />
              Continue reviewing
            </h2>
            {nextPack ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Next pack jahan aap ruke the:
                </p>
                <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-white/80 dark:bg-gray-900/80 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm leading-snug">
                      {nextPack.title}
                    </p>
                    <Badge className="shrink-0 font-mono text-[10px] bg-muted text-muted-foreground border-border">
                      {nextPack.packCode}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {nextPack.totalMedicines} medicines ·{' '}
                    {nextPack.decided}/{nextPack.totalMedicines} decided
                    {nextPack.status === 'needs_changes' && (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        {' '}
                        · corrections pending
                      </span>
                    )}
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="mt-1 w-fit bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
                  >
                    <Link
                      href={`/dashboard/reviewer/pack-review/${nextPack.packCode}`}
                    >
                      Review this pack
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 flex-1 text-center py-6">
                <CheckCircle2
                  className="h-10 w-10 text-emerald-500"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium">All packs reviewed 🎉</p>
                <p className="text-xs text-muted-foreground">
                  Poora library verified — doctors ko green badges dikh rahe hain.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>

      {/* ── How review works + scope note ─────────────────────────────────── */}
      <motion.section
        {...fadeUp}
        transition={{ duration: 0.3, delay: 0.3 }}
        aria-labelledby="how-review-works"
        className="grid gap-4 lg:grid-cols-5"
      >
        <Card className="lg:col-span-3">
          <CardContent className="p-5 sm:p-6">
            <h2
              id="how-review-works"
              className="text-base font-semibold flex items-center gap-2 mb-4"
            >
              <BookOpen className="h-4 w-4 text-teal-600" aria-hidden="true" />
              Review kaise karein
            </h2>
            <ol className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: ClipboardCheck,
                  title: '1 · Pack chunein',
                  desc: 'Console me 27 specialty packs — koi bhi open karein.',
                },
                {
                  icon: PenLine,
                  title: '2 · Dose verify karein',
                  desc: 'Har medicine ka dose/frequency check karke verdict dein.',
                },
                {
                  icon: AlertTriangle,
                  title: '3 · Corrections note karein',
                  desc: 'Galat dose par "needs change" + correction note likhein.',
                },
                {
                  icon: CheckCircle2,
                  title: '4 · Complete karein',
                  desc: 'Sab verdicts done → pack complete → green badges live.',
                },
              ].map((step) => (
                <li
                  key={step.title}
                  className="flex gap-3 rounded-xl border border-border bg-muted/30 p-3"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
                    <step.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border bg-muted/30">
          <CardContent className="p-5 sm:p-6 flex flex-col gap-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Aap ka access
            </h2>
            <ul className="text-sm text-muted-foreground flex flex-col gap-2">
              <li className="flex gap-2">
                <CheckCircle2
                  className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                Pack dose-review console (27 packs)
              </li>
              <li className="flex gap-2">
                <CheckCircle2
                  className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                Apna password change karna
              </li>
              <li className="flex gap-2">
                <Lock
                  className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                Patients, billing, users aur baaki sab locked
              </li>
            </ul>
            <p className="text-xs text-muted-foreground border-t border-border pt-3">
              Ye ek scoped reviewer account hai — isse hospital ka koi clinical ya
              billing data access nahi hota. Sirf pack content review hota hai.
            </p>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  )
}
