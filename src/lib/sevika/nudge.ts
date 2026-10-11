/**
 * Sevika — AI Nurse: empathetic nudge engine (P3).
 *
 * DETERMINISTIC tone selection — no LLM in here by design (safety rail: the
 * nurse's clock and her bedside manner at reminder time are pure code; AI is
 * only used in the on-demand chat / diet / report surfaces).
 *
 * Tone is picked from the last 48h of the patient's doses:
 *   celebrate — last ≥3 decided doses all Taken, zero misses in 48h
 *   gentle    — ≥2 Missed/Skipped in the last 48h (support, never guilt)
 *   warm      — default bedside manner
 */

import { db } from '@/lib/db'

export type NudgeTone = 'celebrate' | 'gentle' | 'warm'

export interface NudgeMed {
  medicine: string
  dose?: string
  instructions?: string
  slotHi: string
}

/** Look at the patient's last 48h of decided doses and pick a tone. */
export async function quickTone(userId: string): Promise<NudgeTone> {
  try {
    const since = new Date(Date.now() - 48 * 60 * 60 * 1000)
    const doses = await db.sevikaDose.findMany({
      where: {
        userId,
        dueAt: { gte: since },
        status: { in: ['Taken', 'Missed', 'Skipped'] },
      },
      select: { status: true },
      orderBy: { dueAt: 'desc' },
      take: 30,
    })
    if (doses.length === 0) return 'warm'

    const missed = doses.filter((d) => d.status !== 'Taken').length
    if (missed >= 2) return 'gentle'

    const last3 = doses.slice(0, 3)
    if (last3.length === 3 && last3.every((d) => d.status === 'Taken') && missed === 0) {
      return 'celebrate'
    }
    return 'warm'
  } catch {
    return 'warm'
  }
}

/** Notification title for a reminder, tone-flavoured. */
export function reminderTitle(tone: NudgeTone, med: NudgeMed): string {
  const name = `${med.medicine}${med.dose ? ` (${med.dose})` : ''}`
  switch (tone) {
    case 'celebrate':
      return `💪 ${name} — ${med.slotHi}`
    case 'gentle':
      return `🩺 ${name} — ${med.slotHi}`
    default:
      return `💊 ${name} — ${med.slotHi}`
  }
}

/** Reminder message body, tone-flavoured. Always signed by Sevika. */
export function reminderMessage(tone: NudgeTone, med: NudgeMed): string {
  const base = `${med.medicine}${med.dose ? ` (${med.dose})` : ''}`
  const instr = med.instructions ? ` ${med.instructions}` : ''

  switch (tone) {
    case 'celebrate':
      return [
        `${base} ka time — aapki regularity dekh kar khushi ho rahi hai! 💪`,
        `Streak zinda rakhenge?${instr}`,
        '— Sevika, aapki nurse 🩺',
      ]
        .filter(Boolean)
        .join(' ')
    case 'gentle':
      return [
        `Yaad hai na — ${base} lena hai.`,
        'Chhoti si cheez hai, ho jayegi. Main saath hoon, bina tension.',
        `${instr}— Sevika, aapki nurse 🩺`.trim(),
      ].join(' ')
    default:
      return [`${base} lena hai.`, instr, '— Sevika, aapki nurse 🩺']
        .filter((p) => p && p.trim())
        .join(' ')
  }
}

/** Missed-dose follow-up message, tone-flavoured (never guilt-trip). */
export function missedMessage(tone: NudgeTone, medicine: string): string {
  switch (tone) {
    case 'celebrate':
      return `Arre, ${medicine} reh gayi? Koi baat nahi — itni acchi streak ke baad ek dose se farak nahi padta. Jab yaad aaye le lijiye, agli se phir wahi rhythm. — Sevika 🩺`
    case 'gentle':
      return `Dil pe mat lijiye — ${medicine} jab yaad aaye le lena, der se lene se bhi faida hi hai. Apna rhythm aaram se wapas paiye, main hoon na. — Sevika 🩺`
    default:
      return `Koi baat nahi — jab yaad aaye le lijiye. Agli dose ka dhyan rakhenge. — Sevika 🩺`
  }
}
