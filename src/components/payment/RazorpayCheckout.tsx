'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2 } from 'lucide-react'

export type RazorpayEntityType = 'ipd-bill' | 'opd-bill' | 'advance' | 'consultation'

interface RazorpayCheckoutProps {
  type: RazorpayEntityType
  entityId: string
  amount: number
  description?: string
  /** Optional label for the trigger button (default: "Pay Now") */
  label?: string
  /** Optional class names for the trigger button */
  className?: string
  /** Optional size variant for the trigger button */
  size?: 'default' | 'sm' | 'lg' | 'icon'
  /** Optional variant for the trigger button */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
  /** Called when the payment is successfully captured. */
  onSuccess?: (paymentId: string) => void
  /** Called when the payment fails, modal is dismissed, or an error occurs. */
  onError?: (message: string) => void
  /** Disabled state for the trigger button */
  disabled?: boolean
}

// Augment the Window interface so TS knows about the Razorpay global
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void; on: (event: string, handler: (response: unknown) => void) => void }
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  order_id: string
  name: string
  description?: string
  image?: string
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void
  modal?: {
    ondismiss?: () => void
    escape?: boolean
    backdropclose?: boolean
  }
  theme?: { color?: string; background?: string; hide_topbar?: boolean }
  prefill?: { name?: string; email?: string; contact?: string }
  notes?: Record<string, string>
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

/** Loads the Razorpay checkout.js script once. Resolves when ready. */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false)
    if (window.Razorpay) return resolve(true)

    const existing = document.getElementById('razorpay-checkout-script') as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve(!!window.Razorpay))
      existing.addEventListener('error', () => resolve(false))
      return
    }

    const script = document.createElement('script')
    script.id = 'razorpay-checkout-script'
    script.src = RAZORPAY_SCRIPT_URL
    script.async = true
    script.onload = () => resolve(!!window.Razorpay)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function RazorpayCheckout({
  type,
  entityId,
  amount,
  description = 'Hospital Bill Payment',
  label = 'Pay Now',
  className,
  size = 'default',
  variant = 'default',
  onSuccess,
  onError,
  disabled,
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = useCallback(async () => {
    if (loading || disabled) return

    if (!amount || amount <= 0) {
      onError?.('Invalid amount')
      return
    }

    setLoading(true)

    try {
      // 1) Ensure Razorpay script is loaded
      const scriptReady = await loadRazorpayScript()
      if (!scriptReady || !window.Razorpay) {
        onError?.('Failed to load Razorpay checkout. Please check your internet connection.')
        setLoading(false)
        return
      }

      // 2) Create order on the server
      const createRes = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, entityId, amount }),
      })
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}))
        const msg = err?.error || 'Failed to create payment order'
        onError?.(msg)
        setLoading(false)
        return
      }
      const data = (await createRes.json()) as {
        orderId: string
        amount: number
        currency: string
        keyId: string
        transactionId: string
      }

      // 3) Open Razorpay modal
      const options: RazorpayOptions = {
        key: data.keyId,
        amount: Math.round(data.amount * 100), // paise
        currency: data.currency || 'INR',
        order_id: data.orderId,
        name: 'Doctorooms',
        description,
        handler: async (response) => {
          // 4) Verify the payment signature on the server
          try {
            const verifyRes = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                transactionId: data.transactionId,
              }),
            })
            if (!verifyRes.ok) {
              const errBody = await verifyRes.json().catch(() => ({}))
              onError?.(errBody?.error || 'Payment verification failed')
              return
            }
            onSuccess?.(response.razorpay_payment_id)
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Verification request failed'
            onError?.(msg)
          }
        },
        modal: {
          ondismiss: () => {
            onError?.('Payment cancelled')
            setLoading(false)
          },
          escape: true,
          backdropclose: false,
        },
        theme: { color: '#0d9488' }, // teal
        notes: { type, entityId, transactionId: data.transactionId },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response: unknown) => {
        const r = response as { error?: { description?: string } }
        const msg = r?.error?.description || 'Payment failed'
        onError?.(msg)
        setLoading(false)
      })
      rzp.open()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unexpected error'
      onError?.(msg)
    } finally {
      setLoading(false)
    }
  }, [loading, disabled, amount, type, entityId, description, onSuccess, onError])

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={className}
      onClick={handleClick}
      disabled={loading || disabled}
      aria-label={`Pay ₹${amount.toLocaleString('en-IN')} online`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <CreditCard className="h-4 w-4 mr-2" />
      )}
      {label}
      {amount > 0 && !loading && (
        <span className="ml-1.5 font-semibold">₹{amount.toLocaleString('en-IN')}</span>
      )}
    </Button>
  )
}
