/**
 * Sevika — AI Nurse: context-grounded chat (P3).
 *
 * Server-only. Mirrors the Dr. Copilot "context firewall" pattern
 * (src/lib/copilot/llm.ts) but for the PATIENT side:
 *   L1  userId resolved from the session (API route) — never client-supplied
 *   L2  buildSevikaContext() compiles a data block from THIS patient's own
 *       Sevika rows only (medicines, today's doses, adherence, diet)
 *   L3  the system prompt bakes in the isolation + safety rules: the model is
 *       told it has NO data beyond the block, must never propose dose
 *       changes, and must always defer clinical decisions to the doctor.
 *
 * Conversation history lives on the CLIENT and is echoed back per request
 * (bounded + sanitised by the route) — no chat table in P3.
 */

import { db } from '@/lib/db'
import { nowIST, todayISTRange } from '@/lib/date-utils'
import { computeAdherence, getSlotTimes, SLOT_LABELS } from '@/lib/sevika/schedule'
import { getLatestDietPlan } from '@/lib/sevika/diet'

export interface SevikaChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// ─── L2: scoped context block ──────────────────────────────────────────────

export interface SevikaChatContext {
  patientName: string
  dataBlock: string
}

/**
 * Compiles the patient's ENTIRE Sevika state into one flat data block.
 * This is the ONLY thing the LLM ever sees (plus the chat history).
 */
export async function buildSevikaContext(userId: string): Promise<SevikaChatContext> {
  const { start, end } = todayISTRange()
  const since48h = new Date(Date.now() - 48 * 60 * 60 * 1000)

  const [user, schedules, todayDoses, adherence, diet, slotTimes, recentMissed, nextDose] =
    await Promise.all([
      db.user.findUnique({ where: { id: userId }, select: { name: true } }),
      db.sevikaSchedule.findMany({
        where: { userId, status: 'Active' },
        select: {
          medicineName: true,
          dose: true,
          instructions: true,
          morning: true,
          afternoon: true,
          evening: true,
          startDate: true,
          durationDays: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
      db.sevikaDose.findMany({
        where: { userId, dueAt: { gte: start, lte: end } },
        include: { schedule: { select: { medicineName: true, dose: true } } },
        orderBy: { dueAt: 'asc' },
        take: 30,
      }),
      computeAdherence(userId),
      getLatestDietPlan(userId),
      getSlotTimes(userId),
      db.sevikaDose.findMany({
        where: {
          userId,
          dueAt: { gte: since48h, lte: end },
          status: { in: ['Missed', 'Skipped'] },
        },
        include: { schedule: { select: { medicineName: true } } },
        orderBy: { dueAt: 'desc' },
        take: 10,
      }),
      db.sevikaDose.findFirst({
        where: { userId, dueAt: { gte: new Date() }, status: { in: ['Pending', 'Reminded', 'Snoozed'] } },
        include: { schedule: { select: { medicineName: true, dose: true } } },
        orderBy: { dueAt: 'asc' },
      }),
    ])

  const lines: string[] = []
  lines.push(`PATIENT: ${user?.name || 'Patient'}`)
  lines.push(
    `REMINDER TIMES (personalised): subah ${slotTimes.morning}, dopahar ${slotTimes.afternoon}, raat ${slotTimes.evening}`
  )
  lines.push('')

  // Active medicines
  if (schedules.length === 0) {
    lines.push('ACTIVE MEDICINES: koi active course nahi hai.')
  } else {
    lines.push(`ACTIVE MEDICINES (${schedules.length}):`)
    schedules.forEach((s) => {
      const slots = [
        s.morning ? 'subah' : '',
        s.afternoon ? 'dopahar' : '',
        s.evening ? 'raat' : '',
      ]
        .filter(Boolean)
        .join('-')
      const remaining = Math.max(
        0,
        Math.ceil(
          (new Date(s.startDate).getTime() + s.durationDays * 86400000 - Date.now()) / 86400000
        )
      )
      lines.push(
        `- ${s.medicineName}${s.dose ? ` (${s.dose})` : ''} — ${slots}, ~${remaining} din bache${
          s.instructions ? `; instructions: ${s.instructions}` : ''
        }`
      )
    })
  }
  lines.push('')

  // Today's doses
  const statusHi: Record<string, string> = {
    Taken: 'Le Li ✓',
    Missed: 'Miss',
    Skipped: 'Skip kiya',
    Reminded: 'Yaad dilaya, baaki hai',
    Snoozed: 'Snooze kiya, baaki hai',
    Pending: 'Baaki',
  }
  if (todayDoses.length === 0) {
    lines.push("TODAY'S DOSES: aaj koi dose schedule nahi hai.")
  } else {
    lines.push(`TODAY'S DOSES (${todayDoses.length}):`)
    for (const d of todayDoses) {
      const hhmm = new Date(d.dueAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata',
      })
      lines.push(`- ${hhmm} ${d.schedule.medicineName}${d.schedule.dose ? ` (${d.schedule.dose})` : ''} — ${statusHi[d.status] || d.status}`)
    }
  }
  lines.push('')

  // Adherence
  lines.push(
    `ADHERENCE: aaj ${adherence.todayTaken}/${adherence.todayTotal} le li; last 7 din score ${adherence.scorePct}%; streak ${adherence.streakDays} din; pichhle 48 ghante me ${recentMissed.length} dose miss/skip hui.`
  )

  if (recentMissed.length > 0) {
    lines.push('RECENT MISSES (48h):')
    for (const d of recentMissed) {
      lines.push(`- ${d.schedule.medicineName} (${d.status})`)
    }
    lines.push(
      'CATCH-UP RULE: 2 ghante ke andar wali miss hui dose patient abhi "Le Li" kar sakta hai (app me option hai).'
    )
  }

  if (nextDose) {
    const hhmm = new Date(nextDose.dueAt).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    })
    lines.push(`NEXT DOSE: ${hhmm} ${nextDose.schedule.medicineName}`)
  }

  // Diet plan
  if (diet) {
    lines.push('')
    lines.push(
      `DIET PLAN (latest, ${diet.plan.fallback ? 'default' : 'AI-generated'}): ${diet.plan.summary} Disclaimer: doctor se confirm karke follow karein.`
    )
  }

  return { patientName: user?.name || 'Patient', dataBlock: lines.join('\n') }
}

