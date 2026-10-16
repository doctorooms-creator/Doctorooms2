/**
 * Sevika — AI Nurse: diet layer (AI-NURSE-PLAN.md §2.4 touchpoint #2).
 *
 * ONE LLM call (via the app-wide provider: SDK in sandbox, OpenAI-compatible
 * public provider in production) generates a 7-day Indian diet card grounded
 * in the patient's ACTIVE medicine list. The output is structured JSON
 * stored in SevikaDietPlan.planJson.
 *
 * Safety rails (from the plan):
 *  - The LLM only SUGGESTS food; it never mentions dose changes.
 *  - Every plan carries a "consult your doctor" disclaimer.
 *  - Deterministic fallback plan if the LLM fails (feature degrades, never breaks).
 */

import { db } from '@/lib/db'
import { completeChat } from '@/lib/ai/provider'

export interface DietDay {
  morning: string
  breakfast: string
  lunch: string
  evening: string
  dinner: string
  note?: string
}

export interface DietPlanData {
  summary: string
  disclaimer: string
  days: DietDay[]
  fallback?: boolean
}

const DISCLAIMER =
  'Ye AI-suggested diet hai — apne doctor se confirm karke follow karein. Koi bhi allergy ho to wo item avoid karein.'

const FALLBACK_PLAN: DietPlanData = {
  summary:
    'Aapki dawaiyon ke saath halka, ghar ka khana aur khoob paani behtar rehta hai. (Default plan — AI abhi unavailable hai.)',
  disclaimer: DISCLAIMER,
  days: Array.from({ length: 7 }, () => ({
    morning: '1 glass gunguna paani + 5 bheege badam',
    breakfast: 'Poha / upma / daliya + 1 cup doodh (low sugar)',
    lunch: '2 roti + dal + sabzi + salad + dahi',
    evening: '1 fruit (apple / papaya) + green tea',
    dinner: '1-2 roti / khichdi + halki sabzi (8 baje se pehle)',
    note: 'Din me 8-10 glass paani; dawai hamesha doctor ke bataye time pe.',
  })),
  fallback: true,
}

function buildDietPrompt(medicines: string[], patientName: string): string {
  return [
    'You are "Sevika", a warm Indian nurse-nutritionist inside a patient app (AturSeva/Doctorooms).',
    'Create a simple 7-day Indian diet plan that is SAFE to eat alongside the patient\'s current medicines.',
    '',
    `PATIENT: ${patientName}`,
    `CURRENT MEDICINES: ${medicines.join(', ')}`,
    '',
    'RULES:',
    '1. Common-sense Indian ghar-ka-khana only (poha, daliya, khichdi, dal, roti, sabzi, dahi, fruits). No exotic/diet-fad items.',
    '2. If a medicine is a common antibiotic/painkiller/antacid/BP-sugar medicine, add the usual food caution (e.g. dairy gap with some antibiotics, low salt with BP meds, low sugar with diabetes meds) — but WITHOUT naming specific drug interactions clinically. Keep it nurse-level, general.',
    '3. NEVER suggest changing medicine dose/timing. Diet only.',
    '4. Hinglish food names, short lines. Each meal line ≤ 12 words.',
    '5. Reply with ONLY valid JSON, no markdown fences, in EXACTLY this shape:',
    '{"summary":"2-line Hindi/Hinglish summary","days":[{"morning":"","breakfast":"","lunch":"","evening":"","dinner":"","note":""}]}',
    '"days" MUST contain exactly 7 items (Monday→Sunday order).',
  ].join('\n')
}

function extractJson(raw: string): DietPlanData | null {
  try {
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start === -1 || end === -1 || end <= start) return null
    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as {
      summary?: string
      days?: DietDay[]
    }
    if (!Array.isArray(parsed.days) || parsed.days.length === 0) return null
    const days = parsed.days.slice(0, 7).map((d) => ({
      morning: String(d.morning || ''),
      breakfast: String(d.breakfast || ''),
      lunch: String(d.lunch || ''),
      evening: String(d.evening || ''),
      dinner: String(d.dinner || ''),
      note: d.note ? String(d.note) : undefined,
    }))
    return {
      summary: String(parsed.summary || 'Aapke medicines ke hisaab se 7-din ka diet plan.'),
      disclaimer: DISCLAIMER,
      days,
    }
  } catch {
    return null
  }
}

export interface GenerateDietResult {
  planId: string
  plan: DietPlanData
  usedFallback: boolean
}

/**
 * Generates (or regenerates) the patient's diet plan from their ACTIVE
 * medicine schedules. One LLM call; falls back to the default plan on failure.
 */
export async function generateDietPlan(userId: string): Promise<GenerateDietResult> {
  const [schedules, user] = await Promise.all([
    db.sevikaSchedule.findMany({
      where: { userId, status: 'Active' },
      select: { medicineName: true, instructions: true },
      take: 15,
    }),
    db.user.findUnique({ where: { id: userId }, select: { name: true } }),
  ])

  const medicines = schedules.map((s) => s.medicineName)
  const medicinesSummary =
    medicines.length > 0 ? medicines.join(', ') : 'koi active medicine nahi (general wellness)'

  let plan: DietPlanData
  let usedFallback = false

  if (medicines.length === 0 && (await hasPlan(userId))) {
    // No active meds + existing plan → keep it simple: still regenerate wellness plan
  }

  try {
    const content = await completeChat([
      {
        role: 'system',
        content:
          'You are Sevika, a caring Indian nurse. You output ONLY valid JSON diet plans. You never give medical dosing advice.',
      },
      { role: 'user', content: buildDietPrompt(medicines, user?.name || 'Patient') },
    ])
    const parsed = typeof content === 'string' ? extractJson(content) : null
    if (parsed) {
      plan = parsed
    } else {
      plan = FALLBACK_PLAN
      usedFallback = true
    }
  } catch {
    plan = FALLBACK_PLAN
    usedFallback = true
  }

  const row = await db.sevikaDietPlan.create({
    data: {
      userId,
      medicinesSummary,
      planJson: JSON.stringify(plan),
      aiGenerated: !usedFallback,
    },
  })

  return { planId: row.id, plan, usedFallback }
}

async function hasPlan(userId: string): Promise<boolean> {
  const count = await db.sevikaDietPlan.count({ where: { userId } })
  return count > 0
}

/** Latest diet plan for the patient (or null if never generated). */
export async function getLatestDietPlan(
  userId: string
): Promise<{ planId: string; medicinesSummary: string; plan: DietPlanData; createdAt: Date } | null> {
  const row = await db.sevikaDietPlan.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  if (!row) return null
  let plan: DietPlanData
  try {
    plan = JSON.parse(row.planJson) as DietPlanData
    if (!Array.isArray(plan.days)) throw new Error('bad')
  } catch {
    plan = FALLBACK_PLAN
  }
  return { planId: row.id, medicinesSummary: row.medicinesSummary, plan, createdAt: row.createdAt }
}
