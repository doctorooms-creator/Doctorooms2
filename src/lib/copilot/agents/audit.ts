/**
 * Dr. Copilot — Audit (L4)
 * Best-effort audit trail; never throws into the request path.
 */
import { logAudit } from '@/lib/audit'
import type { NextRequest } from 'next/server'
import type { CopilotCtx } from '../guard'

export async function auditCopilot(
  req: NextRequest,
  ctx: CopilotCtx,
  event: 'chat' | 'error' | 'action_approved' | 'action_rejected' | 'action_error',
  detail: Record<string, unknown>
) {
  try {
    await logAudit({
      userId: ctx.doctorUserId,
      userRole: 'doctor',
      userName: ctx.doctorName,
      action: 'View',
      entityType: 'copilot',
      entityId: ctx.doctorId,
      after: { event, ...detail },
      req,
    })
  } catch {
    // audit must never break the chat flow
  }
}
