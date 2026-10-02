import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * Resolve hospital auth (hospital or admin role).
 * Hospital role uses the user's own hospital; admin must pass ?hospitalId.
 */
async function getHospitalAuth(req: NextRequest): Promise<{ hospitalId: string } | null> {
  let user = await requireRole(req, 'hospital')
  if (!user) user = await requireRole(req, 'admin')
  if (!user) return null

  let hospitalId: string | null = null
  if (user.role === 'hospital') {
    const hospital = await db.hospital.findUnique({ where: { userId: user.id } })
    if (!hospital) return null
    hospitalId = hospital.id
  } else {
    const url = new URL(req.url)
    hospitalId = url.searchParams.get('hospitalId')
    if (hospitalId) {
      const exists = await db.hospital.findUnique({ where: { id: hospitalId } })
      if (!exists) return null
    }
  }
  if (!hospitalId) return null
  return { hospitalId }
}

const VALID_EVENT_TYPES = [
  'booking_confirmed',
  'consultation_started',
  'vital_critical',
  'lab_result_ready',
  'bill_generated',
  'payment_received',
  'discharge_advised',
  'appointment_reminder',
] as const

const VALID_CHANNELS = ['SMS', 'WhatsApp', 'Email'] as const

// PUT /api/notifications/templates/[id] — update template (must belong to this hospital)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getHospitalAuth(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { hospitalId } = auth

    const { id } = await params

    // Verify ownership — only templates belonging to this hospital can be edited
    const existing = await db.notificationTemplate.findFirst({
      where: { id, hospitalId },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}

    if (typeof body.eventType === 'string') {
      const eventType = body.eventType.trim()
      if (!eventType || !VALID_EVENT_TYPES.includes(eventType as never)) {
        return NextResponse.json({ error: 'Invalid event type' }, { status: 400 })
      }
      updates.eventType = eventType
    }
    if (typeof body.channel === 'string') {
      const channel = body.channel.trim()
      if (!channel || !VALID_CHANNELS.includes(channel as never)) {
        return NextResponse.json({ error: 'Invalid channel' }, { status: 400 })
      }
      updates.channel = channel
    }
    if (typeof body.templateName === 'string') {
      const templateName = body.templateName.trim()
      if (!templateName) {
        return NextResponse.json({ error: 'Template name cannot be empty' }, { status: 400 })
      }
      updates.templateName = templateName
    }
    if (typeof body.templateBody === 'string') {
      const templateBody = body.templateBody.trim()
      if (!templateBody) {
        return NextResponse.json({ error: 'Template body cannot be empty' }, { status: 400 })
      }
      updates.templateBody = templateBody
    }
    if (typeof body.senderId === 'string' && body.senderId.trim()) {
      updates.senderId = body.senderId.trim()
    }
    if (typeof body.whatsappTemplateId === 'string') {
      updates.whatsappTemplateId = body.whatsappTemplateId.trim()
    }
    if (body.isActive !== undefined) {
      updates.isActive = Boolean(body.isActive)
    }

    const template = await db.notificationTemplate.update({
      where: { id },
      data: updates,
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error('notifications/templates/[id] PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/notifications/templates/[id] — delete template (must belong to this hospital)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getHospitalAuth(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { hospitalId } = auth

    const { id } = await params

    const existing = await db.notificationTemplate.findFirst({
      where: { id, hospitalId },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    await db.notificationTemplate.delete({ where: { id } })

    return NextResponse.json({ message: 'Template deleted successfully' })
  } catch (error) {
    console.error('notifications/templates/[id] DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
