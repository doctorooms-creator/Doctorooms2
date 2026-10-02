'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  Gift,
  Copy,
  Share2,
  Check,
  Users,
  Zap,
  CreditCard,
  Trophy,
  Wallet,
  Clock,
  Sparkles,
  Send,
  Lock,
  CalendarClock,
  RefreshCw,
  Crown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ReferralMe {
  code: string
  shareUrl: string
  wallet: {
    total: number
    spendable: number
    pending: number
    expiringSoon: number
    nextExpiry: string | null
  }
  tracker: {
    id: string
    refereeName: string
    status: string
    stageLabel: string
    stageBadge: string
    pointsEarned: number
    createdAt: string
  }[]
  ledger: {
    id: string
    type: string
    points: number
    note: string
    createdAt: string
    expiresAt: string | null
  }[]
  catalog: {
    itemType: string
    title: string
    description: string
    points: number
    cashValue: number
    active: boolean
  }[]
  stats: {
    totalReferrals: number
    activated: number
    converted: number
    totalEarned: number
    fullReferralEquivalents: number
  }
  milestones: {
    rollingConversions: number
    champion: boolean
    targets: { conversions: number; points: number }[]
  }
}

const STAGE_STEPS = [
  { label: 'Signup ho jaye', points: 0, desc: 'Referral link se naya doctor register kare' },
  { label: 'Pehla patient book ho', points: 300, desc: 'Unki practice ka pehla booking' },
  { label: '20 bookings ho jaye', points: 700, desc: 'Regular practice ban jaye' },
  { label: 'Paid plan le le', points: 1000, desc: 'Koi bhi plan subscribe kare' },
]

const STAGE_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  activated: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  habit: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  converted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  expired: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

