/**
 * GET /api/copilot/history?limit=40
 * Doctor-scoped copilot chat history (RULE #1: where doctorId = session).
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

  const { searchParams } = new URL(req.url)
  const limitParam = Number(searchParams.get('limit'))
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 40

  const messages = await repo.chatHistory(ctx, limit)
  return Response.json({
    messages: messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      agentName: m.agentName,
      meta: safeParse(m.metaJson),
      createdAt: m.createdAt.toISOString(),
    })),
  })
}

function safeParse(s: string): Record<string, unknown> {
  try {
    return JSON.parse(s)
  } catch {
    return {}
  }
}
