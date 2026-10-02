/**
 * Play a soft 2-note chime using Web Audio API.
 * Used for critical-event notifications (abnormal report, urgent test, surgery scheduled).
 * No audio file needed — synthesized at runtime.
 *
 * Notes:
 *   - C5 (523.25 Hz) at t=0,     0.35s
 *   - E5 (659.25 Hz) at t=0.18s, 0.45s  (a major third — pleasant, "soft alert" feel)
 *
 * Safe to call repeatedly. The AudioContext is lazily created on first call
 * and resumed if suspended (browser autoplay policy).
 */
let audioContext: AudioContext | null = null

export function playChime(): void {
  try {
    if (typeof window === 'undefined') return
    if (!audioContext) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      if (!AudioContextClass) return
      audioContext = new AudioContextClass()
    }
    // Resume context if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {})
    }

    const now = audioContext.currentTime
    // Two notes: C5 (523.25Hz) + E5 (659.25Hz) — a pleasant interval
    const notes = [
      { freq: 523.25, start: 0, duration: 0.35 },
      { freq: 659.25, start: 0.18, duration: 0.45 },
    ]
    notes.forEach(({ freq, start, duration }) => {
      const osc = audioContext!.createOscillator()
      const gain = audioContext!.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      // Soft attack + exponential decay envelope
      gain.gain.setValueAtTime(0, now + start)
      gain.gain.linearRampToValueAtTime(0.18, now + start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration)
      osc.connect(gain)
      gain.connect(audioContext!.destination)
      osc.start(now + start)
      osc.stop(now + start + duration + 0.05)
    })
  } catch (e) {
    console.warn('[chime] Failed to play:', e)
  }
}
