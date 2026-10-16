/**
 * Aturseva LLM + voice provider abstraction (server-only).
 *
 * WHY THIS EXISTS
 * ───────────────
 * z-ai-web-dev-sdk talks to `internal-api.z.ai`, which resolves to PRIVATE
 * z.ai-network IPs (172.25.x.x) and is only reachable from inside the sandbox.
 * Production hosts (Vercel / Render) cannot route there — verified live on
 * 2026-10-16: serverless chat attempts to 172.25.150.234:443 time out, and
 * the public api.z.ai rejects the sandbox JWT (401). This is a platform
 * boundary, not a bug: the SDK is a sandbox dev tool.
 *
 * STRATEGY (env-driven; zero behavior change when the env vars are absent)
 * ─────────────────────────────────────────────────────────────────────────
 *   - Sandbox (no LLM_* env vars): z-ai-web-dev-sdk, exactly as before.
 *   - Production (env vars set on Vercel): any OpenAI-compatible public
 *     provider — e.g. the z.ai open platform
 *     (LLM_BASE_URL=https://api.z.ai/api/paas/v4, LLM_MODEL=glm-4.6),
 *     OpenRouter, Groq, Together, OpenAI, …
 *
 * ENV CONTRACT (each capability switches independently, all optional)
 * ─────────────────────────────────────────────────────────────────────────
 *   Chat: LLM_BASE_URL, LLM_API_KEY, LLM_MODEL
 *   TTS:  TTS_BASE_URL, TTS_API_KEY, TTS_MODEL, TTS_VOICE (optional override)
 *   ASR:  ASR_BASE_URL, ASR_API_KEY, ASR_MODEL
 */

export interface ProviderChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// ─── Shared SSE delta parser (identical shape for both providers) ───────────

async function* parseSSEDeltas(
  body: AsyncIterable<Uint8Array | string>
): AsyncGenerator<string> {
  const decoder = new TextDecoder()
  let buffer = ''
  for await (const chunk of body) {
    buffer += typeof chunk === 'string' ? chunk : decoder.decode(chunk)
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const payload = trimmed.slice(5).trim()
      if (!payload || payload === '[DONE]') continue
      try {
        const json = JSON.parse(payload) as {
          choices?: { delta?: { content?: string }; message?: { content?: string } }[]
        }
        const delta = json?.choices?.[0]?.delta?.content ?? json?.choices?.[0]?.message?.content
        if (delta) yield delta
      } catch {
        // partial/keepalive line — ignore
      }
    }
  }
}

// ─── Chat (streaming) ────────────────────────────────────────────────────────

function publicChatConfig() {
  const baseUrl = process.env.LLM_BASE_URL
  const apiKey = process.env.LLM_API_KEY
  const model = process.env.LLM_MODEL
  if (baseUrl && apiKey && model) {
    return { baseUrl: baseUrl.replace(/\/$/, ''), apiKey, model }
  }
  return null
}

async function* streamViaPublicProvider(
  cfg: { baseUrl: string; apiKey: string; model: string },
  messages: ProviderChatMessage[]
): AsyncGenerator<string> {
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({ model: cfg.model, messages, stream: true }),
  })
  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '')
    throw new Error(
      `Public LLM provider error ${res.status}: ${detail.slice(0, 300) || 'no body'}`
    )
  }
  yield* parseSSEDeltas(res.body as unknown as AsyncIterable<Uint8Array>)
}

async function* streamViaSDK(messages: ProviderChatMessage[]): AsyncGenerator<string> {
  const ZAI = (await import('z-ai-web-dev-sdk')).default
  const zai = await ZAI.create()
  const res = await zai.chat.completions.create({
    messages,
    stream: true,
    thinking: { type: 'disabled' },
  })

  if (res && typeof (res as AsyncIterable<unknown>)[Symbol.asyncIterator] === 'function') {
    // SDK yields raw SSE bytes — same parser as the public provider.
    yield* parseSSEDeltas(res as AsyncIterable<Uint8Array>)
  } else {
    // Defensive: some SDK versions resolve a plain completion object.
    const content = (res as { choices?: { message?: { content?: string } }[] })?.choices?.[0]
      ?.message?.content
    if (content) yield content
  }
}

