'use client'

/**
 * Hospital Plan & Billing page (PRICING-STRATEGY §2.2 + §4, hospital-role parity).
 *
 * Hero story for 20+ bed facilities: "IPD billing leakage 5–15% hota hai —
 * hum rok dete hain." Leakage-recovery ROI calculator FIRST, Hospital Pro
 * as the recommended card, honest founder banner, trust strip + FAQ.
 * No referral wallet — points economy is doctor-to-doctor only.
 */
import { useMemo, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  CreditCard, Sparkles, Calculator, ShieldCheck, Check, X, Database,
  TrendingUp, Users, Stethoscope, Timer, BadgeCheck, Building2, AlertTriangle, Zap,
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
    features: Record<string, boolean>
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
    limits: Record<string, number>
    features: Record<string, boolean>
  }[]
}

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

const PLAN_HIGHLIGHTS: Record<string, { icon: typeof Zap; text: string }[]> = {
  free: [
    { icon: Stethoscope, text: 'OPD bookings + queue + tokens — unlimited' },
    { icon: Users, text: 'Unlimited patients / records' },
    { icon: Sparkles, text: '1 doctor + 1+1 staff seats' },
    { icon: Database, text: 'Data kabhi delete nahi hota' },
  ],
  pro: [
    { icon: TrendingUp, text: '10 doctor seats, 3+3 staff' },
    { icon: Sparkles, text: '1,000 auto-reminders + 500 AI credits' },
    { icon: BadgeCheck, text: 'OPD billing + lab reports + clinic page' },
  ],
  hospital: [
    { icon: Database, text: 'IPD + OT + insurance pre-auth + claims' },
    { icon: TrendingUp, text: 'Dept-wise revenue + leakage reports' },
    { icon: Users, text: '10 doctor seats, 15+15 staff accounts' },
    { icon: Sparkles, text: '5,000 reminders/mo + 2,000 AI credits' },
    { icon: ShieldCheck, text: 'Dedicated onboarding manager' },
  ],
}

const FAQS = [
  {
    q: 'Leakage report asli mein kya pakadta hai?',
    a: 'Charge master se compare karke: unbilled services, missing charge entries, discount without approval, aur unclaimed insurance items. 20+ bed hospitals mein typically 3–8% monthly billing recover hota hai.',
  },
  {
    q: 'Hamari billing team ko training chahiye hogi?',
    a: 'Charge entry aur IPD billing screens simple hain — 15-minute walkthrough video included. Dedicated onboarding manager Hospital Pro ke saath milta hai.',
  },
  {
    q: 'Data safe rahega? DPDP ka kya?',
    a: 'Data cloud database mein encrypted rehta hai, India region. Kabhi bhi CSV/PDF export. Cancel karne par bhi 90 din tak download ke liye safe.',
  },
  {
    q: 'Paisa waste hoga to?',
    a: '60-day ROI guarantee: agar recovered leakage software ki price se kam ho, to full refund. Risk humara, fayda aapka.',
  },
]

