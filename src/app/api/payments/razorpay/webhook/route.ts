import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay'

/**
 * POST /api/payments/razorpay/webhook
 *
 * Public endpoint (no auth — Razorpay server calls this).
 * Verifies the webhook signature using RAZORPAY_WEBHOOK_SECRET, then updates
 * the corresponding PaymentGatewayTransaction based on the event payload.
 *
 * Razorpay requires a 200 response; we always return 200 even on errors to
 * avoid retries, but log issues for debugging.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature') || ''

    // If webhook secret is not configured, accept but log a warning
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!secret) {
      console.warn('Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not set')
      return NextResponse.json({ success: true, warning: 'Webhook secret not configured' })
    }

    const valid = verifyRazorpayWebhookSignature(rawBody, signature)
    if (!valid) {
      console.warn('Razorpay webhook signature verification failed')
      // Razorpay still expects 200 to stop retries — but we return 400 to flag the issue
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 })
    }

    let payload: RazorpayWebhookPayload
    try {
      payload = JSON.parse(rawBody) as RazorpayWebhookPayload
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
    }

    const event = payload.event
    const paymentEntity = payload.payload?.payment?.entity
    const orderEntity = payload.payload?.payment?.entity?.order_id
      ? payload.payload.payment.entity
      : undefined

    // Resolve the transaction by razorpayOrderId or razorpayPaymentId
    const razorpayOrderId =
      paymentEntity?.order_id || payload.payload?.order?.entity?.id || ''
    const razorpayPaymentId = paymentEntity?.id || ''

    let txn = null
    if (razorpayOrderId) {
      txn = await db.paymentGatewayTransaction.findUnique({
        where: { razorpayOrderId },
      })
    }
    if (!txn && razorpayPaymentId) {
      txn = await db.paymentGatewayTransaction.findFirst({
        where: { razorpayPaymentId },
      })
    }

    if (!txn) {
      // No matching local transaction — still 200 so Razorpay doesn't retry
      return NextResponse.json({ success: true, note: 'No matching transaction' })
    }

    // Map Razorpay event → local status
    let newStatus = txn.status
    let errorMessage = ''
    switch (event) {
      case 'payment.captured':
      case 'payment.authorized':
        newStatus = 'Captured'
        break
      case 'payment.failed':
        newStatus = 'Failed'
        errorMessage = paymentEntity?.error_description || 'Payment failed'
        break
      case 'payment.refunded':
        newStatus = 'Refunded'
        break
      case 'order.paid':
        newStatus = 'Captured'
        break
      default:
        // Unknown event — leave status alone but record the gateway response
        break
    }

    await db.paymentGatewayTransaction.update({
      where: { id: txn.id },
      data: {
        status: newStatus,
        errorMessage,
        ...(razorpayPaymentId && !txn.razorpayPaymentId
          ? { razorpayPaymentId }
          : {}),
        gatewayResponse: JSON.stringify(payload).slice(0, 65000),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Razorpay webhook error:', error)
    // Still return 200 to prevent Razorpay retries
    return NextResponse.json({ success: true, error: 'Internal error' })
  }
}

interface RazorpayWebhookPayload {
  entity?: string
  account_id?: string
  event: string
  contains?: string[]
  payload?: {
    payment?: {
      entity?: {
        id?: string
        order_id?: string
        amount?: number
        currency?: string
        status?: string
        method?: string
        error_description?: string
      }
    }
    order?: {
      entity?: {
        id?: string
        amount?: number
        status?: string
      }
    }
  }
  created_at?: number
}
