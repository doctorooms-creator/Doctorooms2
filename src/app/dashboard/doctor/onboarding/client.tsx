'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Stethoscope,
  GraduationCap,
  Briefcase,
  BadgeCheck,
  MapPin,
  IndianRupee,
  Building2,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * ONBOARDING-1: Doctor self-serve onboarding wizard (solo practice, FREE plan).
 * Visual language mirrors /register (step circles + bars, AnimatePresence
 * slide transitions, teal gradients, Card shell).
 */

const SPECIALIZATIONS = [
  'General Physician',
  'Pediatrician',
  'Dermatologist',
  'Cardiologist',
  'Orthopedist',
  'Gynecologist',
  'ENT Specialist',
  'Neurologist',
  'Psychiatrist',
  'Dentist',
  'Oncologist',
  'Other',
]

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
}

interface FormState {
  specialization: string
  customSpecialization: string
  education: string
  experience: string
  registrationDetail: string
  city: string
  state: string
  fees: string
  clinicName: string
}

type LoadState = 'loading' | 'exists' | 'wizard'

export function DoctorOnboardingClient() {
  const router = useRouter()
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [doctorName, setDoctorName] = useState('')
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>({
    specialization: '',
    customSpecialization: '',
    education: '',
    experience: '',
    registrationDetail: '',
    city: '',
    state: '',
    fees: '300',
    clinicName: '',
  })

  // On mount: already onboarded? + user name for the clinic default placeholder
  useEffect(() => {
    let cancelled = false
    fetch('/api/dashboard/doctor/onboarding')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        if (d.exists) {
          setLoadState('exists')
        } else {
          setLoadState('wizard')
        }
      })
      .catch(() => {
        if (!cancelled) setLoadState('wizard')
      })
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.success && d.user?.name) setDoctorName(d.user.name)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const finalSpecialization =
    form.specialization === 'Other' ? form.customSpecialization.trim() : form.specialization

  const goNext = () => {
    if (step === 0) {
      if (!form.specialization) {
        toast.error('Please select your specialization')
        return
      }
      if (form.specialization === 'Other' && !form.customSpecialization.trim()) {
        toast.error('Please enter your specialization')
        return
      }
    }
    if (step === 1) {
      if (!form.city.trim()) {
        toast.error('City is required')
        return
      }
      if (form.fees !== '' && (!Number.isFinite(Number(form.fees)) || Number(form.fees) < 0)) {
        toast.error('Consultation fees must be a number of 0 or more')
        return
      }
    }
    setDirection(1)
    setStep((s) => s + 1)
  }

  const goBack = () => {
    setDirection(-1)
    setStep((s) => s - 1)
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/dashboard/doctor/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialization: finalSpecialization,
          education: form.education.trim(),
          experience: form.experience.trim(),
          registrationDetail: form.registrationDetail.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          fees: form.fees === '' ? 300 : Number(form.fees),
          clinicName: form.clinicName.trim() || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Could not create your profile. Please try again.')
        if (res.status === 409) {
          setLoadState('exists')
        }
        return
      }
      toast.success('Your practice is live! Welcome to Doctorooms 🎉')
      router.push('/dashboard/doctor')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const stepLabels = ['Professional Details', 'Practice Details', 'Review & Start']

  // ── Already onboarded ──────────────────────────────────────────────────
  if (loadState === 'exists') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-xl shadow-teal-900/5">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30 mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground mb-1">
                Your practice is already set up
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                Your doctor profile and clinic are live. Manage appointments, prescriptions and
                patients from your dashboard.
              </p>
              <Button
                onClick={() => router.push('/dashboard/doctor')}
                className="w-full h-11 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-lg shadow-teal-600/25 cursor-pointer"
                aria-label="Go to doctor dashboard"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // ── Initial loading ────────────────────────────────────────────────────
  if (loadState === 'loading') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center" role="status" aria-label="Loading onboarding">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  // ── Wizard ─────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center py-8 px-4 overflow-hidden">
      {/* Dot pattern background (register page language) */}
      <div
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #0d9488 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-xl shadow-teal-500/30">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Set up your practice
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your solo clinic on the Free plan — 3 quick steps
          </p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-6" aria-label={`Step ${step + 1} of 3`}>
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={step >= i ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                    step > i
                      ? 'bg-teal-500 text-white'
                      : step === i
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step > i ? <Check className="h-4 w-4" /> : i + 1}
                </motion.div>
                <span className="text-[10px] mt-1 text-muted-foreground hidden sm:block">
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div
                  className={`w-10 sm:w-16 h-0.5 mx-2 transition-colors duration-300 ${
                    step > i ? 'bg-teal-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="border-0 shadow-xl shadow-teal-900/5">
          <CardContent className="p-6 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {/* Step 0: Professional Details */}
              {step === 0 && (
                <motion.div
                  key="professional"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-2">
                    <h2 className="text-lg font-semibold">Professional Details</h2>
                    <p className="text-sm text-muted-foreground">Your medical credentials</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">
                        Specialization <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={form.specialization}
                        onValueChange={(val) => updateField('specialization', val)}
                      >
                        <SelectTrigger id="specialization" aria-label="Specialization" className="h-11">
                          <SelectValue placeholder="Select your specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPECIALIZATIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {form.specialization === 'Other' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <Label htmlFor="customSpecialization">
                          Your Specialization <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="customSpecialization"
                          placeholder="e.g. Ayurvedic Physician"
                          value={form.customSpecialization}
                          onChange={(e) => updateField('customSpecialization', e.target.value)}
                        />
                      </motion.div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="education">Education</Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="education"
                          placeholder="MBBS, MD — ..."
                          className="pl-10"
                          value={form.education}
                          onChange={(e) => updateField('education', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience (years)</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="experience"
                          type="number"
                          min={0}
                          max={70}
                          placeholder="8"
                          className="pl-10"
                          value={form.experience}
                          onChange={(e) => updateField('experience', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registrationDetail">
                        Medical Registration No.{' '}
                        <span className="text-muted-foreground font-normal">(optional)</span>
                      </Label>
                      <div className="relative">
                        <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="registrationDetail"
                          placeholder="GMC-2012-45678"
                          className="pl-10"
                          value={form.registrationDetail}
                          onChange={(e) => updateField('registrationDetail', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Practice Details */}
              {step === 1 && (
                <motion.div
                  key="practice"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-2">
                    <h2 className="text-lg font-semibold">Practice Details</h2>
                    <p className="text-sm text-muted-foreground">Where patients will find you</p>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="doc-city">
                          City <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="doc-city"
                            placeholder="Mumbai"
                            className="pl-10"
                            value={form.city}
                            onChange={(e) => updateField('city', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="doc-state">State</Label>
                        <Input
                          id="doc-state"
                          placeholder="Maharashtra"
                          value={form.state}
                          onChange={(e) => updateField('state', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fees">Consultation Fees (₹)</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fees"
                          type="number"
                          min={0}
                          placeholder="300"
                          className="pl-10"
                          value={form.fees}
                          onChange={(e) => updateField('fees', e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Typical OPD consult: ₹300–₹800
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clinicName">
                        Clinic Name{' '}
                        <span className="text-muted-foreground font-normal">(optional)</span>
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="clinicName"
                          placeholder={`Dr. ${doctorName || 'Your Name'} Clinic (default)`}
                          className="pl-10"
                          value={form.clinicName}
                          onChange={(e) => updateField('clinicName', e.target.value)}
                          maxLength={100}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        We&apos;ll create a free clinic workspace for you with an OPD queue, digital
                        prescriptions and a receptionist seat.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Review & Start */}
              {step === 2 && (
                <motion.div
                  key="review"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-2">
                    <h2 className="text-lg font-semibold">Review & Start</h2>
                    <p className="text-sm text-muted-foreground">
                      One last look before your practice goes live
                    </p>
                  </div>

                  <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/40 dark:bg-teal-950/20 divide-y divide-border">
                    <div className="px-4 py-3 flex justify-between gap-4">
                      <span className="text-xs text-muted-foreground">Specialization</span>
                      <span className="text-sm font-medium text-foreground text-right">
                        {finalSpecialization || '—'}
                      </span>
                    </div>
                    {form.education.trim() && (
                      <div className="px-4 py-3 flex justify-between gap-4">
                        <span className="text-xs text-muted-foreground">Education</span>
                        <span className="text-sm font-medium text-foreground text-right max-w-[60%] truncate">
                          {form.education.trim()}
                        </span>
                      </div>
                    )}
                    {form.experience.trim() && (
                      <div className="px-4 py-3 flex justify-between gap-4">
                        <span className="text-xs text-muted-foreground">Experience</span>
                        <span className="text-sm font-medium text-foreground text-right">
                          {form.experience.trim()} years
                        </span>
                      </div>
                    )}
                    <div className="px-4 py-3 flex justify-between gap-4">
                      <span className="text-xs text-muted-foreground">City</span>
                      <span className="text-sm font-medium text-foreground text-right">
                        {form.city.trim()}
                        {form.state.trim() ? `, ${form.state.trim()}` : ''}
                      </span>
                    </div>
                    <div className="px-4 py-3 flex justify-between gap-4">
                      <span className="text-xs text-muted-foreground">Consultation</span>
                      <span className="text-sm font-medium text-foreground text-right">
                        ₹{form.fees === '' ? '300' : Number(form.fees)}
                      </span>
                    </div>
                    <div className="px-4 py-3 flex justify-between gap-4">
                      <span className="text-xs text-muted-foreground">Clinic</span>
                      <span className="text-sm font-medium text-foreground text-right max-w-[60%] truncate">
                        {form.clinicName.trim() ||
                          `Dr. ${doctorName || 'Your Name'} Clinic`}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Free plan</span> — you get the
                      full clinic engine (OPD queue, digital Rx, 1 receptionist + 1 nurse seats).
                      Upgrade anytime from{' '}
                      <span className="font-medium text-foreground">Plan &amp; Billing</span>.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  disabled={creating}
                  className="flex-1 h-11 cursor-pointer"
                  aria-label="Go back to previous step"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              {step < 2 ? (
                <Button
                  type="button"
                  onClick={goNext}
                  className="flex-1 h-11 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-lg shadow-teal-600/25 cursor-pointer"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex-1 h-11 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-lg shadow-teal-600/25 cursor-pointer"
                  aria-label="Create my practice"
                >
                  {creating ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Launch My Practice
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
