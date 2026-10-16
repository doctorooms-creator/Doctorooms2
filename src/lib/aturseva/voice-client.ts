'use client'

/**
 * Aturseva voice-input recorder (client side).
 *
 * Records microphone audio via AudioContext + ScriptProcessorNode and encodes
 * a 16 kHz 16-bit mono WAV blob on stop.
 *
 * WHY not MediaRecorder: its output codec depends on the browser
 * (webm/opus on Chromium, mp4 on Safari) and the ASR service is only
 * guaranteed to accept WAV/MP3/M4A/FLAC/OGG. Recording raw PCM and encoding
 * WAV ourselves makes the format deterministic everywhere, and 16 kHz mono
 * is exactly the ASR-recommended sample rate — a 60s clip is ~1.9 MB.
 */

export interface VoiceRecorder {
  /** Stop recording and resolve the WAV blob. */
  stop(): Promise<Blob>
  /** Discard the recording without building the WAV. */
  cancel(): void
  /** Seconds recorded so far (updated live). */
  elapsed(): number
}

const TARGET_SAMPLE_RATE = 16000
const MAX_SECONDS = 60

export function isVoiceInputSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined')
  )
}

export async function startVoiceRecording(): Promise<VoiceRecorder> {
  if (!isVoiceInputSupported()) {
    throw new Error('unsupported')
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  })

  const Ctor: typeof AudioContext =
    typeof AudioContext !== 'undefined'
      ? AudioContext
      : (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const ctx = new Ctor()

  // Resume needed on browsers that create contexts suspended (autoplay policy).
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume()
    } catch {
      // recorder still works in many cases; ignore
    }
  }

  const source = ctx.createMediaStreamSource(stream)
  // ScriptProcessor is deprecated but universally available and needs no
  // AudioWorklet blob URL — the simplest cross-browser PCM tap.
  const processor = ctx.createScriptProcessor(4096, 1, 1)
  const chunks: Float32Array[] = []
  let totalSamples = 0
  const startedAt = Date.now()
  let finished = false

  processor.onaudioprocess = (e: AudioProcessingEvent) => {
    if (finished) return
    const input = e.inputBuffer.getChannelData(0)
    // Copy — the buffer is reused by the next event.
    const copy = new Float32Array(input.length)
    copy.set(input)
    chunks.push(copy)
    totalSamples += copy.length

    // Hard cap: stop accepting samples past 60s (caller's stop() still works).
    if (totalSamples / ctx.sampleRate >= MAX_SECONDS) {
      finished = true
    }
  }

  source.connect(processor)
  // ScriptProcessor only fires when connected to a destination.
  processor.connect(ctx.destination)

  const teardown = () => {
    if (finished) return
    finished = true
    try {
      processor.disconnect()
      source.disconnect()
    } catch {
      // already torn down
    }
    stream.getTracks().forEach((t) => t.stop())
    void ctx.close().catch(() => {})
  }

  return {
    elapsed: () => (Date.now() - startedAt) / 1000,
    cancel: () => {
      teardown()
      chunks.length = 0
      totalSamples = 0
    },
    stop: async () => {
      teardown()
      const merged = mergeChunks(chunks, totalSamples)
      const wav = encodeWav(downsample(merged, ctx.sampleRate, TARGET_SAMPLE_RATE))
      return new Blob([wav], { type: 'audio/wav' })
    },
  }
}

function mergeChunks(chunks: Float32Array[], totalSamples: number): Float32Array {
  const merged = new Float32Array(totalSamples)
  let offset = 0
  for (const c of chunks) {
    merged.set(c, offset)
    offset += c.length
  }
  return merged
}

/** Simple linear-interpolation downsampling to the target rate. */
function downsample(buffer: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate || fromRate < toRate || buffer.length === 0) return buffer
  const ratio = fromRate / toRate
  const outLength = Math.floor(buffer.length / ratio)
  const out = new Float32Array(outLength)
  let pos = 0
  for (let i = 0; i < outLength; i++) {
    const idx = Math.floor(pos)
    const frac = pos - idx
    const a = buffer[idx] ?? 0
    const b = buffer[idx + 1] ?? a
    out[i] = a + (b - a) * frac
    pos += ratio
  }
  return out
}

/** Encode Float32 samples as a 16-bit PCM mono WAV ArrayBuffer. */
function encodeWav(samples: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i))
  }

  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true) // fmt chunk size
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, TARGET_SAMPLE_RATE, true)
  view.setUint32(28, TARGET_SAMPLE_RATE * 2, true) // byte rate
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  writeStr(36, 'data')
  view.setUint32(40, samples.length * 2, true)

  let offset = 44
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }
  return buffer
}

/** Blob → base64 (no data: prefix) for JSON transport. */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = String(reader.result || '')
      const comma = result.indexOf(',')
      resolve(comma === -1 ? result : result.slice(comma + 1))
    }
    reader.onerror = () => reject(new Error('Recording padhne me dikkat aayi'))
    reader.readAsDataURL(blob)
  })
}
