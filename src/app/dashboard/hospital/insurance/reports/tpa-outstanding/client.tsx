'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/print-utils'

export function TpaOutstandingClient() {
  const { data, isLoading } = useQuery({
    queryKey: ['tpa-outstanding-report'],
    queryFn: async () => {
      const res = await fetch('/api/reports/insurance/tpa-outstanding')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })

  const tpas = data?.tpas || []
  const grandTotal = data?.grandTotal || 0
  const totalCount = data?.totalCount || 0

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-teal-600" /> TPA Outstanding Report
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Insurance claims outstanding by TPA with aging analysis</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><span className="text-xs font-medium text-muted-foreground">TOTAL OUTSTANDING</span><p className="text-2xl font-bold">{formatCurrency(grandTotal)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><span className="text-xs font-medium text-muted-foreground">TOTAL CLAIMS</span><p className="text-2xl font-bold">{totalCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><span className="text-xs font-medium text-muted-foreground">ACTIVE TPAS</span><p className="text-2xl font-bold">{tpas.length}</p></CardContent></Card>
      </div>

      {/* TPA-wise table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Outstanding by TPA</CardTitle></CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
          ) : tpas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              No outstanding claims. All claims are settled or rejected.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">TPA</th>
                    <th className="text-center text-xs font-medium text-muted-foreground p-3">Claims</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-3">Total</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-3">0-30 days</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-3">31-60 days</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-3">61-90 days</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-3">90+ days</th>
                  </tr>
                </thead>
                <tbody>
                  {tpas.map((t: any) => (
                    <tr key={t.tpaId} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium text-sm">{t.tpaName}</td>
                      <td className="p-3 text-center text-sm">{t.count}</td>
                      <td className="p-3 text-right text-sm font-bold">{formatCurrency(t.total)}</td>
                      <td className="p-3 text-right text-sm text-emerald-600">{t.aging['0-30'] > 0 ? formatCurrency(t.aging['0-30']) : '—'}</td>
                      <td className="p-3 text-right text-sm text-teal-600">{t.aging['31-60'] > 0 ? formatCurrency(t.aging['31-60']) : '—'}</td>
                      <td className="p-3 text-right text-sm text-amber-600">{t.aging['61-90'] > 0 ? formatCurrency(t.aging['61-90']) : '—'}</td>
                      <td className="p-3 text-right text-sm text-red-600 font-medium">{t.aging['90+'] > 0 ? formatCurrency(t.aging['90+']) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 bg-muted/50">
                  <tr>
                    <td className="p-3 font-bold">TOTAL</td>
                    <td className="p-3 text-center font-bold">{totalCount}</td>
                    <td className="p-3 text-right font-bold">{formatCurrency(grandTotal)}</td>
                    <td className="p-3 text-right font-bold text-emerald-600">{formatCurrency(tpas.reduce((s: number, t: any) => s + t.aging['0-30'], 0))}</td>
                    <td className="p-3 text-right font-bold text-teal-600">{formatCurrency(tpas.reduce((s: number, t: any) => s + t.aging['31-60'], 0))}</td>
                    <td className="p-3 text-right font-bold text-amber-600">{formatCurrency(tpas.reduce((s: number, t: any) => s + t.aging['61-90'], 0))}</td>
                    <td className="p-3 text-right font-bold text-red-600">{formatCurrency(tpas.reduce((s: number, t: any) => s + t.aging['90+'], 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual claims per TPA */}
      {!isLoading && tpas.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Claim Details</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">TPA</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Claim No</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Patient</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-3">Amount</th>
                    <th className="text-center text-xs font-medium text-muted-foreground p-3">Days</th>
                    <th className="text-center text-xs font-medium text-muted-foreground p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tpas.flatMap((t: any) => t.claims.map((c: any) => (
                    <tr key={c.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-xs">{t.tpaName}</td>
                      <td className="p-3 font-mono text-xs">{c.claimNo}</td>
                      <td className="p-3 text-sm">{c.patientName}</td>
                      <td className="p-3 text-right text-sm font-medium">{formatCurrency(c.claimAmount)}</td>
                      <td className="p-3 text-center">
                        <span className={c.daysOutstanding > 90 ? 'text-red-600 font-bold' : c.daysOutstanding > 60 ? 'text-amber-600' : 'text-emerald-600'}>
                          {c.daysOutstanding}d
                        </span>
                      </td>
                      <td className="p-3 text-center text-xs">{c.status}</td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
