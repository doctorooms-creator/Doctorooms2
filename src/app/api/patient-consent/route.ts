import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole, requireAuth } from '@/lib/api-auth'

// GET: List consents
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get('patientId')
    const admissionId = searchParams.get('admissionId')

    const where: Record<string, unknown> = {}
    if (patientId) where.patientId = patientId
    if (admissionId) where.admissionId = admissionId

    // Patients can only see their own consents
    if (user.role === 'patient') {
      where.patientId = user.id
    }

    const consents = await db.patientConsent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      consents: consents.map((c) => ({
        id: c.id,
        patientId: c.patientId,
        admissionId: c.admissionId,
        bookingId: c.bookingId,
        consentType: c.consentType,
        documentUrl: c.documentUrl,
        templateName: c.templateName,
        signedByPatient: c.signedByPatient,
        signedByWitness: c.signedByWitness,
        witnessName: c.witnessName,
        witnessRelation: c.witnessRelation,
        signedAt: c.signedAt?.toISOString() || null,
        validUntil: c.validUntil?.toISOString() || null,
        createdAt: c.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Consents GET error:', error)
    return NextResponse.json({ error: 'Failed to load consents' }, { status: 500 })
  }
}

// POST: Create consent
export async function POST(req: NextRequest) {
  try {
    let user = await requireRole(req, 'doctor')
    if (!user) user = await requireRole(req, 'receptionist')
    if (!user) user = await requireRole(req, 'hospital')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { patientId, admissionId, bookingId, consentType, templateName, documentUrl } = body

    if (!patientId || !consentType) {
      return NextResponse.json({ error: 'patientId and consentType are required' }, { status: 400 })
    }

    const consent = await db.patientConsent.create({
      data: {
        patientId,
        admissionId: admissionId || null,
        bookingId: bookingId || null,
        consentType,
        templateName: templateName || '',
        documentUrl: documentUrl || '',
        createdBy: user.id,
      },
    })

    return NextResponse.json({ consent: { id: consent.id } }, { status: 201 })
  } catch (error) {
    console.error('Consent POST error:', error)
    return NextResponse.json({ error: 'Failed to create consent' }, { status: 500 })
  }
}