// ─── L3: system prompt (persona + hard safety rails) ──────────────────────

export function buildSevikaSystemPrompt(patientName: string, dataBlock: string): string {
  const today = nowIST().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Kolkata',
  })
  return [
    'You are "Sevika" — a warm, experienced Indian nurse inside the patient\u2019s own health app (AturSeva/Doctorooms). You chat with THE PATIENT directly.',
    '',
    'HARD RULES (never break these):',
    '1. You can ONLY use facts present in the DATA BLOCK below. You have no database access of your own. If something is not in the block, say you don\u2019t have that in today\u2019s records — never invent medicines, times, or counts.',
    '2. You NEVER suggest starting, stopping, or changing any medicine or dose. Those decisions belong to their doctor. If asked, say: "Ye aapke doctor se poochhna zaroori hai — main dose change nahi kar sakti."',
    '3. You NEVER diagnose. If the patient describes symptoms, be empathetic, suggest basic self-care only when it is common-sense (rest, water, light food), and gently say their doctor (or a video consult) is the right next step.',
    '4. Missed dose? No guilt-tripping, ever. Be supportive — "der se lene me bhi faida hai" — and mention the 2-hour catch-up option when a recent miss is in the DATA BLOCK.',
    '5. Diet talk is nurse-nutritionist level: ghar-ka-khana, hydration, light meals. Same rule as diet plans — no clinical drug-interaction claims, no dose advice.',
    '6. Celebrate adherence wins warmly (streaks, good score) — you are proud of them.',
    '',
    `PATIENT: ${patientName}. Aaj (IST) ${today} hai.`,
    '',
    'LANGUAGE: Reply in the same language the patient writes — natural Hinglish by default (Roman script), pure English if they write English. Keep medicine names in English.',
    '',
    'FORMAT: 2–4 short lines, warm and personal like a caring nurse. One tiny bullet list ONLY when listing today\u2019s medicines. Use at most 1 emoji. Never say you are an AI model; you are Sevika.',
    '',
    '─── DATA BLOCK (your ONLY source of truth) ───',
    dataBlock || '(no data available today)',
    '─── END DATA BLOCK ───',
  ].join('\n')
}

// ─── LLM plumbing (delegates to the app-wide provider: SDK in sandbox,
// OpenAI-compatible public provider on production — same delta shape) ─────

import { streamChatCompletion } from '@/lib/ai/provider'

/**
 * Streaming completion — yields text deltas.
 */
export async function* streamSevikaChat(
  messages: SevikaChatMessage[]
): AsyncGenerator<string> {
  yield* streamChatCompletion(messages)
}
