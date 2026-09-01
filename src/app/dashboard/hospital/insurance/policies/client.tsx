'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { FileText } from 'lucide-react'
import { formatCurrency } from '@/lib/print-utils'

export function PoliciesClient() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['all-insurance-policies'],
    queryFn: async () => {
      const res = await fetch('/api/patient-insurance')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })

  const policies = (data?.policies || []).filter((p: any) => {
    if (!search) return true
    const q = search.toLowerCase()
    return p.policyNo?.toLowerCase().includes(q) ||
      p.patient?.name?.toLowerCase().includes(q) ||
      p.company?.name?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-teal-600" /> Insurance Policies
        </h1>
        <p className="text-sm text-muted-foreground mt-1">All patient insurance policies</p>
      </div>

      <Input placeholder="Search by patient, policy no, or company…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : policies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No policies found.</div>
          ) : (
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Patient</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Company</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Policy No</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-3">Sum Insured</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-3">Copay</th>
                    <th className="text-center text-xs font-medium text-muted-foreground p-3">Type</th>
                    <th className="text-center text-xs font-medium text-muted-foreground p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map((p: any) => {
                    const isActive = p.validTo ? new Date(p.validTo) > new Date() : true
                    return (
                      <tr key={p.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 text-sm font-medium">{p.patient?.name || '—'}</td>
                        <td className="p-3 text-sm">{p.company?.name || '—'}</td>
                        <td className="p-3 text-sm font-mono text-xs">{p.policyNo}</td>
                        <td className="p-3 text-right text-sm font-medium">{formatCurrency(p.sumInsured)}</td>
                        <td className="p-3 text-right text-sm">{p.copayPercent}%</td>
                        <td className="p-3 text-center text-xs">{p.policyType}</td>
                        <td className="p-3 text-center">
                          {isActive ? (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Active</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Expired</Badge>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
