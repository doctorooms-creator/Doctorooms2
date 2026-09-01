'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  Brain,
  Calculator,
  ClipboardList,
  Droplets,
  Footprints,
  GlassWater,
  HeartPulse,
  Info,
  Ruler,
  Scale,
  ShieldCheck,
  Stethoscope,
  Target,
  Thermometer,
  TriangleAlert,
  UserRound,
} from 'lucide-react'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/* ------------------------------------------------------------------ */
/* Shared animations                                                   */
/* ------------------------------------------------------------------ */

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
}

/* ------------------------------------------------------------------ */
/* Calculator metadata (for quick-jump grid + tabs)                   */
/* ------------------------------------------------------------------ */

type CalcId = 'bmi' | 'tdee' | 'water' | 'ibw' | 'symptoms'

const CALCULATORS: {
  id: CalcId
  name: string
  description: string
  icon: typeof Activity
  accent: string
}[] = [
  {
    id: 'bmi',
    name: 'BMI Calculator',
    description: 'Body Mass Index from your height & weight',
    icon: Scale,
    accent: 'text-teal-600 dark:text-teal-400',
  },
  {
    id: 'tdee',
    name: 'BMR & Daily Calories',
    description: 'Calorie needs based on activity level',
    icon: Activity,
    accent: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'water',
    name: 'Water Intake',
    description: 'Daily hydration goal in litres & glasses',
    icon: Droplets,
    accent: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'ibw',
    name: 'Ideal Body Weight',
    description: 'Devine formula & healthy BMI weight range',
    icon: Target,
    accent: 'text-teal-600 dark:text-teal-400',
  },
  {
    id: 'symptoms',
    name: 'Symptom Checker',
    description: 'Find the right specialist for your symptoms',
    icon: ClipboardList,
    accent: 'text-amber-600 dark:text-amber-400',
  },
]

/* ------------------------------------------------------------------ */
/* Activity multipliers (TDEE)                                         */
/* ------------------------------------------------------------------ */

const ACTIVITY_LEVELS = [
  { value: '1.2', label: 'Sedentary (little or no exercise)' },
  { value: '1.375', label: 'Lightly Active (1-3 days/week)' },
  { value: '1.55', label: 'Moderately Active (3-5 days/week)' },
  { value: '1.725', label: 'Very Active (6-7 days/week)' },
  { value: '1.9', label: 'Extra Active (physical job + training)' },
]

/* ------------------------------------------------------------------ */
/* Symptom data                                                        */
/* ------------------------------------------------------------------ */

const SPECIALISTS: Record<
  string,
  { display: string; slug: string; icon: typeof Activity }
> = {
  cardiologist: { display: 'Cardiologist', slug: 'Cardiologist', icon: HeartPulse },
  pulmonologist: { display: 'Pulmonologist', slug: 'Pulmonologist', icon: Activity },
  neurologist: { display: 'Neurologist', slug: 'Neurologist', icon: Brain },
  ent: { display: 'ENT Specialist', slug: 'ENT Specialist', icon: Stethoscope },
  ophthalmologist: { display: 'Ophthalmologist', slug: 'Ophthalmologist', icon: UserRound },
  gastro: { display: 'Gastroenterologist', slug: 'Gastroenterology', icon: Activity },
  ortho: { display: 'Orthopedist', slug: 'Orthopedics', icon: Ruler },
  derm: { display: 'Dermatologist', slug: 'Dermatologist', icon: ShieldCheck },
  general: { display: 'General Physician', slug: 'General Physician', icon: Stethoscope },
}

type Symptom = { id: string; label: string; spec: keyof typeof SPECIALISTS }

