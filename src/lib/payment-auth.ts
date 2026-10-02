import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import type { AuthUser } from '@/lib/api-auth'

/**
 * Roles allowed to initiate / verify a Razorpay payment on behalf of a bill.
 * - patient: pays their own bills
 * - receptionist / hospital / admin: collect on behalf of patients
 */
const ALLOWED_ROLES = ['patient', 'receptionist', 'hospital', 'admin']

export interface PaymentAuth {
  user: AuthUser
  hospitalId: string
}

/**
 * Resolve a logged-in user (patient | receptionist | hospital | admin) plus
 * the hospitalId they're acting for. Returns null if unauthenticated or not
 * allowed.
 */
export async function resolvePaymentAuth(req: NextRequest): Promise<PaymentAuth | null> {
  const user = await requireAuth(req)
  if (!user) return null
  if (!ALLOWED_ROLES.includes(user.role.toLowerCase())) return null

  let hospitalId: string | null = null

  if (user.role === 'patient') {
    // patient hospitalId is resolved per-entity (from the bill/admission) in the route
    return { user, hospitalId: '' }
  }

  if (user.role === 'hospital' || user.role === 'admin') {
    const hospital = await db.hospital.findUnique({ where: { userId: user.id } })
    if (!hospital) return null
    return { user, hospitalId: hospital.id }
  }

  // receptionist
  const receptionist = await db.receptionist.findUnique({ where: { userId: user.id } })
  if (!receptionist) return null
  return { user, hospitalId: receptionist.hospitalId }
}

/**
 * Resolve the hospitalId for a given entity type + id.
 * Used by patient role to find the hospital the bill belongs to (since the
 * patient is not tied to a single hospital in the schema).
 */
export async function resolveHospitalForEntity(
  type: 'ipd-bill' | 'opd-bill' | 'advance' | 'consultation',
  entityId: string
): Promise<{ hospitalId: string; admissionId?: string | null } | null> {
  if (type === 'ipd-bill') {
    const bill = await db.ipdBill.findUnique({
      where: { id: entityId },
      select: { hospitalId: true, admissionId: true },
    })
    if (!bill) return null
    return { hospitalId: bill.hospitalId, admissionId: bill.admissionId }
  }
  if (type === 'opd-bill') {
    const bill = await db.opdBill.findUnique({
      where: { id: entityId },
      select: { hospitalId: true },
    })
    if (!bill) return null
    return { hospitalId: bill.hospitalId }
  }
  if (type === 'advance') {
    const adv = await db.patientAdvance.findUnique({
      where: { id: entityId },
      select: { hospitalId: true, admissionId: true },
    })
    if (!adv) return null
    return { hospitalId: adv.hospitalId, admissionId: adv.admissionId }
  }
  // consultation — entity is a Booking
  const booking = await db.booking.findUnique({
    where: { id: entityId },
    select: { hospitalId: true },
  })
  if (!booking || !booking.hospitalId) return null
  return { hospitalId: booking.hospitalId }
}

/**
 * For patient role: verify that the entity actually belongs to the patient
 * (via IpdAdmission.userId or OpdBill.patientId or Booking.userId).
 */
export async function verifyPatientOwnsEntity(
  patientUserId: string,
  type: 'ipd-bill' | 'opd-bill' | 'advance' | 'consultation',
  entityId: string
): Promise<boolean> {
  if (type === 'ipd-bill') {
    const bill = await db.ipdBill.findUnique({
      where: { id: entityId },
      select: { admission: { select: { userId: true } } },
    })
    if (!bill || !bill.admission) return false
    return bill.admission.userId === patientUserId
  }
  if (type === 'opd-bill') {
    const bill = await db.opdBill.findUnique({
      where: { id: entityId },
      select: { patientId: true },
    })
    if (!bill) return false
    return bill.patientId === patientUserId
  }
  if (type === 'advance') {
    const adv = await db.patientAdvance.findUnique({
      where: { id: entityId },
      select: { patientId: true, admission: { select: { userId: true } } },
    })
    if (!adv) return false
    if (adv.patientId && adv.patientId === patientUserId) return true
    if (adv.admission?.userId === patientUserId) return true
    return false
  }
  // consultation
  const booking = await db.booking.findUnique({
    where: { id: entityId },
    select: { userId: true },
  })
  if (!booking) return false
  return booking.userId === patientUserId
}
