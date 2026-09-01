import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

// POST: Sign a consent (mark as signed by patient + witness)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let user = await requireRole(req, 'doctor')
    if (!user) user = await requireRole(req, 'receptionist')
    if (!user) user = await requireRole(req, 'hospital')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { witnessName, witnessRelation } = body

    const consent = await db.patientConsent.findUnique({ where: { id } })
    if (!consent) {
      return NextResponse.json({ error: 'Consent not found' }, { status: 404 })
    }
    if (consent.signedByPatient) {
      return NextResponse.json({ error: 'Consent already signed' }, { status: 400 })
    }

    const updated = await db.patientConsent.update({
      where: { id },
      data: {
        signedByPatient: true,
        signedByWitness: !!witnessName,
        witnessName: witnessName || '',
        witnessRelation: witnessRelation || '',
        signedAt: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // valid 1 year
      },
    })

    return NextResponse.json({ consent: { id: updated.id, signedAt: updated.signedAt?.toISOString() } })
  } catch (error) {
    console.error('Consent sign error:', error)
    return NextResponse.json({ error: 'Failed to sign consent' }, { status: 500 })
  }
}
