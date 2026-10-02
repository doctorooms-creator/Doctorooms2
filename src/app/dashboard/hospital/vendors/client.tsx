'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, Building2, Loader2, Eye, Phone, Mail, MapPin, Receipt, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ============ Types ============
interface Vendor {
  id: string
  hospitalId: string
  name: string
  category: string
  gstNo: string
  panNo: string
  contactPerson: string
  phoneNo: string
  email: string
  address: string
  city: string
  state: string
  pincode: string
  paymentTerms: string
  bankAccountNo: string
  bankIfsc: string
  status: string
  createdAt: string
  updatedAt: string
  _count?: { expenses: number; payments: number }
}

interface VendorDetail extends Vendor {
  expenses: Array<{
    id: string
    expenseNo: string
    expenseDate: string
    totalAmount: number
    status: string
    category: { id: string; name: string }
  }>
  payments: Array<{
    id: string
    paymentNo: string
    amount: number
    paymentDate: string
    paymentMode: string
    notes: string
  }>
}

const VENDOR_CATEGORIES = [
  'Pharmacy',
  'Equipment Supplier',
  'Utility',
  'Service Provider',
  'Maintenance',
  'Consultant',
  'Office Supplies',
  'Other',
]

const emptyForm = {
  name: '',
  category: 'Pharmacy',
  gstNo: '',
  panNo: '',
  contactPerson: '',
  phoneNo: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  paymentTerms: '',
  bankAccountNo: '',
  bankIfsc: '',
  status: 'Active',
}

const fmtINR = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

