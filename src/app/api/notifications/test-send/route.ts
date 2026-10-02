import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { sendViaChannel, isSmsConfigured } from '@/lib/notify-channels'

/**
 * POST /api/notifications/test-send
 *
 * Sends a test SMS to the supplied phone number.
 * Body: { phone, message }
 * Returns: { success: boolean, error?: string, logId?: string }
 *
 * Available to hospital + admin roles.
 */
export async function POST(req: NextRequest) {
  try {
    let user = await requireRole(req, 'hospital')
    if (!user) user = await requireRole(req, 'admin')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Resolve hospital for tagging the log
    let hospitalId: string | null = null
    if (user.role === 'hospital') {
      const hospital = await db.hospital.findUnique({ where: { userId: user.id } })
      if (!hospital) {
        return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })
      }
      hospitalId = hospital.id
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const rawPhone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''

    if (!rawPhone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }
    if (!isSmsConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'SMS gateway is not configured. Set MSG91_API_KEY in your .env file.',
      }, { status: 400 })
    }

    // Normalise phone to E.164-ish (+91XXXXXXXXXX)
    let phone = rawPhone.replace(/\s+/g, '').replace(/-/g, '')
    if (!phone.startsWith('+')) {
      if (phone.length === 10) phone = `+91${phone}`
      else if (phone.startsWith('91') && phone.length === 12) phone = `+${phone}`
      else phone = `+${phone}`
    }

    // sendViaChannel is fire-and-forget but it does await its internal
    // network call + log write. So awaiting it guarantees the NotificationLog
    // row exists by the time we query.
    await sendViaChannel({
      userId: user.id,
      hospitalId: hospitalId || undefined,
      recipient: phone,
      message,
      templateName: 'Test SMS',
      channel: 'SMS',
    })

    // Look up the most recent log row for this user + templateName to extract
    // the send result (since sendViaChannel returns void).
    const latestLog = await db.notificationLog.findFirst({
      where: {
        userId: user.id,
        templateName: 'Test SMS',
        recipient: phone,
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, status: true, errorMessage: true },
    })

    const success = latestLog?.status === 'Sent'
    return NextResponse.json({
      success,
      error: success ? undefined : (latestLog?.errorMessage || 'Send failed'),
      logId: latestLog?.id,
    })
  } catch (error) {
    console.error('notifications/test-send POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
