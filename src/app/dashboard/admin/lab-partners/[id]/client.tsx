'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
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
  Users,
  Receipt,
  Activity,
  Stethoscope,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────

interface DoctorAssociationItem {
  id: string
  commissionPercent: number
  isActive: boolean
  associatedAt: string
  doctor: {
    id: string
    user: {
      id: string
      name: string
      specialization: string
    }
  }
}

interface TestCatalogItem {
  id: string
  testName: string
  testCategory: string
  fee: number
  isActive: boolean
}

interface LabPartnerDetail {
  id: string
  userId: string
  hospitalId: string | null
  labName: string
  ownerName: string
  email: string
  mobile: string
  altMobile: string
  address: string
  state: string
  city: string
  pincode: string
  gstNo: string
  registrationNo: string
  specializations: string
  testsAvailable: string
  status: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    mobileNo: string
    status: string
  }
  doctorAssociations: DoctorAssociationItem[]
  testCatalog: TestCatalogItem[]
  _count: {
    externalOrders: number
    reportUploads: number
    billings: number
    doctorAssociations: number
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  if (status === 'Active') {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
        Active
      </Badge>
    )
  }
  return (
    <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0">
      Inactive
    </Badge>
  )
}

const formatDate = (d: string) => {
  const date = new Date(d)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Main ─────────────────────────────────────────────────────────────────

export default function LabPartnerDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()

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
  const [specializations, setSpecializations] = useState('both')
  const [testsAvailable, setTestsAvailable] = useState('')
  const [status, setStatus] = useState('Active')
  const [deactivateOpen, setDeactivateOpen] = useState(false)

  const { data, isLoading } = useQuery<{ partner: LabPartnerDetail }>({
    queryKey: ['admin-lab-partner', id],
    queryFn: async () => {
      const res = await fetch(`/api/lab-partners/${id}`)
      if (!res.ok) throw new Error('Failed to load lab partner')
      return res.json()
    },
  })

  // Prefill form once data is loaded
  useEffect(() => {
    if (!data?.partner) return
    const p = data.partner
    setLabName(p.labName || '')
    setOwnerName(p.ownerName || '')
    setEmail(p.email || '')
    setMobile(p.mobile || '')
    setAltMobile(p.altMobile || '')
    setAddress(p.address || '')
    setState(p.state || '')
    setCity(p.city || '')
    setPincode(p.pincode || '')
    setGstNo(p.gstNo || '')
    setRegistrationNo(p.registrationNo || '')
    setSpecializations(p.specializations || 'both')
    setTestsAvailable(p.testsAvailable || '')
    setStatus(p.status || 'Active')
  }, [data])

  const updateMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch(`/api/lab-partners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update lab partner')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lab-partner', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-lab-partners'] })
      toast.success('Lab partner updated')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/lab-partners/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to deactivate')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lab-partner', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-lab-partners'] })
      toast.success('Lab partner deactivated')
      setDeactivateOpen(false)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  function handleSave() {
    if (!labName.trim() || !email.trim()) {
      toast.error('Lab name and email are required')
      return
    }
    updateMutation.mutate({
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
      status,
    })
  }

  const p = data?.partner

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-slate-200 -mx-4 px-4 py-3 sm:mx-0 sm:rounded-lg sm:border">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard/admin/lab-partners')}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">
                  {isLoading ? (
                    <Skeleton className="h-6 w-40" />
                  ) : (
                    p?.labName || 'Lab Partner'
                  )}
                </h1>
                {p && statusBadge(p.status)}
              </div>
              <p className="text-xs text-muted-foreground">
                {p?.email || '—'} · {p?.city || '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setDeactivateOpen(true)}
              disabled={deactivateMutation.isPending || p?.status === 'Inactive'}
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              {p?.status === 'Inactive' ? 'Inactive' : 'Deactivate'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Associated Doctors', value: p?._count.doctorAssociations ?? 0, icon: Users, color: 'bg-amber-50 text-amber-600' },
          { label: 'Tests Ordered', value: p?._count.externalOrders ?? 0, icon: FlaskConical, color: 'bg-violet-50 text-violet-600' },
          { label: 'Reports Uploaded', value: p?._count.reportUploads ?? 0, icon: FileText, color: 'bg-teal-50 text-teal-600' },
          { label: 'Bills Generated', value: p?._count.billings ?? 0, icon: Receipt, color: 'bg-emerald-50 text-emerald-600' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${s.color}`}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !p ? (
        <Card className="border-rose-200">
          <CardContent className="p-8 text-center">
            <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground font-medium">Lab partner not found</p>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/admin/lab-partners')}
              className="mt-3"
            >
              Back to Lab Partners
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Lab Profile Card */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-teal-600" />
                Lab Profile
              </CardTitle>
              <CardDescription>
                Edit lab partner information. Changes apply immediately.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Identity */}
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
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status">
                        <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
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
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
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
                      value={gstNo}
                      onChange={(e) => setGstNo(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registrationNo">Registration No.</Label>
                    <Input
                      id="registrationNo"
                      value={registrationNo}
                      onChange={(e) => setRegistrationNo(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* Tests */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-teal-700">
                  <Hash className="h-4 w-4" />
                  Tests Available
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testsAvailable">Comma-separated Test List</Label>
                  <Textarea
                    id="testsAvailable"
                    rows={3}
                    value={testsAvailable}
                    onChange={(e) => setTestsAvailable(e.target.value)}
                  />
                </div>
              </section>
            </CardContent>
            <CardFooter className="border-t pt-6 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/admin/lab-partners')}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          {/* Associated Doctors Card */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-teal-600" />
                Associated Doctors
              </CardTitle>
              <CardDescription>
                Doctors linked to this lab. Associations are created by doctors themselves.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {p.doctorAssociations.length === 0 ? (
                <div className="text-center py-10">
                  <Stethoscope className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-muted-foreground text-sm">
                    No doctors associated yet
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200">
                        <TableHead>Doctor</TableHead>
                        <TableHead className="hidden md:table-cell">Specialization</TableHead>
                        <TableHead className="text-center">Commission %</TableHead>
                        <TableHead className="text-center">Active</TableHead>
                        <TableHead className="hidden lg:table-cell">Associated On</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {p.doctorAssociations.map((a) => (
                        <TableRow key={a.id} className="border-slate-200">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-md bg-amber-50">
                                <Stethoscope className="h-3.5 w-3.5 text-amber-600" />
                              </div>
                              <span>{a.doctor.user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            {a.doctor.specialization || '—'}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="font-mono">
                              {a.commissionPercent}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {a.isActive ? (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
                                Yes
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-0">
                                No
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {formatDate(a.associatedAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Catalog Card (Read-only) */}
          {p.testCatalog.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-teal-600" />
                  Test Catalog
                </CardTitle>
                <CardDescription>
                  Tests configured in this lab's catalog
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200">
                        <TableHead>Test Name</TableHead>
                        <TableHead className="hidden md:table-cell">Category</TableHead>
                        <TableHead className="text-right">Fee</TableHead>
                        <TableHead className="text-center">Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {p.testCatalog.map((t) => (
                        <TableRow key={t.id} className="border-slate-200">
                          <TableCell className="font-medium text-sm">
                            {t.testName}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className="text-xs">
                              {t.testCategory}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            ₹{t.fee.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="text-center">
                            {t.isActive ? (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
                                Yes
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-0">
                                No
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Deactivate Confirmation */}
      <AlertDialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate this lab partner?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark <strong>{p?.labName}</strong> as Inactive. The associated
              user account will also be deactivated. You can re-activate by setting
              status to Active in the profile form above.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                deactivateMutation.mutate()
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deactivateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
