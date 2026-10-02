'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Receipt } from 'lucide-react'
import { formatCurrency } from '@/lib/print-utils'

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  Submitted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  UnderReview: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  PartiallyApproved: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Settled: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
}

export function ClaimsClient() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState('All')

  const { data, isLoading } = useQuery({
    queryKey: ['insurance-claims-list', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'All' ? `?status=${statusFilter}` : ''
      const res = await fetch(`/api/insurance/claims${params}`)
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })

  const claims = data?.claims || []

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Receipt className="h-6 w-6 text-teal-600" /> Insurance Claims
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Track all insurance claims and settlements</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['All', 'Draft', 'Submitted', 'Approved', 'Settled', 'Rejected'].map((s) => (
          <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(s)}>
            {s}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : claims.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              No claims found. Claims are auto-created when a bill is generated for an insured patient.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Claim No</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Patient</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Company</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-3">Claimed</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-3">Patient Share</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-3">TPA Share</th>
                    <th className="text-center text-xs font-medium text-muted-foreground p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((c: any) => (
                    <tr key={c.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/dashboard/hospital/insurance/claims/${c.id}`)}>
                      <td className="p-3 font-mono text-xs">{c.claimNo}</td>
                      <td className="p-3 text-sm">{c.policy?.patient?.name || c.admission?.patientName || '—'}</td>
                      <td className="p-3 text-sm">{c.policy?.company?.name || '—'}</td>
                      <td className="p-3 text-right text-sm font-medium">{formatCurrency(c.claimAmount)}</td>
                      <td className="p-3 text-right text-sm text-amber-600">{formatCurrency(c.patientPayable)}</td>
                      <td className="p-3 text-right text-sm text-emerald-600">{formatCurrency(c.tpaPayable)}</td>
                      <td className="p-3 text-center"><Badge className={STATUS_COLORS[c.status]}>{c.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
