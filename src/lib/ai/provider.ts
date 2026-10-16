/**
 * Doctorooms / Aturseva — app-wide AI provider layer (server-only).
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
 *   Chat (stream + complete): LLM_BASE_URL, LLM_API_KEY, LLM_MODEL
 *   Vision (image understanding): same LLM_BASE_URL/LLM_API_KEY plus
 *     optional LLM_VISION_MODEL (defaults to LLM_MODEL — set a multimodal
 *     id like glm-4.5v / gpt-4o when the chat model is text-only)
 *   TTS:  TTS_BASE_URL, TTS_API_KEY, TTS_MODEL, TTS_VOICE (optional override)
 *   ASR:  ASR_BASE_URL, ASR_API_KEY, ASR_MODEL
 *   Image generation: IMG_BASE_URL, IMG_API_KEY, IMG_MODEL (optional)
 *
 * CONSUMERS: aturseva/agent.ts (chat) + aturseva voice routes (TTS/ASR),
 * sevika/{chat,diet,weekly-report,rx-parse}, copilot/{llm,vision}.
 */

export interface ProviderChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/** Multimodal message content (OpenAI-compatible vision format). */
export type ProviderVisionPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }

export interface ProviderVisionMessage {
  role: 'user' | 'system' | 'assistant'
  content: ProviderVisionPart[]
}

// ─── SDK singleton (sandbox path) ───────────────────────────────────────────

type ZAIClient = Awaited<ReturnType<(typeof import('z-ai-web-dev-sdk'))['default']['create']>>

let sdkPromise: Promise<ZAIClient> | null = null

async function getSDK(): Promise<ZAIClient> {
  if (!sdkPromise) {
    const p = (async () => {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      return ZAI.create()
    })()
    sdkPromise = p
    // A failed creation (e.g. transient config read) must not poison the
    // cache forever — clear it so the next call retries.
    p.catch(() => {
      sdkPromise = null
    })
    return p
  }
  return sdkPromise
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

// ─── Public-provider config resolution ──────────────────────────────────────

interface PublicChatConfig {
  baseUrl: string
  apiKey: string
  model: string
}

function publicChatConfig(): PublicChatConfig | null {
  const baseUrl = process.env.LLM_BASE_URL
  const apiKey = process.env.LLM_API_KEY
  const model = process.env.LLM_MODEL
  if (baseUrl && apiKey && model) {
    return { baseUrl: baseUrl.replace(/\/$/, ''), apiKey, model }
  }
  return null
}

function publicVisionConfig(): PublicChatConfig | null {
  const cfg = publicChatConfig()
  if (!cfg) return null
  return { ...cfg, model: process.env.LLM_VISION_MODEL || cfg.model }
}

async function publicPostJSON(
  url: string,
  apiKey: string,
  payload: Record<string, unknown>
): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })
}

async function readPublicError(res: Response): Promise<string> {
  const detail = await res.text().catch(() => '')
  return detail.slice(0, 300) || 'no body'
}

interface PublicCompletionShape {
  choices?: { message?: { content?: string } }[]
}

async function publicCompletionText(res: Response): Promise<string> {
  const json = (await res.json()) as PublicCompletionShape
  return json?.choices?.[0]?.message?.content ?? ''
}

// ─── Chat (streaming) ────────────────────────────────────────────────────────

async function* streamViaPublicProvider(
  cfg: PublicChatConfig,
  messages: ProviderChatMessage[]
): AsyncGenerator<string> {
  const res = await publicPostJSON(`${cfg.baseUrl}/chat/completions`, cfg.apiKey, {
    model: cfg.model,
    messages,
    stream: true,
  })
  if (!res.ok || !res.body) {
    throw new Error(`Public LLM provider error ${res.status}: ${await readPublicError(res)}`)
  }
  yield* parseSSEDeltas(res.body as unknown as AsyncIterable<Uint8Array>)
}

