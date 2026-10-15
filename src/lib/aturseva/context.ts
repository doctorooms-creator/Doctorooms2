/**
 * Aturseva Agent — CONTEXT (L2, patient edition superset).
 *
 * buildAtursevaContext() = the ENTIRE live state the agent is allowed to know:
 *   • the Sevika block (medicines, today's doses, adherence, diet) — reused
 *     verbatim from lib/sevika/chat.ts so dose logic stays single-sourced
 *   • upcoming appointments + statuses (so "approve hua ki nai" needs no tool)
 *   • today's live queue summary (if a token exists)
 *   • profile basics
 *
 * The DATA BLOCK is rebuilt fresh on EVERY request — answers stay correct
 * even seconds after the patient marks a dose or reception approves a booking.
 */

import { db } from '@/lib/db'
import { istDateRange } from '@/lib/date-utils'
import { buildSevikaContext } from '@/lib/sevika/chat'

export interface AtursevaContext {
  patientName: string
  dataBlock: string
}

const STATUS_HI: Record<string, string> = {
  Pending: 'approve ka intezaar me',
  Approve: 'CONFIRMED',
  Visited: 'visit ho chuki',
  Finish: 'complete',
  Canceled: 'cancel ho gaya',
  Rejected: 'reject hua',
}

export async function buildAtursevaContext(userId: string): Promise<AtursevaContext> {
  const sevika = await buildSevikaContext(userId)
  const { start, end } = istDateRange(new Date().toISOString().slice(0, 10))

  const [upcoming, todayQueue] = await Promise.all([
    db.booking.findMany({
      where: {
        userId,
        bookingDate: { gte: new Date(Date.now() - 24 * 3600 * 1000) },
        status: { in: ['Pending', 'Approve'] },
      },
      include: { doctor: { select: { specialization: true, user: { select: { name: true } } } } },
      orderBy: { bookingDate: 'asc' },
      take: 5,
    }),
    db.booking.findFirst({
      where: {
        userId,
        status: { in: ['Approve', 'Pending'] },
        bookingDate: { gte: start, lte: end },
        tokenNumber: { not: '' },
      },
      include: { doctor: { select: { specialization: true, user: { select: { name: true } } } } },
      orderBy: { tokenOrder: 'asc' },
    }),
  ])

  const lines: string[] = []

  // Upcoming appointments (deterministic part of "booking status" questions)
  if (upcoming.length === 0) {
    lines.push('UPCOMING APPOINTMENTS: koi pending/confirmed appointment nahi hai.')
  } else {
    lines.push(`UPCOMING APPOINTMENTS (${upcoming.length}):`)
    for (const b of upcoming) {
      const d = new Date(b.bookingDate)
      const dateStr = d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        timeZone: 'Asia/Kolkata',
      })
      lines.push(
        `- ${dateStr} ${b.timeSlot || ''} — ${b.doctor?.user?.name || 'Doctor'}${
          b.doctor?.specialization ? ` (${b.doctor.specialization})` : ''
        } — status: ${STATUS_HI[b.status] || b.status}${b.bookingMode === 'VideoCall' ? ' — VideoCall' : ''}`
      )
    }
  }

  // Today's live queue snapshot (tool gives exact position on request)
  if (todayQueue?.tokenNumber) {
    lines.push(
      `TODAY'S TOKEN: #${todayQueue.tokenNumber} (${todayQueue.doctor?.user?.name || 'Doctor'}), exact live position ke liye get_queue_position tool use karein.`
    )
  } else {
    lines.push("TODAY'S TOKEN: aaj ka token abhi assign nahi hua hai (ya aaj koi appointment nahi).")
  }

  lines.push('')

  return {
    patientName: sevika.patientName,
    dataBlock: `${sevika.dataBlock}\n\n${lines.join('\n')}`,
  }
}

/**
 * Deterministic context-aware greeting for an empty thread (no LLM call —
 * facts straight from the live context, composed in Aturseva's voice).
 */
export function buildGreeting(patientName: string, dataBlock: string): string {
  const lines: string[] = [`Namaste ${patientName.split(' ')[0]} 🙏 Main Aturseva hoon — aapki AI nurse aur saathi.`]

  // Doses today?
  const doses = /TODAY'S DOSES \((\d+)\):/.exec(dataBlock)
  const noDoses = /aaj koi dose schedule nahi hai/.test(dataBlock)
  const nextDose = /NEXT DOSE: (\d\d:\d\d) (.+)/.exec(dataBlock)
  if (doses) {
    lines.push(`Aaj ki ${doses[1]} dose${Number(doses[1]) > 1 ? 'e' : ''} maine yaad rakh rakhi hain — sab Dawai page par taiyaar hain.`)
  } else if (!noDoses) {
    lines.push('Aaj ki dawai maine set kar rakhi hai.')
  }
  if (nextDose) lines.push(`Agli dose: ${nextDose[2]} — ${nextDose[1]} baje.`)

  // Upcoming appointment?
  const upcomingMatch = dataBlock.match(/UPCOMING APPOINTMENTS \(\d+\):([\s\S]*?)\nTODAY'S TOKEN/)
  if (upcomingMatch) {
    const first = upcomingMatch[1].split('\n').find((l) => l.trim().startsWith('-'))
    if (first) {
      const m = /- (.+?) — (.+?) — status: (.+?)( — VideoCall)?$/.exec(first.trim())
      if (m) {
        lines.push(
          `Aapka ${m[1]} ko ${m[2]} ka appointment ${m[3].includes('CONFIRMED') ? 'confirm hai ✓' : 'approve hone ka intezaar me hai'}.`
        )
      }
    }
  } else if (/koi pending\/confirmed appointment nahi hai/.test(dataBlock)) {
    lines.push('Abhi koi appointment pending nahi hai — chahein to main aapke liye achhe doctor dhoondh sakti hoon.')
  }

  // Queue today?
  const token = /TODAY'S TOKEN: #(\d+)/.exec(dataBlock)
  if (token) lines.push(`Aaj ka aapka token #${token[1]} hai — poochh lijiye to live position bhi bata dungi.`)

  lines.push('Kya poochhna hai? Dawai, diet, appointment, queue — sab main sambhal leti hoon 😊')
  return lines.join(' ')
}
