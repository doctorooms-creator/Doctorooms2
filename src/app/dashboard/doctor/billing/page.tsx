'use client'

/**
 * Plan & Billing page (docs/PRICING-STRATEGY.md §4 blueprint, in-app version).
 *
 * Persuasion order: ROI calculator FIRST (numbers before price), dominant Pro
 * card, value stack, points-payment path (referral economy), founder pricing
 * scarcity, 60-day guarantee + objection-handling FAQ.
 */
import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  CreditCard, Sparkles, Calculator, Crown, Gift, ShieldCheck, Check, X,
  RefreshCw, TrendingUp, Zap, Users, Stethoscope, Database, Timer, BadgeCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'

interface PlansMe {
  hospitalId: string
  plan: {
    key: 'free' | 'pro' | 'hospital'
    name: string
    tagline: string
    status: 'free' | 'active' | 'trialing' | 'expired'
    source: string
    currentPeriodEnd: string | null
    trialEndsAt: string | null
    daysLeft: number | null
    effectiveMonthly: string
    priceMonthly: number
    priceAnnual: number
    founderAnnual: number | null
    features: {
      recallCampaigns: boolean
      lostRevenueReport: boolean
      clinicPage: boolean
      opdBilling: boolean
      labReports: boolean
    }
  }
  usage: {
    ai: { used: number; limit: number }
    whatsapp: { used: number; limit: number }
    receptionistSeats: { used: number; limit: number }
    nurseSeats: { used: number; limit: number }
    doctorSeats: { used: number; limit: number }
  }
  founderSeats: { taken: number; total: number; left: number }
  wallet: { total: number; spendable: number; pending: number } | null
  catalog: {
    key: string
    name: string
    tagline: string
    priceMonthly: number
    priceAnnual: number
    founderAnnual: number | null
    effectiveMonthly: string
    limits: {
      aiCredits: number
      whatsappReminders: number
      receptionistSeats: number
      nurseSeats: number
      doctorSeats: number
    }
    features: {
      recallCampaigns: boolean
      lostRevenueReport: boolean
      clinicPage: boolean
      opdBilling: boolean
      labReports: boolean
    }
  }[]
}

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

const PLAN_HIGHLIGHTS: Record<string, { icon: typeof Zap; text: string }[]> = {
  free: [
    { icon: Zap, text: 'OPD bookings + queue + tokens — unlimited' },
    { icon: Stethoscope, text: '6-step Rx wizard + print + templates' },
    { icon: Users, text: 'Unlimited patients / records' },
    { icon: Sparkles, text: '50 AI credits + 20 reminders/mo (taste)' },
  ],
  pro: [
    { icon: Zap, text: 'WhatsApp auto-reminders 1,000/mo — no-show recovery' },
    { icon: TrendingUp, text: 'Patient recall campaigns (dormant wapas)' },
    { icon: Sparkles, text: 'AI Copilot 500 credits — 2 hr/day saved' },
    { icon: CreditCard, text: 'Money dashboard + Lost Revenue report' },
    { icon: Users, text: 'Staff accounts: 3 receptionist + 3 nurse' },
    { icon: BadgeCheck, text: 'Public clinic page + QR (naye patients)' },
  ],
  hospital: [
    { icon: Database, text: 'IPD + OT + insurance pre-auth' },
    { icon: TrendingUp, text: 'Dept-wise revenue + leakage reports' },
    { icon: Users, text: '10 doctor seats, 15+15 staff' },
    { icon: Zap, text: '5,000 reminders/mo + 2,000 AI credits' },
    { icon: ShieldCheck, text: 'Dedicated onboarding manager' },
  ],
}

const FAQS = [
  {
    q: 'Mera data kahan jayega? Kya loss ho jayega?',
    a: 'Aapka data safe cloud database mein hai — kabhi bhi CSV/PDF mein export karein. Cancel karne par bhi data 90 din tak download ke liye safe rehta hai. Data hamesha aapka hi rehta hai.',
  },
  {
    q: 'Meri staff computer nahi chala payegi',
    a: 'Receptionist ke liye 10-minute training video hai. Booking aur queue simple screens hain — staff phone se bhi manage kar sakti hai. Support WhatsApp pe hamesha available hai.',
  },
  {
    q: 'Main already Practo/HealthPlix use karta hoon',
    a: 'Same budget mein zyada software milta hai — staff accounts, hospital path, AI Copilot aur WhatsApp automation included. Data import mein humari team free help karegi.',
  },
  {
    q: 'Paisa waste hoga to?',
    a: '60-day ROI guarantee: 60 din mein jo revenue recover karein wo software ki price se kam ho, to full refund. Risk humara, fayda aapka.',
  },
  {
    q: 'Internet jata hai to clinic ruk jayegi?',
    a: 'Queue aur Rx offline-first design mein hain (roadmap). Print kabhi nahi rukta — prescription turant PDF ban jata hai.',
  },
]