async function* streamViaSDK(messages: ProviderChatMessage[]): AsyncGenerator<string> {
  const zai = await getSDK()
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

// ─── Chat (non-streaming) ────────────────────────────────────────────────────

async function completeViaPublicProvider(
  cfg: PublicChatConfig,
  messages: ProviderChatMessage[]
): Promise<string> {
  const res = await publicPostJSON(`${cfg.baseUrl}/chat/completions`, cfg.apiKey, {
    model: cfg.model,
    messages,
    stream: false,
  })
  if (!res.ok) {
    throw new Error(`Public LLM provider error ${res.status}: ${await readPublicError(res)}`)
  }
  return publicCompletionText(res)
}

async function completeViaSDK(messages: ProviderChatMessage[]): Promise<string> {
  const zai = await getSDK()
  const completion = await zai.chat.completions.create({
    messages,
    thinking: { type: 'disabled' },
  })
  const content = completion.choices[0]?.message?.content
  return typeof content === 'string' ? content : ''
}

/**
 * Non-streaming chat completion (single string). Used by the Sevika diet /
 * weekly-report generators, the Copilot intent router — anywhere a full reply
 * is needed in one shot. Provider selection is identical to the streaming path.
 */
export async function completeChat(messages: ProviderChatMessage[]): Promise<string> {
  const cfg = publicChatConfig()
  if (cfg) return completeViaPublicProvider(cfg, messages)
  return completeViaSDK(messages)
}

// ─── Vision (image understanding) ────────────────────────────────────────────

async function visionViaPublicProvider(
  cfg: PublicChatConfig,
  messages: ProviderVisionMessage[]
): Promise<string> {
  // OpenAI-compatible multimodal format: content parts carry text + image_url.
  const res = await publicPostJSON(`${cfg.baseUrl}/chat/completions`, cfg.apiKey, {
    model: cfg.model,
    messages,
    stream: false,
  })
  if (!res.ok) {
    throw new Error(`Public vision provider error ${res.status}: ${await readPublicError(res)}`)
  }
  return publicCompletionText(res)
}

async function visionViaSDK(messages: ProviderVisionMessage[]): Promise<string> {
  const zai = await getSDK()
  const completion = await zai.chat.completions.createVision({
    messages,
    thinking: { type: 'disabled' },
  })
  const text = completion.choices[0]?.message?.content
  return typeof text === 'string' ? text : ''
}

/**
 * One vision completion over text + image parts (data-URL images). Public
 * OpenAI-compatible provider (multimodal chat model) when LLM_* env vars are
 * present; otherwise the SDK's createVision (sandbox).
 */
export async function visionCompletion(messages: ProviderVisionMessage[]): Promise<string> {
  const cfg = publicVisionConfig()
  if (cfg) return visionViaPublicProvider(cfg, messages)
  return visionViaSDK(messages)
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
  const res = await publicPostJSON(`${baseUrl}/audio/speech`, apiKey, {
    model,
    input: opts.text,
    voice,
    response_format: responseFormat,
  })
  if (!res.ok) {
    throw new Error(`Public TTS provider error ${res.status}: ${await readPublicError(res)}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

async function ttsViaSDK(opts: SpeechOptions): Promise<Buffer> {
  const zai = await getSDK()
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
    throw new Error(`Public ASR provider error ${res.status}: ${await readPublicError(res)}`)
  }
  const json = (await res.json()) as { text?: string }
  return { text: typeof json?.text === 'string' ? json.text : '' }
}

async function asrViaSDK(audioBase64: string): Promise<TranscriptionResult> {
  const zai = await getSDK()
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

// ─── Image generation ────────────────────────────────────────────────────────

/**
 * Generate an image (e.g. patient-education illustrations). Public
 * OpenAI-compatible `/images/generations` provider when IMG_* env vars are
 * present; otherwise the SDK (sandbox). Returns { base64 } (PNG) or null when
 * the provider yields nothing usable.
 */
export async function generateImage(
  prompt: string,
  size = '1024x1024'
): Promise<{ base64: string } | null> {
  const baseUrl = (process.env.IMG_BASE_URL || '').replace(/\/$/, '')
  const apiKey = process.env.IMG_API_KEY || ''
  const model = process.env.IMG_MODEL || ''

  if (baseUrl && apiKey && model) {
    const res = await publicPostJSON(`${baseUrl}/images/generations`, apiKey, {
      model,
      prompt,
      size,
      response_format: 'b64_json',
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data?: { b64_json?: string; base64?: string }[] }
    const b64 = json?.data?.[0]?.b64_json ?? json?.data?.[0]?.base64
    return typeof b64 === 'string' && b64.length > 100 ? { base64: b64 } : null
  }

  const zai = await getSDK()
  const response = await zai.images.generations.create({
    prompt,
    size,
  })
  const base64 = response.data?.[0]?.base64
  return typeof base64 === 'string' && base64.length > 100 ? { base64 } : null
}
