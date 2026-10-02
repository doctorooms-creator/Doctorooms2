'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Settings as SettingsIcon,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  KeyRound,
  Webhook,
  IndianRupee,
} from 'lucide-react'

// ============ Types ============

interface GatewayTransaction {
  id: string
  billId: string | null
  opdBillId: string | null
  advanceId: string | null
  bookingId: string | null
  razorpayOrderId: string | null
  razorpayPaymentId: string | null
  amount: number
  currency: string
  status: string
  errorMessage: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface StatusResponse {
  configured: boolean
  keyIdConfigured: boolean
  keySecretConfigured: boolean
  webhookSecretConfigured: boolean
  publicKeyId: string
  isTestMode: boolean
  recentTransactions: GatewayTransaction[]
}

// ============ Helpers ============

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'Captured':
      return (
        <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Captured
        </Badge>
      )
    case 'Created':
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/30">
          <Loader2 className="h-3 w-3 mr-1" /> Pending
        </Badge>
      )
    case 'Failed':
      return (
        <Badge variant="outline" className="border-rose-500 text-rose-700 bg-rose-50 dark:bg-rose-950/30">
          <XCircle className="h-3 w-3 mr-1" /> Failed
        </Badge>
      )
    case 'Refunded':
      return (
        <Badge variant="outline" className="border-violet-500 text-violet-700 bg-violet-50 dark:bg-violet-950/30">
          Refunded
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getEntityType(t: GatewayTransaction): string {
  if (t.billId) return 'IPD Bill'
  if (t.opdBillId) return 'OPD Bill'
  if (t.advanceId) return 'Advance'
  if (t.bookingId) return 'Consultation'
  return '—'
}

// ============ Component ============

export default function PaymentsSettingsClient() {
  const queryClient = useQueryClient()

  const { data, isLoading, refetch, isFetching } = useQuery<StatusResponse>({
    queryKey: ['razorpay-status'],
    queryFn: async () => {
      const res = await fetch('/api/payments/razorpay/status')
      if (!res.ok) throw new Error('Failed to load payment settings')
      return res.json()
    },
  })

  const handleRefresh = () => {
    refetch()
    toast.success('Status refreshed')
  }

  const handleCopyWebhookUrl = () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/payments/razorpay/webhook`
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url)
      toast.success('Webhook URL copied', { description: url })
    }
  }

  const maskedKeyId = data?.publicKeyId
    ? data.publicKeyId.slice(0, 8) + '••••••••' + data.publicKeyId.slice(-4)
    : 'Not configured'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
            <SettingsIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Payment Gateway</h1>
            <p className="text-sm text-muted-foreground">Razorpay configuration &amp; recent transactions</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Configuration Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className={data?.configured ? 'border-emerald-200 dark:border-emerald-800' : 'border-amber-200 dark:border-amber-800'}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-teal-600" />
              Gateway Status
            </CardTitle>
            <CardDescription>
              Current configuration status of the Razorpay integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-2">
                    {data?.configured ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">Overall Status</p>
                      <p className="text-xs text-muted-foreground">
                        {data?.configured ? 'Razorpay is configured and ready' : 'Razorpay is not fully configured'}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      data?.configured
                        ? 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30'
                        : 'border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/30'
                    }
                  >
                    {data?.configured ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Mode</p>
                      <p className="text-xs text-muted-foreground">
                        {data?.isTestMode ? 'Test mode (no real charges)' : 'Live mode (real charges)'}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      data?.isTestMode
                        ? 'border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/30'
                        : 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30'
                    }
                  >
                    {data?.isTestMode ? 'TEST' : 'LIVE'}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <KeyRound className="h-5 w-5 text-teal-600" />
              Credentials
            </CardTitle>
            <CardDescription>
              Keys are read from environment variables on the server
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="key-id" className="text-xs text-muted-foreground">
                    Key ID (Public)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="key-id"
                      value={maskedKeyId}
                      readOnly
                      className="font-mono text-sm"
                    />
                    {data?.keyIdConfigured ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="key-secret" className="text-xs text-muted-foreground">
                    Key Secret
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="key-secret"
                      value={data?.keySecretConfigured ? '••••••••••••••••' : 'Not configured'}
                      readOnly
                      className="font-mono text-sm"
                    />
                    {data?.keySecretConfigured ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="webhook-secret" className="text-xs text-muted-foreground">
                    Webhook Secret
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="webhook-secret"
                      value={data?.webhookSecretConfigured ? '••••••••••••••••' : 'Not configured'}
                      readOnly
                      className="font-mono text-sm"
                    />
                    {data?.webhookSecretConfigured ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    )}
                  </div>
                  {!data?.webhookSecretConfigured && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Optional — recommended for verifying Razorpay webhook events
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Webhook Setup */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Webhook className="h-5 w-5 text-teal-600" />
            Webhook Configuration
          </CardTitle>
          <CardDescription>
            Configure this URL in your Razorpay dashboard to receive payment events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Webhook Endpoint URL</Label>
            <div className="flex items-center gap-2">
              <Input
                value={
                  typeof window !== 'undefined'
                    ? `${window.location.origin}/api/payments/razorpay/webhook`
                    : '/api/payments/razorpay/webhook'
                }
                readOnly
                className="font-mono text-xs sm:text-sm"
              />
              <Button variant="outline" size="sm" onClick={handleCopyWebhookUrl}>
                Copy
              </Button>
            </div>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-xs space-y-1.5">
            <p className="font-medium">Setup steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Log in to your Razorpay dashboard → Settings → Webhooks</li>
              <li>Add a new webhook with the URL above</li>
              <li>Select events: <code>payment.captured</code>, <code>payment.failed</code>, <code>order.paid</code></li>
              <li>Set <code>RAZORPAY_WEBHOOK_SECRET</code> in your server env to the secret shown</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-teal-600" />
            Recent Gateway Transactions
          </CardTitle>
          <CardDescription>Last 10 Razorpay transactions for your hospital</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data?.recentTransactions || data.recentTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No gateway transactions yet</p>
            </div>
          ) : (
            <div className="max-h-[36rem] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentTransactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm">{getEntityType(t)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {t.razorpayOrderId || '—'}
                        {t.razorpayPaymentId && (
                          <span className="block text-muted-foreground text-[10px]">
                            {t.razorpayPaymentId}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(t.amount)}</TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          {getStatusBadge(t.status)}
                          {t.errorMessage && (
                            <p className="text-[10px] text-rose-600 dark:text-rose-400 max-w-[200px] truncate">
                              {t.errorMessage}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(t.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Banner */}
      <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
        <div className="flex gap-3">
          <ShieldCheck className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-medium text-teal-900 dark:text-teal-100">
              Secure Payment Processing
            </p>
            <p className="text-teal-700 dark:text-teal-300 text-xs">
              Razorpay handles all card/UPI data directly — no sensitive payment information ever
              touches the Doctorooms server. Signatures are verified using HMAC-SHA256 to ensure
              payment integrity.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
