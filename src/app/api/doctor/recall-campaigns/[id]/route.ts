import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'

/**
 * GET /api/doctor/recall-campaigns/[id]
 * Campaign detail + full recipient list (the results view). Owner-only.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const { id } = await params
    const campaign = await db.recallCampaign.findFirst({
      where: { id, doctorId: doctor.id },
      select: {
        id: true,
        name: true,
        template: true,
        dormantDays: true,
        status: true,
        recipientCount: true,
        createdAt: true,
        sentAt: true,
        recipients: {
          orderBy: { sentAt: 'asc' },
          select: {
            id: true,
            patientId: true,
            patientName: true,
            phone: true,
            whatsappUrl: true,
            sentAt: true,
          },
        },
      },
    })
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('[recall-campaigns] detail error:', error)
    return NextResponse.json({ error: 'Failed to load campaign' }, { status: 500 })
  }
}

/**
 * DELETE /api/doctor/recall-campaigns/[id]
 * DRAFT campaigns only — a SENT campaign is an immutable record (patients
 * already got notifications; the recipient list stays for audit).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } })
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const { id } = await params
    const campaign = await db.recallCampaign.findFirst({
      where: { id, doctorId: doctor.id },
      select: { id: true, status: true },
    })
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }
    if (campaign.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Sent campaign delete nahi ho sakta — uska record patients ke liye hai' },
        { status: 400 }
      )
    }

    await db.recallCampaign.delete({ where: { id: campaign.id } })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('[recall-campaigns] delete error:', error)
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 })
  }
}
