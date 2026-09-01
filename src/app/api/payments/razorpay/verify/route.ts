import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { resolvePaymentAuth } from '@/lib/payment-auth'
import { emitNotification, roleRoom } from '@/lib/emit-notification'
import { z } from 'zod/v4'

const verifySchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
  transactionId: z.string().min(1),
})

/** Auto-generate receipt number for bill payments */
async function generateReceiptNo(hospitalId: string, prefix: string): Promise<string> {
  const year = new Date().getFullYear()
  const fullPrefix = `${prefix}${year}`
  const last = await db.billPayment.findFirst({
    where: { hospitalId, receiptNo: { startsWith: fullPrefix } },
    orderBy: { receiptNo: 'desc' },
  })
  const lastNum = last ? parseInt(last.receiptNo.split('-').pop() || '0') : 0
  return `${fullPrefix}-${String(lastNum + 1).padStart(6, '0')}`
}

/** Auto-generate receipt number for patient advances */
async function generateAdvanceReceiptNo(hospitalId: string): Promise<string> {
  const year = new Date().getFullYear()
  const fullPrefix = `ADV${year}`
  const last = await db.patientAdvance.findFirst({
    where: { hospitalId, receiptNo: { startsWith: fullPrefix } },
    orderBy: { receiptNo: 'desc' },
  })
  const lastNum = last ? parseInt(last.receiptNo.split('-').pop() || '0') : 0
  return `${fullPrefix}-${String(lastNum + 1).padStart(6, '0')}`
}

