/**
 * POST /api/copilot/chat
 *
 * Streams a Dr. Copilot answer as Server-Sent Events:
 *   event: meta   → { agent, citations }
 *   event: delta  → { text }          (many)
 *   event: action → { card }          (Phase B — approve-card, if any)
 *   event: chart  → { chart }         (Phase D2 — analytics bar chart, if any)
 *   event: done   → { messageId }
 *   event: error  → { message }
 *
 * Isolation chain (RULE #1):
 *   L1 getCtx() resolves doctorId from the SESSION only
 *   L2 fetchData() / resolveScoped() run repo functions compiled with doctorId filter
 *   L3 buildSystemPrompt() only ever embeds the L2 data block
 *   L4 every exchange is persisted doctor-scoped + audit-logged
 *
 * Phase B (actions): the LLM only PROPOSES a structured draft; a pending
 * CopilotAction row is created and an approve-card is streamed to the panel.
 * No production table is ever written from this route — writes happen only
 * in /api/copilot/action/[id] after the doctor taps Approve.
 */

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getCtx, sanitizeMessage } from '@/lib/copilot/guard'
import { classifyIntent } from '@/lib/copilot/router'
import { fetchData } from '@/lib/copilot/agents/query'
import { buildSystemPrompt, streamChat, type LLMMessage } from '@/lib/copilot/llm'
import { extractActionDraft, resolveScoped, prepareAction } from '@/lib/copilot/agents/actions'
import { buildPreVisitBrief } from '@/lib/copilot/agents/brief'
import { buildAnalytics } from '@/lib/copilot/agents/analytics'
import { buildPattern } from '@/lib/copilot/agents/pattern'
import * as repo from '@/lib/copilot/repo'
import { auditCopilot } from '@/lib/copilot/agents/audit'
import type { CopilotActionCard, CopilotChart } from '@/lib/copilot/action-card'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const ctx = await getCtx(req)
  if (!ctx) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { message?: unknown }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const message = sanitizeMessage(body.message)
  if (!message) {
    return Response.json({ error: 'Message is required' }, { status: 400 })
  }

  const startedAt = Date.now()

  // Persist the user's message (doctor-scoped)
  const userRow = await repo.saveChatMessage(ctx, 'user', message, 'user', '{}')

  // Recent conversation for context (doctor-scoped)
  const historyRows = await repo.chatHistory(ctx, 12)
  const history: LLMMessage[] = historyRows.map((r) => ({
    role: r.role === 'assistant' ? 'assistant' : 'user',
    content: r.content,
  }))

  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      let fullText = ''
      let agentName = 'router'
      let citations: string[] = []
      let actionCard: CopilotActionCard | null = null
      let chartData: CopilotChart | null = null

      try {
        // Step 1: classify intent (fast LLM call or action fast-path)
        const intent = await classifyIntent(message, ctx)

        let dataBlock: string

        if (intent.intent === 'rx_pattern') {
          // ── Phase D3: prescribing pattern + optional template proposal ──
          agentName = 'pattern'
          const pattern = await buildPattern(ctx, userRow.id)
          dataBlock = pattern.dataBlock
          citations = pattern.citations
          actionCard = pattern.card
          send('meta', { agent: agentName, citations })
        } else if (intent.intent === 'action_request') {
          // ── Phase B: action proposal flow ─────────────────────────────
          agentName = 'action'
          const draft = await extractActionDraft(message)
          if (!draft) {
            dataBlock = [
              'The doctor asked for an action (prescription / lab order / follow-up) but the request could not be structured.',
              'Tell them politely what you can draft: a prescription (medicines + doses), a lab order (test names), or a follow-up (date), and which patient it is for. Ask them to rephrase with those details.',
            ].join('\n')
          } else {
            const resolved = await resolveScoped(ctx, draft)
            if (!resolved) {
              // Isolation: patient never treated by THIS doctor → not found
              dataBlock = [
                'RESULT: PATIENT NOT FOUND.',
                'No matching patient was found among THIS doctor\'s records (their bookings/prescriptions).',
                'Reply with ONLY a short not-found message: this patient is not in the doctor\'s own records, so no draft can be prepared. Never mention other doctors. Never list the medicines/tests from the message. Never invent a mobile number or patient details.',
              ].join('\n')
            } else {
              const prepared = await prepareAction(ctx, draft, userRow.id, resolved)
              actionCard = prepared.card
              dataBlock = prepared.dataBlock
              citations = [prepared.card.appointmentNo]
            }
          }
          send('meta', { agent: agentName, citations })
        } else {
          // ── Read-only flow (Phase A + D1/D2) ────────────────────────
          if (intent.intent === 'pre_visit_brief') {
            // Phase D1: deterministic pre-visit brief for the next patient
            const brief = await buildPreVisitBrief(ctx, intent)
            agentName = brief.agentName
            citations = brief.citations
            dataBlock = brief.dataBlock
            send('meta', { agent: agentName, citations })
          } else if (intent.intent === 'analytics') {
            // Phase D2: practice analytics + structured chart for the panel
            const analytics = await buildAnalytics(ctx)
            agentName = analytics.agentName
            citations = analytics.citations
            dataBlock = analytics.dataBlock
            chartData = analytics.chart
            send('meta', { agent: agentName, citations })
          } else {
            const fetched = await fetchData(ctx, intent)
            agentName = fetched.agentName
            citations = fetched.citations
            dataBlock = fetched.dataBlock
            send('meta', { agent: agentName, citations })
          }
        }

        // Step 3: stream the narrated answer (L3 firewall prompt).
        // One-shot clinical commands (actions, patient briefs, analytics,
        // patterns) get NO conversation history: they must narrate ONLY from
        // this turn's data block. Earlier turns contain other patient names/
        // numbers — letting them bleed into a patient brief is a clinical
        // hazard (QA caught exactly this during Phase D testing).
        const NO_HISTORY_INTENTS = new Set(['action_request', 'pre_visit_brief', 'analytics', 'rx_pattern'])
        const messages: LLMMessage[] = [
          { role: 'system', content: buildSystemPrompt(ctx, dataBlock) },
          ...(NO_HISTORY_INTENTS.has(intent.intent) ? [] : history.slice(0, -1)),
          { role: 'user', content: message },
        ]

        for await (const delta of streamChat(messages)) {
          fullText += delta
          send('delta', { text: delta })
        }

        if (!fullText.trim()) {
          fullText = 'Sorry — could not generate a reply. Please try again.'
          send('delta', { text: fullText })
        }

        // Phase B: stream the approve-card after the narration
        if (actionCard) {
          send('action', { card: actionCard })
        }

        // Phase D2: stream the analytics chart after the narration
        if (chartData) {
          send('chart', { chart: chartData })
        }

        // Persist the assistant reply with citations (+ card for history restore)
        const meta: Record<string, unknown> = {
          citations,
          intent: intent.intent,
          agent: agentName,
          latencyMs: Date.now() - startedAt,
        }
        if (actionCard) meta.actions = [actionCard]
        if (chartData) meta.chart = chartData
        const saved = await repo.saveChatMessage(ctx, 'assistant', fullText, agentName, JSON.stringify(meta))
        // Link the action row to the assistant message so a later Approve/Reject
        // can patch the card in history (keeps reload state accurate).
        if (actionCard) {
          await db.copilotAction.update({ where: { id: actionCard.id }, data: { chatId: saved.id } }).catch(() => {})
        }
        send('done', { messageId: saved.id, latencyMs: meta.latencyMs })
      } catch (err) {
        console.error('[copilot/chat] error:', err)
        send('error', { message: 'Copilot hit an error. Please try again.' })
        void auditCopilot(req, ctx, 'error', { message, error: String(err).slice(0, 300) })
      } finally {
        controller.close()
        void auditCopilot(req, ctx, 'chat', { latencyMs: Date.now() - startedAt })
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
