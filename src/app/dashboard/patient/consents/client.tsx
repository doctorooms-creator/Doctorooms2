'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FileSignature, CheckCircle2, Clock, XCircle } from 'lucide-react'

export function PatientConsentsClient() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-consents'],
    queryFn: async () => {
      const res = await fetch('/api/patient-consent')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileSignature className="h-6 w-6 text-teal-600" />
          My Consents
        </h1>
        <p className="text-sm text-muted-foreground mt-1">View your signed consent forms</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : data?.consents?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileSignature className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No consent forms on record.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.consents?.map((c: any) => {
            const isActive = c.signedByPatient && c.validUntil && new Date(c.validUntil) > new Date()
            return (
              <Card key={c.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base capitalize">{c.consentType} Consent</CardTitle>
                    {isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                      </Badge>
                    ) : c.signedByPatient ? (
                      <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                        <XCircle className="h-3 w-3 mr-1" /> Expired
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <Clock className="h-3 w-3 mr-1" /> Pending
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {c.templateName && <p className="text-muted-foreground">{c.templateName}</p>}
                  {c.signedByPatient && c.signedAt && (
                    <p className="text-xs text-muted-foreground">
                      Signed on: {new Date(c.signedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                  {c.witnessName && (
                    <p className="text-xs text-muted-foreground">
                      Witness: {c.witnessName} ({c.witnessRelation})
                    </p>
                  )}
                  {c.validUntil && (
                    <p className="text-xs text-muted-foreground">
                      Valid until: {new Date(c.validUntil).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
