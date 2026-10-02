/**
 * DR Copilot — Orchestrator.
 * One turn of conversation: injection scan → route → scoped snapshot →
 * firewall prompt → streamed answer → citations → persistence → audit.
 *
 * The route layer owns the SSE transport; this module owns the pipeline and
 * calls `emit(event, data)` for each protocol frame.
 */

import { db } from '@/lib/db'
import { auditCopilot, buildFirewallPrompt, scanForInjection } from './guard'
import { buildSnapshot, buildAnswerPrompt } from './agents/query'
import { buildSummaryPrompt, capabilitiesAnswer } from './agents/summary'
import { route } from './agents/router'
import { resolveTarget, proposeDraft, type ResolvedTarget } from './agents/rx-draft'
import { createAction } from './actions'
import { chatStream } from './llm'
import { buildCitations } from './repo'
import type { CopilotCtx, CopilotCitation, CopilotIntent } from './types'

export type CopilotEvent =
  | { event: 'meta'; data: { intent: CopilotIntent; agent: string; loadedNote: string } }
  | { event: 'delta'; data: { text: string } }
  | { event: 'citations'; data: { citations: unknown[] } }
  | { event: 'action'; data: { actionId: string; kind: string; payload: Record<string, unknown>; safety: { findings: { severity: string; rule: string; message: string }[]; blocked: boolean } } }
  | { event: 'blocked'; data: { reason: string } }
  | { event: 'error'; data: { message: string } }
  | { event: 'done'; data: { chatId: string } }

type Emit = (e: CopilotEvent) => void

export async function runCopilot(ctx: CopilotCtx, message: string, emit: Emit): Promise<void> {
  const trimmed = message.trim().slice(0, 2000)

  // 0) L3 tripwire — block obvious injection / scope-escape attempts.
  const injectionHits = scanForInjection(trimmed)
  if (injectionHits.length > 0) {
    await auditCopilot({
      ctx,
      action: 'injection_blocked',
      description: `Blocked prompt-injection pattern(s) in chat message`,
      meta: { patterns: injectionHits, messageHead: trimmed.slice(0, 120) },
      severity: 'warning',
    })
    emit({ event: 'blocked', data: { reason: 'That request tries to change my instructions or leave your data scope, so I stopped it. Ask me about your own patients, appointments or prescriptions and I\'m all yours.' } })
    return
  }

  // 1) persist the user turn
  const userRow = await db.copilotChat.create({
    data: { doctorId: ctx.doctorId, role: 'user', content: trimmed },
  })

  // 2) route
  let routed
  try {
    routed = await route(ctx, trimmed)
  } catch (e) {
    console.error('[copilot] router failed:', e)
    routed = { intent: 'chitchat' as CopilotIntent, reason: 'router error fallback' }
  }

  // 3) capabilities → canned answer, no LLM, no data
  if (routed.intent === 'capabilities') {
    const text = capabilitiesAnswer(ctx)
    for (const chunk of chunkify(text)) emit({ event: 'delta', data: { text: chunk } })
    await finalize(ctx, userRow.id, routed.intent, 'query', text, [], emit)
    return
  }

  // 3.5) draft intents → approve-card flow (AI proposes, doctor approves)
  if (routed.intent === 'rx_draft' || routed.intent === 'followup') {
    await runDraftFlow(ctx, trimmed, routed, emit, userRow.id)
    return
  }


  // 4) scoped snapshot (L2) — this is ALL the data the model will see
  const snapshot = await buildSnapshot(ctx, routed)
  emit({
    event: 'meta',
    data: { intent: routed.intent, agent: routed.intent === 'summary' ? 'summary' : 'query', loadedNote: snapshot.loadedNote },
  })

  // 5) firewall prompt + recent history from THIS doctor's own chat
  const historyRows = await db.copilotChat.findMany({
    where: { doctorId: ctx.doctorId, createdAt: { lt: userRow.createdAt } },
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: { role: true, content: true },
  })
  const history = historyRows
    .reverse()
    .filter((h) => h.role === 'user' || h.role === 'assistant')
    .map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content.slice(0, 1500) }))

  const firewall = buildFirewallPrompt(ctx)
  const messages =
    routed.intent === 'summary'
      ? buildSummaryPrompt({ firewall, snapshot, history, question: trimmed })
      : buildAnswerPrompt({ firewall, snapshot, history, question: trimmed })

  // 6) stream the answer
  let full = ''
  try {
    for await (const delta of chatStream(messages, { temperature: 0.4 })) {
      full += delta
      emit({ event: 'delta', data: { text: delta } })
    }
  } catch (e) {
    console.error('[copilot] answer stream failed:', e)
    if (!full) {
      emit({ event: 'error', data: { message: 'I could not reach my language engine just now. Please try again in a moment.' } })
      return
    }
  }

  // 7) citations — re-verify ownership of the consulted booking ids
  const citations = await buildCitations(ctx, snapshot.bookingIds)
  if (citations.length > 0) emit({ event: 'citations', data: { citations } })

  // 8) persist + audit
  await finalize(ctx, userRow.id, routed.intent, routed.intent === 'summary' ? 'summary' : 'query', full || '(no answer)', citations, emit, snapshot.loadedNote)
}

