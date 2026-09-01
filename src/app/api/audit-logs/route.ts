import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/audit-logs
 *   Admin only: paginated audit log with filters.
 *
 *   Query:
 *     ?page=1                - page number (default 1)
 *     ?pageSize=50           - page size (default 50, max 200)
 *     ?userId=...            - filter by user
 *     ?action=...            - filter by action (create/update/delete/login/logout/status_change)
 *     ?entityType=...       - filter by entity type (prescription/lab_billing/ipd_admission/...)
 *     ?entityId=...          - filter by specific entity id
 *     ?severity=...           - filter by severity (info/warning/critical)
 *     ?hospitalId=...        - filter by hospital
 *     ?startDate=ISO         - filter by timestamp >= startDate
 *     ?endDate=ISO           - filter by timestamp <= endDate
 *     ?search=...            - free-text search in userName / description
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'admin')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.min(200, Math.max(10, parseInt(searchParams.get('pageSize') || '50', 10)))
    const userId = searchParams.get('userId') || ''
    const action = searchParams.get('action') || ''
    const entityType = searchParams.get('entityType') || ''
    const entityId = searchParams.get('entityId') || ''
    const severity = searchParams.get('severity') || ''
    const hospitalId = searchParams.get('hospitalId') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const search = searchParams.get('search') || ''

    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId
    if (action) where.action = action
    if (entityType) where.entityType = entityType
    if (entityId) where.entityId = entityId
    if (severity) where.severity = severity
    if (hospitalId) where.hospitalId = hospitalId
    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {}
      if (startDate) dateFilter.gte = new Date(startDate)
      if (endDate) dateFilter.lte = new Date(endDate)
      where.timestamp = dateFilter
    }
    if (search) {
      where.OR = [
        { userName: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.auditLog.count({ where }),
    ])

    // Distinct values for filter dropdowns
    const [actions, entityTypes, severities] = await Promise.all([
      db.auditLog.findMany({ where, select: { action: true }, distinct: 'action', orderBy: { action: 'asc' } }),
      db.auditLog.findMany({ where, select: { entityType: true }, distinct: 'entityType', orderBy: { entityType: 'asc' } }),
      db.auditLog.findMany({ where, select: { severity: true }, distinct: 'severity' }),
    ])

    return NextResponse.json({
      logs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      filters: {
        actions: actions.map((a) => a.action).filter(Boolean),
        entityTypes: entityTypes.map((e) => e.entityType).filter(Boolean),
        severities: severities.map((s) => s.severity).filter(Boolean),
      },
    })
  } catch (error) {
    console.error('audit-logs GET error:', error)
    return NextResponse.json({ error: 'Failed to load audit logs' }, { status: 500 })
  }
}