const SYMPTOM_GROUPS: {
  label: string
  icon: typeof Activity
  symptoms: Symptom[]
}[] = [
  {
    label: 'Head & Neck',
    icon: Brain,
    symptoms: [
      { id: 'headache', label: 'Headache', spec: 'neurologist' },
      { id: 'dizziness', label: 'Dizziness', spec: 'neurologist' },
      { id: 'sore-throat', label: 'Sore Throat', spec: 'ent' },
      { id: 'vision-changes', label: 'Vision Changes', spec: 'ophthalmologist' },
    ],
  },
  {
    label: 'Chest & Respiratory',
    icon: HeartPulse,
    symptoms: [
      { id: 'chest-pain', label: 'Chest Pain', spec: 'cardiologist' },
      { id: 'shortness-breath', label: 'Shortness of Breath', spec: 'pulmonologist' },
      { id: 'cough', label: 'Persistent Cough', spec: 'pulmonologist' },
      { id: 'wheezing', label: 'Wheezing', spec: 'pulmonologist' },
    ],
  },
  {
    label: 'Abdomen & Digestion',
    icon: Activity,
    symptoms: [
      { id: 'stomach-pain', label: 'Stomach Pain', spec: 'gastro' },
      { id: 'nausea', label: 'Nausea', spec: 'gastro' },
      { id: 'vomiting', label: 'Vomiting', spec: 'gastro' },
      { id: 'diarrhea', label: 'Diarrhoea', spec: 'gastro' },
      { id: 'constipation', label: 'Constipation', spec: 'gastro' },
    ],
  },
  {
    label: 'General',
    icon: Thermometer,
    symptoms: [
      { id: 'fever', label: 'Fever', spec: 'general' },
      { id: 'fatigue', label: 'Fatigue', spec: 'general' },
      { id: 'weight-loss', label: 'Unexplained Weight Loss', spec: 'general' },
      { id: 'joint-pain', label: 'Joint Pain', spec: 'ortho' },
      { id: 'skin-rash', label: 'Skin Rash', spec: 'derm' },
    ],
  },
]

