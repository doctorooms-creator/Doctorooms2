import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { isSmsConfigured, isWhatsAppConfigured } from '@/lib/notify-channels'

/**
 * GET /api/notifications/channel-status
 *
 * Returns configuration status for SMS (MSG91) and WhatsApp (Gupshup).
 * Available to hospital + admin roles.
 */
export async function GET(req: NextRequest) {
  try {
    let user = await requireRole(req, 'hospital')
    if (!user) user = await requireRole(req, 'admin')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Confirm hospital linkage exists (admin can call without one)
    if (user.role === 'hospital') {
      const hospital = await db.hospital.findUnique({ where: { userId: user.id } })
      if (!hospital) {
        return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })
      }
    }

    return NextResponse.json({
      sms: {
        configured: isSmsConfigured(),
        provider: 'MSG91',
        envVar: 'MSG91_API_KEY',
      },
      whatsapp: {
        configured: isWhatsAppConfigured(),
        provider: 'Gupshup',
        envVars: ['GUPSHUP_API_KEY', 'GUPSHUP_SOURCE_NUMBER'],
      },
    })
  } catch (error) {
    console.error('channel-status GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
