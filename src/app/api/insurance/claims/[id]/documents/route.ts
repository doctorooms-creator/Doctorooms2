import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, 'receptionist') || await requireRole(req, 'hospital')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { docType, fileUrl, fileName } = body

    if (!docType || !fileUrl) {
      return NextResponse.json({ error: 'docType and fileUrl are required' }, { status: 400 })
    }

    const doc = await db.insuranceDoc.create({
      data: {
        claimId: id,
        docType,
        fileUrl,
        fileName: fileName || '',
        uploadedBy: user.id,
      },
    })

    return NextResponse.json({ doc: { id: doc.id } }, { status: 201 })
  } catch (error) {
    console.error('Claim document upload error:', error)
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
  }
}
