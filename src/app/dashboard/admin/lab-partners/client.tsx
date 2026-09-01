'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Handshake,
  Plus,
  Search,
  Eye,
  Pencil,
  Users,
  FlaskConical,
  MapPin,
  Phone,
  Activity,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────

interface LabPartnerItem {
  id: string
  labName: string
  ownerName: string
  email: string
  mobile: string
  city: string
  state: string
  specializations: string
  status: string
  createdAt: string
  _count: {
    doctorAssociations: number
    externalOrders: number
    reportUploads: number
  }
}

interface LabPartnersResponse {
  partners: LabPartnerItem[]
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

export default function LabPartnersClient() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const params = new URLSearchParams()
  if (statusFilter !== 'all') params.set('status', statusFilter)
  if (search.trim()) params.set('search', search.trim())

  const { data, isLoading } = useQuery<LabPartnersResponse>({
    queryKey: ['admin-lab-partners', statusFilter, search.trim()],
    queryFn: async () => {
      const res = await fetch(`/api/lab-partners?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load lab partners')
      return res.json()
    },
  })

  const partners = useMemo(() => data?.partners ?? [], [data])

  // ─── Stats ───────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = partners.length
    const active = partners.filter((p) => p.status === 'Active').length
    const doctors = partners.reduce((s, p) => s + p._count.doctorAssociations, 0)
    const tests = partners.reduce((s, p) => s + p._count.externalOrders, 0)
    return { total, active, doctors, tests }
  }, [partners])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Handshake className="h-6 w-6 text-teal-600" />
            Lab Partners
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage diagnostic lab partners and their associations
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/admin/lab-partners/new')}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Lab Partner
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Labs', value: stats.total, icon: Handshake, color: 'bg-teal-50 text-teal-600' },
          { label: 'Active', value: stats.active, icon: Activity, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Associated Doctors', value: stats.doctors, icon: Users, color: 'bg-amber-50 text-amber-600' },
          { label: 'Tests Ordered', value: stats.tests, icon: FlaskConical, color: 'bg-violet-50 text-violet-600' },
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

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1 max-w-xs relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, email, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex-1 max-w-xs">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lab Partners Table */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-teal-600" />
            Diagnostic Labs
            {data && (
              <Badge variant="outline" className="ml-2 font-normal text-xs">
                {partners.length} total
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-16">
              <Handshake className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground font-medium">No lab partners found</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Register a new lab partner to get started'}
              </p>
              <Button
                onClick={() => router.push('/dashboard/admin/lab-partners/new')}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Lab Partner
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead>Lab Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="hidden md:table-cell">City</TableHead>
                    <TableHead className="hidden lg:table-cell">Mobile</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead className="text-center">Doctors</TableHead>
                    <TableHead className="text-center">Tests Done</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((p) => (
                    <TableRow
                      key={p.id}
                      className="border-slate-200 cursor-pointer hover:bg-slate-50"
                      onClick={() => router.push(`/dashboard/admin/lab-partners/${p.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-teal-50">
                            <FlaskConical className="h-3.5 w-3.5 text-teal-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{p.labName}</div>
                            <div className="text-xs text-muted-foreground">{p.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{p.ownerName || '—'}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {p.city ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {p.city}
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {p.mobile ? (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {p.mobile}
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>{specializationsBadge(p.specializations)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono text-xs">
                          {p._count.doctorAssociations}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono text-xs">
                          {p._count.externalOrders}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{statusBadge(p.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/dashboard/admin/lab-partners/${p.id}`)
                            }}
                          >
                            <Eye className="h-4 w-4 text-teal-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/dashboard/admin/lab-partners/${p.id}`)
                            }}
                          >
                            <Pencil className="h-4 w-4 text-amber-600" />
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
    </div>
  )
}

