import { requireRole, requireAuth } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { emitNotification, hospitalRoom, roleRoom } from '@/lib/emit-notification'
import { validateBody, createBedTransferSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    // Resolve acting user once, keeping effectiveUser in scope for the WHOLE
    // handler (previously declared block-scoped inside if/else → ReferenceError
    // at the transferredBy write below).
    let effectiveUser = await requireRole(req, 'hospital')
    if (!effectiveUser) {
      effectiveUser = await requireRole(req, 'receptionist')
    }
    if (!effectiveUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const v = validateBody(createBedTransferSchema, body)
    if (!v.success) return v.error
    const { admissionId, toBedId, transferReason } = v.data

    // Get admission with current bed
    const admission = await db.ipdAdmission.findUnique({
      where: { id: admissionId },
      include: { bed: { select: { id: true, wardId: true, bedNumber: true, status: true } } },
    })
    if (!admission) {
      return NextResponse.json({ error: 'Admission not found' }, { status: 404 })
    }
    if (admission.status !== 'Admitted') {
      return NextResponse.json({ error: 'Patient is not currently admitted' }, { status: 400 })
    }
    if (!admission.bedId || !admission.bed) {
      return NextResponse.json({ error: 'Admission has no current bed to transfer from' }, { status: 400 })
    }

    // Check target bed is available
    const targetBed = await db.bed.findUnique({
      where: { id: toBedId },
      include: { ward: { select: { id: true, name: true, hospitalId: true } } },
    })
    if (!targetBed) {
      return NextResponse.json({ error: 'Target bed not found' }, { status: 404 })
    }
    if (targetBed.status !== 'Available') {
      return NextResponse.json({ error: 'Target bed is not available' }, { status: 400 })
    }

    // App-level occupancy integrity — IpdAdmission.bedId is no longer DB-unique
    // (historical admissions keep a null bedId instead), so reject explicitly
    // when another Admitted admission already holds the target bed.
    const bedHolder = await db.ipdAdmission.findFirst({
      where: { bedId: toBedId, status: 'Admitted', id: { not: admissionId } },
    })
    if (bedHolder) {
      return NextResponse.json({ error: 'Bed is already occupied' }, { status: 409 })
    }

    // Transfer in transaction
    await db.$transaction(async (tx) => {
      // Free old bed
      await tx.bed.update({
        where: { id: admission.bedId! },
        data: { status: 'Available' },
      })

      // Occupy new bed
      await tx.bed.update({
        where: { id: toBedId },
        data: { status: 'Occupied' },
      })

      // Update admission bed and ward
      await tx.ipdAdmission.update({
        where: { id: admissionId },
        data: {
          bedId: toBedId,
          wardId: targetBed.wardId,
        },
      })

      // Create bed transfer record
      await tx.bedTransfer.create({
        data: {
          admissionId,
          fromBedId: admission.bedId!,
          toBedId,
          fromWardId: admission.bed!.wardId,
          toWardId: targetBed.wardId,
          transferReason: transferReason || '',
          transferredBy: effectiveUser!.id,
        },
      })
    })

    emitNotification('new-admission', [roleRoom('nurse'), hospitalRoom(admission.hospitalId)], {
      id: admissionId,
      title: 'Patient Bed Transferred',
      message: `Patient ${admission.patientName} transferred`,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Bed transfer POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const admissionId = searchParams.get('admissionId')

    if (!admissionId) {
      return NextResponse.json({ error: 'admissionId is required' }, { status: 400 })
    }

    const transfers = await db.bedTransfer.findMany({
      where: { admissionId },
      orderBy: { transferDate: 'desc' },
      include: {
        fromBed: { select: { bedNumber: true, bedType: true, ward: { select: { name: true } } } },
        toBed: { select: { bedNumber: true, bedType: true, ward: { select: { name: true } } } },
      },
    })

    // Resolve transferredBy user ids to names for display
    const userIds = [...new Set(transfers.map((t) => t.transferredBy))]
    const users = userIds.length
      ? await db.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })
      : []
    const userNameById = new Map(users.map((u) => [u.id, u.name]))

    return NextResponse.json({
      transfers: transfers.map((t) => ({
        id: t.id,
        admissionId: t.admissionId,
        fromBedId: t.fromBedId,
        fromBedNumber: t.fromBed.bedNumber,
        fromBedType: t.fromBed.bedType,
        fromWardName: t.fromBed.ward.name,
        toBedId: t.toBedId,
        toBedNumber: t.toBed.bedNumber,
        toBedType: t.toBed.bedType,
        toWardName: t.toBed.ward.name,
        transferDate: t.transferDate.toISOString(),
        transferReason: t.transferReason,
        transferredBy: t.transferredBy,
        transferredByName: userNameById.get(t.transferredBy) || '—',
        createdAt: t.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Bed transfers GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
