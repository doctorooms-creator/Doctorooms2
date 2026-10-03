'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Gift,
  TrendingUp,
  Users,
  MousePointerClick,
  UserPlus,
  Zap,
  CreditCard,
  Trophy,
  AlertTriangle,
  Wallet,
  IndianRupee,
  FlaskConical,
  Crown,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface AdminReferrals {
  totalCodes: number
  funnel: Record<string, number>
  activatedRate: number
  pointsIssued: number
  pointsRedeemed: number
  pointsLiability: number
  redemptionsByItem: { itemType: string; count: number; pointsSpent: number }[]
  topReferrers: { name: string; referrals: number }[]
  milestones: { type: string; count: number }[]
  stalePending: number
  viral: {
    kFactor: number
    kTarget: number
    referredCohortSize: number
    referralsByReferredUsers: number
    claimsLast30: number
    activeReferrers30: number
    claimsPerReferrer30: number
    clicks: number
  }
  experiment: {
    variants: { variant: string; codes: number }[]
  }
  fraudQueue: {
    userId: string
    name: string
    reasons: string[]
    balance: number
  }[]
}

const FUNNEL_STEPS = [
  { key: 'codes', label: 'Codes Created', icon: Gift, color: 'bg-teal-500' },
  { key: 'clicks', label: 'Link Clicks', icon: MousePointerClick, color: 'bg-teal-600' },
  { key: 'signups', label: 'Signups (claims)', icon: UserPlus, color: 'bg-cyan-600' },
  { key: 'activated', label: 'Activated', icon: Zap, color: 'bg-amber-500' },
  { key: 'habit', label: 'Regular Practice', icon: TrendingUp, color: 'bg-orange-500' },
  { key: 'converted', label: 'Paid Customers', icon: CreditCard, color: 'bg-emerald-600' },
]

