import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * Resolve hospital auth (hospital or admin role) — returns the hospitalId
 * for the current user. Admin may pass a `hospitalId` query param to scope.
 */
async function getHospitalAuth(req: NextRequest): Promise<{ user: NonNullable<Awaited<ReturnType<typeof requireRole>>>; hospitalId: string } | null> {
  let user = await requireRole(req, 'hospital')
  if (!user) user = await requireRole(req, 'admin')
  if (!user) return null

  let hospitalId: string | null = null
  if (user.role === 'hospital') {
    const hospital = await db.hospital.findUnique({ where: { userId: user.id } })
    if (!hospital) return null
    hospitalId = hospital.id
  } else {
    // admin — must pass ?hospitalId=
    const url = new URL(req.url)
    hospitalId = url.searchParams.get('hospitalId')
    if (hospitalId) {
      const exists = await db.hospital.findUnique({ where: { id: hospitalId } })
      if (!exists) return null
    }
  }
  if (!hospitalId) return null
  return { user, hospitalId }
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

// GET /api/notifications/templates — list hospital + global templates
export async function GET(req: NextRequest) {
  try {
    const auth = await getHospitalAuth(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { hospitalId } = auth

    const templates = await db.notificationTemplate.findMany({
      where: {
        OR: [{ hospitalId }, { hospitalId: null }],
      },
      orderBy: [{ hospitalId: 'asc' }, { eventType: 'asc' }, { channel: 'asc' }],
    })

    return NextResponse.json({
      templates: templates.map((t) => ({
        id: t.id,
        hospitalId: t.hospitalId,
        isGlobal: t.hospitalId === null,
        eventType: t.eventType,
        channel: t.channel,
        templateName: t.templateName,
        templateBody: t.templateBody,
        senderId: t.senderId,
        whatsappTemplateId: t.whatsappTemplateId,
        isActive: t.isActive,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    })
  } catch (error) {
    console.error('notifications/templates GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/notifications/templates — create a new template for this hospital
export async function POST(req: NextRequest) {
  try {
    const auth = await getHospitalAuth(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { hospitalId } = auth

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const eventType = typeof body.eventType === 'string' ? body.eventType.trim() : ''
    const channel = typeof body.channel === 'string' ? body.channel.trim() : ''
    const templateName = typeof body.templateName === 'string' ? body.templateName.trim() : ''
    const templateBody = typeof body.templateBody === 'string' ? body.templateBody.trim() : ''
    const senderId = typeof body.senderId === 'string' && body.senderId.trim() ? body.senderId.trim() : 'DOCTRM'
    const whatsappTemplateId = typeof body.whatsappTemplateId === 'string' ? body.whatsappTemplateId.trim() : ''
    const isActive = body.isActive === undefined ? true : Boolean(body.isActive)

    if (!eventType || !VALID_EVENT_TYPES.includes(eventType as never)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 })
    }
    if (!channel || !VALID_CHANNELS.includes(channel as never)) {
      return NextResponse.json({ error: 'Invalid channel' }, { status: 400 })
    }
    if (!templateName) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 })
    }
    if (!templateBody) {
      return NextResponse.json({ error: 'Template body is required' }, { status: 400 })
    }

    const template = await db.notificationTemplate.create({
      data: {
        hospitalId,
        eventType,
        channel,
        templateName,
        templateBody,
        senderId,
        whatsappTemplateId,
        isActive,
      },
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('notifications/templates POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
