'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, ClipboardCheck } from 'lucide-react'
import { formatCurrency } from '@/lib/print-utils'

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Submitted: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  PartiallyApproved: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export function PreAuthsClient() {
  const [statusFilter, setStatusFilter] = useState('All')

  const { data, isLoading } = useQuery({
    queryKey: ['insurance-preauths', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'All' ? `?status=${statusFilter}` : ''
      const res = await fetch(`/api/insurance/pre-auth${params}`)
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })

  const preAuths = data?.preAuths || []

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-teal-600" /> Pre-Authorizations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Insurance pre-auth requests before admission/treatment</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/hospital/insurance/pre-auths/new"><Plus className="h-4 w-4 mr-2" /> New Pre-Auth</Link>
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['All', 'Pending', 'Submitted', 'Approved', 'Rejected'].map((s) => (
          <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(s)}>
            {s}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : preAuths.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              No pre-authorizations found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Pre-Auth No</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Patient</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Company</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-3">Requested</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-3">Approved</th>
                    <th className="text-center text-xs font-medium text-muted-foreground p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preAuths.map((pa: any) => (
                    <tr key={pa.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => window.location.href = `/dashboard/hospital/insurance/pre-auths/${pa.id}`}>
                      <td className="p-3 font-mono text-xs">{pa.preAuthNo}</td>
                      <td className="p-3 text-sm">{pa.policy?.patient?.name || pa.admission?.patientName || '—'}</td>
                      <td className="p-3 text-sm">{pa.policy?.company?.name || '—'}</td>
                      <td className="p-3 text-right text-sm font-medium">{formatCurrency(pa.requestedAmount)}</td>
                      <td className="p-3 text-right text-sm">{pa.approvedAmount > 0 ? formatCurrency(pa.approvedAmount) : '—'}</td>
                      <td className="p-3 text-center"><Badge className={STATUS_COLORS[pa.status]}>{pa.status}</Badge></td>
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