const ALL_SYMPTOMS: Symptom[] = SYMPTOM_GROUPS.flatMap((g) => g.symptoms)

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function HealthToolsPage() {
  const [activeTab, setActiveTab] = useState<CalcId>('bmi')

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 h-40 w-40 rounded-full bg-white" />
          <div className="absolute bottom-10 right-10 h-60 w-60 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/3 h-24 w-24 rounded-full bg-white" />
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5 text-xs font-medium mb-5">
              <Calculator className="h-3.5 w-3.5" />
              Patient Education Tools
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Free <span className="text-teal-200">Health Tools</span>
            </h1>
            <p className="text-base md:text-lg text-teal-50 leading-relaxed max-w-2xl mx-auto">
              Quick, evidence-based calculators to help you understand your health metrics.
              Always consult a doctor for medical advice.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick-jump grid */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <motion.div
          {...fadeIn}
          className="text-center mb-8 md:mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Pick a tool to get started</h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Five quick calculators — pick the one that matches your need.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5"
        >
          {CALCULATORS.map((c) => (
            <motion.div key={c.id} variants={fadeIn}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab(c.id)
                  document
                    .getElementById('calculators')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="group h-full w-full text-left"
              >
                <Card className="h-full hover:shadow-md hover:border-teal-400 dark:hover:border-teal-600 transition-all duration-300 hover:-translate-y-0.5">
                  <CardContent className="p-5 md:p-6">
                    <div className="h-11 w-11 rounded-xl bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center mb-3 group-hover:bg-teal-100 dark:group-hover:bg-teal-950/50 transition-colors">
                      <c.icon className={`h-5 w-5 ${c.accent}`} />
                    </div>
                    <h3 className="font-semibold text-sm md:text-base mb-1">{c.name}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {c.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400 group-hover:gap-2 transition-all">
                      Open tool <ArrowRight className="h-3 w-3" />
                    </span>
                  </CardContent>
                </Card>
              </button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Separator />

      {/* Calculators */}
      <section id="calculators" className="container mx-auto px-4 py-12 md:py-16 scroll-mt-20">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CalcId)} className="w-full">
          <TabsList className="bg-muted text-muted-foreground h-auto p-1 grid grid-cols-3 sm:grid-cols-5 gap-1 w-full rounded-xl">
            {CALCULATORS.map((c) => (
              <TabsTrigger
                key={c.id}
                value={c.id}
                className="flex-col items-stretch gap-0.5 py-2 h-auto text-xs sm:text-sm data-[state=active]:bg-teal-50 dark:data-[state=active]:bg-teal-950/40 data-[state=active]:text-teal-700 dark:data-[state=active]:text-teal-300"
              >
                <c.icon className="h-4 w-4 mb-0.5" />
                <span className="leading-tight">{c.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="bmi" className="mt-6 md:mt-8">
            <BmiCalculator />
          </TabsContent>
          <TabsContent value="tdee" className="mt-6 md:mt-8">
            <TdeeCalculator />
          </TabsContent>
          <TabsContent value="water" className="mt-6 md:mt-8">
            <WaterCalculator />
          </TabsContent>
          <TabsContent value="ibw" className="mt-6 md:mt-8">
            <IbwCalculator />
          </TabsContent>
          <TabsContent value="symptoms" className="mt-6 md:mt-8">
            <SymptomChecker />
          </TabsContent>
        </Tabs>
      </section>

      <Separator />

      {/* Disclaimer */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="rounded-xl border border-amber-300/60 dark:border-amber-700/40 bg-amber-50 dark:bg-amber-950/20 p-5 md:p-6 flex gap-4 items-start">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <TriangleAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-amber-900 dark:text-amber-200">
              Medical Disclaimer
            </h3>
            <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-100/80">
              These tools provide general information only and are not a substitute for
              professional medical advice, diagnosis, or treatment. Always seek the guidance of
              a qualified healthcare provider with any questions you have regarding a medical
              condition. Never disregard professional medical advice or delay in seeking it
              because of something you read here.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}

/* ================================================================== */
/* 1. BMI Calculator                                                   */
/* ================================================================== */

function BmiCalculator() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')

  const h = parseFloat(height)
  const w = parseFloat(weight)
  const valid = h > 0 && w > 0
  const bmi = valid ? w / Math.pow(h / 100, 2) : null

  const category = useMemo(() => {
    if (bmi == null) return null
    if (bmi < 18.5) return { label: 'Underweight', color: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' }
    if (bmi < 25) return { label: 'Normal', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' }
    if (bmi < 30) return { label: 'Overweight', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' }
    return { label: 'Obese', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' }
  }, [bmi])

  // Scale: 15 → 40 (clamped)
  const scaleMin = 15
  const scaleMax = 40
  const markerPct = bmi == null ? null : Math.max(0, Math.min(100, ((bmi - scaleMin) / (scaleMax - scaleMin)) * 100))

  return (
    <Card>
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center">
            <Scale className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold">BMI Calculator</h3>
            <p className="text-sm text-muted-foreground">
              Body Mass Index — a quick weight-vs-height screening metric.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="bmi-height">Height (cm)</Label>
            <Input
              id="bmi-height"
              type="number"
              inputMode="decimal"
              min={50}
              max={250}
              placeholder="e.g. 175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bmi-weight">Weight (kg)</Label>
            <Input
              id="bmi-weight"
              type="number"
              inputMode="decimal"
              min={10}
              max={400}
              placeholder="e.g. 70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        </div>

        {bmi != null && category ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Your BMI</p>
                <p className="text-5xl font-bold text-foreground">{bmi.toFixed(1)}</p>
              </div>
              <Badge className={`px-3 py-1 text-sm ${category.color}`}>{category.label}</Badge>
            </div>

            {/* Scale */}
            <div>
              <div className="relative h-3 w-full rounded-full overflow-hidden bg-[linear-gradient(to_right,#ccfbf1_0%,#5eead4_18%,#34d399_36%,#fde68a_58%,#fdba74_76%,#f43f5e_100%)]">
                {markerPct != null && (
                  <motion.div
                    initial={{ left: '50%', opacity: 0 }}
                    animate={{ left: `${markerPct}%`, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 rounded-full border-2 border-white bg-foreground shadow-md"
                  />
                )}
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
                <span>15</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40</span>
              </div>
            </div>

            {/* Category legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="rounded-md bg-sky-50 dark:bg-sky-950/30 px-2.5 py-2">
                <span className="font-semibold text-sky-700 dark:text-sky-300">Underweight</span>
                <span className="block text-muted-foreground">&lt; 18.5</span>
              </div>
              <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-2">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Normal</span>
                <span className="block text-muted-foreground">18.5 – 24.9</span>
              </div>
              <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 px-2.5 py-2">
                <span className="font-semibold text-amber-700 dark:text-amber-300">Overweight</span>
                <span className="block text-muted-foreground">25 – 29.9</span>
              </div>
              <div className="rounded-md bg-rose-50 dark:bg-rose-950/30 px-2.5 py-2">
                <span className="font-semibold text-rose-700 dark:text-rose-300">Obese</span>
                <span className="block text-muted-foreground">≥ 30</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Enter your height and weight to see your BMI.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ================================================================== */
/* 2. BMR & TDEE                                                      */
/* ================================================================== */

function TdeeCalculator() {
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [activity, setActivity] = useState('1.55')

  const a = parseFloat(age)
  const h = parseFloat(height)
  const w = parseFloat(weight)
  const mult = parseFloat(activity)
  const valid = a > 0 && h > 0 && w > 0

  // Mifflin-St Jeor
  const bmr = valid
    ? 10 * w + 6.25 * h - 5 * a + (gender === 'male' ? 5 : -161)
    : null
  const tdee = bmr != null ? bmr * mult : null

  const cards = tdee != null
    ? [
        {
          label: 'Weight Loss',
          sub: '−500 kcal/day',
          value: Math.max(0, Math.round(tdee - 500)),
          badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
          icon: Target,
        },
        {
          label: 'Maintenance',
          sub: 'stay at current weight',
          value: Math.round(tdee),
          badge: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
          icon: Activity,
        },
        {
          label: 'Weight Gain',
          sub: '+500 kcal/day',
          value: Math.round(tdee + 500),
          badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
          icon: Scale,
        },
      ]
    : []

  return (
    <Card>
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
            <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold">BMR &amp; Daily Calories (TDEE)</h3>
            <p className="text-sm text-muted-foreground">
              Mifflin-St Jeor equation — your daily energy needs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="tdee-age">Age (years)</Label>
            <Input
              id="tdee-age"
              type="number"
              min={10}
              max={120}
              placeholder="e.g. 30"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as 'male' | 'female')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tdee-height">Height (cm)</Label>
            <Input
              id="tdee-height"
              type="number"
              min={50}
              max={250}
              placeholder="e.g. 175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tdee-weight">Weight (kg)</Label>
            <Input
              id="tdee-weight"
              type="number"
              min={10}
              max={400}
              placeholder="e.g. 70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2 lg:col-span-2">
            <Label>Activity Level</Label>
            <Select value={activity} onValueChange={setActivity}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select activity" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_LEVELS.map((lv) => (
                  <SelectItem key={lv.value} value={lv.value}>
                    {lv.label} (×{lv.value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {bmr != null && tdee != null ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Basal Metabolic Rate
                </p>
                <p className="text-3xl font-bold text-foreground">{Math.round(bmr)} <span className="text-base font-normal text-muted-foreground">kcal/day</span></p>
              </div>
              <Separator orientation="vertical" className="hidden sm:block h-10" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Total Daily Energy (TDEE)
                </p>
                <p className="text-3xl font-bold text-foreground">{Math.round(tdee)} <span className="text-base font-normal text-muted-foreground">kcal/day</span></p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {cards.map((c) => (
                <Card key={c.label} className="border-t-4 border-t-teal-500/60 dark:border-t-teal-700/40">
                  <CardContent className="p-5 text-center">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center mb-3 mx-auto">
                      <c.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Badge className={`mb-2 ${c.badge}`}>{c.label}</Badge>
                    <p className="text-2xl font-bold">{c.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">kcal / day</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimates use the Mifflin-St Jeor equation × an activity multiplier. For personalised
              plans consult a registered dietitian or physician.
            </p>
          </motion.div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Enter age, height, weight &amp; activity level to see your calorie targets.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ================================================================== */
/* 3. Water Intake                                                    */
/* ================================================================== */

function WaterCalculator() {
  const [weight, setWeight] = useState('')
  const [exercise, setExercise] = useState('')

  const w = parseFloat(weight)
  const ex = parseFloat(exercise) || 0
  const valid = w > 0
  const liters = valid ? w * 0.033 + ex * 0.035 : null
  const ml = liters != null ? liters * 1000 : 0
  const glasses = liters != null ? Math.ceil(ml / 250) : 0

  // Bottle visual: full at 4L
  const fillPct = liters != null ? Math.min(100, (liters / 4) * 100) : 0

  return (
    <Card>
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 flex items-center justify-center">
            <Droplets className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Water Intake Calculator</h3>
            <p className="text-sm text-muted-foreground">
              Estimate your daily hydration goal based on body weight &amp; exercise.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="water-weight">Body Weight (kg)</Label>
              <Input
                id="water-weight"
                type="number"
                min={10}
                max={400}
                placeholder="e.g. 70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="water-exercise">Exercise (minutes/day)</Label>
              <Input
                id="water-exercise"
                type="number"
                min={0}
                max={600}
                placeholder="e.g. 30"
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
              />
            </div>

            {liters != null ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-cyan-50 dark:bg-cyan-950/30 p-4">
                <p className="text-xs uppercase tracking-wider text-cyan-700 dark:text-cyan-300 mb-1">
                  Recommended intake
                </p>
                <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">
                  {liters.toFixed(2)} <span className="text-base font-normal">L / day</span>
                </p>
                <p className="text-xs text-cyan-700/80 dark:text-cyan-300/80 mt-1">
                  ≈ {ml.toFixed(0)} ml · {glasses} glass{glasses === 1 ? '' : 'es'} of 250 ml
                </p>
              </motion.div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                Enter your weight to see your hydration goal.
              </div>
            )}
          </div>

          {/* Bottle visual */}
          <div className="flex flex-col items-center justify-center rounded-lg bg-muted/40 p-6">
            <div className="relative h-56 w-32">
              {/* Cap */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-4 w-12 rounded-md bg-cyan-700 dark:bg-cyan-500" />
              {/* Neck */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 h-3 w-6 bg-cyan-200/80 dark:bg-cyan-900/60" />
              {/* Bottle body */}
              <div className="absolute inset-x-0 top-4 bottom-0 rounded-2xl border-2 border-cyan-300 dark:border-cyan-700 overflow-hidden bg-white/60 dark:bg-cyan-950/20">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${fillPct}%` }}
                  transition={{ type: 'spring', stiffness: 90, damping: 20 }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500 to-cyan-300"
                >
                  {/* Wave caps */}
                  <div className="absolute -top-1 left-0 right-0 h-2 bg-cyan-200/40 rounded-full" />
                </motion.div>
                {/* Markers */}
                <div className="absolute inset-0 flex flex-col justify-between py-3 px-1 pointer-events-none">
                  <span className="block h-px bg-cyan-300/50" />
                  <span className="block h-px bg-cyan-300/50" />
                  <span className="block h-px bg-cyan-300/50" />
                  <span className="block h-px bg-cyan-300/50" />
                </div>
              </div>
              {/* Glass icon */}
              <GlassWater className="absolute -right-2 top-8 h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground text-center">
              Bottle fill is illustrative (100% = 4 L).
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ================================================================== */
/* 4. Ideal Body Weight (IBW)                                         */
/* ================================================================== */

function IbwCalculator() {
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [height, setHeight] = useState('')

  const h = parseFloat(height)
  const valid = h > 0
  // Devine formula (cm-based equivalent)
  const ibw = valid
    ? (gender === 'male' ? 50 : 45.5) + 0.91 * (h - 152.4)
    : null
  // Healthy BMI range
  const hM = valid ? h / 100 : 0
  const low = valid ? 18.5 * hM * hM : null
  const high = valid ? 24.9 * hM * hM : null

  return (
    <Card>
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center">
            <Target className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Ideal Body Weight (IBW)</h3>
            <p className="text-sm text-muted-foreground">
              Devine formula plus a healthy BMI weight range.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as 'male' | 'female')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ibw-height">Height (cm)</Label>
            <Input
              id="ibw-height"
              type="number"
              min={50}
              max={250}
              placeholder="e.g. 175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
        </div>

        {ibw != null && low != null && high != null ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-teal-50 dark:bg-teal-950/30 p-5">
              <div className="flex items-center gap-2 mb-1.5">
                <Target className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <p className="text-xs uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  Ideal Body Weight
                </p>
              </div>
              <p className="text-3xl font-bold text-teal-900 dark:text-teal-100">
                {ibw.toFixed(1)} <span className="text-base font-normal">kg</span>
              </p>
              <p className="text-xs text-teal-700/80 dark:text-teal-300/80 mt-1">
                Devine formula ({gender === 'male' ? 'men' : 'women'})
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-5">
              <div className="flex items-center gap-2 mb-1.5">
                <Scale className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Healthy BMI Range
                </p>
              </div>
              <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                {low.toFixed(1)}–{high.toFixed(1)} <span className="text-base font-normal">kg</span>
              </p>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-1">
                BMI 18.5–24.9 at your height
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Enter your gender &amp; height to see your ideal weight range.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ================================================================== */
/* 5. Symptom Checker                                                  */
/* ================================================================== */

function SymptomChecker() {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Tally specialists
  const tally = useMemo(() => {
    const counts: Record<string, number> = {}
    ALL_SYMPTOMS.forEach((s) => {
      if (selected.has(s.id)) {
        counts[s.spec] = (counts[s.spec] || 0) + 1
      }
    })
    return counts
  }, [selected])

  const recommendations = useMemo(() => {
    const entries = Object.entries(tally).sort((a, b) => b[1] - a[1])
    if (entries.length === 0) return []
    // Top 3 specialists
    return entries.slice(0, 3).map(([spec, count]) => ({ spec, count }))
  }, [tally])

  const defaultRec = selected.size > 0 && recommendations.length === 0 ? 'general' : null
  const showRecs = recommendations.length > 0 || defaultRec != null

  return (
    <Card>
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Symptom Checker</h3>
            <p className="text-sm text-muted-foreground">
              Pick your symptoms — we&apos;ll suggest the right specialist to consult.
            </p>
          </div>
        </div>

        {/* Intra-tool disclaimer */}
        <div className="mb-6 rounded-lg border border-amber-300/60 dark:border-amber-700/40 bg-amber-50 dark:bg-amber-950/20 p-3 flex gap-2 items-start text-xs">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-800 dark:text-amber-100/80 leading-relaxed">
            For informational purposes only — not a substitute for professional medical advice.
            Always consult a doctor.
          </p>
        </div>

        {/* Symptom groups */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          {SYMPTOM_GROUPS.map((group) => (
            <div key={group.label} className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-md bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center">
                  <group.icon className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                </div>
                <h4 className="text-sm font-semibold">{group.label}</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.symptoms.map((s) => {
                  const checked = selected.has(s.id)
                  return (
                    <label
                      key={s.id}
                      className={`flex items-center gap-2 rounded-md border px-2.5 py-2 cursor-pointer text-sm transition-colors ${
                        checked
                          ? 'border-teal-400 dark:border-teal-600 bg-teal-50 dark:bg-teal-950/30'
                          : 'border-border hover:bg-muted/60'
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggle(s.id)}
                      />
                      <span className="leading-tight">{s.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Action row */}
        {selected.size > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selected.size} symptom{selected.size === 1 ? '' : 's'} selected
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set())}
              className="text-muted-foreground"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Recommendations */}
        {showRecs ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Footprints className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Recommended specialist{recommendations.length > 1 || defaultRec ? 's' : ''} to consult
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recommendations.map(({ spec, count }) => {
                const sp = SPECIALISTS[spec]
                const Icon = sp.icon
                return (
                  <div
                    key={spec}
                    className="rounded-lg border border-border p-4 flex flex-col gap-3 hover:border-teal-400 dark:hover:border-teal-600 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-md bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm leading-tight">{sp.display}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {count} matching symptom{count === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>
                    <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700 text-white w-full">
                      <Link href={`/doctors?specialization=${encodeURIComponent(sp.slug)}`}>
                        Find {sp.display} Doctors
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                )
              })}
              {defaultRec && (
                <div className="rounded-lg border border-border p-4 flex flex-col gap-3 hover:border-teal-400 dark:hover:border-teal-600 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-md bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center">
                      <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm leading-tight">General Physician</p>
                      <p className="text-[11px] text-muted-foreground">Good first point of contact</p>
                    </div>
                  </div>
                  <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700 text-white w-full">
                    <Link href={`/doctors?specialization=${encodeURIComponent('General Physician')}`}>
                      Find General Physician Doctors
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              These suggestions are based on common symptom–specialist associations and are not a
              diagnosis. In an emergency, call your local emergency number immediately.
            </p>
          </motion.div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Select one or more symptoms above to see specialist recommendations.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
