/**
 * Audit log context helper — extracts IP + UA from any NextRequest.
 *
 * SECURITY (P1.15): All audit log entries should include the requesting
 * IP + User-Agent so admins can attribute actions to specific devices +
 * investigate suspicious activity.
 *
 * Usage:
 *   import { getAuditContext } from '@/lib/audit-context'
 *
 *   const auditCtx = getAuditContext(req)
 *   await logCreate('booking', booking.id, user, description, after, { ...auditCtx })
 */

import type { NextRequest } from 'next/server'

export interface AuditContext {
  ipAddress: string
  userAgent: string
}

/**
 * Extract audit-relevant context from a NextRequest.
 */
export function getAuditContext(req: NextRequest): AuditContext {
  const xff = req.headers.get('x-forwarded-for')
  const ip = xff
    ? xff.split(',')[0].trim()
    : (req.headers.get('x-real-ip') || 'unknown')

  return {
    ipAddress: ip,
    userAgent: req.headers.get('user-agent') || '',
  }
}