export default function BillingPage() {
  const queryClient = useQueryClient()
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [interestDone, setInterestDone] = useState(false)

  // ROI calculator state
  const [fees, setFees] = useState(600)
  const [patientsPerDay, setPatientsPerDay] = useState(25)
  const [noShowPct, setNoShowPct] = useState(20)

  const { data, isLoading } = useQuery<PlansMe>({
    queryKey: ['plans-me'],
    queryFn: async () => {
      const r = await fetch('/api/plans/me')
      if (!r.ok) throw new Error('Failed to load plan data')
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
      toast.success(`🎁 ${d.item} activated — ${d.pointsSpent} points se!`)
      queryClient.invalidateQueries({ queryKey: ['plans-me'] })
      queryClient.invalidateQueries({ queryKey: ['referral-me'] })
    },
    onError: (err: Error) => toast.error(err.message),
    onSettled: () => setRedeeming(null),
  })

  const interestMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch('/api/plans/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey: 'pro' }),
      })
      if (!r.ok) throw new Error('Failed')
    },
    onSuccess: () => {
      setInterestDone(true)
      toast.success('Founder seat interest lock ho gaya — team aapse contact karegi 🤝')
    },
    onError: () => toast.error('Thodi der baad try karein'),
  })

  // ROI math: 26 working days/month; reminders recover 80% of no-shows
  const roi = useMemo(() => {
    const monthlyNoShows = Math.round(patientsPerDay * 26 * (noShowPct / 100))
    const monthlyLoss = monthlyNoShows * fees
    const recovered = Math.round(monthlyLoss * 0.8)
    const netProfit = recovered - 833
    return { monthlyNoShows, monthlyLoss, recovered, netProfit }
  }, [fees, patientsPerDay, noShowPct])

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-muted animate-pulse rounded-lg" />
        <div className="h-40 bg-muted animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-72 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const isPro = data.plan.key === 'pro' && data.plan.status === 'active'
  const isTrial = data.plan.status === 'trialing'
  const spendable = data.wallet?.spendable ?? 0

  const usageRows = [
    { label: 'AI Copilot credits', icon: Sparkles, ...data.usage.ai, unit: 'credits' },
    { label: 'WhatsApp reminders', icon: Zap, ...data.usage.whatsapp, unit: 'reminders' },
    { label: 'Receptionist seats', icon: Users, ...data.usage.receptionistSeats, unit: 'seats' },
    { label: 'Nurse seats', icon: Users, ...data.usage.nurseSeats, unit: 'seats' },
    { label: 'Doctor seats', icon: Stethoscope, ...data.usage.doctorSeats, unit: 'seats' },
  ]

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
            <CreditCard className="h-6 w-6 text-teal-600" />
            Plan & Billing
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Free aapka OPD chalata hai · <span className="font-semibold text-emerald-600">Pro aapka practice badhata hai</span>
          </p>
        </div>
        <Badge
          className={`gap-1.5 text-sm px-4 py-1.5 border-0 ${
            isPro
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
              : isTrial
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          {isPro ? <BadgeCheck className="h-4 w-4" /> : isTrial ? <Timer className="h-4 w-4" /> : null}
          {data.plan.name}
          {isPro && data.plan.currentPeriodEnd
            ? ` · ${format(new Date(data.plan.currentPeriodEnd), 'dd MMM yyyy')} tak`
            : isTrial && data.plan.daysLeft !== null
              ? ` Trial · ${data.plan.daysLeft} din baaki`
              : ''}
        </Badge>
      </motion.div>

      {/* ROI CALCULATOR — FIRST, numbers before price */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/10 dark:from-teal-950/40 dark:via-emerald-950/30 dark:to-teal-950/40 p-5">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1">
              <Calculator className="h-4 w-4 text-teal-600" />
              No-Show Loss Calculator
            </p>
            <p className="text-xs text-muted-foreground">
              Indian OPD mein 15-30% booked slots no-show hote hain. Apna number daalke dekhein.
            </p>
          </div>
          <CardContent className="p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Aapki fees per visit</label>
                  <span className="text-sm font-bold text-teal-700 dark:text-teal-400">{inr(fees)}</span>
                </div>
                <Slider value={[fees]} onValueChange={([v]) => setFees(v)} min={100} max={2000} step={50} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Patients / day</label>
                  <span className="text-sm font-bold text-teal-700 dark:text-teal-400">{patientsPerDay}</span>
                </div>
                <Slider value={[patientsPerDay]} onValueChange={([v]) => setPatientsPerDay(v)} min={5} max={60} step={1} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-muted-foreground">No-show %</label>
                  <span className="text-sm font-bold text-red-600">{noShowPct}%</span>
                </div>
                <Slider value={[noShowPct]} onValueChange={([v]) => setNoShowPct(v)} min={5} max={40} step={5} />
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] text-muted-foreground">Aapke monthly no-shows</p>
                  <p className="text-xl font-bold text-red-600">{roi.monthlyNoShows} patients</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Aapka monthly loss</p>
                  <p className="text-xl font-bold text-red-600">{inr(roi.monthlyLoss)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Auto-reminders se recover (80%)</p>
                  <p className="text-xl font-bold text-emerald-600">{inr(roi.recovered)}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm font-semibold">
                  Pro price ₹833/mo ke against:{' '}
                  <span className={roi.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    Net profit {inr(roi.netProfit)}/mo
                  </span>
                </p>
                {!isPro && (
                  <p className="text-xs text-muted-foreground italic">
                    Ek patient ki fees = poore mahine ka software.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Current plan + usage */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-teal-600" />
                Is mahine ka usage
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {data.plan.name} plan · {data.plan.effectiveMonthly}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {usageRows.map((u) => {
              const pct = Math.min(100, u.limit > 0 ? Math.round((u.used / u.limit) * 100) : 0)
              const near = pct >= 80 && u.limit !== 0
              return (
                <div key={u.label} className="rounded-xl border border-gray-100 dark:border-gray-800 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <u.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {u.label}
                    </p>
                    <p className={`text-xs font-bold ${near ? 'text-amber-600' : 'text-muted-foreground'}`}>
                      {u.used} / {u.limit === 999999 ? '∞' : u.limit}
                    </p>
                  </div>
                  <Progress value={pct} className={`h-1.5 ${near ? '[&>div]:bg-amber-500' : ''}`} />
                  {near && (
                    <p className="text-[10px] text-amber-600 mt-1.5">
                      Limit qareeb hai — Pro mein zyada {u.unit}
                    </p>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Founder banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <div className="rounded-xl border border-amber-300/60 dark:border-amber-700/60 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Founder&apos;s Pricing — pehle 1,000 doctors
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pro at <span className="font-bold text-amber-700 dark:text-amber-400">₹4,999/saal — forever grandfathered</span> (renew hamesha ₹4,999). Founder badge + case-study feature.
                <span className="font-semibold"> {data.founderSeats.left.toLocaleString('en-IN')}/{data.founderSeats.total.toLocaleString('en-IN')} seats bache.</span>
              </p>
            </div>
          </div>
          {interestDone ? (
            <Badge className="gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-0 shrink-0">
              <Check className="h-3.5 w-3.5" /> Interest locked
            </Badge>
          ) : (
            <Button
              onClick={() => interestMutation.mutate()}
              disabled={interestMutation.isPending}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shrink-0"
            >
              {interestMutation.isPending ? 'Locking…' : 'Founder seat lock karo'}
            </Button>
          )}
        </div>
      </motion.div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {data.catalog.map((p, i) => {
          const current = p.key === data.plan.key
          const isProCard = p.key === 'pro'
          return (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              className={isProCard ? 'md:-mt-2 md:mb-2' : ''}
            >
              <Card
                className={`h-full border-0 shadow-md relative overflow-hidden ${
                  isProCard ? 'ring-2 ring-emerald-500 dark:ring-emerald-400' : 'shadow-sm'
                }`}
              >
                {isProCard && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                    SABSE POPULAR — 87% doctors yahi lete hain
                  </div>
                )}
                <CardContent className="p-5 pt-6 flex flex-col h-full">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold text-foreground">{p.name}</p>
                    {current && (
                      <Badge variant="outline" className="text-[10px] border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
                        Current Plan
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.tagline}</p>

                  <div className="mt-4">
                    {p.priceMonthly > 0 ? (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-foreground">
                            {inr(Math.round(p.priceAnnual / 12))}
                          </span>
                          <span className="text-xs text-muted-foreground">/mo</span>
                          <span className="text-xs text-muted-foreground line-through">
                            {inr(Math.round((p.priceMonthly === 999 ? 1199 : 5999)))}/mo
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {inr(p.priceAnnual)}/yr annual billing (2 mahine free)
                        </p>
                        {p.founderAnnual && (
                          <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mt-1">
                            Founder: {inr(p.founderAnnual)}/yr forever
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-foreground">₹0</span>
                          <span className="text-xs text-muted-foreground">forever</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Full clinic ops — data kabhi delete nahi hota
                        </p>
                      </>
                    )}
                  </div>

                  <div className="mt-4 space-y-2 flex-1">
                    {(PLAN_HIGHLIGHTS[p.key] ?? []).map((h) => (
                      <div key={h.text} className="flex items-start gap-2">
                        {p.key === 'free' ? (
                          <Check className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                        ) : (
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        <p className="text-[11px] text-foreground leading-snug">{h.text}</p>
                      </div>
                    ))}
                    {p.key === 'free' && (
                      <div className="flex items-start gap-2">
                        <X className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-muted-foreground">
                          Auto-reminders, recall campaigns, Lost Revenue report — Pro features
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pro card: points payment */}
                  {isProCard && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                      <p className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                        <Gift className="h-3.5 w-3.5 text-emerald-600" />
                        Points se bhi Pro milega
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={redeeming === 'pro_month' || spendable < 2000 || isPro}
                          onClick={() => { setRedeeming('pro_month'); redeemMutation.mutate('pro_month') }}
                          className={`gap-1.5 h-9 text-[11px] ${spendable >= 2000 && !isPro ? 'border-emerald-400 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40' : ''}`}
                        >
                          {redeeming === 'pro_month' ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
                          2,000 pts = 1 mahina
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={redeeming === 'pro_year' || spendable < 20000 || isPro}
                          onClick={() => { setRedeeming('pro_year'); redeemMutation.mutate('pro_year') }}
                          className="gap-1.5 h-9 text-[11px]"
                        >
                          {redeeming === 'pro_year' ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
                          20,000 pts = 1 saal
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Wallet: {spendable.toLocaleString('en-IN')} spendable pts ·{' '}
                        <a href="/dashboard/doctor/referral" className="text-emerald-600 font-medium hover:underline">
                          points kamayo (1 referral = 1 mahina free)
                        </a>
                      </p>
                    </div>
                  )}

                  {!isProCard && p.key !== 'free' && (
                    <Button
                      className="mt-4 w-full"
                      variant="outline"
                      onClick={() => interestMutation.mutate()}
                      disabled={interestMutation.isPending || current}
                    >
                      {current ? 'Current plan' : 'Team se baat karein'}
                    </Button>
                  )}
                  {p.key === 'free' && (
                    <Button className="mt-4 w-full" variant="ghost" disabled>
                      Default plan
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Value stack */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Pro value stack — jo aap GET karte ho
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {[
                ['WhatsApp auto-reminders (~6 slots × ₹600 recovered)', '₹3,600'],
                ['Patient recall campaigns (dormant patients wapas)', '₹2,400'],
                ['AI Copilot — Rx + summaries (2 hrs/day saved)', '₹3,000'],
                ['Money dashboard + Lost Revenue report', '₹500'],
                ['Staff accounts (3 receptionist + 3 nurse)', '₹1,200'],
              ].map(([item, worth]) => (
                <div key={item} className="flex items-center justify-between border-b border-gray-50 dark:border-gray-900 py-1.5">
                  <p className="text-xs text-foreground">{item}</p>
                  <p className="text-xs font-bold text-emerald-600">{worth}</p>
                </div>
              ))}
              <div className="sm:col-span-2 flex items-center justify-between pt-2">
                <p className="text-sm font-bold text-foreground">Total value</p>
                <p className="text-sm font-bold text-emerald-600">₹10,700/mo</p>
              </div>
              <div className="sm:col-span-2 flex items-center justify-between pb-1">
                <p className="text-sm font-bold text-foreground">Aapki price</p>
                <p className="text-sm font-bold text-teal-600">₹833/mo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trust strip */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 px-4 py-3">
        {[
          { icon: ShieldCheck, text: '60-day ROI ya paisa wapas' },
          { icon: Database, text: 'Data export anytime CSV' },
          { icon: Timer, text: 'Cancel anytime · data 90 din safe' },
          { icon: BadgeCheck, text: 'DPDP-compliant roadmap' },
        ].map((t) => (
          <div key={t.text} className="flex items-center gap-1.5">
            <t.icon className="h-3.5 w-3.5 text-teal-600" />
            <p className="text-[11px] font-medium text-muted-foreground">{t.text}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sawaal jo doctors poochte hain</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-sm text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
