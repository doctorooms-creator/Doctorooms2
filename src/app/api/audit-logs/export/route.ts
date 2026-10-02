import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'admin')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') || undefined
    const action = searchParams.get('action') || undefined
    const entityType = searchParams.get('entityType') || undefined

    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId
    if (action && action !== 'All') where.action = action
    if (entityType) where.entityType = { contains: entityType }

    const logs = await db.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 1000, // limit export to 1000 rows
    })

    // Build CSV
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Before', 'After']
    const rows = logs.map((l) => [
      l.timestamp.toISOString(),
      l.userName || l.userId || '',
      l.userRole,
      l.action,
      l.entityType,
      l.entityId,
      l.ipAddress,
      l.beforeJson.replace(/"/g, '""'),
      l.afterJson.replace(/"/g, '""'),
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Audit logs export error:', error)
    return NextResponse.json({ error: 'Failed to export audit logs' }, { status: 500 })
  }
}