export default function ReferralsAnalyticsClient() {
  const queryClient = useQueryClient()
  const [refereeInput, setRefereeInput] = useState('')
  const [adjustUserId, setAdjustUserId] = useState('')
  const [adjustPoints, setAdjustPoints] = useState('')
  const [adjustNote, setAdjustNote] = useState('')

  const { data, isLoading } = useQuery<AdminReferrals>({
    queryKey: ['admin-referrals'],
    queryFn: async () => {
      const r = await fetch('/api/admin/referrals')
      if (!r.ok) throw new Error('Failed to load referral analytics')
      return r.json()
    },
  })

  const opsMutation = useMutation({
    mutationFn: async (body: Record<string, string | number>) => {
      const r = await fetch('/api/admin/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Action failed')
      return d
    },
    onSuccess: (d) => {
      toast.success(`✅ ${d.action} done`)
      queryClient.invalidateQueries({ queryKey: ['admin-referrals'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-72 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-72 bg-muted animate-pulse rounded-xl" />
      </div>
    )
  }

  const signups = Object.values(data.funnel).reduce((s, n) => s + n, 0)
  const funnelValues: Record<string, number> = {
    codes: data.totalCodes,
    clicks: data.viral.clicks,
    signups,
    activated: (data.funnel.activated ?? 0) + (data.funnel.habit ?? 0) + (data.funnel.converted ?? 0),
    habit: (data.funnel.habit ?? 0) + (data.funnel.converted ?? 0),
    converted: data.funnel.converted ?? 0,
  }
  const funnelMax = Math.max(...FUNNEL_STEPS.map((s) => funnelValues[s.key] ?? 0), 1)
  const kProgress = Math.min(100, (data.viral.kFactor / data.viral.kTarget) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Gift className="h-6 w-6 text-teal-600" />
            Referral Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Viral coefficient, funnel, points economy aur fraud queue — sab ek jagah
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-referrals'] })}
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </motion.div>

      {/* K-factor hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md overflow-hidden lg:col-span-2">
          <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-amber-500/10 dark:from-teal-950/40 dark:via-emerald-950/30 dark:to-amber-950/20 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="text-center sm:text-left">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-teal-600" />
                  Viral Coefficient (K)
                </p>
                <p className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mt-1">
                  {data.viral.kFactor.toFixed(3)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Target: K ≥ {data.viral.kTarget} · K ≥ 1.0 = self-sustaining loop
                </p>
              </div>
              <div className="flex-1 w-full">
                <Progress value={kProgress} className="h-3" />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="rounded-lg bg-white/70 dark:bg-gray-900/70 border border-gray-100 dark:border-gray-800 p-3">
                    <p className="text-[10px] text-muted-foreground">Referred cohort (users)</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {data.viral.referredCohortSize}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/70 dark:bg-gray-900/70 border border-gray-100 dark:border-gray-800 p-3">
                    <p className="text-[10px] text-muted-foreground">Referrals BY referred users</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {data.viral.referralsByReferredUsers}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground">
              💡 K = referrals generated by the referred cohort ÷ referred users. Har naya referred
              doctor khud referrer banta hai — ye wahi loop hai jo growth ko paid CAC ke bina chalata hai.
              {data.viral.kFactor === 0 && data.viral.referredCohortSize > 0 && (
                <span className="text-amber-600 dark:text-amber-400">
                  {' '}Abhi referred doctors khud refer nahi kar rahe — referee ko apna code bhejne ka nudge bhejo.
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Points economy */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-600" />
              Points Economy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2.5">
            {[
              { label: 'Points issued (earn)', value: data.pointsIssued.toLocaleString('en-IN'), color: 'text-emerald-600' },
              { label: 'Points redeemed', value: data.pointsRedeemed.toLocaleString('en-IN'), color: 'text-teal-600' },
              { label: 'Outstanding liability', value: `₹${data.pointsLiability.toLocaleString('en-IN')}`, color: 'text-amber-600' },
              { label: 'Active referrers (30d)', value: data.viral.activeReferrers30, color: 'text-violet-600' },
              { label: 'Claims / referrer (30d)', value: data.viral.claimsPerReferrer30, color: 'text-cyan-600' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{row.label}</p>
                <p className={`text-sm font-bold ${row.color}`}>{row.value}</p>
              </div>
            ))}
            <div className="pt-1.5 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5">
              <IndianRupee className="h-3 w-3 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground">1 point ≈ ₹0.50 deferred value</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Referral Funnel</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-3">
            {FUNNEL_STEPS.map((step, i) => {
              const value = funnelValues[step.key] ?? 0
              const prev = i > 0 ? funnelValues[FUNNEL_STEPS[i - 1].key] ?? 0 : 0
              const conv = i > 0 && prev > 0 ? Math.round((value / prev) * 100) : null
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className="w-36 shrink-0 flex items-center gap-1.5">
                    <step.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground truncate">{step.label}</p>
                  </div>
                  <div className="flex-1 h-7 rounded-lg bg-gray-100 dark:bg-gray-800/60 overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(value / funnelMax) * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className={`h-full ${step.color} opacity-80`}
                    />
                    <span className="absolute inset-y-0 left-3 flex items-center text-xs font-bold text-white mix-blend-luminosity">
                      {value.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {conv !== null && (
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-5 shrink-0 ${
                        conv >= 50
                          ? 'border-emerald-200 text-emerald-700 dark:text-emerald-400'
                          : conv >= 20
                            ? 'border-amber-200 text-amber-700 dark:text-amber-400'
                            : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      {conv}%
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Clicks = shared links kholne wale doctors · Signups = register par code claim · Activated = pehla booking
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* A/B experiment */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-violet-600" />
              A/B Reward Experiment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-3">
              {['a', 'b'].map((v) => {
                const row = data.experiment.variants.find((x) => x.variant === v)
                const codes = row?.codes ?? 0
                const total = data.experiment.variants.reduce((s, x) => s + x.codes, 0) || 1
                return (
                  <div
                    key={v}
                    className={`rounded-xl border p-4 ${
                      v === 'a'
                        ? 'border-teal-200 dark:border-teal-800/60 bg-teal-50/50 dark:bg-teal-950/30'
                        : 'border-violet-200 dark:border-violet-800/60 bg-violet-50/50 dark:bg-violet-950/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] h-5 uppercase">
                        Variant {v}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((codes / total) * 100)}% of codes
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {(v === 'a' ? 2000 : 2500).toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-muted-foreground"> pts</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {v === 'a' ? 'Control — 300/700/1000 stages' : '+25% reward — 375/875/1250 stages'}
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground mt-1.5">
                      {codes.toLocaleString('en-IN')} codes issued
                    </p>
                  </div>
                )
              })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              Split doctor ke code par deterministic hash se hota hai — same doctor hamesha same
              variant dekhta hai. Award sizes automatically variant ke hisaab se scale hote hain.
            </p>
          </CardContent>
        </Card>

        {/* Top referrers + milestones */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Top Referrers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {data.topReferrers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Abhi koi referral nahi hua hai
              </p>
            ) : (
              <div className="space-y-1.5">
                {data.topReferrers.map((t, i) => (
                  <div
                    key={`${t.name}-${i}`}
                    className="flex items-center justify-between rounded-lg bg-gray-50/60 dark:bg-gray-900/40 px-3 py-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                          i === 0
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            : i === 1
                              ? 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {t.name}
                        {i === 0 && <Crown className="inline h-3 w-3 ml-1 text-amber-500" />}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {t.referrals} referrals
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            {data.milestones.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-2">
                {data.milestones.map((m) => (
                  <Badge
                    key={m.type}
                    className="gap-1 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                  >
                    <Trophy className="h-3 w-3" />
                    {m.type === 'earn_milestone_5' ? '5th Conversion' : 'Champion (10th)'} ×{m.count}
                  </Badge>
                ))}
              </div>
            )}
            {data.stalePending > 0 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-3 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {data.stalePending} pending referrals 60+ din purane hain — 90 din par auto-expire
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fraud queue + ops */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            Fraud Review Queue & Ops Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          {data.fraudQueue.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
              ✅ Koi fraud flag nahi — sab system normal hai
            </p>
          ) : (
            <div className="space-y-2">
              {data.fraudQueue.map((f) => (
                <div
                  key={f.userId}
                  className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{f.name}</p>
                    <Badge className="bg-red-100 text-red-700 border-0 dark:bg-red-950 dark:text-red-400">
                      balance: {f.balance.toLocaleString('en-IN')}
                    </Badge>
                  </div>
                  <ul className="mt-1.5 space-y-0.5">
                    {f.reasons.map((r) => (
                      <li key={r} className="text-[11px] text-red-600 dark:text-red-400 flex gap-1">
                        <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" /> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Ops actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Conversion ops (manual payment)</p>
              <div className="flex gap-2">
                <Input
                  placeholder="referee userId"
                  value={refereeInput}
                  onChange={(e) => setRefereeInput(e.target.value)}
                  className="text-xs h-9"
                />
                <Button
                  size="sm"
                  className="gap-1 shrink-0"
                  disabled={!refereeInput || opsMutation.isPending}
                  onClick={() => {
                    opsMutation.mutate({ action: 'mark-converted', refereeUserId: refereeInput })
                    setRefereeInput('')
                  }}
                >
                  <CreditCard className="h-3.5 w-3.5" /> Convert
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 shrink-0 text-red-600 hover:text-red-700 border-red-200 dark:border-red-900"
                  disabled={!refereeInput || opsMutation.isPending}
                  onClick={() => {
                    opsMutation.mutate({ action: 'clawback', refereeUserId: refereeInput })
                    setRefereeInput('')
                  }}
                >
                  Clawback
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Webhook ke bahar capture hui payment (cheque/UPI manual) ke liye — Razorpay aane par
                webhook authoritative hai.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Manual ledger adjust</p>
              <div className="flex gap-2">
                <Input
                  placeholder="userId"
                  value={adjustUserId}
                  onChange={(e) => setAdjustUserId(e.target.value)}
                  className="text-xs h-9 w-28"
                />
                <Input
                  placeholder="±points"
                  type="number"
                  value={adjustPoints}
                  onChange={(e) => setAdjustPoints(e.target.value)}
                  className="text-xs h-9 w-20"
                />
                <Input
                  placeholder="note (required)"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="text-xs h-9 flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  disabled={
                    !adjustUserId ||
                    !adjustPoints ||
                    Number(adjustPoints) === 0 ||
                    !adjustNote ||
                    opsMutation.isPending
                  }
                  onClick={() => {
                    opsMutation.mutate({
                      action: 'adjust',
                      userId: adjustUserId,
                      points: Number(adjustPoints),
                      note: adjustNote,
                    })
                    setAdjustUserId('')
                    setAdjustPoints('')
                    setAdjustNote('')
                  }}
                >
                  Adjust
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Append-only adjust entry — note ke bina allowed nahi (audit trail).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
