import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const ALLOWED_ROLES = ['doctor', 'receptionist', 'hospital', 'admin', 'patient']

async function resolveAuthorizedUser(req: NextRequest) {
  for (const role of ALLOWED_ROLES) {
    // We can't use requireRole for patient here in a loop —
    // it returns null for non-matching roles so it's safe.
    const { requireRole } = await import('@/lib/api-auth')
    const u = await requireRole(req, role)
    if (u) return u
  }
  return null
}

/**
 * GET /api/patient-consent/[id]
 * Returns the full consent detail.
 * Patients can only view their own consents.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await resolveAuthorizedUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const consent = await db.patientConsent.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, name: true, mobileNo: true } },
      },
    })

    if (!consent) {
      return NextResponse.json({ error: 'Consent not found' }, { status: 404 })
    }

    // Patients can only view their own consents
    if (user.role === 'patient' && consent.patientId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      consent: {
        id: consent.id,
        patientId: consent.patientId,
        patientName: consent.patient?.name || '',
        admissionId: consent.admissionId,
        bookingId: consent.bookingId,
        consentType: consent.consentType,
        documentUrl: consent.documentUrl,
        templateName: consent.templateName,
        signedByPatient: consent.signedByPatient,
        signedByWitness: consent.signedByWitness,
        witnessName: consent.witnessName,
        witnessRelation: consent.witnessRelation,
        signedAt: consent.signedAt,
        validUntil: consent.validUntil,
        createdBy: consent.createdBy,
        createdAt: consent.createdAt,
        updatedAt: consent.updatedAt,
        status: consent.signedByPatient
          ? 'Signed'
          : consent.validUntil && consent.validUntil < new Date()
            ? 'Revoked'
            : 'Pending',
      },
    })
  } catch (error) {
    console.error('Patient consent detail GET error:', error)
    return NextResponse.json({ error: 'Failed to load consent' }, { status: 500 })
  }
}
