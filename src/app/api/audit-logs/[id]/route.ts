import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/audit-logs/[id]
 * Admin-only. Returns a single audit log entry with full before/after JSON.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, 'admin')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const log = await db.auditLog.findUnique({ where: { id } })

    if (!log) {
      return NextResponse.json({ error: 'Audit log not found' }, { status: 404 })
    }

    let parsedBefore: unknown = {}
    let parsedAfter: unknown = {}
    try {
      parsedBefore = log.beforeJson ? JSON.parse(log.beforeJson) : {}
    } catch {
      parsedBefore = log.beforeJson
    }
    try {
      parsedAfter = log.afterJson ? JSON.parse(log.afterJson) : {}
    } catch {
      parsedAfter = log.afterJson
    }

    return NextResponse.json({
      log: {
        id: log.id,
        userId: log.userId,
        userRole: log.userRole,
        userName: log.userName,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        before: parsedBefore,
        after: parsedAfter,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        timestamp: log.timestamp,
      },
    })
  } catch (error) {
    console.error('Audit log detail GET error:', error)
    return NextResponse.json({ error: 'Failed to load audit log' }, { status: 500 })
  }
}