// ============ Component ============
export default function VendorsClient() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Vendor | null>(null)
  const [deletingItem, setDeletingItem] = useState<Vendor | null>(null)
  const [viewingItem, setViewingItem] = useState<Vendor | null>(null)
  const [form, setForm] = useState(emptyForm)

  // Fetch vendors
  const { data: vendorsData, isLoading } = useQuery({
    queryKey: ['vendors', search, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      params.set('page', String(page))
      params.set('limit', '20')
      const res = await fetch(`/api/vendors?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load vendors')
      return res.json()
    },
  })

  // Fetch vendor detail (when viewing)
  const { data: vendorDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['vendor-detail', viewingItem?.id],
    queryFn: async () => {
      const res = await fetch(`/api/vendors/${viewingItem!.id}`)
      if (!res.ok) throw new Error('Failed to load vendor details')
      return res.json()
    },
    enabled: !!viewingItem,
  })

  const vendors: Vendor[] = vendorsData?.data || []
  const total = vendorsData?.total || 0
  const totalPages = vendorsData?.totalPages || 1

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof emptyForm) => {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create vendor')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Vendor created successfully')
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      closeDialog()
    },
    onError: (err) => toast.error(err.message),
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof emptyForm }) => {
      const res = await fetch(`/api/vendors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update vendor')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Vendor updated successfully')
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      closeDialog()
    },
    onError: (err) => toast.error(err.message),
  })

  // Delete mutation (soft delete)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/vendors/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to delete vendor')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Vendor deactivated successfully')
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      setDeleteDialogOpen(false)
      setDeletingItem(null)
    },
    onError: (err) => toast.error(err.message),
  })

  const openCreateDialog = () => {
    setEditingItem(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEditDialog = (item: Vendor) => {
    setEditingItem(item)
    setForm({
      name: item.name,
      category: item.category || 'Other',
      gstNo: item.gstNo,
      panNo: item.panNo,
      contactPerson: item.contactPerson,
      phoneNo: item.phoneNo,
      email: item.email,
      address: item.address,
      city: item.city,
      state: item.state,
      pincode: item.pincode,
      paymentTerms: item.paymentTerms,
      bankAccountNo: item.bankAccountNo,
      bankIfsc: item.bankIfsc,
      status: item.status,
    })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingItem(null)
    setForm(emptyForm)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const detail = vendorDetail?.data as VendorDetail | undefined

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground text-sm">
            Manage suppliers, service providers, and other payees
          </p>
        </div>
        <Button onClick={openCreateDialog} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, contact, phone, GST, city..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : vendors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <h3 className="text-lg font-medium">No vendors found</h3>
              <p className="text-sm text-muted-foreground">
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Add your first vendor to get started.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop: Table */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden lg:table-cell">Category</TableHead>
                      <TableHead className="hidden md:table-cell">Contact</TableHead>
                      <TableHead className="hidden lg:table-cell">Phone</TableHead>
                      <TableHead className="hidden xl:table-cell text-right">Expenses</TableHead>
                      <TableHead className="hidden xl:table-cell text-right">Payments</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {vendors.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15, delay: index * 0.02 }}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <TableCell>
                            <div className="font-medium">{item.name}</div>
                            {item.contactPerson && (
                              <div className="text-xs text-muted-foreground">{item.contactPerson}</div>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant="secondary">{item.category || '—'}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-muted-foreground">{item.email || '—'}</span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-muted-foreground">{item.phoneNo || '—'}</span>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell text-right">
                            <span className="font-medium">{item._count?.expenses || 0}</span>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell text-right">
                            <span className="font-medium">{item._count?.payments || 0}</span>
                          </TableCell>
                          <TableCell>
                            {item.status === 'Active' ? (
                              <Badge className="bg-emerald-600 hover:bg-emerald-700">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setViewingItem(item)
                                  setViewDialogOpen(true)
                                }}
                                className="h-8 w-8"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(item)}
                                className="h-8 w-8"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setDeletingItem(item)
                                  setDeleteDialogOpen(true)
                                }}
                                className="h-8 w-8 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              {/* Mobile: Card layout */}
              <div className="space-y-3 p-4 md:hidden">
                {vendors.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.contactPerson || '—'}</p>
                        <Badge variant="secondary" className="mt-1">{item.category || 'Other'}</Badge>
                      </div>
                      {item.status === 'Active' ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>Phone: {item.phoneNo || '—'}</div>
                      <div>Email: {item.email || '—'}</div>
                      <div>City: {item.city || '—'}</div>
                      <div>GST: {item.gstNo || '—'}</div>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-1">
                      <Button variant="outline" size="sm" onClick={() => { setViewingItem(item); setViewDialogOpen(true) }}>
                        <Eye className="mr-1 h-3 w-3" /> View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                        <Pencil className="mr-1 h-3 w-3" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600" onClick={() => { setDeletingItem(item); setDeleteDialogOpen(true) }}>
                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <span className="flex h-9 items-center px-3 text-sm">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the vendor details.' : 'Fill in the details to add a new vendor.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Vendor Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Pharma Supplier Co."
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VENDOR_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phoneNo">Phone</Label>
                <Input
                  id="phoneNo"
                  value={form.phoneNo}
                  onChange={(e) => setForm({ ...form, phoneNo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="gstNo">GST No</Label>
                <Input
                  id="gstNo"
                  value={form.gstNo}
                  onChange={(e) => setForm({ ...form, gstNo: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input
                  id="paymentTerms"
                  value={form.paymentTerms}
                  onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                  placeholder="e.g. Net 30"
                />
              </div>
              <div>
                <Label htmlFor="bankAccountNo">Bank Account No</Label>
                <Input
                  id="bankAccountNo"
                  value={form.bankAccountNo}
                  onChange={(e) => setForm({ ...form, bankAccountNo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bankIfsc">Bank IFSC</Label>
                <Input
                  id="bankIfsc"
                  value={form.bankIfsc}
                  onChange={(e) => setForm({ ...form, bankIfsc: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingItem ? 'Save Changes' : 'Create Vendor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={(open) => { if (!open) { setViewingItem(null); setViewDialogOpen(false) } }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-teal-600" />
              {viewingItem?.name}
            </DialogTitle>
            <DialogDescription>
              Vendor details, expenses, and payment history
            </DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : detail ? (
            <div className="space-y-4">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-3 rounded-lg border p-3 text-sm">
                <div><span className="text-muted-foreground">Category:</span> {detail.category || '—'}</div>
                <div><span className="text-muted-foreground">Status:</span> {detail.status}</div>
                <div className="flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" /> {detail.phoneNo || '—'}</div>
                <div className="flex items-center gap-1 truncate"><Mail className="h-3 w-3 text-muted-foreground" /> {detail.email || '—'}</div>
                <div className="col-span-2 flex items-start gap-1"><MapPin className="h-3 w-3 text-muted-foreground mt-0.5" /> {detail.address || '—'}, {detail.city} {detail.state} {detail.pincode}</div>
                <div><span className="text-muted-foreground">GST:</span> {detail.gstNo || '—'}</div>
                <div><span className="text-muted-foreground">PAN:</span> {detail.panNo || '—'}</div>
                <div><span className="text-muted-foreground">Payment Terms:</span> {detail.paymentTerms || '—'}</div>
                <div><span className="text-muted-foreground">Bank A/C:</span> {detail.bankAccountNo || '—'} {detail.bankIfsc && `(${detail.bankIfsc})`}</div>
              </div>

              {/* Expenses */}
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Receipt className="h-4 w-4 text-amber-600" /> Recent Expenses ({detail._count?.expenses || 0})
                </h4>
                <div className="max-h-48 overflow-y-auto rounded-lg border">
                  {detail.expenses.length === 0 ? (
                    <p className="p-3 text-center text-xs text-muted-foreground">No expenses recorded</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Expense No</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.expenses.map((e) => (
                          <TableRow key={e.id}>
                            <TableCell className="font-medium text-xs">{e.expenseNo}</TableCell>
                            <TableCell className="text-xs">{format(new Date(e.expenseDate), 'dd MMM yyyy')}</TableCell>
                            <TableCell className="text-xs">{e.category.name}</TableCell>
                            <TableCell className="text-right text-xs font-medium">{fmtINR(e.totalAmount)}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">{e.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>

              {/* Payments */}
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="h-4 w-4 text-emerald-600" /> Payment History ({detail._count?.payments || 0})
                </h4>
                <div className="max-h-48 overflow-y-auto rounded-lg border">
                  {detail.payments.length === 0 ? (
                    <p className="p-3 text-center text-xs text-muted-foreground">No payments recorded</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Payment No</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Mode</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.payments.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium text-xs">{p.paymentNo}</TableCell>
                            <TableCell className="text-xs">{format(new Date(p.paymentDate), 'dd MMM yyyy')}</TableCell>
                            <TableCell className="text-xs">{p.paymentMode}</TableCell>
                            <TableCell className="text-right text-xs font-medium">{fmtINR(p.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate vendor?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark <strong>{deletingItem?.name}</strong> as Inactive. Existing expenses and
              payments will be preserved for audit. You can reactivate the vendor later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingItem(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingItem && deleteMutation.mutate(deletingItem.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
