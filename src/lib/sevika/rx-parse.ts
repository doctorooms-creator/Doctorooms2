/**
 * Sevika — AI Nurse: photo prescription parser (AI-NURSE-PLAN.md §2.1 + §2.4 #1).
 *
 * Server-only. ONE VLM call (z-ai-web-dev-sdk createVision) reads a paper-Rx
 * photo or medicine-strip photo and returns a DRAFT medicine list for the
 * patient to review. Nothing here writes to the DB — the patient must confirm
 * each row in the UI before schedules are created (doctor-confirm flow per plan).
 *
 * Safety rails:
 *  - The model is told to write "unreadable" rather than guess — and we drop
 *    any row whose name we cannot normalise (never invent medicines).
 *  - SOS / PRN items are returned as info rows (flagged, no slots) — the
 *    schedule engine itself only takes 1/0 slot flags.
 *  - Hard caps: max 12 medicines, duration ≤ 30 days, all strings trimmed.
 */

export interface ParsedMedicineDraft {
  name: string
  dose: string
  morning: number
  afternoon: number
  evening: number
  durationDays: number
  instructions: string
  isSos: boolean
}

export interface RxParseResult {
  ok: true
  medicines: ParsedMedicineDraft[]
  doctorName: string
  patientNote: string
}

export interface RxParseFailure {
  ok: false
  reason: string // human-readable Hinglish reason for the UI
}

let zaiPromise: Promise<typeof import('z-ai-web-dev-sdk').default> | null = null

async function getLLM() {
  if (!zaiPromise) {
    zaiPromise = (async () => {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      return ZAI.create()
    })()
  }
  return zaiPromise
}

// ─── Prompt ────────────────────────────────────────────────────────────────

function buildParsePrompt(): string {
  return [
    'You are "Sevika RX Lens" — an OCR engine inside an Indian patient app that reads photos of handwritten or printed prescriptions, and photos of medicine strips/bottles.',
    '',
    'EXTRACT RULES (follow exactly):',
    '1. For each medicine, output: name, dose (strength like 500mg + form like 1 tablet), frequency, duration in days, and any food/timing instruction.',
    '2. Decode frequency to slot flags: "1-0-1" → morning=1,afternoon=0,evening=1; "1-1-1"/"TDS" → all 1; "OD"/"1-0-0" → morning only; "0-0-1" → evening only; "BD"/"1-0-1" twice daily; "SOS"/"PRN"/"when needed" → isSos=true with all slots 0.',
    '3. If duration is not written, use 5. If instructions are not written, use "".',
    '4. If the name or frequency is unreadable, SKIP that medicine entirely — never guess. It is better to miss one row than to invent a wrong dose.',
    '5. If the photo is a medicine strip/bottle (not an Rx), extract just that one medicine from the printed label; duration 5, empty instructions.',
    '6. If the photo is NOT a prescription or medicine at all, return medicines:[] and note what the photo shows.',
    '7. No medical advice, no interpretation, no diagnosis. Extraction only.',
    '',
    'Reply with ONLY valid JSON, no markdown fences, EXACTLY this shape:',
    '{"doctorName":"","patientNote":"","medicines":[{"name":"","dose":"","morning":0,"afternoon":0,"evening":0,"durationDays":5,"instructions":"","isSos":false}]}',
    'patientNote = 1 short Hinglish line to show the patient (e.g. "Dr. Sharma ki prescription padh li" or "Label se ye medicine mili").',
  ].join('\n')
}

// ─── Response normalisation (defensive: never trust the model blindly) ─────

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10)
  if (!Number.isFinite(n)) return fallback
  return Math.min(Math.max(Math.round(n), min), max)
}

function normaliseMedicine(raw: Record<string, unknown>): ParsedMedicineDraft | null {
  const name = String(raw.name || '').trim()
  if (!name || name.length < 2) return null
  if (/unreadable|not clear|cannot read|indeterminate/i.test(name)) return null

  const isSos = raw.isSos === true || /sos|prn|when needed/i.test(String(raw.frequency || ''))

  let morning = clampInt(raw.morning, 0, 1, 0)
  let afternoon = clampInt(raw.afternoon, 0, 1, 0)
  let evening = clampInt(raw.evening, 0, 1, 0)

  // Frequency string fallback decode when flags are all zero but not SOS
  if (!isSos && morning + afternoon + evening === 0) {
    const freq = String(raw.frequency || '').toLowerCase()
    if (/tds|1-1-1|thrice|three times/.test(freq)) {
      morning = afternoon = evening = 1
    } else if (/bd|1-0-1|twice/.test(freq)) {
      morning = evening = 1
    } else if (/od|once|1-0-0|daily/.test(freq)) {
      morning = 1
    }
  }

  return {
    name: name.slice(0, 80),
    dose: String(raw.dose || '').trim().slice(0, 60),
    morning,
    afternoon,
    evening,
    durationDays: clampInt(raw.durationDays, 1, 30, 5),
    instructions: String(raw.instructions || '').trim().slice(0, 120),
    isSos: isSos && morning + afternoon + evening === 0,
  }
}

function extractJson(raw: string): { medicines: unknown[]; doctorName?: string; patientNote?: string } | null {
  try {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start === -1 || end === -1 || end <= start) return null
    const parsed = JSON.parse(cleaned.slice(start, end + 1))
    if (!Array.isArray(parsed.medicines)) return null
    return parsed
  } catch {
    return null
  }
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Parse a prescription / medicine-strip photo into a draft medicine list.
 * Returns RxParseFailure (never throws) so the route can 4xx gracefully.
 */
export async function parseRxPhoto(
  base64: string,
  mimeType: string
): Promise<RxParseResult | RxParseFailure> {
  if (!/^image\/(png|jpe?g|webp|heic|heif)$/i.test(mimeType)) {
    return { ok: false, reason: 'Ye photo format samajh nahi aaya — JPG ya PNG behtar hai.' }
  }
  // ~6MB base64 ceiling (≈4.5MB binary)
  if (base64.length > 6_000_000) {
    return { ok: false, reason: 'Photo bahut badi hai — thodi chhoti image try karein.' }
  }

  try {
    const zai = await getLLM()
    const completion = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: buildParsePrompt() },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
          ],
        },
      ],
      thinking: { type: 'disabled' },
    })

    const content = completion.choices[0]?.message?.content
    if (typeof content !== 'string' || !content.trim()) {
      return { ok: false, reason: 'Photo padhne me dikkat aayi — ek baar phir try karein.' }
    }

    const parsed = extractJson(content)
    if (!parsed) {
      return { ok: false, reason: 'Photo se dawaiyan padh nahi paayi — saaf photo phir se try karein.' }
    }

    const medicines = (parsed.medicines as Array<Record<string, unknown>>)
      .slice(0, 12)
      .map(normaliseMedicine)
      .filter((m): m is ParsedMedicineDraft => m !== null)

    if (medicines.length === 0) {
      return {
        ok: false,
        reason:
          parsed.patientNote ||
          'Is photo me koi dawai padh nahi payi. Prescription ya dawai ke packet ki photo try karein.',
      }
    }

    return {
      ok: true,
      medicines,
      doctorName: String(parsed.doctorName || '').trim().slice(0, 60),
      patientNote: String(parsed.patientNote || '').trim().slice(0, 120),
    }
  } catch {
    return { ok: false, reason: 'AI service abhi available nahi hai — thodi der baad try karein.' }
  }
}
