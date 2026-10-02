'use client'

import { motion } from 'framer-motion'
import {
  Accessibility,
  ArrowDown,
  ArrowRight,
  Baby,
  Bandage,
  Brain,
  Check,
  ClipboardList,
  CloudLightning,
  Droplet,
  ExternalLink,
  EyeOff,
  FlaskConical,
  Flame,
  Hand,
  Heart,
  HeartHandshake,
  HeartPulse,
  Hourglass,
  LifeBuoy,
  Lock,
  MessageCircleHeart,
  Phone,
  PhoneCall,
  Printer,
  Shield,
  ShieldAlert,
  Siren,
  Stethoscope,
  TriangleAlert,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PublicLayout } from '@/components/layout/public-layout'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

/* ------------------------------------------------------------------ */
/* Shared animations                                                   */
/* ------------------------------------------------------------------ */

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
}

/* ------------------------------------------------------------------ */
/* Tone system (red for emergency, teal/emerald for care)              */
/* ------------------------------------------------------------------ */

type Tone = 'red' | 'rose' | 'slate' | 'amber' | 'emerald' | 'teal'

const TONE_STYLES: Record<
  Tone,
  { icon: string; number: string; border: string }
> = {
  red: {
    icon: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
    number: 'text-red-600 dark:text-red-400',
    border: 'hover:border-red-300 dark:hover:border-red-800',
  },
  rose: {
    icon: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    number: 'text-rose-600 dark:text-rose-400',
    border: 'hover:border-rose-300 dark:hover:border-rose-800',
  },
  slate: {
    icon: 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300',
    number: 'text-slate-800 dark:text-slate-100',
    border: 'hover:border-slate-300 dark:hover:border-slate-700',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    number: 'text-amber-600 dark:text-amber-500',
    border: 'hover:border-amber-300 dark:hover:border-amber-800',
  },
  emerald: {
    icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    number: 'text-emerald-600 dark:text-emerald-400',
    border: 'hover:border-emerald-300 dark:hover:border-emerald-800',
  },
  teal: {
    icon: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400',
    number: 'text-teal-600 dark:text-teal-400',
    border: 'hover:border-teal-300 dark:hover:border-teal-800',
  },
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

type EmergencyContact = {
  number: string
  tel: string
  label: string
  desc: string
  icon: LucideIcon
  tone: Tone
}

const NATIONAL_NUMBERS: EmergencyContact[] = [
  {
    number: '108',
    tel: '108',
    label: 'Ambulance',
    desc: 'Free 24×7 emergency ambulance service',
    icon: Siren,
    tone: 'red',
  },
  {
    number: '112',
    tel: '112',
    label: 'National Emergency',
    desc: 'All-in-one — police, fire & medical (ERSS)',
    icon: ShieldAlert,
    tone: 'red',
  },
  {
    number: '100',
    tel: '100',
    label: 'Police',
    desc: 'Immediate police assistance',
    icon: Shield,
    tone: 'slate',
  },
  {
    number: '101',
    tel: '101',
    label: 'Fire Brigade',
    desc: 'Fire & rescue services',
    icon: Flame,
    tone: 'amber',
  },
  {
    number: '1091',
    tel: '1091',
    label: 'Women Helpline',
    desc: 'Distress & domestic violence support',
    icon: HeartHandshake,
    tone: 'rose',
  },
  {
    number: '1098',
    tel: '1098',
    label: 'Child Helpline',
    desc: 'CHILDLINE — abuse, labour, missing children',
    icon: Baby,
    tone: 'emerald',
  },
  {
    number: '1078',
    tel: '1078',
    label: 'Disaster Management',
    desc: 'Natural calamities & rescue coordination',
    icon: CloudLightning,
    tone: 'slate',
  },
  {
    number: '14567',
    tel: '14567',
    label: 'Senior Citizens',
    desc: 'Elder Line — care, abuse & legal aid',
    icon: Accessibility,
    tone: 'teal',
  },
  {
    number: '104',
    tel: '104',
    label: 'Medical Helpline',
    desc: '24×7 health advice & hospital guidance',
    icon: Stethoscope,
    tone: 'teal',
  },
  {
    number: '1930',
    tel: '1930',
    label: 'Cyber Crime',
    desc: 'Online fraud, UPI scams & reporting',
    icon: Lock,
    tone: 'slate',
  },
]

const BLOOD_AND_SUPPORT: EmergencyContact[] = [
  {
    number: '1910',
    tel: '1910',
    label: 'Blood Bank Helpline',
    desc: 'Locate the nearest blood bank & check availability',
    icon: Droplet,
    tone: 'red',
  },
  {
    number: '14567',
    tel: '14567',
    label: 'Elder Helpline',
    desc: 'Senior citizen health, care & support (Elder Line)',
    icon: Heart,
    tone: 'teal',
  },
  {
    number: '1090',
    tel: '1090',
    label: 'Anti-Terrorism Tip Line',
    desc: 'Report suspicious activity — fully anonymous',
    icon: EyeOff,
    tone: 'slate',
  },
]

type Helpline = {
  name: string
  desc: string
  numbers: { display: string; tel: string }[]
  icon: LucideIcon
  tone: 'teal' | 'emerald'
  note: string
}

const MENTAL_HELPLINES: Helpline[] = [
  {
    name: 'Tele-MANAS',
    desc: 'Ministry of Health & Family Welfare — free 24×7 tele-mental-health counselling in 20+ Indian languages.',
    numbers: [
      { display: '14416', tel: '14416' },
      { display: '1-800-891-4416', tel: '18008914416' },
    ],
    icon: Brain,
    tone: 'teal',
    note: '24/7 · Free · Confidential',
  },
  {
    name: 'KIRAN Helpline',
    desc: 'National mental-health rehabilitation helpline for stress, anxiety, depression and addiction support.',
    numbers: [{ display: '1800-599-0019', tel: '18005990019' }],
    icon: LifeBuoy,
    tone: 'emerald',
    note: '24/7 · Free',
  },
  {
    name: 'AASRA',
    desc: 'Suicide prevention and emotional support — trained volunteers who listen without judgement.',
    numbers: [{ display: '+91-9820466726', tel: '+919820466726' }],
    icon: MessageCircleHeart,
    tone: 'teal',
    note: 'Confidential',
  },
  {
    name: 'Vandrevala Foundation',
    desc: 'Round-the-clock counselling by mental-health professionals for anxiety, grief and crisis.',
    numbers: [
      { display: '1860-2662-345', tel: '18602662345' },
      { display: '+91-9999-666-555', tel: '+919999666555' },
    ],
    icon: PhoneCall,
    tone: 'emerald',
    note: '24/7',
  },
]

type FirstAidItem = {
  title: string
  icon: LucideIcon
  intro?: string
  bullets?: string[]
  dos?: string[]
  donts?: string[]
  warning?: string
}

const FIRST_AID: FirstAidItem[] = [
  {
    title: 'While waiting for the ambulance',
    icon: Hourglass,
    intro: 'What you do in the first few minutes matters.',
    bullets: [
      'Keep the patient calm, still and reassured — panic raises heart rate and blood pressure.',
      'Loosen tight clothing — collar, belt, tie — to help them breathe.',
      'If the patient is unconscious but breathing, lay them on their side (recovery position) to keep the airway clear.',
      'Do NOT give food or water to an unconscious or semi-conscious patient.',
      'Collect the patient’s medicines, prescriptions, ID and insurance card to hand to the doctors.',
      'Unlock your main door or gate so paramedics can reach the patient without delay.',
    ],
  },
  {
    title: 'Information to give the emergency operator',
    icon: ClipboardList,
    intro: 'Clear information gets help to you faster.',
    bullets: [
      'Your exact location — full address plus the nearest landmark (temple, school, metro station, shop).',
      'The patient’s age and current condition — conscious? breathing? bleeding? chest pain?',
      'Known medical conditions (diabetes, heart disease, pregnancy, seizures) and any allergies.',
      'Your callback mobile number — say it twice, slowly.',
      'Stay on the line until the operator tells you to hang up.',
    ],
  },
  {
    title: 'Choking — Heimlich maneuver basics',
    icon: Hand,
    intro: 'If the person cannot speak, cough or breathe, act immediately.',
    bullets: [
      'Ask “Are you choking?” — inability to speak or cough means the airway is blocked.',
      'Stand behind the person and wrap your arms around their waist.',
      'Make a fist, place it just above the navel (thumb side in) and grasp it with your other hand.',
      'Give quick, hard inward-and-upward abdominal thrusts until the object pops out.',
      'If they become unconscious: lower them to the floor, call 112 and start CPR.',
      'For babies under 1 year: 5 back blows + 5 chest thrusts — never abdominal thrusts.',
    ],
  },
  {
    title: 'Heavy bleeding — first response',
    icon: Bandage,
    bullets: [
      'Call 108 immediately for heavy or spurting blood.',
      'Press hard and continuously on the wound with a clean cloth or your palm.',
      'Raise the injured limb above heart level — unless a broken bone is suspected.',
      'Blood soaking through? Add fresh layers on top — never remove the first dressing.',
      'Do not pull out embedded objects (glass, metal) — pad tightly around them instead.',
    ],
    warning:
      'A cloth tourniquet is a last resort, only for life-threatening limb bleeding that firm pressure cannot stop. Note the exact time you applied it and tell the paramedics — an improperly used tourniquet can damage the limb.',
  },
  {
    title: 'Burns — DOs and DON’Ts',
    intro:
      'Seek emergency care if the burn is larger than the patient’s palm, or affects the face, hands, feet or genitals, or is a chemical / electrical burn.',
    icon: Flame,
    dos: [
      'Cool the burn under gently running water for 10–15 minutes.',
      'Remove rings, watches and tight clothing near the burn before swelling starts.',
      'Cover the burn loosely with a clean, non-fluffy cloth or cling film.',
    ],
    donts: [
      'No ice or ice-cold water — it deepens tissue damage.',
      'No toothpaste, turmeric, ghee or oils — they trap heat and cause infection.',
      'Don’t burst blisters or peel clothing stuck to the skin.',
    ],
  },
  {
    title: 'Heart attack signs',
    icon: HeartPulse,
    bullets: [
      'Chest pain, pressure, squeezing or fullness — usually centre or left side — lasting more than 15 minutes.',
      'Pain spreading to the left arm, jaw, neck, shoulder or back.',
      'Shortness of breath, cold sweat, nausea or sudden lightheadedness.',
      'Women and people with diabetes may have “silent” signs — unusual fatigue, mild discomfort, breathlessness.',
    ],
    warning:
      'Call 108 immediately — never drive the patient yourself. Keep them still and semi-upright, loosen clothing, and give nothing by mouth except aspirin (150–300 mg, chewed) ONLY if the emergency operator or a doctor advises it and the patient is not allergic.',
  },
]

const QUICK_STEPS = [
  { step: 'Stay calm', desc: 'Panic costs seconds' },
  { step: 'Call 108 / 112', desc: 'Ambulance or all-in-one emergency' },
  { step: 'Give clear location', desc: 'Address + nearest landmark' },
  { step: 'Don’t hang up first', desc: 'Wait for the operator' },
  { step: 'Keep ID & medical info ready', desc: 'Meds, prescriptions, allergies' },
]

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function EmergencyPage() {
  return (
    <PublicLayout>
      {/* ---------------------------------------------------------------- */}
      {/* 1. Hero                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-500 to-rose-500 text-white overflow-hidden print:bg-none">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute top-10 left-10 h-40 w-40 rounded-full bg-white" />
          <div className="absolute bottom-10 right-10 h-60 w-60 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/3 h-24 w-24 rounded-full bg-white" />
        </div>
        <div className="container mx-auto px-4 py-14 md:py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5 text-xs font-medium mb-5">
              <Siren className="h-3.5 w-3.5" />
              Emergency Directory · India
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Emergency <span className="text-rose-100">Numbers</span>
            </h1>
            <p className="text-base md:text-lg text-red-50 leading-relaxed max-w-2xl mx-auto">
              Critical helpline numbers for medical, fire, police, and
              women&apos;s &amp; children&apos;s safety across India. Save this
              page — it could save a life.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden">
              <motion.a
                href="tel:108"
                whileTap={{ scale: 0.96 }}
                aria-label="Call 108 now — national ambulance number"
                className="relative inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-lg font-bold text-red-600 shadow-xl shadow-red-950/30 transition-colors hover:bg-red-50"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-white/60 animate-ping [animation-duration:1.8s]"
                />
                <Siren className="relative h-6 w-6" />
                <span className="relative">Call 108 Now</span>
              </motion.a>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <Printer className="h-4 w-4" />
                Print this page
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 2. National emergency numbers                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <motion.div {...fadeIn} className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            National Emergency Numbers
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Tap any card to dial instantly — works on every phone in India.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4"
        >
          {NATIONAL_NUMBERS.map((n) => {
            const tone = TONE_STYLES[n.tone]
            return (
              <motion.a
                key={`${n.number}-${n.label}`}
                variants={fadeIn}
                href={`tel:${n.tel}`}
                aria-label={`Call ${n.number} — ${n.label}`}
                className={`group flex flex-col items-center text-center gap-2 rounded-2xl border border-border/60 bg-card p-4 md:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-95 ${tone.border}`}
              >
                <span
                  className={`flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 ${tone.icon}`}
                >
                  <n.icon className="h-6 w-6 md:h-7 md:w-7" />
                </span>
                <span
                  className={`text-2xl md:text-3xl font-bold tracking-tight tabular-nums ${tone.number}`}
                >
                  {n.number}
                </span>
                <span className="text-sm font-semibold leading-tight">
                  {n.label}
                </span>
                <span className="text-xs text-muted-foreground leading-snug">
                  {n.desc}
                </span>
              </motion.a>
            )
          })}
        </motion.div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 3. Blood banks & organ donation                                  */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-muted/40 dark:bg-muted/10 border-y border-border/60">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <motion.div {...fadeIn} className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Blood Banks &amp; Organ Donation
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Helplines for blood availability, elder care and reporting crime
              anonymously.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-4 md:gap-6 items-stretch">
            {/* Contact rows */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-40px' }}
              className="flex flex-col gap-4"
            >
              {BLOOD_AND_SUPPORT.map((n) => {
                const tone = TONE_STYLES[n.tone]
                return (
                  <motion.a
                    key={`${n.number}-${n.label}`}
                    variants={fadeIn}
                    href={`tel:${n.tel}`}
                    aria-label={`Call ${n.number} — ${n.label}`}
                    className={`group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 md:p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${tone.border}`}
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 ${tone.icon}`}
                    >
                      <n.icon className="h-6 w-6" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-xl md:text-2xl font-bold tracking-tight tabular-nums ${tone.number}`}
                      >
                        {n.number}
                      </span>
                      <span className="block text-sm font-semibold">
                        {n.label}
                      </span>
                      <span className="block text-xs text-muted-foreground leading-snug">
                        {n.desc}
                      </span>
                    </span>
                    <Phone className="h-5 w-5 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                  </motion.a>
                )
              })}
            </motion.div>

            {/* Organ donation card */}
            <motion.div
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-40px' }}
              className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/20 p-6 md:p-8 flex flex-col justify-center"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                  <Heart className="h-6 w-6" />
                </span>
                <h3 className="text-lg md:text-xl font-bold">
                  Pledge to Donate Organs
                </h3>
              </div>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
                One donor can save up to <strong>8 lives</strong>. Register
                your pledge with{' '}
                <strong>NOTTO</strong> (National Organ &amp; Tissue Transplant
                Organisation) — the pledge is linked to your{' '}
                <strong>Aadhaar</strong>, so hospitals can honour your wish at
                the critical moment. Talk to your family about your decision —
                their consent is required at the time of donation.
              </p>
              <a
                href="https://notto.mohfw.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:underline"
              >
                Pledge online at notto.mohfw.gov.in
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 4. Mental health support                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <motion.div {...fadeIn} className="text-center mb-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Mental Health Support
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Trained counsellors, free of cost, whenever you need someone to
            talk to.
          </p>
        </motion.div>

        <motion.div {...fadeIn} className="max-w-2xl mx-auto mb-8">
          <div className="rounded-2xl border border-teal-200 dark:border-teal-900/60 bg-teal-50 dark:bg-teal-950/30 px-6 py-4 text-center">
            <p className="text-sm md:text-base font-medium text-teal-800 dark:text-teal-200">
              “It&apos;s okay to not be okay. Talking helps.”
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-40px' }}
          className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto"
        >
          {MENTAL_HELPLINES.map((h) => {
            const tone = TONE_STYLES[h.tone]
            return (
              <motion.div
                key={h.name}
                variants={fadeIn}
                className="rounded-2xl border border-border/60 bg-card p-5 md:p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-teal-300 dark:hover:border-teal-800"
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tone.icon}`}
                  >
                    <h.icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-base md:text-lg">
                        {h.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-[11px] border-teal-300 dark:border-teal-800 text-teal-700 dark:text-teal-300"
                      >
                        {h.note}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      {h.desc}
                    </p>
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                      {h.numbers.map((num) => (
                        <a
                          key={num.tel}
                          href={`tel:${num.tel}`}
                          aria-label={`Call ${h.name} at ${num.display}`}
                          className="inline-flex items-center gap-2 text-lg md:text-xl font-bold tracking-tight tabular-nums text-teal-600 dark:text-teal-400 hover:underline underline-offset-4"
                        >
                          <Phone className="h-4 w-4" />
                          {num.display}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 5. Poison control & first aid                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-muted/40 dark:bg-muted/10 border-y border-border/60">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <motion.div {...fadeIn} className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Poison Control &amp; First Aid Basics
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Expert guidance while you wait for professional help.
            </p>
          </motion.div>

          {/* Poison helpline banner */}
          <motion.a
            {...fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-40px' }}
            href="tel:1800116117"
            aria-label="Call National Poison Information Centre at AIIMS — 1800-116-117"
            className="group mb-8 flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 p-5 md:p-6 text-center sm:text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 transition-transform duration-300 group-hover:scale-110">
              <FlaskConical className="h-7 w-7" />
            </span>
            <span className="flex-1">
              <span className="block text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-0.5">
                Poisoning or overdose — call immediately
              </span>
              <span className="block text-lg md:text-xl font-bold">
                National Poison Information Centre (AIIMS, New Delhi)
              </span>
              <span className="block text-sm text-muted-foreground">
                24×7 expert guidance on what to do — and what NOT to give.
              </span>
            </span>
            <span className="flex items-center gap-2 text-xl md:text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
              <Phone className="h-5 w-5" />
              1800-116-117
            </span>
          </motion.a>

          {/* First aid accordion */}
          <motion.div
            {...fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-40px' }}
            className="max-w-3xl mx-auto"
          >
            <Accordion type="single" collapsible className="space-y-3">
              {FIRST_AID.map((item, idx) => (
                <AccordionItem
                  key={item.title}
                  value={`first-aid-${idx}`}
                  className="rounded-lg border border-border/60 bg-card px-5 shadow-sm data-[state=open]:border-red-300 dark:data-[state=open]:border-red-900 data-[state=open]:shadow-md transition-all"
                >
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline hover:text-red-700 dark:hover:text-red-400 py-5">
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                        <item.icon className="h-4 w-4" />
                      </span>
                      {item.title}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground pb-5">
                    {item.intro && (
                      <p className="mb-3 font-medium text-foreground/80">
                        {item.intro}
                      </p>
                    )}
                    {item.bullets && (
                      <ul className="space-y-2">
                        {item.bullets.map((b) => (
                          <li key={b} className="flex gap-2.5">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400 dark:bg-red-500" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.dos && (
                      <ul className="space-y-2 mb-3">
                        {item.dos.map((b) => (
                          <li key={b} className="flex gap-2.5">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.donts && (
                      <ul className="space-y-2 mb-3">
                        {item.donts.map((b) => (
                          <li key={b} className="flex gap-2.5">
                            <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.warning && (
                      <p className="mt-3 flex gap-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 px-4 py-3 text-amber-800 dark:text-amber-300">
                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>{item.warning}</span>
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 6. Quick tips strip                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <motion.div {...fadeIn} className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            In an Emergency — 5 Steps
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Memorise this sequence. It works for every emergency.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-40px' }}
          className="flex flex-col md:flex-row md:items-stretch md:justify-center gap-2 md:gap-0 max-w-5xl mx-auto"
        >
          {QUICK_STEPS.map((s, i) => (
            <motion.div key={s.step} variants={fadeIn} className="contents">
              <div className="flex items-center gap-4 md:gap-3 rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-sm md:flex-1 md:flex-col md:text-center md:justify-center md:gap-2 md:px-3 md:py-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-red-300 dark:hover:border-red-800">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-rose-500 text-white text-sm font-bold">
                  {i + 1}
                </span>
                <span>
                  <span className="block text-sm font-semibold leading-tight">
                    {s.step}
                  </span>
                  <span className="block text-xs text-muted-foreground leading-snug">
                    {s.desc}
                  </span>
                </span>
              </div>
              {i < QUICK_STEPS.length - 1 && (
                <>
                  <ArrowRight
                    aria-hidden="true"
                    className="hidden md:block self-center h-5 w-5 mx-1 shrink-0 text-red-400 dark:text-red-500"
                  />
                  <ArrowDown
                    aria-hidden="true"
                    className="md:hidden self-center h-5 w-5 my-0.5 shrink-0 text-red-400 dark:text-red-500"
                  />
                </>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 7. Footer disclaimer                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="container mx-auto px-4 pb-12 md:pb-16">
        <motion.div
          {...fadeIn}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-20px' }}
          className="max-w-3xl mx-auto rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 px-6 py-5 flex gap-4 items-start"
        >
          <TriangleAlert className="h-6 w-6 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <p className="text-sm md:text-base text-amber-900 dark:text-amber-200 leading-relaxed">
            <strong>Note:</strong> Numbers verified from national helpline
            directories. Always dial{' '}
            <a href="tel:112" className="font-bold underline underline-offset-2">
              112
            </a>{' '}
            for life-threatening emergencies if unsure which service you need.
            This page is a quick reference and does not replace professional
            medical training.
          </p>
        </motion.div>
      </section>
    </PublicLayout>
  )
}
