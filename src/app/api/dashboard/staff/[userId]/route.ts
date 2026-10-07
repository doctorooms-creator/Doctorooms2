import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, type AuthUser } from '@/lib/api-auth'
import { getHospitalIdForUser } from '@/lib/plans'
import { logAction } from '@/lib/audit-log'

/**
 * PATCH /api/dashboard/staff/[userId] — Block / Unblock a staff member.
 *
 * Hospital admin + solo doctor scope: the target's role row must link to the
 * SAME hospital as the requester BEFORE any toggle happens (out of scope → 403).
 *   - receptionist / nurse / pharmacist → role row .hospitalId
 *   - doctor  → Doctor.hospitalId or a DoctorHospital link
 *   - assistant → their doctor's DoctorHospital link to this hospital
 */

/** Authorize hospital/doctor + resolve their hospitalId (shared with staff route). */
async function authorizeAndResolve(
  request: NextRequest
): Promise<{ user: AuthUser; hospitalId: string } | { error: NextResponse }> {
  const user = await getAuthUser(request)
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (user.role !== 'hospital' && user.role !== 'doctor') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  if (user.role === 'hospital') {
    const hospital = await db.hospital.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!hospital) {
      return {
        error: NextResponse.json(
          { error: 'Hospital profile not found — complete onboarding first' },
          { status: 404 }
        ),
      }
    }
    return { user, hospitalId: hospital.id }
  }

  const hospitalId = await getHospitalIdForUser(user)
  if (!hospitalId) {
    return { error: NextResponse.json({ error: 'Practice setup incomplete' }, { status: 404 }) }
  }
  return { user, hospitalId }
}

/** Is this target user inside the requester's hospital scope? */
async function isUserInHospitalScope(userId: string, hospitalId: string): Promise<boolean> {
  const target = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  if (!target) return false

  switch (target.role) {
    case 'receptionist': {
      const profile = await db.receptionist.findUnique({ where: { userId } })
      return !!profile && profile.hospitalId === hospitalId
    }
    case 'nurse': {
      const profile = await db.staffNurse.findUnique({ where: { userId } })
      return !!profile && profile.hospitalId === hospitalId
    }
    case 'pharmacist': {
      const profile = await db.doctorPharmacist.findUnique({ where: { userId } })
      return !!profile && profile.hospitalId === hospitalId
    }
    case 'doctor': {
      const doctor = await db.doctor.findFirst({
        where: { userId },
        select: { id: true, hospitalId: true },
      })
      if (!doctor) return false
      if (doctor.hospitalId === hospitalId) return true
      const link = await db.doctorHospital.findFirst({
        where: { doctorId: doctor.id, hospitalId },
        select: { id: true },
      })
      return !!link
    }
    case 'assistant': {
      const profile = await db.doctorAssistant.findUnique({ where: { userId } })
      if (!profile) return false
      const link = await db.doctorHospital.findFirst({
        where: { doctorId: profile.doctorId, hospitalId },
        select: { id: true },
      })
      return !!link
    }
    default:
      return false
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await authorizeAndResolve(request)
    if ('error' in auth) return auth.error
    const { user, hospitalId } = auth

    const { userId } = await params

    const body = await request.json()
    const { status } = body

    if (!status || !['Active', 'Block'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be Active or Block' },
        { status: 400 }
      )
    }

    // Find the target user
    const target = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, status: true },
    })
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Scope check BEFORE toggling — the target must belong to this hospital
    const inScope = await isUserInHospitalScope(userId, hospitalId)
    if (!inScope) {
      return NextResponse.json(
        { error: 'This staff member is not in your hospital' },
        { status: 403 }
      )
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: { status },
    })

    // Audit (fire-and-forget — never throws)
    await logAction({
      userId: user.id,
      userRole: user.role,
      userName: user.name,
      action: 'staff_status_changed',
      entityType: 'staff',
      entityId: userId,
      description: `Staff ${target.name} <${target.email}> status: ${target.status} → ${status}`,
      beforeJson: JSON.stringify({ status: target.status }),
      afterJson: JSON.stringify({ status }),
      metadata: { requesterId: user.id, requesterRole: user.role, targetRole: target.role },
      hospitalId,
      severity: status === 'Block' ? 'warning' : 'info',
    })

    return NextResponse.json({ userId: updated.id, status: updated.status })
  } catch (error) {
    console.error('Update staff status error:', error)
    return NextResponse.json({ error: 'Failed to update staff status' }, { status: 500 })
  }
}
