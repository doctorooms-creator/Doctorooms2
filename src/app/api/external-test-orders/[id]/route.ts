import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * GET /api/external-test-orders/[id]
 *   Doctor, Lab Technician (own only), Patient (own only): get order detail
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    let user = await requireRole(req, 'doctor')
    if (!user) user = await requireRole(req, 'lab_technician')
    if (!user) user = await requireRole(req, 'patient')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const order = await db.externalTestOrder.findUnique({
      where: { id },
      include: {
        labPartner: true,
        doctor: { include: { user: { select: { id: true, name: true, mobileNo: true } } } },
        patient: { select: { id: true, name: true, gender: true, mobileNo: true, email: true } },
        booking: { select: { id: true, appointmentNo: true, patientName: true, timeSlot: true } },
        // SECURITY (P3.1 + P3.2): Don't expose raw fileUrl to the client.
        // Use the proxy route /api/lab-reports/[reportId]/file instead.
        reportUploads: { select: { id: true, fileName: true, fileType: true, fileSize: true, reportData: true, uploadedAt: true, uploadedBy: true, verifiedByDoctor: true, verifiedAt: true, notes: true } },
        billing: true,
      },
    })
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Authorization checks
    if (user.role === 'lab_technician') {
      const partner = await db.labPartner.findFirst({ where: { userId: user.id } })
      if (!partner || partner.id !== order.labPartnerId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } else if (user.role === 'patient') {
      if (order.patientId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } else if (user.role === 'doctor') {
      const doctor = await db.doctor.findUnique({ where: { userId: user.id } })
      if (!doctor || doctor.id !== order.doctorId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Inject commissionPercent from the doctor-lab association (the order model itself doesn't store it)
    const association = await db.doctorLabAssociation.findUnique({
      where: { doctorId_labPartnerId: { doctorId: order.doctorId, labPartnerId: order.labPartnerId } },
      select: { commissionPercent: true, isActive: true, id: true },
    })
    const orderWithCommission = {
      ...order,
      commissionPercent: association?.commissionPercent ?? 10,
      associationId: association?.id ?? null,
      associationActive: association?.isActive ?? false,
    }

    return NextResponse.json({ order: orderWithCommission })
  } catch (error) {
    console.error('external-test-order GET error:', error)
    return NextResponse.json({ error: 'Failed to load order' }, { status: 500 })
  }
}
