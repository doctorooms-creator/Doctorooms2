'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Stethoscope,
  ArrowRight,
  ArrowLeft,
  User,
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  Heart,
  Bone,
  Brain,
  Eye,
  Baby,
  Activity,
  Pill,
} from 'lucide-react'
import { toast } from 'sonner'

const DEPT_ICONS: Record<string, any> = {
  Cardiology: Heart,
  Orthopedics: Bone,
  Neurology: Brain,
  Ophthalmology: Eye,
  Pediatrics: Baby,
  'General Medicine': Activity,
  Pharmacy: Pill,
}

type Step = 'details' | 'department' | 'doctor' | 'confirm' | 'submitting'

export default function KioskPage({ params }: { params: Promise<{ hospitalId: string }> }) {
  const { hospitalId } = use(params)
  const router = useRouter()

  const [step, setStep] = useState<Step>('details')
  const [form, setForm] = useState({
    patientName: '',
    mobileNo: '',
    age: '',
    gender: 'Male',
    disease: '',
  })
  const [departmentId, setDepartmentId] = useState('')
  const [doctorId, setDoctorId] = useState('')

  // Fetch hospital info
  const { data: hospitalData } = useQuery({
    queryKey: ['kiosk-hospital', hospitalId],
    queryFn: async () => {
      const res = await fetch(`/api/hospitals/${hospitalId}`)
      if (!res.ok) return null
      const data = await res.json()
      return data.hospital || data
    },
  })

  // Fetch departments
  const { data: deptData, isLoading: deptLoading } = useQuery({
    queryKey: ['kiosk-departments', hospitalId],
    queryFn: async () => {
      const res = await fetch(`/api/public/hospital/${hospitalId}/departments`)
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    enabled: step === 'department',
  })

  // Fetch doctors when department selected
  const { data: doctorData, isLoading: doctorLoading } = useQuery({
    queryKey: ['kiosk-doctors', hospitalId, departmentId],
    queryFn: async () => {
      const res = await fetch(`/api/public/hospital/${hospitalId}/department/${departmentId}/doctors`)
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    enabled: !!departmentId && step === 'doctor',
  })

  // Submit booking
  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/public/hospital/${hospitalId}/kiosk-book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          departmentId,
          doctorId,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to submit')
      }
      return res.json()
    },
    onSuccess: (data) => {
      // Redirect to status page
      router.push(`/kiosk/${hospitalId}/status/${data.bookingId}`)
    },
    onError: (err: Error) => {
      toast.error(err.message)
      setStep('confirm')
    },
  })

  const handleSubmit = () => {
    setStep('submitting')
    submitMutation.mutate()
  }

  const canProceed = (s: Step): boolean => {
    switch (s) {
      case 'details': return !!form.patientName.trim()
      case 'department': return !!departmentId
      case 'doctor': return !!doctorId
      default: return true
    }
  }

  const departments = deptData?.departments || []
  const doctors = doctorData?.doctors || []

  // Selected doctor (from cached doctors query) — used for live queue stats on the confirm step
  const selectedDoctor = doctors.find((d: any) => d.id === doctorId) || null
  // Strip a leading "Dr." from the stored name so we never render "Dr. Dr. ..."
  const selectedDoctorName = selectedDoctor?.name?.replace(/^Dr\.?\s+/i, '') || ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-teal-950/20">
      {/* Header */}
      <div className="bg-teal-600 text-white py-6 px-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Stethoscope className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{hospitalData?.hospitalName || 'Hospital'}</h1>
            <p className="text-sm text-teal-100">Self Check-in Kiosk</p>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          {['details', 'department', 'doctor', 'confirm'].map((s, i) => {
            const stepOrder = ['details', 'department', 'doctor', 'confirm', 'submitting']
            const currentIdx = stepOrder.indexOf(step)
            const thisIdx = stepOrder.indexOf(s)
            const isDone = currentIdx > thisIdx
            const isCurrent = step === s

            return (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isDone ? 'bg-emerald-500 text-white' :
                    isCurrent ? 'bg-teal-600 text-white ring-4 ring-teal-200' :
                    'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                </div>
                {i < 3 && <div className={`w-8 h-0.5 mx-1 ${isDone ? 'bg-emerald-400' : 'bg-gray-200'}`} />}
              </div>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Details */}
          {step === 'details' && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="text-center mb-4">
                    <User className="h-12 w-12 mx-auto text-teal-600 mb-2" />
                    <h2 className="text-lg font-bold">Enter Your Details</h2>
                    <p className="text-sm text-muted-foreground">Fill in your information to get started</p>
                  </div>

                  <div>
                    <Label>Full Name *</Label>
                    <Input
                      value={form.patientName}
                      onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                      placeholder="Enter your full name"
                      className="text-lg py-6"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Mobile Number</Label>
                      <Input
                        type="tel"
                        value={form.mobileNo}
                        onChange={(e) => setForm({ ...form, mobileNo: e.target.value.replace(/[^0-9+ ]/g, '') })}
                        placeholder="9876543210"
                        className="py-3"
                      />
                    </div>
                    <div>
                      <Label>Age</Label>
                      <Input
                        type="number"
                        value={form.age}
                        onChange={(e) => setForm({ ...form, age: e.target.value })}
                        placeholder="35"
                        className="py-3"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Gender</Label>
                    <div className="flex gap-2">
                      {['Male', 'Female', 'Other'].map((g) => (
                        <Button
                          key={g}
                          variant={form.gender === g ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={() => setForm({ ...form, gender: g })}
                        >
                          {g}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Chief Complaint (optional)</Label>
                    <Input
                      value={form.disease}
                      onChange={(e) => setForm({ ...form, disease: e.target.value })}
                      placeholder="e.g. Fever, headache, stomach pain"
                      className="py-3"
                    />
                  </div>

                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-base"
                    disabled={!canProceed('details')}
                    onClick={() => setStep('department')}
                  >
                    Next: Select Department <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Department */}
          {step === 'department' && (
            <motion.div key="department" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <Building2 className="h-12 w-12 mx-auto text-teal-600 mb-2" />
                    <h2 className="text-lg font-bold">Select Department</h2>
                    <p className="text-sm text-muted-foreground">Choose the department you need</p>
                  </div>

                  {deptLoading ? (
                    <div className="grid grid-cols-2 gap-3">
                      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {departments.map((dept: any) => {
                        const Icon = DEPT_ICONS[dept.name] || Activity
                        return (
                          <button
                            key={dept.id}
                            onClick={() => { setDepartmentId(dept.id); setDoctorId(''); setStep('doctor') }}
                            className={`p-4 rounded-xl border-2 text-left transition-all hover:border-teal-400 hover:shadow-md ${
                              departmentId === dept.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                                <Icon className="h-5 w-5 text-teal-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{dept.name}</p>
                                {dept.doctorCount > 0 && (
                                  <p className="text-xs text-muted-foreground">{dept.doctorCount} doctors</p>
                                )}
                              </div>
                            </div>
                            {dept.floorNo && <p className="text-xs text-muted-foreground">📍 {dept.floorNo}</p>}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {departments.length === 0 && !deptLoading && (
                    <div className="text-center py-8 text-muted-foreground">
                      No departments available. Please visit the reception counter.
                    </div>
                  )}

                  <Button variant="ghost" className="mt-4" onClick={() => setStep('details')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Doctor */}
          {step === 'doctor' && (
            <motion.div key="doctor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <Stethoscope className="h-12 w-12 mx-auto text-teal-600 mb-2" />
                    <h2 className="text-lg font-bold">Select Doctor</h2>
                    <p className="text-sm text-muted-foreground">Choose a doctor to consult</p>
                  </div>

                  {doctorLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {doctors.map((doc: any) => (
                        <button
                          key={doc.id}
                          onClick={() => { setDoctorId(doc.id); setStep('confirm') }}
                          disabled={!doc.isAvailable}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:border-teal-400 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                            doctorId === doc.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold">
                              {doc.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{doc.name}</p>
                              <p className="text-sm text-muted-foreground">{doc.specialization || 'General Physician'}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {doc.queueLength} in queue
                                </Badge>
                                {doc.queueLength > 0 && (
                                  <Badge variant="outline" className="text-xs text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
                                    <Clock className="h-3 w-3 mr-1" />
                                    ~{doc.queueLength * 10} min wait
                                  </Badge>
                                )}
                                {doc.fees > 0 && (
                                  <Badge variant="outline" className="text-xs">₹{doc.fees}</Badge>
                                )}
                              </div>
                            </div>
                            {doc.isAvailable ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <Badge className="bg-red-100 text-red-700">Full</Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <Button variant="ghost" className="mt-4" onClick={() => setStep('department')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 mb-2" />
                    <h2 className="text-lg font-bold">Confirm Your Details</h2>
                    <p className="text-sm text-muted-foreground">Review and submit your request</p>
                  </div>

                  <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{form.patientName}</span>
                    </div>
                    {form.mobileNo && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mobile</span>
                        <span>{form.mobileNo}</span>
                      </div>
                    )}
                    {form.age && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Age/Gender</span>
                        <span>{form.age}y / {form.gender}</span>
                      </div>
                    )}
                    {form.disease && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Complaint</span>
                        <span className="text-right">{form.disease}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between">
                      <span className="text-muted-foreground">Department</span>
                      <span className="font-medium">{departments.find((d: any) => d.id === departmentId)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Doctor</span>
                      <span className="font-medium">{doctors.find((d: any) => d.id === doctorId)?.name}</span>
                    </div>
                  </div>

                  {/* Queue Preview — live queue stats + explicit queue-tail confirmation */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    aria-label="Queue preview"
                    className="mt-4 rounded-xl overflow-hidden border border-teal-200 dark:border-teal-900/60 bg-teal-50/70 dark:bg-teal-950/30"
                  >
                    <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-teal-600 dark:bg-teal-800 text-white">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      <p className="text-sm font-bold">Queue Preview</p>
                      {selectedDoctor && (
                        <span className="ml-auto text-xs font-medium text-teal-100 dark:text-teal-200">
                          Dr. {selectedDoctorName}
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-3">
                      {selectedDoctor ? (
                        <>
                          <dl className="flex flex-wrap gap-x-8 gap-y-3">
                            <div className="min-w-[150px]">
                              <dt className="text-xs font-medium uppercase tracking-wide text-teal-700 dark:text-teal-400">
                                Currently waiting
                              </dt>
                              <dd className="text-lg font-bold text-teal-900 dark:text-teal-50">
                                {selectedDoctor.queueLength > 0
                                  ? `${selectedDoctor.queueLength} ${selectedDoctor.queueLength === 1 ? 'patient' : 'patients'}`
                                  : 'No patients waiting — you\'ll be first!'}
                              </dd>
                            </div>
                            <div className="min-w-[150px]">
                              <dt className="text-xs font-medium uppercase tracking-wide text-teal-700 dark:text-teal-400">
                                Estimated wait
                              </dt>
                              <dd className="text-lg font-bold text-teal-900 dark:text-teal-50">
                                {selectedDoctor.queueLength > 0
                                  ? `~${Math.round((selectedDoctor.queueLength * 10) / 5) * 5} min`
                                  : 'Right away'}
                              </dd>
                            </div>
                          </dl>

                          <div className="rounded-lg border border-emerald-300 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs shrink-0">
                                Queue tail
                              </Badge>
                              <p className="text-sm text-emerald-900 dark:text-emerald-200">
                                No fixed time slot — you'll join the end of Dr. {selectedDoctorName}'s queue.
                                Reception will confirm and assign your token number.
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-teal-900 dark:text-teal-100">
                          Reception will confirm your queue position and assign your token number.
                        </p>
                      )}

                      <p className="text-xs text-teal-700/80 dark:text-teal-400/80">
                        Your request will be sent to the reception desk. Once approved, you'll receive a token
                        number. Please wait in the waiting area.
                      </p>
                    </div>
                  </motion.div>

                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setStep('doctor')}>
                      <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <Button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-6" onClick={handleSubmit}>
                      Submit Request <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 5: Submitting */}
          {step === 'submitting' && (
            <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <CardContent className="p-12 text-center">
                  <Loader2 className="h-12 w-12 mx-auto text-teal-600 animate-spin mb-4" />
                  <h2 className="text-lg font-bold">Submitting your request...</h2>
                  <p className="text-sm text-muted-foreground mt-1">Please wait a moment</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
