'use client'

/**
 * Lost Revenue Report page (PRICING-STRATEGY §3.2 hero paid feature, §3.3 wall #4).
 *
 * THE conversion weapon — makes the no-show pain numerical:
 *  - Free plan: headline totals + trend shape visible (teaser); the full
 *    breakdown (dates, slots, patients, recoverable ₹) sits behind the Pro wall.
 *  - Pro plan: every no-show listed with date/slot/masked patient/fee/disease,
 *    recovery math (80% via auto-reminders) and an honest data-quality split
 *    (recorded fees vs avg-fee estimates).
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  TrendingDown, Sparkles, CalendarDays, Lock, ShieldCheck, CheckCircle2, RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { UpgradeWallDialog, UpgradeWallPayload } from '@/components/upgrade-wall-dialog'

interface BreakdownRow {
  id: string
  bookingDate: string
  timeSlot: string
  patientName: string
  appointmentCharge: number
  estimated: boolean
  disease: string
}

interface LostRevenueData {
  period: 'week' | 'month'
  noShowCount: number
  canceledCount: number
  avgFee: number
  recordedTotal: number
  estimatedTotal: number
  estimatedCount: number
  lostTotal: number
  recoverableEstimate: number
  byDay: { date: string; label: string; lost: number; count: number }[]
  plan: { key: string; status: string }
  gated: boolean
  breakdown: BreakdownRow[] | null
  upgrade: UpgradeWallPayload | null
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

export default function LostRevenuePage() {
  const [period, setPeriod] = useState<'week' | 'month'>('month')
  const [wallOpen, setWallOpen] = useState(false)
  const [walletSpendable, setWalletSpendable] = useState<number | null>(null)

  const { data, isLoading } = useQuery<LostRevenueData>({
    queryKey: ['lost-revenue', period],
    queryFn: async () => {
      const r = await fetch(`/api/dashboard/doctor/lost-revenue?period=${period}`)
      if (!r.ok) throw new Error('Report load nahi hua')
      return r.json()
    },
  })

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-56 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-xl" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    )
  }

  const openWall = async () => {
    if (walletSpendable === null) {
      fetch('/api/referral/me')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setWalletSpendable(d?.wallet?.spendable ?? 0))
        .catch(() => setWalletSpendable(0))
    }
    setWallOpen(true)
  }

  const maxDay = Math.max(...data.byDay.map((d) => d.lost), 1)
  const periodLabel = period === 'week' ? 'Is hafte' : 'Is mahine'

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
            <TrendingDown className="h-6 w-6 text-red-600" />
            Lost Revenue Report
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            No-shows aapka paisa kahan le gaye — {periodLabel} ka hisaab
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-800 p-1">
          {(['week', 'month'] as const).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? 'default' : 'ghost'}
              onClick={() => setPeriod(p)}
              className={`h-8 text-xs ${period === p ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
            >
              {p === 'week' ? 'Is hafte' : 'Is mahine'}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Empty state — celebrate when nothing was lost */}
      {data.noShowCount === 0 ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-md overflow-hidden">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <p className="text-lg font-bold text-foreground">
                {periodLabel} koi no-show nahi — badhai! 🎉
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Aapka OPD discipline strong hai. Indian OPD average 15–30% no-shows hota hai —
                agar future mein dige to yeh report turant bata dega, Pro auto-reminders ke saath 80% recover ho sakte hain.
              </p>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left">
                {[
                  ['Avg fee / visit', inr(data.avgFee)],
                  ['Canceled bookings', `${data.canceledCount}`],
                  ['Auto-recovery rate', '80%'],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-xl border border-gray-100 dark:border-gray-800 p-3">
                    <p className="text-[11px] text-muted-foreground">{l}</p>
                    <p className="text-base font-bold text-foreground">{v}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Hero numbers — the pain, numerical */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 dark:from-red-950/40 dark:via-orange-950/30 dark:to-amber-950/20 p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                      {periodLabel} no-shows
                    </p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {data.noShowCount}
                      <span className="text-sm font-medium text-muted-foreground ml-1.5">patients</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue lost</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">{inr(data.lostTotal)}</p>
                    {data.estimatedCount > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {inr(data.recordedTotal)} recorded + {inr(data.estimatedTotal)} estimated (avg fee)
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Auto-reminders se recover (80%)</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {inr(data.recoverableEstimate)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Pro WhatsApp engine se wapas mil sakta hai</p>
                  </div>
                </div>
              </div>

              {/* Day trend — visible on both plans (the pain must be seen) */}
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Roz ka loss — {period === 'week' ? ' hafte ka' : ' mahine ka'} trend
                </p>
                <div className="flex items-end gap-1.5 h-24">
                  {data.byDay.map((d) => (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
                      <div
                        className={`w-full rounded-t-md transition-all ${
                          d.lost > 0
                            ? 'bg-gradient-to-t from-red-500 to-orange-400 group-hover:from-red-600 group-hover:to-orange-500'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                        style={{ height: `${Math.max(d.lost > 0 ? 8 : 3, (d.lost / maxDay) * 100)}%` }}
                        title={d.lost > 0 ? `${d.label}: ${inr(d.lost)} (${d.count} no-shows)` : `${d.label}: clean`}
                      />
                      <span className="text-[9px] text-muted-foreground truncate w-full text-center">{d.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Breakdown — Pro full vs Free teaser */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-teal-600" />
                    Full breakdown — har no-show ki kahani
                  </span>
                  {data.gated ? (
                    <Badge className="gap-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-0">
                      <Lock className="h-3 w-3" /> Pro feature
                    </Badge>
                  ) : (
                    <Badge className="gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-0">
                      <ShieldCheck className="h-3 w-3" /> Pro unlocked
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {data.gated ? (
                  /* TEASER (§3.3 #4): totals visible, breakdown behind the wall */
                  <div className="space-y-4">
                    <div className="rounded-xl border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 p-5 text-center">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3">
                        <Lock className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        {inr(data.lostTotal)} lost {period === 'week' ? 'is hafte' : 'is mahine'} — par kis din, kis slot,
                        kaunsa patient?
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-lg mx-auto">
                        Pro ka full report har no-show dikhata hai: date, time slot, patient, fees aur disease —
                        saath mein WhatsApp auto-reminders jo 80% wapas laate hain.
                      </p>
                      <Button
                        onClick={openWall}
                        className="mt-4 gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                      >
                        <Sparkles className="h-4 w-4" />
                        Breakdown kholo — Pro dekhein
                      </Button>
                    </div>

                    {/* Frozen preview rows — the shape of what's behind the wall */}
                    <div className="space-y-2 opacity-50 select-none" aria-hidden="true">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-800 px-4 py-3">
                          <div className="space-y-1.5 flex-1">
                            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-2.5 w-36 bg-gray-100 dark:bg-gray-800 rounded" />
                          </div>
                          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* PRO: full table */
                  <>
                    <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                            <TableHead className="text-xs">Date</TableHead>
                            <TableHead className="text-xs">Slot</TableHead>
                            <TableHead className="text-xs">Patient</TableHead>
                            <TableHead className="text-xs hidden sm:table-cell">Disease</TableHead>
                            <TableHead className="text-xs text-right">Fees lost</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.breakdown?.map((r) => (
                            <TableRow key={r.id}>
                              <TableCell className="text-xs font-medium">
                                {format(new Date(r.bookingDate), 'dd MMM yyyy')}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">{r.timeSlot}</TableCell>
                              <TableCell className="text-xs">{r.patientName}</TableCell>
                              <TableCell className="text-xs text-muted-foreground hidden sm:table-cell max-w-[180px] truncate">
                                {r.disease}
                              </TableCell>
                              <TableCell className="text-xs text-right">
                                <span className="font-bold text-red-600 dark:text-red-400">{inr(r.appointmentCharge)}</span>
                                {r.estimated && (
                                  <span className="ml-1 text-[9px] text-amber-600 dark:text-amber-400">(est.)</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {data.estimatedCount > 0
                        ? `${data.estimatedCount} no-shows par fees record nahi thi — aapki 90-din average fee (${inr(data.avgFee)}) se estimate ki gayi hai, (est.) ke saath mark.`
                        : 'Saari fees booking ke waqt record hui thi — zero estimation.'}
                      {data.canceledCount > 0 && ` · ${data.canceledCount} cancel bhi hue (slot un bhi khali gaya).`}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recovery engine explainer */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50/60 to-teal-50/60 dark:from-emerald-950/20 dark:to-teal-950/10">
              <CardContent className="p-5">
                <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-emerald-600" />
                  Recovery engine — kaam kaise karta hai
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { step: '1', title: 'WhatsApp auto-reminder', desc: 'Appointment se 2 ghante pehle patient ko reminder — confirm ya cancel ka 1-tap button.' },
                    { step: '2', title: 'Cancel = turant refill', desc: 'Cancel hote hi khali slot dobara available — naya patient book hota hai, revenue zero waste.' },
                    { step: '3', title: 'No-show follow-up', desc: 'Jo phir bhi nahi aaya, usko reschedule link jata hai — 80% wapas aate hain.' },
                  ].map((s) => (
                    <div key={s.step} className="rounded-xl bg-white/70 dark:bg-gray-900/40 border border-emerald-100 dark:border-emerald-900/50 p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {s.step}
                        </span>
                        <p className="text-xs font-bold text-foreground">{s.title}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      <UpgradeWallDialog
        open={wallOpen}
        onOpenChange={setWallOpen}
        wall={data.upgrade}
        walletSpendable={walletSpendable ?? 0}
        source="lost_revenue"
      />
    </div>
  )
}
