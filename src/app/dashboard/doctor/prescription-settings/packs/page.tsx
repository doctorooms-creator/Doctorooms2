'use client'

/**
 * Content Packs — browsable library of all specialty starter packs.
 *
 * P3 "pack settings surface": doctors see their installed packs (receipt
 * counts + versions) and can install ANY of the 21 packs on demand —
 * not just their own specialty's. Install is idempotent + append-only
 * (install.ts P3/P4), so this is always safe to click.
 *
 * Data: GET  /api/dashboard/doctor/packs/library
 *       POST /api/dashboard/doctor/packs/install { packCode }
 */

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Backpack,
  Search,
  Loader2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Pill,
  MessageSquareQuote,
  Stethoscope,
  FileText,
  ClipboardList,
  Info,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

interface LibraryPack {
  code: string
  title: string
  tier: 'BASE' | 'T1' | 'T2' | 'T3'
  version: string
  reviewed: boolean
  reviewedBy: string | null
  summary: string
  counts: Record<string, number>
  totalRows: number
  specialtyNames: string[]
  fallbackFor: number
  installed: boolean
  installedAt: string | null
  installedVersion: string | null
}

interface LibraryResponse {
  installedPacks: {
    packCode: string
    version: string
    counts: Record<string, number>
    installedAt: string
  }[]
  library: LibraryPack[]
}

