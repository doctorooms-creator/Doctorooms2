import { NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { buildAtursevaContext, buildGreeting } from '@/lib/aturseva/context'
import { buildAtursevaSystemPrompt, runAtursevaTurn, type AtursevaLLMMessage } from '@/lib/aturseva/agent'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const bodySchema = z.object({
  message: z.string().min(1, 'Kuch likhiye to sahi 🩺').max(1000),
})

// ─── helpers ────────────────────────────────────────────────────────────────

async function getOrCreateConversation(userId: string) {
  return db.atursevaConversation.upsert({
    where: { userId },
    create: { userId },
    update: {},
  })
}

interface SerializedMessage {
  id: string
  role: 'user' | 'aturseva' | 'action'
  content: string
  actionJson?: { type: string; title: string; data: Record<string, unknown> }
  createdAt: string
}

function serialize(
  rows: { id: string; role: string; content: string; actionType: string | null; actionJson: string | null; createdAt: Date }[]
): SerializedMessage[] {
  return rows.map((r) => {
    let action: { type: string; title: string; data: Record<string, unknown> } | undefined
    if (r.actionType && r.actionJson) {
      const parsed = safeParse(r.actionJson)
      action = {
        type: r.actionType,
        title: typeof parsed.title === 'string' ? parsed.title : '',
        data:
          parsed.data && typeof parsed.data === 'object'
            ? (parsed.data as Record<string, unknown>)
            : parsed,
      }
    }
    return {
      id: r.id,
      role: r.role as SerializedMessage['role'],
      content: r.content,
      actionJson: action,
      createdAt: r.createdAt.toISOString(),
    }
  })
}

function safeParse(json: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(json)
    return typeof parsed === 'object' && parsed ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

// ─── GET: history + greeting (empty thread) ─────────────────────────────────

export async function GET(req: NextRequest) {
  const user = await requireRole(req, 'patient')
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const conversation = await db.atursevaConversation.findUnique({
    where: { userId: user.id },
    include: {
      messages: { orderBy: { createdAt: 'asc' }, take: 200 },
    },
  })

  const messages = conversation ? serialize(conversation.messages) : []
  let greeting: string | null = null
  if (messages.length === 0) {
    const ctx = await buildAtursevaContext(user.id)
    greeting = buildGreeting(ctx.patientName, ctx.dataBlock)
  }

  return Response.json({ success: true, sessionExists: !!conversation, greeting, messages })
}

// ─── DELETE: clear thread ───────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const user = await requireRole(req, 'patient')
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  await db.atursevaConversation.deleteMany({ where: { userId: user.id } })
  return Response.json({ success: true })
}

// ─── POST: one agent turn (SSE) ─────────────────────────────────────────────

/**
 * SSE events:
 *   delta  { text }                    — many
 *   action { id, type, title, data }  — 0..2 per turn (rich card)
 *   done   { messageId }
 *   error  { message }
 *
 * Persistence contract: the user message is saved BEFORE the stream starts;
 * action rows and the final reply are saved as they complete — so a dropped
 * connection still leaves a coherent thread (the reply may be partial).
 */
export async function POST(req: NextRequest) {
  const user = await requireRole(req, 'patient')
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message || 'Validation failed' },
      { status: 422 }
    )
  }

  const { message } = parsed.data

  // Persist the user message first (coherent even if the stream dies).
  const conversation = await getOrCreateConversation(user.id)
  const userMsg = await db.atursevaMessage.create({
    data: { conversationId: conversation.id, role: 'user', content: message },
  })
  await db.atursevaConversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  })

  // Fresh context (L2) + history window (last 12 turns from DB — no client echo).
  const [ctx, historyRows] = await Promise.all([
    buildAtursevaContext(user.id),
    db.atursevaMessage.findMany({
      where: { conversationId: conversation.id, role: { in: ['user', 'aturseva'] } },
      orderBy: { createdAt: 'desc' },
      take: 24, // ~12 turns
    }),
  ])

  const historyMessages: AtursevaLLMMessage[] = historyRows
    .reverse()
    .filter((r) => r.id !== userMsg.id) // this turn's message is appended below
    .slice(-23) // keep the most recent turns
    .map((r) => ({ role: r.role === 'user' ? 'user' : 'assistant', content: r.content }))

  const llmMessages: AtursevaLLMMessage[] = [
    { role: 'system', content: buildAtursevaSystemPrompt(ctx.patientName, ctx.dataBlock) },
    ...historyMessages,
    { role: 'user', content: message },
  ]

  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const { reply, actions } = await runAtursevaTurn(llmMessages, user.id, {
          delta: (text) => send('delta', { text }),
          action: (a) => send('action', { id: a.id, type: a.type, title: a.title, data: a.data }),
        })

        // Persist action rows (before the reply, matching emission order).
        for (const a of actions) {
          await db.atursevaMessage.create({
            data: {
              conversationId: conversation.id,
              role: 'action',
              content: '',
              actionType: a.type,
              actionJson: JSON.stringify({ title: a.title, data: a.data }),
            },
          })
        }

        let replyId: string | undefined
        if (reply.trim()) {
          const saved = await db.atursevaMessage.create({
            data: { conversationId: conversation.id, role: 'aturseva', content: reply.trim() },
          })
          replyId = saved.id
        }
        await db.atursevaConversation.update({
          where: { id: conversation.id },
          data: { updatedAt: new Date() },
        })

        send('done', { messageId: replyId || null })
      } catch (err) {
        console.error('[aturseva/chat] error:', err)
        const fallback =
          'Aturseva abhi jawab nahi de pa rahi — thodi der baad try kariye. 🩺'
        send('error', { message: fallback })
        // Persist the failure as the reply so the thread stays visually paired
        // (user question → aturseva response) even on a failed turn.
        try {
          await db.atursevaMessage.create({
            data: { conversationId: conversation.id, role: 'aturseva', content: fallback },
          })
        } catch {
          // persistence failure must not mask the original error
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
