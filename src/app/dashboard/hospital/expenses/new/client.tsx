'use client'

import { useState, useMemo } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Loader2, Save, ArrowLeft, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

const PAYMENT_MODES = ['Cash', 'Bank', 'UPI', 'Cheque', 'NEFT']
const COST_CENTER_TYPES = ['', 'Department', 'Ward']
// Radix UI forbids empty-string SelectItem values — use a sentinel for "no vendor"
const NO_VENDOR = 'none'

const emptyForm = {
  categoryId: '',
  vendorId: NO_VENDOR,
  amount: 0,
  taxAmount: 0,
  paymentMode: 'Cash',
  paymentRef: '',
  expenseDate: format(new Date(), 'yyyy-MM-dd'),
  description: '',
  receiptUrl: '',
  costCenterType: '',
  costCenterId: '',
  status: 'Pending',
}

const fmtINR = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function NewExpenseClient() {
  const router = useRouter()
  const [form, setForm] = useState(emptyForm)
  const [uploading, setUploading] = useState(false)

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const res = await fetch('/api/expense-categories?status=Active')
      if (!res.ok) throw new Error('Failed to load categories')
      return res.json()
    },
  })
  const categories = categoriesData?.data || []

  // Fetch vendors
  const { data: vendorsData } = useQuery({
    queryKey: ['vendors-active'],
    queryFn: async () => {
      const res = await fetch('/api/vendors?status=Active&limit=100')
      if (!res.ok) throw new Error('Failed to load vendors')
      return res.json()
    },
  })
  const vendors = vendorsData?.data || []

  // Fetch departments (cost center)
  const { data: departmentsData } = useQuery({
    queryKey: ['departments-for-cost-center'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/hospital/departments')
      if (!res.ok) return { data: [] }
      return res.json()
    },
  })
  const departments = departmentsData?.data || departmentsData?.departments || []

  // Fetch wards (cost center)
  const { data: wardsData } = useQuery({
    queryKey: ['wards-for-cost-center'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/admin/wards')
      if (!res.ok) return { wards: [] }
      return res.json()
    },
  })
  const wards = wardsData?.wards || []

  // Total amount (auto-calc)
  const total = useMemo(
    () => Number(form.amount) + Number(form.taxAmount),
    [form.amount, form.taxAmount]
  )

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof emptyForm) => {
      const payload: Record<string, unknown> = {
        categoryId: data.categoryId,
        amount: Number(data.amount),
        taxAmount: Number(data.taxAmount),
        paymentMode: data.paymentMode,
        paymentRef: data.paymentRef,
        expenseDate: data.expenseDate,
        description: data.description,
        receiptUrl: data.receiptUrl,
        costCenterType: data.costCenterType,
        status: data.status,
      }
      if (data.vendorId && data.vendorId !== NO_VENDOR) payload.vendorId = data.vendorId
      if (data.costCenterId) payload.costCenterId = data.costCenterId

      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create expense')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Expense created successfully')
      router.push('/dashboard/hospital/expenses')
    },
    onError: (err) => toast.error(err.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.categoryId) {
      toast.error('Please select an expense category')
      return
    }
    if (form.amount <= 0) {
      toast.error('Amount must be greater than zero')
      return
    }
    createMutation.mutate(form)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'expenses')
      // Use the existing upload endpoint pattern if present, else fall back to base64 data URL
      const res = await fetch('/api/patient/medical-documents/upload', {
        method: 'POST',
        body: formData,
      }).catch(() => null)

      if (res && res.ok) {
        const data = await res.json()
        setForm((f) => ({ ...f, receiptUrl: data.url || data.secure_url || '' }))
        toast.success('Receipt uploaded')
      } else {
        // Fallback: read as data URL (works for small images)
        const reader = new FileReader()
        reader.onload = () => {
          setForm((f) => ({ ...f, receiptUrl: String(reader.result || '') }))
          toast.success('Receipt attached')
        }
        reader.onerror = () => toast.error('Failed to read file')
        reader.readAsDataURL(file)
      }
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Expense</h1>
          <p className="text-muted-foreground text-sm">
            Record a new expense for approval and payment
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic details */}
          <Card>
            <CardHeader><CardTitle className="text-base">Expense Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="categoryId">Expense Category *</Label>
                  <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c: { id: string; name: string; type: string }) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} <span className="text-xs text-muted-foreground">({c.type})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vendorId">Vendor (optional)</Label>
                  <Select value={form.vendorId} onValueChange={(v) => setForm({ ...form, vendorId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_VENDOR}>— No vendor —</SelectItem>
                      {vendors.map((v: { id: string; name: string }) => (
                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expenseDate">Expense Date</Label>
                  <Input
                    id="expenseDate"
                    type="date"
                    value={form.expenseDate}
                    onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of the expense..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Amount & payment */}
          <Card>
            <CardHeader><CardTitle className="text-base">Amount & Payment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="taxAmount">Tax / GST (₹)</Label>
                  <Input
                    id="taxAmount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.taxAmount}
                    onChange={(e) => setForm({ ...form, taxAmount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Total (₹)</Label>
                  <div className="flex h-10 items-center rounded-md border bg-muted/50 px-3 font-bold tabular-nums">
                    {fmtINR(total)}
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="paymentMode">Payment Mode</Label>
                  <Select value={form.paymentMode} onValueChange={(v) => setForm({ ...form, paymentMode: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_MODES.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paymentRef">Payment Reference</Label>
                  <Input
                    id="paymentRef"
                    value={form.paymentRef}
                    onChange={(e) => setForm({ ...form, paymentRef: e.target.value })}
                    placeholder="UTR / Cheque no."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost center */}
          <Card>
            <CardHeader><CardTitle className="text-base">Cost Center (optional)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="costCenterType">Cost Center Type</Label>
                  <Select
                    value={form.costCenterType}
                    onValueChange={(v) => setForm({ ...form, costCenterType: v, costCenterId: '' })}
                  >
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      {COST_CENTER_TYPES.filter(Boolean).map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="costCenterId">
                    {form.costCenterType === 'Ward' ? 'Select Ward' : form.costCenterType === 'Department' ? 'Select Department' : 'Select'}
                  </Label>
                  {form.costCenterType === 'Department' ? (
                    <Select value={form.costCenterId} onValueChange={(v) => setForm({ ...form, costCenterId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((d: { id: string; name: string }) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : form.costCenterType === 'Ward' ? (
                    <Select value={form.costCenterId} onValueChange={(v) => setForm({ ...form, costCenterId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select ward" /></SelectTrigger>
                      <SelectContent>
                        {wards.map((w: { id: string; name: string }) => (
                          <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input disabled placeholder="Select a cost center type first" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Receipt upload */}
          <Card>
            <CardHeader><CardTitle className="text-base">Receipt</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {form.receiptUrl ? (
                <div className="relative">
                  <img
                    src={form.receiptUrl}
                    alt="Receipt"
                    className="w-full rounded-lg border object-contain"
                    style={{ maxHeight: 240 }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-7 w-7"
                    onClick={() => setForm({ ...form, receiptUrl: '' })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <p className="mt-2 truncate text-xs text-muted-foreground">{form.receiptUrl}</p>
                </div>
              ) : (
                <>
                  <label
                    htmlFor="receiptUpload"
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-teal-200 bg-teal-50/30 p-6 text-center transition-colors hover:border-teal-300 hover:bg-teal-50/60 dark:border-teal-800 dark:bg-teal-950/20 dark:hover:border-teal-700 dark:hover:bg-teal-950/30"
                  >
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-teal-600 dark:text-teal-400" />
                    ) : (
                      <Upload className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {uploading ? 'Uploading...' : 'Click to upload receipt'}
                    </span>
                    <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                  </label>
                  <input
                    id="receiptUpload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </>
              )}
              <div>
                <Label htmlFor="receiptUrl" className="text-xs text-muted-foreground">
                  Or paste receipt URL
                </Label>
                <Input
                  id="receiptUrl"
                  value={form.receiptUrl}
                  onChange={(e) => setForm({ ...form, receiptUrl: e.target.value })}
                  placeholder="https://..."
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Amount</span>
                <span className="font-medium">{fmtINR(Number(form.amount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax / GST</span>
                <span className="font-medium">{fmtINR(Number(form.taxAmount))}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-bold tabular-nums">
                <span>Total</span>
                <span className="text-emerald-600 dark:text-emerald-400">{fmtINR(total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Create Expense
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