async function finalize(
  ctx: CopilotCtx,
  userChatId: string,
  intent: CopilotIntent,
  agent: string,
  answer: string,
  citations: CopilotCitation[],
  emit: Emit,
  loadedNote?: string,
  actions?: string[]
) {
  const assistantRow = await db.copilotChat.create({
    data: {
      doctorId: ctx.doctorId,
      role: 'assistant',
      content: answer,
      agentName: agent,
      metaJson: JSON.stringify({ intent, citations, loadedNote, actions }),
    },
  })
  await auditCopilot({
    ctx,
    action: 'chat_answer',
    description: `Copilot answered "${intent}" intent`,
    meta: { userChatId, assistantChatId: assistantRow.id, agent, loadedNote, cited: citations.length, actions },
  })
  emit({ event: 'done', data: { chatId: assistantRow.id } })
}

// ─── Phase B: draft → approve-card flow ───────────────────────────────────

async function runDraftFlow(
  ctx: CopilotCtx,
  message: string,
  routed: { intent: CopilotIntent; query?: string },
  emit: Emit,
  userChatId: string
): Promise<void> {
  const isFollowup = routed.intent === 'followup'
  emit({ event: 'meta', data: { intent: routed.intent, agent: isFollowup ? 'followup' : 'rx-draft', loadedNote: 'your prescribing history' } })

  const target = await resolveTarget(ctx, routed.query)
  if ('askBack' in target) {
    const text = target.askBack
    for (const chunk of chunkify(text)) emit({ event: 'delta', data: { text: chunk } })
    await finalize(ctx, userChatId, routed.intent, isFollowup ? 'followup' : 'rx-draft', text, [], emit)
    return
  }

  if (isFollowup) {
    await runFollowupFlow(ctx, message, target, emit, userChatId)
    return
  }

  // rx draft
  const proposal = await proposeDraft(ctx, target, message)
  if ('error' in proposal) {
    const text = proposal.error
    for (const chunk of chunkify(text)) emit({ event: 'delta', data: { text: chunk } })
    await finalize(ctx, userChatId, routed.intent, 'rx-draft', text, [], emit)
    return
  }

  const actionId = await createAction({
    ctx,
    kind: 'rx_draft',
    payload: proposal.payload as unknown as Record<string, unknown>,
    safety: proposal.safety,
    chatId: userChatId,
  })

  const intro = [
    `Here's a **draft prescription** for **${target.patientName}** (${target.appointmentNo}${target.disease ? ` · ${target.disease}` : ''}),` +
      ` built from your own prescribing pattern:`,
    '',
    proposal.payload!.meds.map((m) => `• **${m.name}** — ${m.morning}-${m.afternoon}-${m.evening}${m.tab > 1 ? ` ×${m.tab}` : ''}${m.dose ? ` (${m.dose})` : ''}`).join('\n'),
    '',
    proposal.payload!.advice ? `Advice: ${proposal.payload!.advice}` : '',
    proposal.payload!.followUpDays ? `Follow-up: in ${proposal.payload!.followUpDays} days` : '',
    '',
    'Nothing is saved yet — review the card below and **Approve** to create it as a Draft in the EMR, or Reject to discard.',
  ].filter(Boolean).join('\n')

  for (const chunk of chunkify(intro)) emit({ event: 'delta', data: { text: chunk } })
  emit({ event: 'action', data: { actionId, kind: 'rx_draft', payload: proposal.payload as unknown as Record<string, unknown>, safety: proposal.safety! } })

  await finalize(ctx, userChatId, routed.intent, 'rx-draft', intro, [], emit, `${target.patientName} (${target.appointmentNo})`, [actionId])
}

