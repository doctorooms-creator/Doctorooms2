'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Shield, FileText, ClipboardCheck, Receipt, Building2, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/print-utils'

export function InsuranceDashboardClient() {
  const { data: claimsData, isLoading: claimsLoading } = useQuery({
    queryKey: ['insurance-claims-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/insurance/claims')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })

  const { data: preAuthData, isLoading: preAuthLoading } = useQuery({
    queryKey: ['insurance-preauths-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/insurance/pre-auth')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })

  const claims = claimsData?.claims || []
  const preAuths = preAuthData?.preAuths || []

  const activeClaims = claims.filter((c: any) => !['Settled', 'Rejected'].includes(c.status))
  const pendingPreAuths = preAuths.filter((p: any) => ['Pending', 'Submitted'].includes(p.status))
  const totalClaimed = claims.reduce((sum: number, c: any) => sum + (c.claimAmount || 0), 0)
  const totalSettled = claims.filter((c: any) => c.status === 'Settled').reduce((sum: number, c: any) => sum + (c.settlementAmount || 0), 0)

  const STATUS_COLORS: Record<string, string> = {
    Draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    Submitted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    UnderReview: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    PartiallyApproved: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Settled: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-teal-600" />
            Insurance Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage insurance claims, pre-authorizations, and TPA settlements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/hospital/insurance/companies"><Building2 className="h-4 w-4 mr-2" /> Companies</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/hospital/insurance/pre-auths"><ClipboardCheck className="h-4 w-4 mr-2" /> Pre-Auths</Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">ACTIVE CLAIMS</span>
              <FileText className="h-4 w-4 text-teal-600" />
            </div>
            <p className="text-2xl font-bold">{activeClaims.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">PENDING PRE-AUTHS</span>
              <ClipboardCheck className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold">{pendingPreAuths.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">TOTAL CLAIMED</span>
              <Receipt className="h-4 w-4 text-violet-600" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalClaimed)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">TOTAL SETTLED</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalSettled)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Claims */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Claims</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {claimsLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : claims.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              No insurance claims yet. Claims are auto-created when a bill is generated for an insured patient.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Claim No</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Patient</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Company</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-3">Claimed</th>
                    <th className="text-center text-xs font-medium text-muted-foreground p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.slice(0, 10).map((c: any) => (
                    <tr key={c.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-mono text-xs">{c.claimNo}</td>
                      <td className="p-3 text-sm">{c.policy?.patient?.name || '—'}</td>
                      <td className="p-3 text-sm">{c.policy?.company?.name || '—'}</td>
                      <td className="p-3 text-right text-sm font-medium">{formatCurrency(c.claimAmount)}</td>
                      <td className="p-3 text-center">
                        <Badge className={STATUS_COLORS[c.status] || 'bg-slate-100'}>{c.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link href="/dashboard/hospital/insurance/policies">
          <Card className="hover:border-teal-400 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <FileText className="h-8 w-8 text-teal-600" />
              <div>
                <p className="font-medium">Policies</p>
                <p className="text-xs text-muted-foreground">View patient policies</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/hospital/insurance/claims">
          <Card className="hover:border-teal-400 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <Receipt className="h-8 w-8 text-teal-600" />
              <div>
                <p className="font-medium">All Claims</p>
                <p className="text-xs text-muted-foreground">Track claim status</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/hospital/insurance/reports/tpa-outstanding">
          <Card className="hover:border-teal-400 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-teal-600" />
              <div>
                <p className="font-medium">TPA Outstanding</p>
                <p className="text-xs text-muted-foreground">Aging report</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
