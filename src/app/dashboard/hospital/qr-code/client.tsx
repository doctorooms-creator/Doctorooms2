'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import QRCode from 'qrcode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { QrCode, Download, Printer, Copy, Check, ExternalLink, Building } from 'lucide-react'
import { toast } from 'sonner'

export function QrCodeClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)
  const [baseUrl, setBaseUrl] = useState('')

  // Get hospital info
  // NOTE: /api/hospitals returns { data: [ { id: <userId>, name, profileImg, hospital: { id, hospitalName, address, city, ... } } ], page, limit, total, totalPages }
  // Each row is the hospital's USER record — the actual hospital (with the real
  // hospital id used by /kiosk/[hospitalId]) is nested under `hospital`.
  const { data: hospitalData, isLoading: hospitalLoading } = useQuery({
    queryKey: ['hospital-profile'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me')
      if (!res.ok) return null
      const data = await res.json()
      // Fetch hospital list
      const hospitalRes = await fetch('/api/hospitals')
      if (!hospitalRes.ok) return null
      const hospitals = await hospitalRes.json()
      const list = hospitals?.data || []
      // Match the signed-in hospital user (row.id is the user id), else fall back to the first listed hospital
      const myRow = list.find((h: any) => h.id === data.user?.id) || list[0]
      return myRow?.hospital || null
    },
  })

  // Set base URL from window
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin)
    }
  }, [])

  const hospitalId = hospitalData?.id || ''
  const kioskUrl = hospitalId ? `${baseUrl}/kiosk/${hospitalId}` : ''

  // Generate QR code
  useEffect(() => {
    if (kioskUrl && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, kioskUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#0d9488', // teal-600
          light: '#ffffff',
        },
      }, (err) => {
        if (err) console.error('QR generation error:', err)
      })
    }
  }, [kioskUrl])

  const handleDownload = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `kiosk-qr-${hospitalData?.hospitalName || 'hospital'}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
    toast.success('QR code downloaded')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(kioskUrl)
    setCopied(true)
    toast.success('Link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleOpenKiosk = () => {
    window.open(kioskUrl, '_blank')
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <QrCode className="h-6 w-6 text-teal-600" />
          Kiosk QR Code
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate a QR code for patients to self-check-in at the hospital entrance
        </p>
      </div>

      {hospitalLoading ? (
        <Card>
          <CardContent className="space-y-4 py-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      ) : !hospitalData ? (
        <Card className="border-rose-200 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/20">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40">
              <Building className="h-7 w-7 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="text-lg font-semibold text-rose-700 dark:text-rose-400">No hospital found</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              We couldn&apos;t find an active hospital linked to your account, so there&apos;s no
              kiosk QR code to show yet. Once your hospital profile is created and active, its
              self-check-in QR poster will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
      <div className="grid md:grid-cols-2 gap-6">
        {/* QR Code Display */}
        <Card className="printable-qr">
          <CardHeader>
            <CardTitle className="text-base">QR Code Poster</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {/* Printable area */}
            <div className="bg-white p-8 rounded-xl border-2 border-dashed border-gray-200 text-center">
              <h2 className="text-lg font-bold mb-1">{hospitalData?.hospitalName || 'Hospital'}</h2>
              {(hospitalData?.address || hospitalData?.city) && (
                <p className="text-xs text-muted-foreground mb-3">
                  {[hospitalData?.address, hospitalData?.city].filter(Boolean).join(', ')}
                </p>
              )}
              <p className="text-sm text-muted-foreground mb-4">Scan to self-check-in</p>
              <canvas ref={canvasRef} className="mx-auto mb-4" />
              <p className="text-xs text-muted-foreground">
                Scan with your phone camera<br />
                or visit the kiosk tablet
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 no-print">
              <Button onClick={handleDownload} variant="outline">
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
              <Button onClick={handlePrint} variant="outline">
                <Printer className="h-4 w-4 mr-2" /> Print
              </Button>
              <Button onClick={handleOpenKiosk} variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" /> Test Kiosk
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 font-bold text-xs shrink-0">1</div>
                <p>Print this QR code on a stand and place it at the hospital entrance</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 font-bold text-xs shrink-0">2</div>
                <p>Patient scans the QR with their phone (or uses the kiosk tablet)</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 font-bold text-xs shrink-0">3</div>
                <p>Patient fills: name, mobile, age, complaint → selects department → selects doctor</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 font-bold text-xs shrink-0">4</div>
                <p>Request appears in your receptionist's pending list</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 font-bold text-xs shrink-0">5</div>
                <p>Receptionist approves → patient gets token instantly on their screen</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kiosk URL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input value={kioskUrl} readOnly className="font-mono text-xs" />
              <Button onClick={handleCopy} className="w-full" variant="outline">
                {copied ? <><Check className="h-4 w-4 mr-2" /> Copied!</> : <><Copy className="h-4 w-4 mr-2" /> Copy URL</>}
              </Button>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  No login required
                </Badge>
                <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                  Works on any phone
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Print styles */}
          <style jsx>{`
            @media print {
              .no-print { display: none !important; }
              body { margin: 0; }
              .printable-qr {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                border: none;
                box-shadow: none;
              }
            }
          `}</style>
        </div>
      </div>
      )}
    </div>
  )
}
