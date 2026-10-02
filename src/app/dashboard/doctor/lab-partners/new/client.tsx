'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Handshake,
  ArrowLeft,
  Save,
  Loader2,
  FlaskConical,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Hash,
  User,
  KeyRound,
} from 'lucide-react'

// ─── Main ─────────────────────────────────────────────────────────────────

export default function NewLabPartnerClient() {
  const router = useRouter()

  const [labName, setLabName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [altMobile, setAltMobile] = useState('')
  const [address, setAddress] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [pincode, setPincode] = useState('')
  const [gstNo, setGstNo] = useState('')
  const [registrationNo, setRegistrationNo] = useState('')
  const [specializations, setSpecializations] = useState<string>('both')
  const [testsAvailable, setTestsAvailable] = useState('')
  const [commissionPercent, setCommissionPercent] = useState<number>(10)
  const [password, setPassword] = useState('')

  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch('/api/lab-partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create lab partner')
      return data
    },
    onSuccess: () => {
      toast.success('Lab partner registered and added to your associated labs')
      router.push('/dashboard/doctor/lab-partners')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  function handleSubmit() {
    if (!labName.trim() || !email.trim()) {
      toast.error('Lab name and email are required')
      return
    }
    createMutation.mutate({
      labName: labName.trim(),
      ownerName: ownerName.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      altMobile: altMobile.trim(),
      address: address.trim(),
      state: state.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      gstNo: gstNo.trim(),
      registrationNo: registrationNo.trim(),
      specializations,
      testsAvailable: testsAvailable.trim(),
      commissionPercent,
      password: password.trim() || undefined,
      hospitalId: null,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard/doctor/lab-partners')}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Handshake className="h-6 w-6 text-teal-600" />
            Register a New Lab Partner
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create a diagnostic lab account — it will be auto-linked to your practice
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-slate-200 max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-teal-600" />
              Register a New Lab Partner
            </CardTitle>
            <CardDescription>
              Fill in the lab information. Fields marked with * are required. An
              association with your doctor profile is created automatically.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Lab Identity */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-teal-700">
                <Building2 className="h-4 w-4" />
                Lab Identity
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="labName">
                    Lab Name <span className="text-rose-600">*</span>
                  </Label>
                  <Input
                    id="labName"
                    placeholder="e.g. City Diagnostic Centre"
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="ownerName"
                      placeholder="Owner / contact person"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-rose-600">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="lab@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="mobile"
                      placeholder="+91 98765 43210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altMobile">Alternate Mobile</Label>
                  <Input
                    id="altMobile"
                    placeholder="Alternate contact number"
                    value={altMobile}
                    onChange={(e) => setAltMobile(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specializations">Specialization</Label>
                  <Select
                    value={specializations}
                    onValueChange={setSpecializations}
                  >
                    <SelectTrigger id="specializations">
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blood">Blood Tests</SelectItem>
                      <SelectItem value="radiology">Radiology</SelectItem>
                      <SelectItem value="both">Both (Blood + Radiology)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Address */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-teal-700">
                <MapPin className="h-4 w-4" />
                Address
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Textarea
                    id="address"
                    rows={2}
                    placeholder="Street, area, landmark..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Mumbai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="Maharashtra"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      placeholder="400001"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Compliance */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-teal-700">
                <FileText className="h-4 w-4" />
                Compliance
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gstNo">GST No.</Label>
                  <Input
                    id="gstNo"
                    placeholder="22AAAAA0000A1Z5"
                    value={gstNo}
                    onChange={(e) => setGstNo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNo">Registration No.</Label>
                  <Input
                    id="registrationNo"
                    placeholder="NABL / Lab registration number"
                    value={registrationNo}
                    onChange={(e) => setRegistrationNo(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Tests & Commission */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-teal-700">
                <Hash className="h-4 w-4" />
                Tests & Commission
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="testsAvailable">Tests Available</Label>
                  <Textarea
                    id="testsAvailable"
                    rows={2}
                    placeholder="CBC, LFT, KFT, X-Ray Chest, MRI Brain..."
                    value={testsAvailable}
                    onChange={(e) => setTestsAvailable(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of tests offered by this lab
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="commissionPercent">
                      My Default Commission %
                    </Label>
                    <Input
                      id="commissionPercent"
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={commissionPercent}
                      onChange={(e) => setCommissionPercent(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your share on each test billed through this lab
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Account Password</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="text"
                        placeholder="lab12345"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Defaults to <code className="bg-slate-100 px-1 rounded">lab12345</code> if left blank
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </CardContent>

          <CardFooter className="flex items-center justify-end gap-3 border-t pt-6">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/doctor/lab-partners')}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Register & Link to My Account
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
