import { NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { requireRole } from '@/lib/api-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Phase 5 — VOICE OUTPUT (TTS).
 *
 * "Bol kar jawab" toggle ON → after each Aturseva reply completes, the client
 * posts the reply text here and plays the returned WAV. Each Aturseva bubble
 * also carries a 🔊 replay button hitting the same endpoint.
 *
 * Response: audio/wav binary (voice: tongtong — warm nurse tone).
 */

// TTS API hard limit is 1024 chars/request. Replies are short Hinglish —
// truncate to 900 rather than chunking (a spoken novel is not the goal).
const MAX_TEXT = 900

const bodySchema = z.object({
  text: z.string().min(1, 'Bolne ke liye kuch text chahiye').max(1000),
})

/**
 * Speech-friendly cleanup of an Aturseva reply:
 *  - drop [[TOOL …]] protocol lines (never spoken aloud)
 *  - drop emoji / variation selectors (Extended_Pictographic covers 🩺🎉📍…)
 *  - drop markdown decorations (*, #, `, >, brackets around labels)
 *  - "Dr." → "Doctor" so the voice doesn't say "dar"
 *  - collapse whitespace + truncate
 */
export function sanitizeForSpeech(raw: string): string {
  let text = raw
    // Protocol lines first (before emoji stripping mangles them).
    .replace(/\[\[[^\]]*\]\]/g, ' ')
    .replace(/\[CARD[^\]]*\]/gi, ' ')
    .replace(/\([^)]{0,80}\)/g, (m) => (/[A-Za-z]/.test(m) ? m : ' '))

  // Emoji + ZWJ + variation selectors.
  text = text.replace(/\p{Extended_Pictographic}/gu, ' ')
  text = text.replace(/[\u200D\uFE0F]/g, '')

  // Markdown decorations.
  text = text.replace(/[*_`#>|]/g, ' ')

  // Common spoken forms.
  text = text.replace(/\bDr\.?\b/gi, 'Doctor')

  return text.replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT)
}

/**
 * Canonicalize the TTS service's WAV: it carries a non-standard "AIGC"
 * metadata chunk between `fmt ` and `data`, which some browser <audio>
 * demuxers reject ("no supported source found"). Rewrite as a minimal
 * RIFF/WAVE holding ONLY the fmt + data chunks (44-byte header).
 * Passthrough-safe: if anything doesn't parse, return the original buffer.
 */
function canonicalizeWav(buf: Buffer): Buffer {
  try {
    if (buf.length < 44) return buf
    if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') return buf
    // NOTE: do NOT trust the RIFF size field — the TTS service writes it
    // inconsistently (trailing bytes past the declared size). The chunk walk
    // below only needs the magic bytes; it stops at the buffer's real end.

    let fmt: Buffer | null = null
    let data: Buffer | null = null
    let offset = 12
    while (offset + 8 <= buf.length) {
      const id = buf.toString('ascii', offset, offset + 4)
      const size = buf.readUInt32LE(offset + 4)
      const bodyStart = offset + 8
      const bodyEnd = Math.min(bodyStart + size, buf.length)
      if (id === 'fmt ' && !fmt) fmt = buf.subarray(bodyStart, bodyEnd)
      else if (id === 'data' && !data) data = buf.subarray(bodyStart, bodyEnd)
      // Word-aligned advance; a lying size just ends the walk early.
      offset = bodyStart + size + (size % 2 ? 1 : 0)
    }
    if (!fmt || !data || data.length === 0) return buf

    const out = Buffer.alloc(44 + data.length)
    out.write('RIFF', 0, 'ascii')
    out.writeUInt32LE(36 + data.length, 4)
    out.write('WAVE', 8, 'ascii')
    out.write('fmt ', 12, 'ascii')
    out.writeUInt32LE(fmt.length, 16)
    fmt.copy(out, 20)
    out.write('data', 36, 'ascii')
    out.writeUInt32LE(data.length, 40)
    data.copy(out, 44)
    return out
  } catch {
    return buf
  }
}

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

  const speechText = sanitizeForSpeech(parsed.data.text)
  if (!speechText) {
    return Response.json({ error: 'Is message me bolne layak kuch nahi hai' }, { status: 422 })
  }

  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    const response = await zai.audio.tts.create({
      input: speechText,
      voice: 'tongtong',
      speed: 1.0,
      response_format: 'wav',
      stream: false,
    })

    const arrayBuffer = await response.arrayBuffer()
    const buffer = canonicalizeWav(Buffer.from(new Uint8Array(arrayBuffer)))
    if (buffer.length === 0) {
      throw new Error('Empty TTS buffer')
    }

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('[aturseva/voice/speak] TTS error:', err)
    return Response.json(
      { error: 'Awaaz generate nahi ho payi — thodi der baad try karein 🩺' },
      { status: 500 }
    )
  }
}