export default function ReferralPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<ReferralMe>({
    queryKey: ['referral-me'],
    queryFn: async () => {
      const r = await fetch('/api/referral/me')
      if (!r.ok) throw new Error('Failed to load referral data')
      return r.json()
    },
  })

  const redeemMutation = useMutation({
    mutationFn: async (itemType: string) => {
      const r = await fetch('/api/referral/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemType }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || d.hint || 'Redemption failed')
      return d
    },
    onSuccess: (d) => {
      toast.success(`🎁 Redeemed: ${d.item} — ${d.pointsSpent} points`)
      queryClient.invalidateQueries({ queryKey: ['referral-me'] })
    },
    onError: (err: Error) => toast.error(err.message),
    onSettled: () => setRedeeming(null),
  })

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      toast.success('Copy ho gaya!')
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error('Copy nahi hua — manually select karein')
    }
  }

  const shareWhatsApp = () => {
    if (!data) return
    const link = `${window.location.origin}/r/${data.code}`
    const text = `Main apna clinic Doctorooms par digital chalata hoon — digital Rx 30 sec mein, OPD queue aur WhatsApp reminders. Is link se signup karo, aapko 30 din ka full access milega: ${link}`
    // Analytics (fire-and-forget)
    fetch('/api/referral/share-track', { method: 'POST' }).catch(() => {})
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    )
  }

  const shareLink =
    typeof window !== 'undefined' ? `${window.location.origin}/r/${data.code}` : data.shareUrl
  const progressToFreeMonth = Math.min(100, Math.round((data.stats.totalEarned / 2000) * 100))

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
            Referral Program
            {data.milestones.champion && (
              <Badge className="gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-sm">
                <Crown className="h-3.5 w-3.5" /> Referral Champion
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Har genuine referral = <span className="font-semibold text-emerald-600">1 mahina Pro FREE</span> (2,000 points)
          </p>
        </div>
        {data.wallet.total > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2.5">
            <Wallet className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-[11px] text-muted-foreground leading-none">Points Balance</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 leading-tight">
                {data.wallet.total.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Referrals', value: data.stats.totalReferrals, icon: Users, color: 'text-teal-600' },
          { label: 'Active Practice', value: data.stats.activated, icon: Zap, color: 'text-amber-600' },
          { label: 'Paid Customers', value: data.stats.converted, icon: CreditCard, color: 'text-emerald-600' },
          { label: 'Points Earned', value: data.stats.totalEarned.toLocaleString('en-IN'), icon: Trophy, color: 'text-violet-600' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{s.value}</p>
                  </div>
                  <s.icon className={`h-8 w-8 ${s.color} opacity-80`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="invite" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="invite" className="gap-1.5">
            <Send className="h-4 w-4" /> Invite & Track
          </TabsTrigger>
          <TabsTrigger value="wallet" className="gap-1.5">
            <Wallet className="h-4 w-4" /> Points Wallet
          </TabsTrigger>
        </TabsList>

        {/* ── INVITE TAB ── */}
        <TabsContent value="invite" className="space-y-4 mt-4">
          {/* Share card */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/10 dark:from-teal-950/40 dark:via-emerald-950/30 dark:to-teal-950/40 p-5">
              <p className="text-sm font-medium text-muted-foreground mb-2">Aapka referral code</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 flex items-center gap-3 rounded-xl bg-white dark:bg-gray-900 border-2 border-dashed border-teal-300 dark:border-teal-700 px-4 py-3">
                  <span className="font-mono text-lg font-bold tracking-widest text-teal-700 dark:text-teal-400 select-all">
                    {data.code}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => copy(data.code, 'code')}
                    variant="outline"
                    className="gap-1.5"
                  >
                    {copied === 'code' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    Code
                  </Button>
                  <Button
                    onClick={() => copy(shareLink, 'link')}
                    variant="outline"
                    className="gap-1.5"
                  >
                    {copied === 'link' ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
                    Link
                  </Button>
                  <Button
                    onClick={shareWhatsApp}
                    className="gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white"
                  >
                    <Send className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 break-all">
                {shareLink}
              </p>
            </div>

            {/* Free month progress */}
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  1 Month Pro FREE tak aapki progress (2,000 pts)
                </p>
                <p className="text-xs font-bold text-emerald-600">
                  {data.stats.totalEarned.toLocaleString('en-IN')} / 2,000
                </p>
              </div>
              <Progress value={progressToFreeMonth} className="h-2" />
            </CardContent>
          </Card>

          {/* How it works */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Kaise kaam karta hai — 4 stages</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {STAGE_STEPS.map((step, i) => (
                  <div
                    key={step.label}
                    className="relative rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-[10px] h-5">
                        Step {i + 1}
                      </Badge>
                      {step.points > 0 && (
                        <span className="text-[10px] font-bold text-emerald-600">
                          +{step.points}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-foreground">{step.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                💡 Do active (free) referrals = 1,000+1,000 = 1 month Pro free. Points 18 mahine
                tak valid rehte hain — wallet mein jama hote hain.
              </p>
            </CardContent>
          </Card>

          {/* Milestone bonuses (Phase 2) */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Milestone Bonuses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.milestones.targets.map((m) => {
                  const progress = Math.min(
                    100,
                    Math.round((data.milestones.rollingConversions / m.conversions) * 100)
                  )
                  const unlocked = data.milestones.rollingConversions >= m.conversions
                  return (
                    <div
                      key={m.conversions}
                      className={`rounded-xl border p-3 ${
                        unlocked
                          ? 'border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/20'
                          : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          {m.conversions === 10 && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                          {m.conversions}th paid referral
                          {m.conversions === 10 && (
                            <span className="text-[10px] font-medium text-amber-600">
                              + Champion badge
                            </span>
                          )}
                        </p>
                        <span className="text-xs font-bold text-amber-600">+{m.points.toLocaleString('en-IN')}</span>
                      </div>
                      <Progress value={progress} className="h-1.5 mt-2" />
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        {data.milestones.rollingConversions}/{m.conversions} paid referrals (last 12 months)
                      </p>
                    </div>
                  )
                })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                🏆 Milestone points bhi wallet mein jama hote hain — har milestone par bonus
                automatically mil jata hai.
              </p>
            </CardContent>
          </Card>

          {/* Tracker */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-teal-600" />
                Aapke Referrals ({data.tracker.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.tracker.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center mx-auto mb-3">
                    <Send className="h-7 w-7 text-teal-500" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Abhi koi referral nahi</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Apna code WhatsApp pe doctor-friends ko bhejo — har doctor jo signup kare aur
                    practice chalaye, aapko points milenge.
                  </p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.tracker.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.refereeName}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STAGE_COLORS[t.status] ?? STAGE_COLORS.pending}`}
                            >
                              {t.stageBadge} {t.stageLabel}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-bold text-emerald-600">
                            +{t.pointsEarned}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground hidden sm:table-cell">
                            {format(new Date(t.createdAt), 'dd MMM yyyy')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── WALLET TAB ── */}
        <TabsContent value="wallet" className="space-y-4 mt-4">
          {/* Balance cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-white/80">Spendable Points</p>
                    <p className="text-2xl font-bold mt-0.5">
                      {data.wallet.spendable.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <Wallet className="h-8 w-8 text-white/70" />
                </div>
                <p className="text-[10px] text-white/70 mt-2">
                  ≈ ₹{(data.wallet.spendable * 0.5).toLocaleString('en-IN')} value
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Pending (15-din window)</p>
                    <p className="text-2xl font-bold mt-0.5 text-amber-600">
                      {data.wallet.pending.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-500/70" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Security window ke baad spendable honge
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Expiring Soon (60 din)</p>
                    <p className="text-2xl font-bold mt-0.5 text-red-600">
                      {data.wallet.expiringSoon.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <CalendarClock className="h-8 w-8 text-red-500/70" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {data.wallet.nextExpiry
                    ? `Next expiry: ${format(new Date(data.wallet.nextExpiry), 'dd MMM yyyy')}`
                    : 'Koi expiry risk nahi'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Catalog */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Gift className="h-4 w-4 text-emerald-600" />
                Points Kharid Karein — Redemption Catalog
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.catalog.map((item) => {
                  const affordable = data.wallet.spendable >= item.points
                  return (
                    <div
                      key={item.itemType}
                      className={`rounded-xl border p-4 transition-all ${
                        item.active
                          ? 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md'
                          : 'border-dashed border-gray-200 dark:border-gray-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">{item.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                        {item.active && (
                          <Badge
                            variant="outline"
                            className="shrink-0 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                          >
                            ₹{item.cashValue.toLocaleString('en-IN')} value
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                          {item.points.toLocaleString('en-IN')} pts
                        </p>
                        {!item.active ? (
                          <Badge variant="secondary" className="gap-1 text-[10px]">
                            <Lock className="h-3 w-3" /> Coming Soon
                          </Badge>
                        ) : redeeming === item.itemType ? (
                          <Button size="sm" disabled className="gap-1.5">
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Redeeming…
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            disabled={!affordable}
                            onClick={() => {
                              setRedeeming(item.itemType)
                              redeemMutation.mutate(item.itemType)
                            }}
                            className={`gap-1.5 ${
                              affordable
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                                : ''
                            }`}
                          >
                            <Gift className="h-3.5 w-3.5" />
                            {affordable ? 'Redeem' : 'Insufficient pts'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Ledger */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Points History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.ledger.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Abhi koi points transaction nahi — pehla referral bhejo!
                </p>
              ) : (
                <div className="max-h-72 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Activity</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.ledger.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell>
                            <p className="text-xs font-medium">{l.note || l.type}</p>
                            {l.expiresAt && l.points > 0 && (
                              <p className="text-[10px] text-muted-foreground">
                                Expiry: {format(new Date(l.expiresAt), 'dd MMM yyyy')}
                              </p>
                            )}
                          </TableCell>
                          <TableCell
                            className={`text-right font-bold ${
                              l.points > 0 ? 'text-emerald-600' : 'text-red-500'
                            }`}
                          >
                            {l.points > 0 ? `+${l.points}` : l.points}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground hidden sm:table-cell">
                            {format(new Date(l.createdAt), 'dd MMM yyyy')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
