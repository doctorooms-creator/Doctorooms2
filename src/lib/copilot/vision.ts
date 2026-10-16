/**
 * Dr. Copilot — VISION layer (Phase E)
 *
 * Server-only wrappers for:
 *   1. Report Lens   — vision extraction of medical report images
 *                      uploaded by the doctor (lab reports, X-rays, old rx photos)
 *   2. Illustrations — image generation for the Patient Educator mode
 *
 * All model I/O is delegated to the app-wide provider layer
 * (`@/lib/ai/provider`): z-ai-web-dev-sdk in the sandbox, any
 * OpenAI-compatible public provider (LLM_/IMG_ env vars) in production.
 *
 * RULE #1 (data isolation) is preserved here:
 *   - The VLM only ever sees images the SESSION doctor uploaded (verified by
 *     the attachment route before this module is called).
 *   - Patient context merged into the data block comes exclusively from the
 *     scoped repo (L2), never from the image itself.
 *   - Output is plain text (the extraction) which is embedded into the same
 *     firewall data block as every other agent — the LLM cannot tell the
 *     difference, so the L3 rules apply unchanged.
 */

import type { CopilotCtx } from './guard'
import { visionCompletion, generateImage } from '@/lib/ai/provider'

const MAX_IMAGES_PER_REQUEST = 4

export interface ReportImage {
  attachmentId: string
  base64: string
  mimeType: string
}

/**
 * Extract structured content from uploaded medical report images.
 * Returns a markdown data block with one section per image.
 */
export async function extractReports(ctx: CopilotCtx, images: ReportImage[]): Promise<string> {
  const limited = images.slice(0, MAX_IMAGES_PER_REQUEST)
  if (limited.length === 0) return ''

  const extractionPrompt = [
    'You are "Report Lens" — a medical document OCR + extraction engine inside a hospital app.',
    'The doctor uploaded report images. For EACH image, extract what is readable. Follow these rules exactly:',
    '',
    '1. If it is a LAB REPORT: produce a markdown table with columns Test | Value | Unit | Ref Range | Flag.',
    '   Mark Flag as "H" or "L" ONLY when the printed reference range clearly supports it; otherwise "—".',
    '2. If it is a PRESCRIPTION: list medicines with dose/frequency exactly as printed.',
    '3. If it is an IMAGING report / X-ray / scan report: list the printed findings verbatim.',
    '4. Always include (when printed): patient name, age/sex, date, lab/hospital name, sample ID.',
    '5. DO NOT interpret, diagnose, advise or add any medical opinion. Extraction only.',
    '6. If the image is not a medical document, say in one line what it shows instead.',
    '7. If a value is unreadable, write "unreadable" — never guess or invent values.',
    '',
    'Format per image: "### Image N: <document type>" then the table/list.',
  ].join('\n')

  const content: Array<
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string } }
  > = [{ type: 'text', text: extractionPrompt }]

  for (const img of limited) {
    content.push({ type: 'text', text: `Image (attachment ${img.attachmentId}):` })
    content.push({ type: 'image_url', image_url: { url: `data:${img.mimeType};base64,${img.base64}` } })
  }

  const text = await visionCompletion([{ role: 'user', content }])
  return typeof text === 'string' ? text.trim() : ''
}

/**
 * Build the Report Lens data block: VLM extraction + optional scoped patient
 * context (when the doctor's message mentions a mobile number of one of
 * THEIR patients) so trends/history can be compared in the narration.
 */
export async function buildReportDataBlock(
  ctx: CopilotCtx,
  message: string,
  images: ReportImage[],
  patientContext: string | null
): Promise<{ dataBlock: string; extractionFailed: boolean }> {
  let extraction = ''
  try {
    extraction = await extractReports(ctx, images)
  } catch (err) {
    console.error('[copilot/vision] extraction failed:', err)
    return {
      dataBlock: [
        'The uploaded report image(s) could not be read (vision service error).',
        'Tell the doctor the images could not be analyzed and ask them to retry with a clearer photo.',
      ].join('\n'),
      extractionFailed: true,
    }
  }

  const parts: string[] = [
    'REPORT LENS — EXTRACTED CONTENT (from images the doctor uploaded):',
    extraction || '(nothing readable was extracted)',
  ]

  if (patientContext) {
    parts.push('', 'PATIENT CONTEXT (this doctor\'s own records, if relevant):', patientContext)
  }

  parts.push(
    '',
    'The doctor asked:',
    `"${message}"`,
    '',
    'Answer using ONLY the extracted content + patient context above. You may highlight abnormal values (H/L),',
    'summarise what the report shows, and mention the doctor\'s own history for the patient when the context block has it.',
    'Do NOT invent values, ranges or diagnoses. Keep it short and scannable.'
  )

  return { dataBlock: parts.join('\n'), extractionFailed: false }
}

/**
 * Patient Educator — generate a medical illustration.
 * Returns raw base64 PNG; the caller saves it as a 'generated' attachment.
 */
export async function generateIllustration(
  prompt: string
): Promise<{ base64: string } | null> {
  const safePrompt = [
    'Clean, friendly medical illustration for patient education,',
    'simple flat vector style, soft teal and warm colors, no text labels, no gore, professional clinic handout look —',
    prompt.slice(0, 500),
  ].join(' ')

  return generateImage(safePrompt, '1024x1024')
}
