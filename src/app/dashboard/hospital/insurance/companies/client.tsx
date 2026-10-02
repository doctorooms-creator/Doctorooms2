'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2, Shield } from 'lucide-react'

export function CompaniesClient() {
  const { data, isLoading } = useQuery({
    queryKey: ['insurance-companies-list'],
    queryFn: async () => {
      const res = await fetch('/api/insurance/companies')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })

  const companies = data?.companies || []

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6 text-teal-600" /> Insurance Companies
        </h1>
        <p className="text-sm text-muted-foreground mt-1">List of empanelled insurance companies and TPAs</p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((c: any) => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{c.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{c.code}</p>
                      </div>
                    </div>
                    {c.cashlessSupported && (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs">Cashless</Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>{c.type} • {c._count?.policies || 0} policies</p>
                    {c.contactNo && <p>📞 {c.contactNo}</p>}
                    {c.email && <p>✉️ {c.email}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* TPAs */}
          <TpaSection />
        </>
      )}
    </div>
  )
}

function TpaSection() {
  const { data } = useQuery({
    queryKey: ['insurance-tpas-list'],
    queryFn: async () => {
      const res = await fetch('/api/insurance/tpas')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })

  const tpas = data?.tpas || []
  if (tpas.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">TPAs (Third Party Administrators)</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tpas.map((t: any) => (
          <Card key={t.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{t.name}</h3>
                  <p className="text-xs text-muted-foreground">{t.company?.name}</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                {t.contactNo && <p>📞 {t.contactNo}</p>}
                {t.preAuthEmail && <p>✉️ {t.preAuthEmail}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
