import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/patient/bills
 *
 * Returns the logged-in patient's IPD bills (with payments + advances) and
 * OPD bills. Used by the patient-facing Bills page.
 *
 * Response:
 *   { ipdBills: [...], opdBills: [...], gatewayTransactions: [...] }
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1) IPD bills — via IpdAdmission.userId
    const admissions = await db.ipdAdmission.findMany({
      where: { userId: user.id },
      select: { id: true },
    })
    const admissionIds = admissions.map((a) => a.id)

    const ipdBills = admissionIds.length
      ? await db.ipdBill.findMany({
          where: { admissionId: { in: admissionIds } },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            billNo: true,
            status: true,
            totalAmount: true,
            advanceAdjusted: true,
            discountAmount: true,
            netPayable: true,
            generatedAt: true,
            finalizedAt: true,
            createdAt: true,
            admission: {
              select: {
                admissionNo: true,
                patientName: true,
                hospital: { select: { hospitalName: true } },
                ward: { select: { name: true } },
              },
            },
            payments: {
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                receiptNo: true,
                amount: true,
                paymentMethod: true,
                paymentDate: true,
              },
            },
          },
        })
      : []

    // Compute paid totals
    const ipdBillsWithPaid = ipdBills.map((b) => {
      const paid = b.payments.reduce((s, p) => s + p.amount, 0)
      return {
        id: b.id,
        billNo: b.billNo,
        status: b.status,
        totalAmount: b.totalAmount,
        netPayable: b.netPayable,
        advanceAdjusted: b.advanceAdjusted,
        discountAmount: b.discountAmount,
        paidAmount: paid,
        balance: Math.max(0, b.netPayable - paid),
        generatedAt: b.generatedAt,
        finalizedAt: b.finalizedAt,
        createdAt: b.createdAt,
        admissionNo: b.admission.admissionNo,
        patientName: b.admission.patientName,
        hospitalName: b.admission.hospital?.hospitalName || '',
        wardName: b.admission.ward?.name || '',
        payments: b.payments.map((p) => ({
          id: p.id,
          receiptNo: p.receiptNo,
          amount: p.amount,
          paymentMethod: p.paymentMethod,
          paymentDate: p.paymentDate,
        })),
      }
    })

    // 2) OPD bills — via OpdBill.patientId
    const opdBills = await db.opdBill.findMany({
      where: { patientId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        receiptNo: true,
        totalAmount: true,
        paymentMethod: true,
        paymentDate: true,
        status: true,
        createdAt: true,
        hospital: { select: { hospitalName: true } },
        booking: {
          select: {
            patientName: true,
            doctor: {
              select: { user: { select: { name: true } } },
            },
          },
        },
      },
    })

    const opdBillsMapped = opdBills.map((b) => ({
      id: b.id,
      receiptNo: b.receiptNo,
      totalAmount: b.totalAmount,
      paymentMethod: b.paymentMethod,
      paymentDate: b.paymentDate,
      status: b.status,
      createdAt: b.createdAt,
      patientName: b.booking.patientName,
      doctorName: b.booking.doctor?.user?.name || '',
      hospitalName: b.hospital?.hospitalName || '',
    }))

    // 3) Recent PaymentGatewayTransactions for this patient (via createdBy)
    const gatewayTransactions = await db.paymentGatewayTransaction.findMany({
      where: { createdBy: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        amount: true,
        currency: true,
        status: true,
        errorMessage: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      ipdBills: ipdBillsWithPaid,
      opdBills: opdBillsMapped,
      gatewayTransactions,
    })
  } catch (error) {
    console.error('Patient bills GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
