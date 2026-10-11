import { NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { requireRole } from '@/lib/api-auth'
import {
  buildSevikaContext,
  buildSevikaSystemPrompt,
  streamSevikaChat,
  type SevikaChatMessage,
} from '@/lib/sevika/chat'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const historySchema = z
  .array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(1200),
    })
  )
  .max(8)

const bodySchema = z.object({
  message: z.string().min(1, 'Kuch likhiye to sahi 🩺').max(1000),
  history: historySchema.optional().default([]),
})

/**
 * POST /api/dashboard/patient/sevika/chat
 * Streams a Sevika answer as Server-Sent Events:
 *   event: delta  → { text }   (many)
 *   event: done   → { }
 *   event: error  → { message }
 *
 * Context firewall (same shape as Dr. Copilot, patient edition):
 *   L1 userId from the session only
 *   L2 buildSevikaContext() compiles THIS patient's own Sevika state
 *   L3 the system prompt embeds only that block + nurse safety rails
 *
 * History is echoed by the client (bounded to 8 turns, sanitised above) —
 * the DATA BLOCK is rebuilt fresh server-side on every call, so answers
 * stay correct even right after the patient marks a dose.
 */
export async function POST(req: NextRequest) {
  const user = await requireRole(req, 'patient')
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

  const { message, history } = parsed.data

  // L2: fresh context block for THIS patient (meds, doses, adherence, diet)
  const ctx = await buildSevikaContext(user.id)

  const messages: SevikaChatMessage[] = [
    { role: 'system', content: buildSevikaSystemPrompt(ctx.patientName, ctx.dataBlock) },
    ...history,
    { role: 'user', content: message },
  ]

  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      let fullText = ''
      try {
        for await (const delta of streamSevikaChat(messages)) {
          fullText += delta
          send('delta', { text: delta })
        }

        if (!fullText.trim()) {
          fullText = 'Ek minute — thoda dikkat aayi. Dobara try kariye. 🩺'
          send('delta', { text: fullText })
        }
        send('done', {})
      } catch (err) {
        console.error('[sevika/chat] error:', err)
        send('error', { message: 'Sevika abhi jawab nahi de pa rahi — thodi der baad try kariye. 🩺' })
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
