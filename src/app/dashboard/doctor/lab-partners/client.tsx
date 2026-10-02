'use client'

import { useMemo, useState } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  Handshake,
  Plus,
  Search,
  Pencil,
  Users,
  FlaskConical,
  MapPin,
  Phone,
  Activity,
  FileText,
  Trash2,
  Link2,
  Loader2,
  Save,
  ArrowLeft,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────

interface AssociationItem {
  id: string
  commissionPercent: number
  notes: string | null
  isActive: boolean
  associatedAt: string
  labPartner: {
    id: string
    labName: string
    ownerName: string
    email: string
    mobile: string
    city: string
    state: string
    specializations: string
    status: string
    _count: {
      externalOrders: number
      reportUploads: number
    }
  }
}

interface AssociationsResponse {
  associations: AssociationItem[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function specializationsBadge(spec: string) {
  switch (spec) {
    case 'blood':
      return (
        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0">
          Blood
        </Badge>
      )
    case 'radiology':
      return (
        <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-0">
          Radiology
        </Badge>
      )
    default:
      return (
        <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 border-0">
          Both
        </Badge>
      )
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────

export default function DoctorLabPartnersClient() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')

  // Dialog state — Add Lab (with tabs)
  const [addOpen, setAddOpen] = useState(false)
  const [addTab, setAddTab] = useState<'register' | 'link'>('register')

  // Register new lab form state
  const [rLabName, setRLabName] = useState('')
  const [rOwnerName, setROwnerName] = useState('')
  const [rEmail, setREmail] = useState('')
  const [rMobile, setRMobile] = useState('')
  const [rCity, setRCity] = useState('')
  const [rSpecializations, setRSpecializations] = useState<string>('both')
  const [rCommission, setRCommission] = useState<number>(10)
  const [rPassword, setRPassword] = useState('')

  // Link existing lab form state
  const [lLabPartnerId, setLLabPartnerId] = useState('')
  const [lCommission, setLCommission] = useState<number>(10)

  // Edit commission dialog state
  const [editAssoc, setEditAssoc] = useState<AssociationItem | null>(null)
  const [editCommission, setEditCommission] = useState<number>(10)

  // Remove dialog state
  const [removeAssoc, setRemoveAssoc] = useState<AssociationItem | null>(null)

  // ─── Query: my associations ───────────────────────────────────────────
  const { data, isLoading } = useQuery<AssociationsResponse>({
    queryKey: ['doctor-lab-associations'],
    queryFn: async () => {
      const res = await fetch('/api/doctor-lab-associations')
      if (!res.ok) throw new Error('Failed to load lab associations')
      return res.json()
    },
  })

  const associations = useMemo(() => data?.associations ?? [], [data])

  const filtered = useMemo(() => {
    if (!search.trim()) return associations
    const q = search.trim().toLowerCase()
    return associations.filter(
      (a) =>
        a.labPartner.labName?.toLowerCase().includes(q) ||
        a.labPartner.ownerName?.toLowerCase().includes(q) ||
        a.labPartner.email?.toLowerCase().includes(q) ||
        a.labPartner.city?.toLowerCase().includes(q),
    )
  }, [associations, search])

  // ─── Stats ───────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = associations.length
    const active = associations.filter((a) => a.labPartner.status === 'Active').length
    const tests = associations.reduce((s, a) => s + a.labPartner._count.externalOrders, 0)
    const reports = associations.reduce((s, a) => s + a.labPartner._count.reportUploads, 0)
    return { total, active, tests, reports }
  }, [associations])

  // ─── Mutations ───────────────────────────────────────────────────────

  // Register new lab (auto-creates association since creator is doctor)
  const registerMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch('/api/lab-partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to register lab')
      return json
    },
    onSuccess: () => {
      toast.success('Lab partner registered and added to your associated labs')
      queryClient.invalidateQueries({ queryKey: ['doctor-lab-associations'] })
      resetRegisterForm()
      setAddOpen(false)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  // Link existing lab
  const linkMutation = useMutation({
    mutationFn: async (payload: { labPartnerId: string; commissionPercent: number }) => {
      const res = await fetch('/api/doctor-lab-associations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to link lab')
      return json
    },
    onSuccess: () => {
      toast.success('Lab linked to your account')
      queryClient.invalidateQueries({ queryKey: ['doctor-lab-associations'] })
      setLLabPartnerId('')
      setLCommission(10)
      setAddOpen(false)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  // Edit commission
  const editMutation = useMutation({
    mutationFn: async ({ id, commissionPercent }: { id: string; commissionPercent: number }) => {
      const res = await fetch(`/api/doctor-lab-associations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionPercent }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update commission')
      return json
    },
    onSuccess: () => {
      toast.success('Commission updated')
      queryClient.invalidateQueries({ queryKey: ['doctor-lab-associations'] })
      setEditAssoc(null)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  // Remove association
  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/doctor-lab-associations/${id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to remove lab')
      return json
    },
    onSuccess: () => {
      toast.success('Lab removed from your account')
      queryClient.invalidateQueries({ queryKey: ['doctor-lab-associations'] })
      setRemoveAssoc(null)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  function resetRegisterForm() {
    setRLabName('')
    setROwnerName('')
    setREmail('')
    setRMobile('')
    setRCity('')
    setRSpecializations('both')
    setRCommission(10)
    setRPassword('')
  }

  function handleRegister() {
    if (!rLabName.trim() || !rEmail.trim()) {
      toast.error('Lab name and email are required')
      return
    }
    registerMutation.mutate({
      labName: rLabName.trim(),
      ownerName: rOwnerName.trim(),
      email: rEmail.trim(),
      mobile: rMobile.trim(),
      city: rCity.trim(),
      specializations: rSpecializations,
      commissionPercent: rCommission,
      password: rPassword.trim() || undefined,
      hospitalId: null,
    })
  }

  function handleLink() {
    if (!lLabPartnerId.trim()) {
      toast.error('Lab Partner ID is required')
      return
    }
    linkMutation.mutate({
      labPartnerId: lLabPartnerId.trim(),
      commissionPercent: lCommission,
    })
  }

  function openEdit(a: AssociationItem) {
    setEditAssoc(a)
    setEditCommission(a.commissionPercent)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Handshake className="h-6 w-6 text-teal-600" />
            My Lab Partners
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Diagnostic labs associated with your practice
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/doctor/lab-partners/new')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Open Create Page
          </Button>
          <Button
            onClick={() => {
              setAddTab('register')
              setAddOpen(true)
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Lab Partner
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Labs', value: stats.total, icon: Handshake, color: 'bg-teal-50 text-teal-600' },
          { label: 'Active Labs', value: stats.active, icon: Activity, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Tests Done', value: stats.tests, icon: FlaskConical, color: 'bg-amber-50 text-amber-600' },
          { label: 'Reports', value: stats.reports, icon: FileText, color: 'bg-violet-50 text-violet-600' },
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

      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, owner, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Associated Labs Table */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-teal-600" />
            Associated Labs
            {data && (
              <Badge variant="outline" className="ml-2 font-normal text-xs">
                {associations.length} total
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Commission is auto-applied when labs upload reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Handshake className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground font-medium">No associated labs</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {search
                  ? 'Try adjusting your search'
                  : 'Register a new lab or link an existing one to get started'}
              </p>
              <Button
                onClick={() => setAddOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Lab Partner
              </Button>
            </div>
          ) : (
            <div className="max-h-[560px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead>Lab Name</TableHead>
                    <TableHead className="hidden md:table-cell">Owner</TableHead>
                    <TableHead className="hidden md:table-cell">City</TableHead>
                    <TableHead className="hidden lg:table-cell">Mobile</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead className="text-center">Commission %</TableHead>
                    <TableHead className="text-center">Tests Done</TableHead>
                    <TableHead className="text-center">Reports</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => (
                    <TableRow key={a.id} className="border-slate-200 hover:bg-slate-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-teal-50">
                            <FlaskConical className="h-3.5 w-3.5 text-teal-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{a.labPartner.labName}</div>
                            <div className="text-xs text-muted-foreground">{a.labPartner.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {a.labPartner.ownerName || '—'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {a.labPartner.city ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {a.labPartner.city}
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {a.labPartner.mobile ? (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {a.labPartner.mobile}
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>{specializationsBadge(a.labPartner.specializations)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono text-xs bg-teal-50 text-teal-700 border-0">
                          {a.commissionPercent}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono text-xs">
                          {a.labPartner._count.externalOrders}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono text-xs">
                          {a.labPartner._count.reportUploads}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            title="Edit Commission"
                            onClick={() => openEdit(a)}
                          >
                            <Pencil className="h-4 w-4 text-amber-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            title="Remove"
                            onClick={() => setRemoveAssoc(a)}
                          >
                            <Trash2 className="h-4 w-4 text-rose-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Lab Partner Dialog (with tabs) */}
      <Dialog open={addOpen} onOpenChange={(open) => {
        setAddOpen(open)
        if (!open) {
          resetRegisterForm()
          setLLabPartnerId('')
          setLCommission(10)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-teal-600" />
              Add Lab Partner
            </DialogTitle>
            <DialogDescription>
              Register a new diagnostic lab or link to an existing one using its Lab Partner ID
            </DialogDescription>
          </DialogHeader>

          <Tabs value={addTab} onValueChange={(v) => setAddTab(v as 'register' | 'link')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="register">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Register New Lab
              </TabsTrigger>
              <TabsTrigger value="link">
                <Link2 className="h-3.5 w-3.5 mr-1.5" />
                Link Existing Lab
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Register */}
            <TabsContent value="register" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rLabName">
                    Lab Name <span className="text-rose-600">*</span>
                  </Label>
                  <Input
                    id="rLabName"
                    placeholder="e.g. City Diagnostic Centre"
                    value={rLabName}
                    onChange={(e) => setRLabName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rOwnerName">Owner Name</Label>
                  <Input
                    id="rOwnerName"
                    placeholder="Owner / contact person"
                    value={rOwnerName}
                    onChange={(e) => setROwnerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rEmail">
                    Email <span className="text-rose-600">*</span>
                  </Label>
                  <Input
                    id="rEmail"
                    type="email"
                    placeholder="lab@example.com"
                    value={rEmail}
                    onChange={(e) => setREmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rMobile">Mobile</Label>
                  <Input
                    id="rMobile"
                    placeholder="+91 98765 43210"
                    value={rMobile}
                    onChange={(e) => setRMobile(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rCity">City</Label>
                  <Input
                    id="rCity"
                    placeholder="Mumbai"
                    value={rCity}
                    onChange={(e) => setRCity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rSpecializations">Specialization</Label>
                  <Select value={rSpecializations} onValueChange={setRSpecializations}>
                    <SelectTrigger id="rSpecializations">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blood">Blood Tests</SelectItem>
                      <SelectItem value="radiology">Radiology</SelectItem>
                      <SelectItem value="both">Both (Blood + Radiology)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rCommission">My Default Commission %</Label>
                  <Input
                    id="rCommission"
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={rCommission}
                    onChange={(e) => setRCommission(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Applied to your association with this lab
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rPassword">Account Password</Label>
                  <Input
                    id="rPassword"
                    type="text"
                    placeholder="lab12345"
                    value={rPassword}
                    onChange={(e) => setRPassword(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Defaults to <code className="bg-slate-100 px-1 rounded">lab12345</code> if left blank
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Link existing */}
            <TabsContent value="link" className="space-y-4 pt-4">
              <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-3 text-xs text-teal-800">
                Ask the lab partner for their <strong>Lab Partner ID</strong> (provided by
                their admin or visible in their lab-technician profile). Paste it below to
                link the lab to your account.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="lLabPartnerId">
                    Lab Partner ID <span className="text-rose-600">*</span>
                  </Label>
                  <Input
                    id="lLabPartnerId"
                    placeholder="e.g. lab-partner-uuid or any ID"
                    value={lLabPartnerId}
                    onChange={(e) => setLLabPartnerId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lCommission">Commission %</Label>
                  <Input
                    id="lCommission"
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={lCommission}
                    onChange={(e) => setLCommission(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your share on each test billed through this lab
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              disabled={registerMutation.isPending || linkMutation.isPending}
            >
              Cancel
            </Button>
            {addTab === 'register' ? (
              <Button
                onClick={handleRegister}
                disabled={registerMutation.isPending}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {registerMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Register & Link
              </Button>
            ) : (
              <Button
                onClick={handleLink}
                disabled={linkMutation.isPending}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {linkMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4 mr-2" />
                )}
                Link Lab
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Commission Dialog */}
      <Dialog
        open={!!editAssoc}
        onOpenChange={(open) => {
          if (!open) setEditAssoc(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-amber-600" />
              Edit Commission
            </DialogTitle>
            <DialogDescription>
              Update your commission percentage for{' '}
              <strong>{editAssoc?.labPartner.labName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="editCommission">Commission %</Label>
              <Input
                id="editCommission"
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={editCommission}
                onChange={(e) => setEditCommission(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Applied when this lab uploads a report for a test you ordered
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAssoc(null)} disabled={editMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editAssoc) return
                editMutation.mutate({ id: editAssoc.id, commissionPercent: editCommission })
              }}
              disabled={editMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {editMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Association AlertDialog */}
      <AlertDialog
        open={!!removeAssoc}
        onOpenChange={(open) => {
          if (!open) setRemoveAssoc(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this lab partner?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove{' '}
              <strong>{removeAssoc?.labPartner.labName}</strong> from your associated
              labs. The lab partner account remains active and can be re-linked later.
              Past commission billings are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                if (!removeAssoc) return
                removeMutation.mutate(removeAssoc.id)
              }}
              disabled={removeMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {removeMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