// POST /api/payments/razorpay/verify
// Verifies the signature returned by Razorpay after a payment, marks the
// PaymentGatewayTransaction as Captured/Failed, and creates the underlying
// BillPayment / PatientAdvance row.
export async function POST(req: NextRequest) {
  try {
    const auth = await resolvePaymentAuth(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { user } = auth

    const body = await req.json()
    const parsed = verifySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }
    const { orderId, paymentId, signature, transactionId } = parsed.data

    // Fetch the transaction
    const txn = await db.paymentGatewayTransaction.findUnique({
      where: { id: transactionId },
    })
    if (!txn) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }
    if (txn.razorpayOrderId !== orderId) {
      return NextResponse.json({ error: 'Order ID mismatch' }, { status: 400 })
    }

    // Authorization: patient must own the entity; staff must belong to the same hospital
    if (user.role === 'patient') {
      const owns = await patientOwnsTransactionEntity(user.id, txn)
      if (!owns) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } else if (auth.hospitalId !== txn.hospitalId) {
      return NextResponse.json({ error: 'Hospital mismatch' }, { status: 403 })
    }

    // Verify signature
    const valid = verifyRazorpaySignature(orderId, paymentId, signature)
    if (!valid) {
      await db.paymentGatewayTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'Failed',
          errorMessage: 'Signature verification failed',
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
        },
      })
      return NextResponse.json(
        { success: false, error: 'Signature verification failed' },
        { status: 400 }
      )
    }

    // Signature valid → mark Captured + create the underlying payment row
    await db.$transaction(async (tx) => {
      // 1) Update PaymentGatewayTransaction
      await tx.paymentGatewayTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'Captured',
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          gatewayResponse: JSON.stringify({
            orderId,
            paymentId,
            verifiedAt: new Date().toISOString(),
          }),
          errorMessage: '',
        },
      })

      // 2) Create BillPayment / PatientAdvance depending on entity type
      if (txn.billId) {
        // IPD bill payment
        const bill = await tx.ipdBill.findUnique({
          where: { id: txn.billId },
          select: { id: true, admissionId: true, hospitalId: true, status: true, netPayable: true, discountAmount: true },
        })
        if (!bill) throw new Error('Bill not found')

        const receiptNo = await generateReceiptNo(bill.hospitalId, 'REC-')
        await tx.billPayment.create({
          data: {
            receiptNo,
            billId: bill.id,
            admissionId: bill.admissionId,
            hospitalId: bill.hospitalId,
            amount: txn.amount,
            paymentMethod: 'Online',
            paymentRef: paymentId,
            paymentDate: new Date(),
            receivedBy: user.id,
            notes: `Razorpay payment — Order ${orderId}`,
          },
        })

        // Recompute bill totals + status
        const allPayments = await tx.billPayment.findMany({
          where: { billId: bill.id },
          select: { amount: true },
        })
        const totalPaid = allPayments.reduce((s, p) => s + p.amount, 0)
        let newStatus = bill.status
        if (totalPaid >= bill.netPayable + (bill.discountAmount || 0)) {
          newStatus = 'Paid'
        } else if (totalPaid > 0) {
          newStatus = 'PartiallyPaid'
        }
        await tx.ipdBill.update({
          where: { id: bill.id },
          data: { status: newStatus },
        })
        if (newStatus === 'Paid') {
          await tx.ipdAdmission.update({
            where: { id: bill.admissionId },
            data: { paymentStatus: 'Paid' },
          })
        }
      } else if (txn.opdBillId) {
        // OPD bill — mark as Paid with Online method
        const opd = await tx.opdBill.findUnique({
          where: { id: txn.opdBillId },
          select: { id: true, hospitalId: true },
        })
        if (!opd) throw new Error('OPD bill not found')
        await tx.opdBill.update({
          where: { id: opd.id },
          data: {
            paymentMethod: 'Online',
            paymentRef: paymentId,
            paymentDate: new Date(),
            receivedBy: user.id,
            status: 'Paid',
          },
        })
      } else if (txn.advanceId) {
        // PatientAdvance — update the existing advance row with online ref
        const adv = await tx.patientAdvance.findUnique({
          where: { id: txn.advanceId },
          select: { id: true, hospitalId: true },
        })
        if (!adv) throw new Error('Advance not found')
        await tx.patientAdvance.update({
          where: { id: adv.id },
          data: {
            paymentMethod: 'Online',
            paymentRef: paymentId,
          },
        })
      } else if (txn.bookingId) {
        // Consultation fee — find or create an OpdBill for the booking
        const existingOpd = await tx.opdBill.findUnique({
          where: { bookingId: txn.bookingId },
          select: { id: true },
        })
        if (existingOpd) {
          await tx.opdBill.update({
            where: { id: existingOpd.id },
            data: {
              paymentMethod: 'Online',
              paymentRef: paymentId,
              paymentDate: new Date(),
              receivedBy: user.id,
              status: 'Paid',
            },
          })
        } else {
          const booking = await tx.booking.findUnique({
            where: { id: txn.bookingId },
            select: {
              id: true,
              hospitalId: true,
              userId: true,
              appointmentCharge: true,
            },
          })
          if (!booking) throw new Error('Booking not found')
          const opdReceiptNo = `OPD-BILL-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
          await tx.opdBill.create({
            data: {
              receiptNo: opdReceiptNo,
              bookingId: booking.id,
              hospitalId: booking.hospitalId || txn.hospitalId,
              patientId: booking.userId,
              consultationFee: booking.appointmentCharge || txn.amount,
              subtotal: booking.appointmentCharge || txn.amount,
              totalAmount: booking.appointmentCharge || txn.amount,
              paymentMethod: 'Online',
              paymentRef: paymentId,
              paymentDate: new Date(),
              receivedBy: user.id,
              status: 'Paid',
            },
          })
        }
      }
    })

    emitNotification('payment-received', [roleRoom('receptionist'), roleRoom('hospital')], {
      id: paymentId,
      title: 'Online Payment Received',
      message: `Razorpay payment of ₹${txn.amount} received`,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, paymentId })
  } catch (error) {
    console.error('Razorpay verify error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** Verify that the patient owns the entity tied to a PaymentGatewayTransaction. */
async function patientOwnsTransactionEntity(
  patientUserId: string,
  txn: {
    billId: string | null
    opdBillId: string | null
    advanceId: string | null
    bookingId: string | null
  }
): Promise<boolean> {
  if (txn.billId) {
    const bill = await db.ipdBill.findUnique({
      where: { id: txn.billId },
      select: { admission: { select: { userId: true } } },
    })
    return !!bill?.admission && bill.admission.userId === patientUserId
  }
  if (txn.opdBillId) {
    const bill = await db.opdBill.findUnique({
      where: { id: txn.opdBillId },
      select: { patientId: true },
    })
    return !!bill && bill.patientId === patientUserId
  }
  if (txn.advanceId) {
    const adv = await db.patientAdvance.findUnique({
      where: { id: txn.advanceId },
      select: { patientId: true, admission: { select: { userId: true } } },
    })
    if (!adv) return false
    if (adv.patientId && adv.patientId === patientUserId) return true
    if (adv.admission?.userId === patientUserId) return true
    return false
  }
  if (txn.bookingId) {
    const booking = await db.booking.findUnique({
      where: { id: txn.bookingId },
      select: { userId: true },
    })
    return !!booking && booking.userId === patientUserId
  }
  return false
}
