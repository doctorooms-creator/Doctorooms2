/**
 * Dr. Copilot — GUARD (RULE #1: Data Isolation)
 *
 * The ONLY way any copilot code obtains a doctor context. The doctorId is
 * resolved from the authenticated SESSION (never from request input), and
 * every repo function requires this ctx — making cross-doctor access a
 * compile-time impossibility rather than a runtime hope.
 *
 * Enforcement layers (see DR-COPILOT-PLAN.md):
 *   L1 session identity → this file
 *   L2 scoped repository → repo.ts (every query filters by ctx.doctorId)
 *   L3 context firewall → llm.ts (prompt only ever sees L2 output)
 *   L4 audit + leak tests → audit.ts + QA
 */

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'
import { todayISTStr } from '@/lib/date-utils'

export interface CopilotCtx {
  doctorId: string
  doctorUserId: string
  doctorName: string
  specialization: string
  fees: number
  todayIST: string
}

/**
 * Resolve the copilot context from the request session.
 * Returns null when the caller is not an authenticated doctor.
 *
 * NOTE: there is deliberately NO way to pass a doctorId in — callers
 * cannot impersonate another doctor even by accident.
 */
export async function getCtx(req: NextRequest): Promise<CopilotCtx | null> {
  const user = await requireRole(req, 'doctor')
  if (!user) return null

  const doctor = await db.doctor.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      specialization: true,
      fees: true,
    },
  })
  if (!doctor) return null

  return {
    doctorId: doctor.id,
    doctorUserId: user.id,
    doctorName: user.name,
    specialization: doctor.specialization || '',
    fees: doctor.fees || 0,
    todayIST: todayISTStr(),
  }
}

/** Hard cap on message length accepted from the client (DoS guard). */
export const MAX_MESSAGE_CHARS = 4000

/** Validate + normalize an incoming chat message. */
export function sanitizeMessage(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (trimmed.length > MAX_MESSAGE_CHARS) return trimmed.slice(0, MAX_MESSAGE_CHARS)
  return trimmed
}
