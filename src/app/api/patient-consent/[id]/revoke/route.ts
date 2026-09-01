import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

// POST: Revoke a consent
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let user = await requireRole(req, 'doctor')
    if (!user) user = await requireRole(req, 'hospital')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const consent = await db.patientConsent.findUnique({ where: { id } })
    if (!consent) {
      return NextResponse.json({ error: 'Consent not found' }, { status: 404 })
    }

    await db.patientConsent.update({
      where: { id },
      data: {
        validUntil: new Date(), // expired now
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Consent revoke error:', error)
    return NextResponse.json({ error: 'Failed to revoke consent' }, { status: 500 })
  }
}
