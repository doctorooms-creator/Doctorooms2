import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

/**
 * GET /api/notifications/unread-count
 *   Any authenticated role: returns the count of UNREAD notifications
 *   for the current user. Used by the sidebar badge + dashboard bell icon.
 *
 *   Optional query: ?status=UNREAD|READ|ALL  (default UNREAD)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'UNREAD'

    const where: Record<string, unknown> = { userId: user.id }
    if (status !== 'ALL') where.status = status

    const count = await db.notification.count({ where })

    return NextResponse.json({ count, status })
  } catch (error) {
    console.error('unread-count GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch unread count' }, { status: 500 })
  }
}
