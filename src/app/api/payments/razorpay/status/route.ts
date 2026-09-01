import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/payments/razorpay/status
 *
 * Returns the Razorpay gateway configuration status (configured / not
 * configured) based on env vars + the 10 most recent PaymentGatewayTransactions
 * for the hospital. Available to hospital + admin + receptionist roles.
 */
export async function GET(req: NextRequest) {
  try {
    let user = await requireRole(req, 'hospital')
    if (!user) user = await requireRole(req, 'admin')
    if (!user) user = await requireRole(req, 'receptionist')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let hospitalId: string | null = null
    if (user.role === 'hospital' || user.role === 'admin') {
      const hospital = await db.hospital.findUnique({ where: { userId: user.id } })
      if (!hospital) {
        return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })
      }
      hospitalId = hospital.id
    } else {
      const receptionist = await db.receptionist.findUnique({ where: { userId: user.id } })
      if (!receptionist) {
        return NextResponse.json({ error: 'Receptionist not found' }, { status: 404 })
      }
      hospitalId = receptionist.hospitalId
    }

    const keyIdConfigured = !!process.env.RAZORPAY_KEY_ID
    const keySecretConfigured = !!process.env.RAZORPAY_KEY_SECRET
    const publicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''
    const webhookSecretConfigured = !!process.env.RAZORPAY_WEBHOOK_SECRET

    // Test mode if the key starts with rzp_test_
    const isTestMode = publicKeyId.startsWith('rzp_test_')

    // Last 10 PaymentGatewayTransactions for this hospital
    const recentTransactions = await db.paymentGatewayTransaction.findMany({
      where: { hospitalId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        billId: true,
        opdBillId: true,
        advanceId: true,
        bookingId: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        amount: true,
        currency: true,
        status: true,
        errorMessage: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      configured: keyIdConfigured && keySecretConfigured,
      keyIdConfigured,
      keySecretConfigured,
      webhookSecretConfigured,
      publicKeyId,
      isTestMode,
      recentTransactions,
    })
  } catch (error) {
    console.error('Razorpay status GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