async function runFollowupFlow(
  ctx: CopilotCtx,
  message: string,
  target: ResolvedTarget,
  emit: Emit,
  userChatId: string
): Promise<void> {
  if (!target.userId) {
    const text = 'This visit has no registered patient account, so I can\'t attach a follow-up to a prescription. You can set the next visit directly in the EMR.'
    for (const chunk of chunkify(text)) emit({ event: 'delta', data: { text: chunk } })
    await finalize(ctx, userChatId, 'followup', 'followup', text, [], emit)
    return
  }

  const history = await import('./repo').then((r) => r.getPatientHistory(ctx, target.userId!))
  const latestRx = history?.flatMap((v) => v.prescriptions)[0]
  if (!latestRx) {
    const text = `${target.patientName} has no prescription from you yet to attach a follow-up to. Draft one first (e.g. "draft a prescription for ${target.patientName}").`
    for (const chunk of chunkify(text)) emit({ event: 'delta', data: { text: chunk } })
    await finalize(ctx, userChatId, 'followup', 'followup', text, [], emit)
    return
  }

  const days = parseDays(message) ?? 14
  const payload = {
    prescriptionId: latestRx.id,
    bookingId: target.bookingId,
    appointmentNo: target.appointmentNo,
    patientName: target.patientName,
    followUpDays: days,
  }
  const actionId = await createAction({
    ctx,
    kind: 'followup',
    payload,
    safety: { findings: [], blocked: false },
    chatId: userChatId,
  })

  const date = new Date(Date.now() + days * 864e5).toISOString().slice(0, 10)
  const intro = `I'll set the next visit for **${target.patientName}** in **${days} days** (**${date}**) on the prescription from ${target.appointmentNo}. Approve below to save.`
  for (const chunk of chunkify(intro)) emit({ event: 'delta', data: { text: chunk } })
  emit({ event: 'action', data: { actionId, kind: 'followup', payload, safety: { findings: [], blocked: false } } })
  await finalize(ctx, userChatId, 'followup', 'followup', intro, [], emit, `${target.patientName} follow-up`, [actionId])
}

function parseDays(message: string): number | null {
  const m = message.toLowerCase().match(/(\d+)\s*(day|week|month|din|hafta|mahina)/)
  if (m) {
    const n = parseInt(m[1]!, 10)
    if (m[2] === 'week') return n * 7
    if (m[2] === 'month' || m[2] === 'mahina') return n * 30
    return n
  }
  if (/next week|agle hafte/.test(message.toLowerCase())) return 7
  if (/next month/.test(message.toLowerCase())) return 30
  if (/tomorrow|kal /.test(message.toLowerCase())) return 1
  return null
}

/** Split canned text into small deltas so the UI types it out consistently. */
function* chunkify(text: string): Generator<string> {
  const parts = text.match(/[\s\S]{1,24}/g) ?? []
  for (const p of parts) yield p
}
