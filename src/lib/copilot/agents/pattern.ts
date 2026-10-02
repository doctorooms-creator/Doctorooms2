/**
 * Dr. Copilot — RX PATTERN AGENT (Phase D3)
 *
 * Learns recurring medicine combos from the doctor's OWN prescriptions
 * (scoped repo, last 180 days) and — when a combo repeats and is not already
 * covered by an existing Rx template — proposes saving it as a template via
 * the same approve-card mechanism as Phase B (kind: template_save).
 *
 * The AI never writes: the combo list is deterministic; the doctor approves;
 * /api/copilot/action/[id] creates the PrescriptionTemplate row.
 */

import { db } from '@/lib/db'
import * as repo from '../repo'
import type { CopilotCtx } from '../guard'
import { checkSafety } from './safety'
import type { CopilotActionCard, ActionPayload } from '../action-card'

export interface PatternData {
  agentName: 'pattern'
  dataBlock: string
  citations: string[]
  card: CopilotActionCard | null
}

export async function buildPattern(ctx: CopilotCtx, chatId: string | null): Promise<PatternData> {
  const [combos, templates] = await Promise.all([repo.medicineCombos(ctx, 180, 2), repo.existingTemplates(ctx)])

  if (combos.length === 0) {
    return {
      agentName: 'pattern',
      dataBlock: [
        'NO RECURRING PATTERNS YET.',
        'Analysed this doctor\'s prescriptions from the last 180 days: no exact medicine combo repeats 2+ times.',
        'Reply briefly: no repeating combo found yet — patterns (and template suggestions) appear once the same medicine set is used a couple of times.',
      ].join('\n'),
      citations: [],
      card: null,
    }
  }

  // Is a combo already covered by an existing template? (set-inclusion check)
  const covered = (meds: string[]) => {
    const set = meds.map((m) => m.toLowerCase())
    return templates.find((t) => {
      const tset = t.medicineNames
      return tset.length > 0 && set.every((m) => tset.includes(m))
    })
  }

  const lines: string[] = []
  lines.push(`PRESCRIBING PATTERNS for ${ctx.doctorName} (own prescriptions, last 180 days):`)
  lines.push('')

  let card: CopilotActionCard | null = null
  for (const c of combos) {
    const existing = covered(c.medicines)
    const share = `${c.count}× used${c.diagnosis ? `, usually for ${c.diagnosis}` : ''}, last ${c.lastUsed.toISOString().slice(0, 10)}`
    if (existing) {
      lines.push(`- ${c.medicines.join(' + ')} — ${share} → already covered by template "${existing.name}".`)
    } else if (!card && c.count >= 2) {
      // Propose the strongest uncovered combo ONCE per request
      card = await persistTemplateProposal(ctx, chatId, c)
      lines.push(`- ${c.medicines.join(' + ')} — ${share} → TEMPLATE PROPOSAL pending (see card).`)
      lines.push(
        `PROPOSED ACTION: save this combo as the Rx template "${card.patientName}" (pending doctor approval — you cannot save it yourself). Safety: ${card.safety.level}${card.safety.reasons.length ? ` — ${card.safety.reasons.join(' | ')}` : ''}.`
      )
    } else {
      lines.push(`- ${c.medicines.join(' + ')} — ${share}.`)
    }
  }

  const templateCount = templates.length
  lines.push('')
  lines.push(
    card
      ? `Present the patterns found (each combo + how often), then introduce the proposed template briefly: what it contains, how many times they already use it, and that it saves only after they tap Approve on the card. Under ~120 words.`
      : `All recurring combos are already covered by the doctor's ${templateCount} existing template(s). Present the patterns found (combo + frequency) and confirm nothing new to save. Under ~100 words.`
  )

  return { agentName: 'pattern', dataBlock: lines.join('\n'), citations: [], card }
}

// ─── Proposal persistence (mirrors agents/actions.ts prepareAction) ──────

async function persistTemplateProposal(
  ctx: CopilotCtx,
  chatId: string | null,
  combo: repo.MedCombo
): Promise<CopilotActionCard> {

  const templateName = `${combo.diagnosis ? combo.diagnosis.slice(0, 24) + ' — ' : ''}${combo.medicines.length}-drug combo`

  const payload: ActionPayload = {
    kind: 'template_save',
    // template proposals are patient-independent — placeholders, verified as such in the executor
    bookingId: '',
    appointmentNo: 'Rx pattern',
    patientName: 'Prescription template',
    patientMobile: '',
    patientAge: null,
    patientGender: null,
    patientUserId: '',
    disease: combo.diagnosis,
    medicines: combo.medicines.map((m) => ({ medicine: m, dose: '', morning: 0, afternoon: 0, evening: 0, tab: 0 })),
    notes: '',
    templateName,
    templateDiagnosis: combo.diagnosis,
    templateFollowUpDays: 7,
    templateUseCount: combo.count,
  }

  const safety = checkSafety({ kind: 'template_save', medicines: combo.medicines })

  const action = await db.copilotAction.create({
    data: {
      doctorId: ctx.doctorId,
      chatId,
      kind: 'template_save',
      payloadJson: JSON.stringify(payload),
      status: 'pending',
    },
  })

  return {
    id: action.id,
    kind: 'template_save',
    status: 'pending',
    patientName: templateName,
    appointmentNo: 'Rx pattern',
    summary: `Save template "${templateName}" — ${combo.medicines.length} medicine(s), already used ${combo.count}×`,
    items: combo.medicines,
    safety,
  }
}
