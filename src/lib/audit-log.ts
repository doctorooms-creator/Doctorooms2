/**
 * Audit Log helper — call `logAction()` from any API route (or server-side code)
 * to record an auditable event. Never throws — failures are logged + swallowed.
 *
 * Field conventions:
 *   action:      verb — "create", "update", "delete", "login", "logout", "status_change", "view", "print", "send", "approve", "reject"
 *   entityType:  noun — "prescription", "lab_billing", "ipd_admission", "ot_schedule", "diet_order", "user", "lab_partner", etc.
 *   entityId:    the id of the affected record (string, may be empty if N/A)
 *   description: human-readable summary e.g. "Created prescription RX-2026-0001 for Rahul Verma"
 *   severity:    "info" (default), "warning", "critical"
 *   metadata:    JSON string with extra context (old/new values, etc.)
 */

import { db } from '@/lib/db'

export interface AuditLogEntry {
  userId?: string | null
  userRole?: string
  userName?: string
  action: string
  entityType: string
  entityId?: string
  description?: string
  beforeJson?: string
  afterJson?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  severity?: 'info' | 'warning' | 'critical'
  hospitalId?: string
}

/**
 * Persist an audit log entry. Fire-and-forget under the hood (awaited but never throws).
 * Safe to call from any server-side code (API route, server component, server action).
 */
export async function logAction(entry: AuditLogEntry): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: entry.userId || null,
        userRole: entry.userRole || '',
        userName: entry.userName || '',
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId || '',
        description: entry.description || '',
        beforeJson: entry.beforeJson || '{}',
        afterJson: entry.afterJson || '{}',
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : '{}',
        ipAddress: entry.ipAddress || '',
        userAgent: entry.userAgent || '',
        severity: entry.severity || 'info',
        hospitalId: entry.hospitalId || null,
      },
    })
  } catch (err) {
    // Audit log failure should NEVER block business logic
    console.error('[audit-log] Failed to persist entry:', err)
  }
}

/**
 * Convenience: log a status change with old + new status snapshots.
 *
 * `extra` accepts `ipAddress` + `userAgent` (P2.8) so patient-side routes
 * can capture request context via `getAuditContext(req)` + spread it in.
 */
export async function logStatusChange(
  entityType: string,
  entityId: string,
  oldStatus: string,
  newStatus: string,
  user: { id: string; role: string; name: string } | null | undefined,
  description?: string,
  extra?: {
    hospitalId?: string
    metadata?: Record<string, unknown>
    severity?: 'info' | 'warning' | 'critical'
    ipAddress?: string
    userAgent?: string
  }
): Promise<void> {
  await logAction({
    userId: user?.id,
    userRole: user?.role,
    userName: user?.name,
    action: 'status_change',
    entityType,
    entityId,
    description: description || `${entityType} ${entityId.slice(-8)} status: ${oldStatus} → ${newStatus}`,
    beforeJson: JSON.stringify({ status: oldStatus }),
    afterJson: JSON.stringify({ status: newStatus }),
    metadata: extra?.metadata,
    severity: extra?.severity || (newStatus === 'Cancelled' || newStatus === 'Rejected' ? 'warning' : 'info'),
    hospitalId: extra?.hospitalId,
    ipAddress: extra?.ipAddress,
    userAgent: extra?.userAgent,
  })
}

/**
 * Convenience: log a create action.
 *
 * `extra` accepts `ipAddress` + `userAgent` (P2.8) so patient-side routes
 * can capture request context via `getAuditContext(req)` + spread it in.
 */
export async function logCreate(
  entityType: string,
  entityId: string,
  user: { id: string; role: string; name: string } | null | undefined,
  description: string,
  afterJson?: Record<string, unknown>,
  extra?: {
    hospitalId?: string
    severity?: 'info' | 'warning' | 'critical'
    ipAddress?: string
    userAgent?: string
  }
): Promise<void> {
  await logAction({
    userId: user?.id,
    userRole: user?.role,
    userName: user?.name,
    action: 'create',
    entityType,
    entityId,
    description,
    afterJson: afterJson ? JSON.stringify(afterJson) : '{}',
    severity: extra?.severity || 'info',
    hospitalId: extra?.hospitalId,
    ipAddress: extra?.ipAddress,
    userAgent: extra?.userAgent,
  })
}

/**
 * Convenience: log an update action.
 *
 * `extra` accepts `ipAddress` + `userAgent` (P2.8) so patient-side routes
 * can capture request context via `getAuditContext(req)` + spread it in.
 */
export async function logUpdate(
  entityType: string,
  entityId: string,
  user: { id: string; role: string; name: string } | null | undefined,
  description: string,
  before?: Record<string, unknown>,
  after?: Record<string, unknown>,
  extra?: {
    hospitalId?: string
    severity?: 'info' | 'warning' | 'critical'
    ipAddress?: string
    userAgent?: string
  }
): Promise<void> {
  await logAction({
    userId: user?.id,
    userRole: user?.role,
    userName: user?.name,
    action: 'update',
    entityType,
    entityId,
    description,
    beforeJson: before ? JSON.stringify(before) : '{}',
    afterJson: after ? JSON.stringify(after) : '{}',
    severity: extra?.severity || 'info',
    hospitalId: extra?.hospitalId,
    ipAddress: extra?.ipAddress,
    userAgent: extra?.userAgent,
  })
}

/**
 * Convenience: log a delete (soft or hard).
 *
 * `extra` accepts `ipAddress` + `userAgent` (P2.8) so patient-side routes
 * can capture request context via `getAuditContext(req)` + spread it in.
 */
export async function logDelete(
  entityType: string,
  entityId: string,
  user: { id: string; role: string; name: string } | null | undefined,
  description: string,
  before?: Record<string, unknown>,
  extra?: {
    hospitalId?: string
    severity?: 'info' | 'warning' | 'critical'
    ipAddress?: string
    userAgent?: string
  }
): Promise<void> {
  await logAction({
    userId: user?.id,
    userRole: user?.role,
    userName: user?.name,
    action: 'delete',
    entityType,
    entityId,
    description,
    beforeJson: before ? JSON.stringify(before) : '{}',
    severity: extra?.severity || 'warning',
    hospitalId: extra?.hospitalId,
    ipAddress: extra?.ipAddress,
    userAgent: extra?.userAgent,
  })
}
