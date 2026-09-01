import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createRazorpayOrder } from '@/lib/razorpay'
import {
  resolvePaymentAuth,
  resolveHospitalForEntity,
  verifyPatientOwnsEntity,
} from '@/lib/payment-auth'
import { z } from 'zod/v4'

const createOrderSchema = z.object({
  type: z.enum(['ipd-bill', 'opd-bill', 'advance', 'consultation']),
  entityId: z.string().min(1),
  amount: z.number().positive('Amount must be positive').max(99999999, 'Amount too large'),
})

// POST /api/payments/razorpay/create-order
// Creates a PaymentGatewayTransaction (status=Created) + a Razorpay order.
// Returns { orderId, amount, currency, keyId, transactionId }
export async function POST(req: NextRequest) {
  try {
    const auth = await resolvePaymentAuth(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { user } = auth

    const body = await req.json()
    const parsed = createOrderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }
    const { type, entityId, amount } = parsed.data

    // Resolve the hospital the entity belongs to
    const entityInfo = await resolveHospitalForEntity(type, entityId)
    if (!entityInfo) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 })
    }
    const hospitalId = entityInfo.hospitalId

    // Authorization:
    // - patient: must own the entity
    // - receptionist/hospital/admin: must belong to the same hospital
    if (user.role === 'patient') {
      const owns = await verifyPatientOwnsEntity(user.id, type, entityId)
      if (!owns) {
        return NextResponse.json({ error: 'You do not have access to this bill' }, { status: 403 })
      }
    } else if (auth.hospitalId !== hospitalId) {
      return NextResponse.json({ error: 'Hospital mismatch' }, { status: 403 })
    }

    // Build PaymentGatewayTransaction row data based on type
    const txData: Record<string, string | undefined> = {
      billId: undefined,
      opdBillId: undefined,
      advanceId: undefined,
      bookingId: undefined,
    }
    if (type === 'ipd-bill') txData.billId = entityId
    if (type === 'opd-bill') txData.opdBillId = entityId
    if (type === 'advance') txData.advanceId = entityId
    if (type === 'consultation') txData.bookingId = entityId

    // Create PaymentGatewayTransaction with status='Created'
    const txn = await db.paymentGatewayTransaction.create({
      data: {
        hospitalId,
        billId: txData.billId,
        opdBillId: txData.opdBillId,
        advanceId: txData.advanceId,
        bookingId: txData.bookingId,
        amount,
        currency: 'INR',
        status: 'Created',
        gatewayResponse: '{}',
        errorMessage: '',
        createdBy: user.id,
      },
    })

    // Build receipt & notes
    const receipt = `rcpt_${txn.id.slice(-12)}`
    const notes: Record<string, string> = {
      type,
      entityId,
      transactionId: txn.id,
      hospitalId,
      createdBy: user.id,
    }

    // Create Razorpay order
    let order
    try {
      order = await createRazorpayOrder(amount, receipt, notes)
    } catch (err) {
      // Mark transaction as Failed
      await db.paymentGatewayTransaction.update({
        where: { id: txn.id },
        data: {
          status: 'Failed',
          errorMessage: err instanceof Error ? err.message : 'Razorpay order creation failed',
          gatewayResponse: JSON.stringify(err),
        },
      })
      return NextResponse.json(
        { error: 'Failed to create Razorpay order' },
        { status: 502 }
      )
    }

    const orderId = (order as { id: string }).id

    // Persist razorpayOrderId + raw gateway response
    await db.paymentGatewayTransaction.update({
      where: { id: txn.id },
      data: {
        razorpayOrderId: orderId,
        gatewayResponse: JSON.stringify(order),
      },
    })

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    if (!keyId) {
      return NextResponse.json(
        { error: 'Razorpay public key not configured' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      orderId,
      amount,
      currency: 'INR',
      keyId,
      transactionId: txn.id,
    })
  } catch (error) {
    console.error('Razorpay create-order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
