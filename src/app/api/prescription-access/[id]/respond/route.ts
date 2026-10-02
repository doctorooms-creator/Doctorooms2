import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { emitToUserWithNotify } from '@/lib/emit-notification'
import { logStatusChange, logDelete } from '@/lib/audit-log'
import { getAuditContext } from '@/lib/audit-context'

/**
 * POST /api/prescription-access/[id]/respond
 * Patient accepts or rejects a prescription access request.
 * Body: { action: 'approve' | 'reject' }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { action } = body as { action?: string }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Fetch the request and verify it belongs to this patient
    const accessRequest = await db.prescriptionAccessRequest.findUnique({
      where: { id },
      include: {
        requestingDoctor: {
          include: { user: { select: { name: true, id: true } } },
        },
        originalDoctor: {
          include: { user: { select: { name: true } } },
        },
        prescription: {
          select: { disease: true, patientName: true },
        },
      },
    })

    if (!accessRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (accessRequest.patientId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (accessRequest.status !== 'Pending') {
      return NextResponse.json(
        { error: `Request is already ${accessRequest.status.toLowerCase()}` },
        { status: 400 }
      )
    }

    const newStatus = action === 'approve' ? 'Approved' : 'Rejected'

    await db.prescriptionAccessRequest.update({
      where: { id },
      data: { status: newStatus },
    })

    // Notify the requesting doctor
    await db.notification.create({
      data: {
        userId: accessRequest.requestingDoctor.user.id,
        title: `Prescription Access ${newStatus}`,
        message:
          action === 'approve'
            ? `Patient ${accessRequest.prescription.patientName} has approved your request to view their prescription (by Dr. ${accessRequest.originalDoctor.user.name}). You can now view it in your "Shared Prescriptions" tab.`
            : `Patient ${accessRequest.prescription.patientName} has rejected your request to view their prescription (by Dr. ${accessRequest.originalDoctor.user.name}).`,
        status: 'UNREAD',
      },
    })

    // ── Real-time prescription-shared emit (R3) ──
    // Fire only on approval: notify the patient (prescription owner) that the
    // originalDoctor's prescription has been shared with the requesting doctor.
    // This complements the existing notification above (which goes to the
    // requesting doctor) and gives the patient a real-time toast + DB row.
    if (action === 'approve') {
      try {
        await emitToUserWithNotify(
          accessRequest.patientId,
          'prescription-shared',
          {
            prescriptionId: accessRequest.prescriptionId,
            doctorName: accessRequest.originalDoctor.user.name,
            patientName: accessRequest.prescription.patientName,
          }
        )
      } catch (emitErr) {
        console.error('prescription-shared emit failed:', emitErr)
      }
    }

    // AUDIT (P2.8): Record patient's approve/reject decision on Rx access.
    try {
      const auditCtx = getAuditContext(req)
      const requestingDoctorName = accessRequest.requestingDoctor.user.name
      await logStatusChange(
        'prescription_access',
        id,
        'Pending',
        newStatus,
        user,
        `${newStatus} Rx access request from Dr. ${requestingDoctorName}`,
        { ...auditCtx }
      )
    } catch (auditErr) {
      console.error('[audit-log] prescription access respond capture failed:', auditErr)
    }

    return NextResponse.json({
      success: true,
      message: `Request ${newStatus.toLowerCase()} successfully`,
      newStatus,
    })
  } catch (error) {
    console.error('Prescription access respond error:', error)
    return NextResponse.json({ error: 'Failed to respond to request' }, { status: 500 })
  }
}

/**
 * DELETE /api/prescription-access/[id]/respond
 * Patient revokes previously approved access.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const accessRequest = await db.prescriptionAccessRequest.findUnique({
      where: { id },
      include: {
        requestingDoctor: {
          include: { user: { select: { name: true, id: true } } },
        },
        originalDoctor: {
          include: { user: { select: { name: true } } },
        },
        prescription: {
          select: { patientName: true },
        },
      },
    })

    if (!accessRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (accessRequest.patientId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (accessRequest.status !== 'Approved') {
      return NextResponse.json(
        { error: 'Only approved access can be revoked' },
        { status: 400 }
      )
    }

    await db.prescriptionAccessRequest.update({
      where: { id },
      data: { status: 'Revoked' },
    })

    // Notify the requesting doctor
    await db.notification.create({
      data: {
        userId: accessRequest.requestingDoctor.user.id,
        title: 'Prescription Access Revoked',
        message: `Patient ${accessRequest.prescription.patientName} has revoked your access to their prescription.`,
        status: 'UNREAD',
      },
    })

    // AUDIT (P2.8): Record patient-initiated Rx access revocation.
    try {
      const auditCtx = getAuditContext(req)
      const originalDoctorName = accessRequest.originalDoctor?.user?.name || 'Unknown'
      await logDelete(
        'prescription_access',
        id,
        user,
        `Revoked previously-approved Rx access for Dr. ${originalDoctorName}`,
        {},
        { ...auditCtx }
      )
    } catch (auditErr) {
      console.error('[audit-log] prescription access revoke capture failed:', auditErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Access revoked successfully',
    })
  } catch (error) {
    console.error('Prescription access revoke error:', error)
    return NextResponse.json({ error: 'Failed to revoke access' }, { status: 500 })
  }
}