/**
 * Stream a chat completion as content deltas. Uses the public OpenAI-compatible
 * provider when LLM_* env vars are present (production); otherwise the
 * z-ai-web-dev-sdk (sandbox).
 */
export function streamChatCompletion(messages: ProviderChatMessage[]): AsyncGenerator<string> {
  const cfg = publicChatConfig()
  if (cfg) return streamViaPublicProvider(cfg, messages)
  return streamViaSDK(messages)
}

// ─── Text-to-speech ──────────────────────────────────────────────────────────

export interface SpeechOptions {
  text: string
  /** Provider voice id. Overridden by TTS_VOICE env when set (lets prod map
   *  sandbox voice names like "tongtong" onto the provider's own ids). */
  voice?: string
  /** Audio format requested from the provider (default "wav"). */
  responseFormat?: string
}

async function ttsViaPublicProvider(opts: SpeechOptions): Promise<Buffer> {
  const baseUrl = (process.env.TTS_BASE_URL || '').replace(/\/$/, '')
  const apiKey = process.env.TTS_API_KEY || ''
  const model = process.env.TTS_MODEL || ''
  const voice = process.env.TTS_VOICE || opts.voice || 'alloy'
  const responseFormat = opts.responseFormat || 'wav'
  const res = await fetch(`${baseUrl}/audio/speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: opts.text,
      voice,
      response_format: responseFormat,
    }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Public TTS provider error ${res.status}: ${detail.slice(0, 300)}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

async function ttsViaSDK(opts: SpeechOptions): Promise<Buffer> {
  const ZAI = (await import('z-ai-web-dev-sdk')).default
  const zai = await ZAI.create()
  const response = await zai.audio.tts.create({
    input: opts.text,
    voice: opts.voice || 'tongtong',
    speed: 1.0,
    response_format: 'wav',
    stream: false,
  })
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(new Uint8Array(arrayBuffer))
}

/**
 * Synthesize speech. Public OpenAI-compatible `/audio/speech` provider when
 * TTS_* env vars are present (production); otherwise the SDK (sandbox).
 */
export async function synthesizeSpeech(opts: SpeechOptions): Promise<Buffer> {
  const baseUrl = process.env.TTS_BASE_URL
  const apiKey = process.env.TTS_API_KEY
  const model = process.env.TTS_MODEL
  if (baseUrl && apiKey && model) return ttsViaPublicProvider(opts)
  return ttsViaSDK(opts)
}

// ─── Speech-to-text (ASR) ────────────────────────────────────────────────────

export interface TranscriptionResult {
  text: string
}

async function asrViaPublicProvider(audioBase64: string): Promise<TranscriptionResult> {
  const baseUrl = (process.env.ASR_BASE_URL || '').replace(/\/$/, '')
  const apiKey = process.env.ASR_API_KEY || ''
  const model = process.env.ASR_MODEL || ''
  // The client uploads 16kHz 16-bit mono WAV (voice-client.ts) — but be
  // lenient: providers that need an explicit content type get audio/wav.
  const audio = Buffer.from(audioBase64, 'base64')
  const form = new FormData()
  form.append('file', new Blob([new Uint8Array(audio)], { type: 'audio/wav' }), 'audio.wav')
  form.append('model', model)
  const res = await fetch(`${baseUrl}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Public ASR provider error ${res.status}: ${detail.slice(0, 300)}`)
  }
  const json = (await res.json()) as { text?: string }
  return { text: typeof json?.text === 'string' ? json.text : '' }
}

async function asrViaSDK(audioBase64: string): Promise<TranscriptionResult> {
  const ZAI = (await import('z-ai-web-dev-sdk')).default
  const zai = await ZAI.create()
  const result = await zai.audio.asr.create({
    file_base64: audioBase64,
  })
  const text = typeof result?.text === 'string' ? result.text : ''
  return { text }
}

/**
 * Transcribe speech. Public OpenAI-compatible `/audio/transcriptions` provider
 * when ASR_* env vars are present (production); otherwise the SDK (sandbox).
 */
export async function transcribeAudio(audioBase64: string): Promise<TranscriptionResult> {
  const baseUrl = process.env.ASR_BASE_URL
  const apiKey = process.env.ASR_API_KEY
  const model = process.env.ASR_MODEL
  if (baseUrl && apiKey && model) return asrViaPublicProvider(audioBase64)
  return asrViaSDK(audioBase64)
}
