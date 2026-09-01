import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { emitToUserWithNotify } from '@/lib/emit-notification'
import { logCreate } from '@/lib/audit-log'

/**
 * POST /api/commission/pay
 *   Admin: mark a LabBilling (by id) as Paid.
 *   Body: { billingId: string, transactionRef: string, notes?: string }
 *
 *   Or alternative: { doctorId, labPartnerId, period, transactionRef, notes }
 *     -> will bulk-mark all matching Pending billings as Paid (and create CommissionPayment).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'admin')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const transactionRef = body.transactionRef || ''
    const notes = body.notes || ''

    let updatedCount = 0
    let updatedBillings: { id: string }[] = []

    if (body.billingId) {
      // Single billing pay
      const b = await db.labBilling.findUnique({ where: { id: body.billingId } })
      if (!b) return NextResponse.json({ error: 'Billing not found' }, { status: 404 })
      if (b.paymentStatus === 'Paid') {
        return NextResponse.json({ error: 'Already paid' }, { status: 400 })
      }
      await db.labBilling.update({
        where: { id: body.billingId },
        data: {
          paymentStatus: 'Paid',
          paidAt: new Date(),
          transactionRef,
          notes: notes ? `${b.notes} | ${notes}` : b.notes,
        },
      })
      updatedCount = 1
      updatedBillings = [{ id: body.billingId }]

      // Notify the doctor that a commission payout was made.
      try {
        const doctor = await db.doctor.findUnique({
          where: { id: b.doctorId },
          include: { user: { select: { id: true, name: true } } },
        })
        if (doctor?.user) {
          const labPartner = await db.labPartner.findUnique({
            where: { id: b.labPartnerId },
            select: { labName: true },
          })
          await emitToUserWithNotify(doctor.user.id, 'commission-paid', {
            amount: b.commissionAmount,
            period: '',
            transactionRef,
            labName: labPartner?.labName,
            message: '',
          }, {
            // Doctor gets an SMS — payouts are financial events they want to know about.
            smsChannel: true,
          })
          // Audit log: single commission payout (critical — financial event)
          try {
            await logCreate(
              'commission_payment',
              b.id,
              user,
              `Paid ₹${b.commissionAmount} commission to Dr. ${doctor.user.name} — ref: ${transactionRef}`,
              {
                amount: b.commissionAmount,
                doctorId: b.doctorId,
                labPartnerId: b.labPartnerId,
                transactionRef,
              },
              { severity: 'critical' }
            )
          } catch (auditErr) {
            console.error('[audit-log] commission/pay single capture failed:', auditErr)
          }
        }
      } catch (e) {
        console.error('emit failed:', e)
      }
    } else if (body.doctorId && body.labPartnerId && body.period) {
      // Bulk payout by doctor × lab × period
      const [y, m] = body.period.split('-').map(Number)
      const start = new Date(y, m - 1, 1)
      const end = new Date(y, m, 1)
      const pending = await db.labBilling.findMany({
        where: {
          doctorId: body.doctorId,
          labPartnerId: body.labPartnerId,
          paymentStatus: 'Pending',
          AND: [{ billedAt: { gte: start } }, { billedAt: { lt: end } }],
        },
      })
      const totalAmount = pending.reduce((s, b) => s + b.commissionAmount, 0)
      for (const b of pending) {
        await db.labBilling.update({
          where: { id: b.id },
          data: { paymentStatus: 'Paid', paidAt: new Date(), transactionRef, notes: notes || b.notes },
        })
      }
      // Create CommissionPayment record
      const commissionPayment = await db.commissionPayment.create({
        data: {
          doctorId: body.doctorId,
          labPartnerId: body.labPartnerId,
          amount: totalAmount,
          period: body.period,
          status: 'Paid',
          paidAt: new Date(),
          transactionRef,
          notes: notes || `Bulk payout for ${body.period}`,
        },
      })
      updatedCount = pending.length
      updatedBillings = pending.map((b) => ({ id: b.id }))

      // Notify the doctor that a bulk commission payout was made.
      try {
        const doctor = await db.doctor.findUnique({
          where: { id: body.doctorId },
          include: { user: { select: { id: true, name: true } } },
        })
        if (doctor?.user) {
          const labPartner = await db.labPartner.findUnique({
            where: { id: body.labPartnerId },
            select: { labName: true },
          })
          await emitToUserWithNotify(doctor.user.id, 'commission-paid', {
            amount: totalAmount,
            period: body.period,
            transactionRef,
            labName: labPartner?.labName,
            message: '',
          }, {
            // Doctor gets an SMS — bulk payouts are significant financial events.
            smsChannel: true,
          })
          // Audit log: bulk commission payout (critical — financial event)
          try {
            await logCreate(
              'commission_payment',
              commissionPayment.id,
              user,
              `Bulk commission payout: ₹${totalAmount} for ${body.period} (Dr. ${doctor.user.name} × ${labPartner?.labName}) — ref: ${transactionRef}`,
              {
                amount: totalAmount,
                doctorId: body.doctorId,
                labPartnerId: body.labPartnerId,
                period: body.period,
                transactionRef,
                billingCount: pending.length,
              },
              { severity: 'critical' }
            )
          } catch (auditErr) {
            console.error('[audit-log] commission/pay bulk capture failed:', auditErr)
          }
        }
      } catch (e) {
        console.error('emit failed:', e)
      }
    } else {
      return NextResponse.json(
        { error: 'Provide either { billingId } or { doctorId, labPartnerId, period }' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, updatedCount, updatedBillings })
  } catch (error) {
    console.error('commission/pay POST error:', error)
    return NextResponse.json({ error: 'Failed to process payout' }, { status: 500 })
  }
}