const TIER_STYLES: Record<string, string> = {
  BASE: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  T1: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  T2: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export default function ContentPacksPage() {
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [confirmPack, setConfirmPack] = useState<LibraryPack | null>(null)

  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery<LibraryResponse>({
    queryKey: ['doctor-pack-library'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/doctor/packs/library')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Library load nahi hui')
      }
      return res.json()
    },
  })

  const installMutation = useMutation({
    mutationFn: async (packCode: string) => {
      const res = await fetch('/api/dashboard/doctor/packs/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packCode }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || !body.ok) {
        throw new Error(body.error || 'Install fail ho gaya')
      }
      return body as {
        packCode: string
        title: string
        version: string
        summary: string
        skipped: number
        alreadyInstalled?: boolean
      }
    },
    onSuccess: (result) => {
      if (result.alreadyInstalled) {
        toast.info(`${result.title} pehle se installed hai`, { duration: 4000 })
      } else {
        toast.success(
          `🎒 ${result.title} lag gaya — ${result.summary}${result.skipped ? ` (${result.skipped} items pehle se the, skip)` : ''}`,
          { duration: 6000 }
        )
      }
      // Master data changed under every settings page — invalidate everything
      void queryClient.invalidateQueries()
      void refetch()
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Install nahi hua — thodi der baad dobara try karein', {
        duration: 6000,
      })
      void refetch()
    },
  })

  const library = data?.library ?? []

  const installedPacks = useMemo(
    () => library.filter((p) => p.installed),
    [library]
  )
  const notInstalledPacks = useMemo(
    () => library.filter((p) => !p.installed),
    [library]
  )

  const totalInstalledRows = useMemo(
    () => installedPacks.reduce((sum, p) => sum + p.totalRows, 0),
    [installedPacks]
  )
  const unverifiedCount = useMemo(
    () => installedPacks.filter((p) => !p.reviewed).length,
    [installedPacks]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return library.filter((p) => {
      if (tierFilter !== 'all' && p.tier !== tierFilter) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.specialtyNames.some((n) => n.toLowerCase().includes(q))
      )
    })
  }, [library, search, tierFilter])

  const installing = installMutation.isPending ? installMutation.variables : null

  const handleInstall = (pack: LibraryPack) => {
    setConfirmPack(null)
    installMutation.mutate(pack.code)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Overview stats ─────────────────────────────────────────────── */}
      <section aria-label="Pack overview" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="border-teal-200/60 dark:border-teal-900">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
                <Backpack className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold leading-none tabular-nums">
                  {isLoading ? '—' : installedPacks.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">Packs installed</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Layers className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold leading-none tabular-nums">
                  {isLoading ? '—' : totalInstalledRows.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">Content rows added</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Stethoscope className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold leading-none tabular-nums">
                  {isLoading ? '—' : notInstalledPacks.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">More packs available</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Card className={unverifiedCount > 0 ? 'border-amber-200 dark:border-amber-900' : ''}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold leading-none tabular-nums">
                  {isLoading ? '—' : unverifiedCount}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">Awaiting dose review</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* ── Unverified-dose notice ──────────────────────────────────────── */}
      {unverifiedCount > 0 && (
        <div
          role="note"
          className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30 px-4 py-3"
        >
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Doses medically review ho rahe hain.</span>{' '}
            Starter pack ka content standard Indian references (NLEM, IAP, WHO) se banaya gaya hai —
            lekin prescribe karne se pehle har dose apne clinical judgement se verify karein.
          </p>
        </div>
      )}

      {/* ── Toolbar: search + tier filter ───────────────────────────────── */}
      <section
        aria-label="Search the pack library"
        className="flex flex-col sm:flex-row gap-3 sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pack ya specialty search karein — e.g. Cardiology, Bachche..."
            className="pl-9 h-10 bg-background"
            aria-label="Search packs by name or specialty"
          />
        </div>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-full sm:w-44 h-10" aria-label="Filter packs by tier">
            <SelectValue placeholder="All tiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tiers ({library.length})</SelectItem>
            <SelectItem value="BASE">BASE — General</SelectItem>
            <SelectItem value="T1">T1 — Core specialties</SelectItem>
            <SelectItem value="T2">T2 — Super specialties</SelectItem>
          </SelectContent>
        </Select>
      </section>

      {/* ── Library grid ────────────────────────────────────────────────── */}
      <section aria-label="Pack library" className="flex flex-col gap-4">
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="pb-3 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-28" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {isError && (
          <Card className="border-destructive/50">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-destructive font-medium">
                Pack library load nahi hui.
              </p>
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
              <p className="text-xs text-muted-foreground mt-1">
                Search thoda chhota karein ya tier filter badlein.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((pack, idx) => (
              <PackCard
                key={pack.code}
                pack={pack}
                idx={idx}
                installing={installing === pack.code}
                onInstall={() => setConfirmPack(pack)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Install confirm dialog ──────────────────────────────────────── */}
      <AlertDialog
        open={confirmPack !== null}
        onOpenChange={(open) => !open && setConfirmPack(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Download className="h-4 w-4 text-teal-600" />
              {confirmPack?.title} install karein?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>
                  Ye <span className="font-medium text-foreground">{confirmPack?.totalRows ?? 0} content rows</span>{' '}
                  (complaints, questions, suggestions, medicines, findings, Rx templates) aapke account me
                  add honge. Install <span className="font-medium text-foreground">append-only</span> hai —
                  aapki existing data kabhi overwrite nahi hogi.
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {!confirmPack?.reviewed
                    ? 'Doses abhi medically review nahi hue hain — prescribe karne se pehle verify karein.'
                    : 'Doses medically reviewed hain.'}
                </p>
                <p className="mt-2 text-muted-foreground">
                  Bade pack me 30–60 second lag sakte hain — page band na karein.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
              onClick={() => confirmPack && handleInstall(confirmPack)}
            >
              <Download className="h-4 w-4 mr-2" />
              Install Pack
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* ── Pack card ────────────────────────────────────────────────────────── */

function PackCard({
  pack,
  idx,
  installing,
  onInstall,
}: {
  pack: LibraryPack
  idx: number
  installing: boolean
  onInstall: () => void
}) {
  const c = pack.counts
  const stats: { icon: typeof Stethoscope; label: string; value: number }[] = [
    { icon: Stethoscope, label: 'Complaints', value: c.complaints ?? 0 },
    { icon: MessageSquareQuote, label: 'Questions', value: c.questions ?? 0 },
    { icon: Pill, label: 'Medicines', value: c.medicines ?? 0 },
    { icon: Search, label: 'Findings', value: c.findings ?? 0 },
    { icon: ClipboardList, label: 'Rx templates', value: c.rxTemplates ?? 0 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.04, 0.4) }}
      className="h-full"
    >
      <Card
        className={
          pack.installed
            ? 'h-full flex flex-col border-teal-200/70 dark:border-teal-900/80 bg-teal-50/30 dark:bg-teal-950/20'
            : 'h-full flex flex-col'
        }
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Badge variant="outline" className={`text-[10px] font-semibold shrink-0 ${TIER_STYLES[pack.tier] ?? ''}`}>
                {pack.tier}
              </Badge>
              <span className="text-[11px] text-muted-foreground font-mono truncate">{pack.code}</span>
            </div>
            {pack.installed ? (
              <span className="flex items-center gap-1 text-[11px] font-medium text-teal-700 dark:text-teal-400 shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Installed
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground shrink-0">v{pack.version}</span>
            )}
          </div>
          <h3 className="text-base font-semibold leading-snug mt-1.5">
            {pack.title.replace(' Starter Pack', '')}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {pack.specialtyNames.slice(0, 3).map((name) => (
              <Badge key={name} variant="secondary" className="text-[10px] font-normal max-w-44 truncate">
                {name}
              </Badge>
            ))}
            {pack.specialtyNames.length > 3 && (
              <Badge variant="secondary" className="text-[10px] font-normal">
                +{pack.specialtyNames.length - 3}
              </Badge>
            )}
            {pack.fallbackFor > 0 && (
              <Badge variant="secondary" className="text-[10px] font-normal">
                +{pack.fallbackFor} more fallback
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-4 flex-1">
          <dl className="grid grid-cols-5 gap-1.5" aria-label={`${pack.title} contents`}>
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-1 rounded-md bg-muted/60 dark:bg-muted/30 px-1 py-2"
                title={`${s.value} ${s.label.toLowerCase()}`}
              >
                <s.icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                <dd className="text-sm font-semibold tabular-nums leading-none">{s.value}</dd>
                <dt className="sr-only">{s.label}</dt>
              </div>
            ))}
          </dl>
          {!pack.reviewed ? (
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Doses not yet medically reviewed
            </p>
          ) : (
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              {pack.reviewedBy ? `Doses reviewed by ${pack.reviewedBy}` : 'Doses medically reviewed'}
            </p>
          )}
        </CardContent>

        <CardFooter className="pt-0 flex items-center justify-between gap-2 flex-wrap">
          {pack.installed ? (
            <>
              <span className="text-[11px] text-muted-foreground">
                {formatDate(pack.installedAt)} · v{pack.installedVersion || pack.version}
              </span>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-950"
              >
                <Link href="/dashboard/doctor/prescription-settings/complaints">
                  View in settings
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </>
          ) : (
            <Button
              onClick={onInstall}
              disabled={installing}
              className="w-full h-9 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-md shadow-teal-600/15 cursor-pointer"
              aria-label={`Install ${pack.title}`}
            >
              {installing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Installing… (30–60s)
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Install Pack
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
