import { NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { requireRole } from '@/lib/api-auth'
import { transcribeAudio } from '@/lib/ai/provider'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Phase 5 — VOICE INPUT (ASR).
 *
 * The patient taps the 🎤 mic button, speaks in Hinglish, the browser records
 * WAV (16 kHz mono, encoded client-side via AudioContext — guaranteed format
 * compatibility with the ASR service regardless of MediaRecorder codec
 * support), and posts the base64 blob here.
 *
 * Response: { success: true, text: string }
 * The transcript is placed in the composer INPUT (never auto-sent) so the
 * patient can review/fix wrong words before sending — same human-confirm
 * safety ethos as every other Aturseva write path.
 */

// ~60s of 16 kHz 16-bit mono WAV ≈ 1.92 MB raw → ~2.6 MB base64. 8 MB cap
// leaves generous headroom while blocking accidental giant uploads.
const MAX_BASE64_LENGTH = 8_000_000

const bodySchema = z.object({
  audio: z
    .string()
    .min(100, 'Recording bahut chhoti hai — thoda bol ke dobara try karein')
    .max(MAX_BASE64_LENGTH, 'Recording bahut lambi hai — chhote hisson me boliye'),
})

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

  try {
    // Provider abstraction: SDK in sandbox, OpenAI-compatible
    // /audio/transcriptions endpoint in production (ASR_* env vars).
    const result = await transcribeAudio(parsed.data.audio)

    const text = typeof result?.text === 'string' ? result.text.trim() : ''
    return Response.json({ success: true, text })
  } catch (err) {
    console.error('[aturseva/voice/transcribe] ASR error:', err)
    return Response.json(
      { error: 'Awaaz samajh nahi aa payi — dobara bol ke try karein 🩺' },
      { status: 500 }
    )
  }
}
