/**
 * GET /api/copilot/threads
 * Doctor-scoped Studio thread list for the workspace left rail.
 * (Quick panel keeps the legacy "" thread and never calls this.)
 */
import { NextRequest } from 'next/server'
import { getCtx } from '@/lib/copilot/guard'
import * as repo from '@/lib/copilot/repo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const ctx = await getCtx(req)
  if (!ctx) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const threads = await repo.threadList(ctx, 15)
  return Response.json({ threads })
}
