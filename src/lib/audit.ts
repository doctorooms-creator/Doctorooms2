/**
 * Audit logging utility.
 * Captures who/what/when/before/after for sensitive operations.
 * Never throws — failures are silently swallowed.
 */

import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function logAudit(params: {
  userId?: string
  userRole?: string
  userName?: string
  action: 'Create' | 'Update' | 'Delete' | 'View' | 'Login' | 'Logout'
  entityType: string
  entityId: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  req?: NextRequest
}): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: params.userId || null,
        userRole: params.userRole || '',
        userName: params.userName || '',
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        beforeJson: JSON.stringify(params.before || {}),
        afterJson: JSON.stringify(params.after || {}),
        ipAddress: params.req?.headers.get('x-forwarded-for') || '',
        userAgent: params.req?.headers.get('user-agent') || '',
      },
    })
  } catch {
    // Never let audit logging break business logic
  }
}
