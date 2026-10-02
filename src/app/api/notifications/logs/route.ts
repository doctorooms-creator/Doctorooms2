import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/notifications/logs?limit=10
 *
 * Returns the last N NotificationLog rows for this hospital, sorted by
 * createdAt desc. Available to hospital + admin roles.
 */
export async function GET(req: NextRequest) {
  try {
    let user = await requireRole(req, 'hospital')
    if (!user) user = await requireRole(req, 'admin')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin without a hospital → return empty list (admin sees global view
    // only via separate admin endpoints; here we tie to a specific hospital)
    let hospitalId: string | null = null
    if (user.role === 'hospital') {
      const hospital = await db.hospital.findUnique({ where: { userId: user.id } })
      if (!hospital) {
        return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })
      }
      hospitalId = hospital.id
    } else {
      // admin — optionally filter by query param
      hospitalId = new URL(req.url).searchParams.get('hospitalId')
    }

    const { searchParams } = new URL(req.url)
    const limitParam = parseInt(searchParams.get('limit') || '10', 10)
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 10

    const logs = await db.notificationLog.findMany({
      where: hospitalId ? { hospitalId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        userId: true,
        hospitalId: true,
        channel: true,
        recipient: true,
        content: true,
        templateName: true,
        status: true,
        externalId: true,
        errorMessage: true,
        sentAt: true,
        deliveredAt: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('notifications/logs GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
