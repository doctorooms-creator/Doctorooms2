'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Building2,
  MapPin,
  Phone,
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
 * ONBOARDING-1: Hospital/clinic self-serve onboarding wizard.
 * Visual language mirrors /register (step circles + bars, AnimatePresence
 * slide transitions, teal gradients, Card shell).
 */

const HOSPITAL_TYPES = ['Multi-Specialty', 'Clinic', 'Single-Specialty', 'Diagnostic']

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
  hospitalName: string
  hospitalType: string
  address: string
  city: string
  state: string
  pincode: string
  contactNo: string
  about: string
  planChoice: 'free' | 'pro_trial'
}

type LoadState = 'loading' | 'exists' | 'wizard'

export function HospitalOnboardingClient() {
  const router = useRouter()
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [existingName, setExistingName] = useState('')
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>({
    hospitalName: '',
    hospitalType: 'Multi-Specialty',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contactNo: '',
    about: '',
    planChoice: 'free',
  })

  // On mount: has the hospital already been set up?
  useEffect(() => {
    let cancelled = false
    fetch('/api/dashboard/hospital/onboarding')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        if (d.exists) {
          setExistingName(d.hospital?.hospitalName || '')
          setLoadState('exists')
        } else {
          setLoadState('wizard')
        }
      })
      .catch(() => {
        if (!cancelled) setLoadState('wizard')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const goNext = () => {
    if (step === 0) {
      if (!form.hospitalName.trim()) {
        toast.error('Hospital name is required')
        return
      }
      if (form.hospitalName.trim().length < 3) {
        toast.error('Hospital name must be at least 3 characters')
        return
      }
      if (!form.city.trim()) {
        toast.error('City is required')
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
      const res = await fetch('/api/dashboard/hospital/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalName: form.hospitalName.trim(),
          hospitalType: form.hospitalType,
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          contactNo: form.contactNo.trim(),
          about: form.about.trim(),
          planChoice: form.planChoice,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Could not create your hospital. Please try again.')
        if (res.status === 409) {
          // Already onboarded — show the friendly card instead of a dead wizard
          setLoadState('exists')
        }
        return
      }
      toast.success('Hospital created successfully! Welcome to Doctorooms 🎉')
      router.push('/dashboard/hospital')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const stepLabels = ['Facility Details', 'Choose Plan', 'Review & Launch']

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
                Your hospital is already set up
              </h1>
              {existingName && (
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="font-medium text-foreground">{existingName}</span> is live on
                  Doctorooms.
                </p>
              )}
              <p className="text-sm text-muted-foreground mb-6">
                Manage everything from your dashboard — appointments, doctors, billing and more.
              </p>
              <Button
                onClick={() => router.push('/dashboard/hospital')}
                className="w-full h-11 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-lg shadow-teal-600/25 cursor-pointer"
                aria-label="Go to hospital dashboard"
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
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/30">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Set up your hospital
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Three quick steps and your OPD engine is live
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
              {/* Step 0: Facility Details */}
              {step === 0 && (
                <motion.div
                  key="facility"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-2">
                    <h2 className="text-lg font-semibold">Facility Details</h2>
                    <p className="text-sm text-muted-foreground">Tell us about your facility</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="hospitalName">
                        Hospital / Clinic Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="hospitalName"
                          placeholder="e.g. City Care Hospital"
                          className="pl-10"
                          value={form.hospitalName}
                          onChange={(e) => updateField('hospitalName', e.target.value)}
                          maxLength={100}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hospitalType">Facility Type</Label>
                      <Select
                        value={form.hospitalType}
                        onValueChange={(val) => updateField('hospitalType', val)}
                      >
                        <SelectTrigger id="hospitalType" aria-label="Facility type" className="h-11">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {HOSPITAL_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="address"
                          placeholder="Street, area, landmark"
                          className="pl-10"
                          value={form.address}
                          onChange={(e) => updateField('address', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="city">
                          City <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="city"
                          placeholder="Ahmedabad"
                          value={form.city}
                          onChange={(e) => updateField('city', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          placeholder="Gujarat"
                          value={form.state}
                          onChange={(e) => updateField('state', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                          id="pincode"
                          placeholder="380015"
                          value={form.pincode}
                          onChange={(e) => updateField('pincode', e.target.value)}
                          maxLength={10}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactNo">Contact Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="contactNo"
                            placeholder="9876543210"
                            className="pl-10"
                            value={form.contactNo}
                            onChange={(e) => updateField('contactNo', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="about">About (optional)</Label>
                      <Textarea
                        id="about"
                        placeholder="A short description patients will see on your listing"
                        rows={3}
                        value={form.about}
                        onChange={(e) => updateField('about', e.target.value)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Choose Plan */}
              {step === 1 && (
                <motion.div
                  key="plan"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-2">
                    <h2 className="text-lg font-semibold">Choose Plan</h2>
                    <p className="text-sm text-muted-foreground">
                      Start free, or try Pro free for 14 days
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* FREE plan card */}
                    <button
                      type="button"
                      aria-pressed={form.planChoice === 'free'}
                      aria-label="Select Free plan"
                      onClick={() => updateField('planChoice', 'free')}
                      className={`relative flex flex-col gap-2 p-5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                        form.planChoice === 'free'
                          ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/30 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700'
                      }`}
                    >
                      {form.planChoice === 'free' && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 dark:text-teal-400">
                        <Sparkles className="h-4 w-4" /> Free
                      </span>
                      <span className="text-2xl font-bold text-foreground">
                        ₹0 <span className="text-xs font-normal text-muted-foreground">forever</span>
                      </span>
                      <ul className="text-xs text-muted-foreground space-y-1.5 mt-1">
                        <li className="flex items-start gap-1.5">
                          <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          1 doctor + 1 receptionist + 1 nurse seats
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          OPD queue engine with live tokens
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          Digital prescriptions
                        </li>
                      </ul>
                    </button>

                    {/* PRO trial card */}
                    <button
                      type="button"
                      aria-pressed={form.planChoice === 'pro_trial'}
                      aria-label="Select Pro 14-day trial"
                      onClick={() => updateField('planChoice', 'pro_trial')}
                      className={`relative flex flex-col gap-2 p-5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                        form.planChoice === 'pro_trial'
                          ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-600'
                      }`}
                    >
                      {form.planChoice === 'pro_trial' && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400">
                        <Sparkles className="h-4 w-4" /> Pro — 14 days free
                      </span>
                      <span className="text-2xl font-bold text-foreground">
                        ₹0 <span className="text-xs font-normal text-muted-foreground">trial · no card</span>
                      </span>
                      <ul className="text-xs text-muted-foreground space-y-1.5 mt-1">
                        <li className="flex items-start gap-1.5">
                          <Check className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                          3 doctor + 3 receptionist + 3 nurse seats
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                          Recall campaigns (dormant patients wapas lao)
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                          Lost-revenue report · OPD billing · lab reports
                        </li>
                      </ul>
                      <p className="text-[11px] text-muted-foreground border-t border-border pt-2 mt-1">
                        After trial it falls back to Free — your data is never deleted.
                      </p>
                    </button>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    ₹999/mo after the Pro trial — cancel anytime, keep everything on Free.
                  </p>
                </motion.div>
              )}

              {/* Step 2: Review & Launch */}
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
                    <h2 className="text-lg font-semibold">Review & Launch</h2>
                    <p className="text-sm text-muted-foreground">
                      One last look before we create your hospital
                    </p>
                  </div>

                  <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/40 dark:bg-teal-950/20 divide-y divide-border">
                    <div className="px-4 py-3 flex justify-between gap-4">
                      <span className="text-xs text-muted-foreground">Name</span>
                      <span className="text-sm font-medium text-foreground text-right">
                        {form.hospitalName.trim()}
                      </span>
                    </div>
                    <div className="px-4 py-3 flex justify-between gap-4">
                      <span className="text-xs text-muted-foreground">Type</span>
                      <span className="text-sm font-medium text-foreground text-right">
                        {form.hospitalType}
                      </span>
                    </div>
                    <div className="px-4 py-3 flex justify-between gap-4">
                      <span className="text-xs text-muted-foreground">City</span>
                      <span className="text-sm font-medium text-foreground text-right">
                        {form.city.trim()}
                        {form.state.trim() ? `, ${form.state.trim()}` : ''}
                      </span>
                    </div>
                    {form.address.trim() && (
                      <div className="px-4 py-3 flex justify-between gap-4">
                        <span className="text-xs text-muted-foreground">Address</span>
                        <span className="text-sm font-medium text-foreground text-right max-w-[60%] truncate">
                          {form.address.trim()}
                        </span>
                      </div>
                    )}
                    {form.contactNo.trim() && (
                      <div className="px-4 py-3 flex justify-between gap-4">
                        <span className="text-xs text-muted-foreground">Contact</span>
                        <span className="text-sm font-medium text-foreground text-right">
                          {form.contactNo.trim()}
                        </span>
                      </div>
                    )}
                    <div className="px-4 py-3 flex justify-between gap-4">
                      <span className="text-xs text-muted-foreground">Plan</span>
                      <span className="text-sm font-medium text-right">
                        {form.planChoice === 'pro_trial' ? (
                          <span className="text-amber-600 dark:text-amber-400">
                            Pro — 14-day free trial (no card)
                          </span>
                        ) : (
                          <span className="text-teal-600 dark:text-teal-400">Free — ₹0 forever</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-3 flex items-start gap-2">
                    <FileText className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      We&apos;ll also create a default{' '}
                      <span className="font-medium text-foreground">General Medicine</span>{' '}
                      department so your OPD queue works from day one. You can add more departments
                      later.
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
                  aria-label="Create my hospital"
                >
                  {creating ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Create My Hospital
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