export default function HospitalPlanPage() {
  const [interestDone, setInterestDone] = useState(false)

  // Leakage ROI calculator state
  const [beds, setBeds] = useState(30)
  const [avgBill, setAvgBill] = useState(30000)
  const [occupancy, setOccupancy] = useState(70)
  const [leakagePct, setLeakagePct] = useState(5)

  const { data, isLoading } = useQuery<PlansMe>({
    queryKey: ['plans-me'],
    queryFn: async () => {
      const r = await fetch('/api/plans/me')
      if (!r.ok) throw new Error('Failed to load plan data')
      return r.json()
    },
  })

  const interestMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch('/api/plans/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey: 'hospital' }),
      })
      if (!r.ok) throw new Error('Failed')
    },
    onSuccess: () => {
      setInterestDone(true)
      toast.success('Hospital Pro interest lock ho gaya — team aapse contact karegi 🤝')
    },
    onError: () => toast.error('Thodi der baad try karein'),
  })

  // Leakage math: occupied beds × avg bill × 30 days × leakage%
  const roi = useMemo(() => {
    const monthlyBilling = Math.round(beds * (occupancy / 100) * avgBill * 30)
    const leaked = Math.round(monthlyBilling * (leakagePct / 100))
    const recovered = Math.round(leaked * 0.6) // conservative 60% capture
    const roiMultiple = 4999 > 0 ? Math.round(recovered / 4999) : 0
    return { monthlyBilling, leaked, recovered, roiMultiple }
  }, [beds, avgBill, occupancy, leakagePct])

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

  const isHospital = data.plan.key === 'hospital' && data.plan.status === 'active'
  const isTrial = data.plan.status === 'trialing'

  const usageRows = [
    { label: 'AI Copilot credits', icon: Sparkles, ...data.usage.ai, unit: 'credits' },
    { label: 'WhatsApp reminders', icon: Zap, ...data.usage.whatsapp, unit: 'reminders' },
    { label: 'Doctor seats', icon: Stethoscope, ...data.usage.doctorSeats, unit: 'seats' },
    { label: 'Receptionist seats', icon: Users, ...data.usage.receptionistSeats, unit: 'seats' },
    { label: 'Nurse seats', icon: Users, ...data.usage.nurseSeats, unit: 'seats' },
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
            Ek software, poora hospital ·{' '}
            <span className="font-semibold text-emerald-600">leakage rokna, revenue badhana</span>
          </p>
        </div>
        <Badge
          className={`gap-1.5 text-sm px-4 py-1.5 border-0 ${
            isHospital
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
              : isTrial
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          {isHospital ? <BadgeCheck className="h-4 w-4" /> : isTrial ? <Timer className="h-4 w-4" /> : null}
          {data.plan.name}
          {isHospital && data.plan.currentPeriodEnd
            ? ` · ${format(new Date(data.plan.currentPeriodEnd), 'dd MMM yyyy')} tak`
            : isTrial && data.plan.daysLeft !== null
              ? ` Trial · ${data.plan.daysLeft} din baaki`
              : ''}
        </Badge>
      </motion.div>

      {/* LEAKAGE ROI CALCULATOR — FIRST, numbers before price (§2.2) */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/10 dark:from-teal-950/40 dark:via-emerald-950/30 dark:to-teal-950/40 p-5">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1">
              <Calculator className="h-4 w-4 text-teal-600" />
              IPD Billing Leakage Calculator
            </p>
            <p className="text-xs text-muted-foreground">
              20+ bed hospitals mein billing leakage 5–15% hoti hai — unbilled services, missing entries, unclaimed
              insurance. Apna number daalke dekhein.
            </p>
          </div>
          <CardContent className="p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Total beds</label>
                  <span className="text-sm font-bold text-teal-700 dark:text-teal-400">{beds}</span>
                </div>
                <Slider value={[beds]} onValueChange={([v]) => setBeds(v)} min={10} max={200} step={5} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Avg bill / patient / day</label>
                  <span className="text-sm font-bold text-teal-700 dark:text-teal-400">{inr(avgBill)}</span>
                </div>
                <Slider value={[avgBill]} onValueChange={([v]) => setAvgBill(v)} min={5000} max={100000} step={5000} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Occupancy</label>
                  <span className="text-sm font-bold text-teal-700 dark:text-teal-400">{occupancy}%</span>
                </div>
                <Slider value={[occupancy]} onValueChange={([v]) => setOccupancy(v)} min={30} max={100} step={5} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Leakage %</label>
                  <span className="text-sm font-bold text-red-600">{leakagePct}%</span>
                </div>
                <Slider value={[leakagePct]} onValueChange={([v]) => setLeakagePct(v)} min={1} max={15} step={1} />
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] text-muted-foreground">Monthly IPD billing</p>
                  <p className="text-xl font-bold text-foreground">{inr(roi.monthlyBilling)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Leakage (IS mahine ka nuksaan)</p>
                  <p className="text-xl font-bold text-red-600">{inr(roi.leaked)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Hospital Pro se recover (60%)</p>
                  <p className="text-xl font-bold text-emerald-600">{inr(roi.recovered)}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm font-semibold">
                  Hospital Pro ₹4,999/mo ke against:{' '}
                  <span className={roi.roiMultiple >= 1 ? 'text-emerald-600' : 'text-red-600'}>
                    {roi.roiMultiple}x ROI
                  </span>
                </p>
                {!isHospital && (
                  <p className="text-xs text-muted-foreground italic">
                    Ek leakage-recovered bill, poora saal ka software.
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
                      Limit qareeb hai — Hospital Pro mein zyada {u.unit}
                    </p>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Plan cards — Hospital Pro recommended for this role */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {data.catalog.map((p, i) => {
          const current = p.key === data.plan.key
          const isHospitalCard = p.key === 'hospital'
          return (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              className={isHospitalCard ? 'md:-mt-2 md:mb-2' : ''}
            >
              <Card
                className={`h-full border-0 shadow-md relative overflow-hidden ${
                  isHospitalCard ? 'ring-2 ring-emerald-500 dark:ring-emerald-400' : 'shadow-sm'
                }`}
              >
                {isHospitalCard && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                    RECOMMENDED FOR HOSPITALS
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
                            {inr(p.priceMonthly === 999 ? 1199 : 5999)}/mo
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {inr(p.priceAnnual)}/yr annual billing (2 mahine free)
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-foreground">₹0</span>
                          <span className="text-xs text-muted-foreground">forever</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Basic OPD + queue — data kabhi delete nahi hota
                        </p>
                      </>
                    )}
                  </div>

                  <div className="mt-4 space-y-2 flex-1">
                    {(PLAN_HIGHLIGHTS[p.key] ?? []).map((h) => (
                      <div key={h.text} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-foreground leading-snug">{h.text}</p>
                      </div>
                    ))}
                    {p.key === 'free' && (
                      <div className="flex items-start gap-2">
                        <X className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-muted-foreground">
                          IPD billing, OT scheduling, insurance, leakage reports — Hospital Pro features
                        </p>
                      </div>
                    )}
                  </div>

                  {isHospitalCard ? (
                    interestDone ? (
                      <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-medium py-2.5">
                        <BadgeCheck className="h-4 w-4" />
                        Interest locked — team contact karegi
                      </div>
                    ) : (
                      <Button
                        className="mt-4 w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                        onClick={() => interestMutation.mutate()}
                        disabled={interestMutation.isPending || current}
                      >
                        <Building2 className="h-4 w-4" />
                        {current ? 'Current plan' : 'Hospital Pro kholo'}
                      </Button>
                    )
                  ) : p.key === 'pro' ? (
                    <Button
                      className="mt-4 w-full"
                      variant="outline"
                      onClick={() => interestMutation.mutate()}
                      disabled={interestMutation.isPending || current}
                    >
                      {current ? 'Current plan' : 'Chhote hospital ke liye'}
                    </Button>
                  ) : (
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

      {/* Value stack — Hospital Pro */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Hospital Pro value stack — jo aap GET karte ho</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {[
                ['Leakage recovery reports (3–8% billing wapas)', '₹40,000+/mo'],
                ['IPD billing + charge master + insurance claims', '₹15,000'],
                ['OT scheduling + department analytics', '₹8,000'],
                ['10 doctor + 15+15 staff accounts', '₹6,000'],
                ['5,000 auto-reminders + 2,000 AI credits', '₹5,000'],
                ['Dedicated onboarding manager', '₹3,000'],
              ].map(([item, worth]) => (
                <div key={item} className="flex items-center justify-between border-b border-gray-50 dark:border-gray-900 py-1.5">
                  <p className="text-xs text-foreground">{item}</p>
                  <p className="text-xs font-bold text-emerald-600">{worth}</p>
                </div>
              ))}
              <div className="sm:col-span-2 flex items-center justify-between pt-2">
                <p className="text-sm font-bold text-foreground">Aapki price</p>
                <p className="text-sm font-bold text-teal-600">₹4,999/mo effective</p>
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

      {/* Leakage explainer */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50/60 to-orange-50/60 dark:from-amber-950/20 dark:to-orange-950/10">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Leakage kahan hoti hai — 4 chhupe hue chor
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { title: 'Unbilled services', desc: 'Nursing procedures, consumables, extras jo bill mein enter nahi hue.' },
                { title: 'Missing charge entries', desc: 'Ward/ICU days ya doctor visits jo discharge tak count nahi hue.' },
                { title: 'Discount bina approval', desc: 'Ad-hoc discounts jo margin chhaap jaate hain — audit trail zero.' },
                { title: 'Unclaimed insurance', desc: 'Pre-auth items jo claim file mein submit hi nahi hue.' },
              ].map((c) => (
                <div key={c.title} className="rounded-xl bg-white/70 dark:bg-gray-900/40 border border-amber-100 dark:border-amber-900/50 p-3">
                  <p className="text-xs font-bold text-foreground">{c.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-1">{c.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQ */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sawaal jo hospital admins poochte hain</CardTitle>
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
