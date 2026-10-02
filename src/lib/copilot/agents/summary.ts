/**
 * Dr. Copilot — Summary Agent
 *
 * Turns a scoped PatientHistory into a compact clinical brief text block.
 * This is the same engine that will power the Pre-Visit Auto-Brief card
 * in Phase D — keep it deterministic (no LLM) so numbers are exact.
 */

import type { PatientHistory } from '../repo'

export function buildPatientBrief(history: PatientHistory, compact = false): string {
  const { patient, visits } = history
  const lines: string[] = []

  lines.push(`PATIENT: ${patient.name} | ${patient.gender || '—'} | mobile ${patient.mobileNo || '—'}`)
  lines.push(`Visits to this doctor: ${visits.length}${visits[0] ? ` (latest ${visits[0].date.toISOString().slice(0, 10)})` : ''}`)

  // Latest visit detail
  const latest = visits[0]
  if (latest?.prescription) {
    const rx = latest.prescription
    lines.push(
      `LATEST VISIT (${latest.date.toISOString().slice(0, 10)}, appt ${latest.appointmentNo}, token ${latest.tokenNumber || '—'}):`
    )
    lines.push(`- Diagnosis: ${rx.disease || latest.disease || '—'}`)
    if (rx.weight) lines.push(`- Weight: ${rx.weight}`)
    if (rx.bp) lines.push(`- BP: ${rx.bp}`)
    if (rx.temperature) lines.push(`- Temp: ${rx.temperature}`)
    if (rx.nextVisit) lines.push(`- Next visit advised: ${rx.nextVisit.toISOString().slice(0, 10)}`)
    if (rx.medicines.length) {
      lines.push(`- Current medicines:`)
      for (const m of rx.medicines) {
        const times = [m.morning && 'morning', m.afternoon && 'afternoon', m.evening && 'evening'].filter(Boolean).join('+') || 'as directed'
        lines.push(`  · ${m.medicine} ${m.dose ? `(${m.dose}) ` : ''}— ${times}`)
      }
    }
    if (rx.description) lines.push(`- Notes: ${rx.description.slice(0, 300)}`)
  } else if (latest) {
    lines.push(`LATEST VISIT (${latest.date.toISOString().slice(0, 10)}, appt ${latest.appointmentNo}): no prescription on record, status ${latest.status}.`)
  }

  // Vitals trend across visits (oldest → newest)
  const vitalRows = visits
    .filter((v) => v.prescription && (v.prescription.bp || v.prescription.weight))
    .slice(0, 6)
    .reverse()
  if (vitalRows.length >= 2 && !compact) {
    lines.push('VITALS TREND (older → newer):')
    for (const v of vitalRows) {
      const rx = v.prescription!
      lines.push(`- ${v.date.toISOString().slice(0, 10)}: BP ${rx.bp || '—'} | Wt ${rx.weight || '—'}${rx.temperature ? ` | Temp ${rx.temperature}` : ''}`)
    }
  }

  // Visit timeline (compact mode: last 3)
  const timeline = compact ? visits.slice(0, 3) : visits.slice(0, 8)
  if (timeline.length) {
    lines.push('VISIT TIMELINE:')
    for (const v of timeline) {
      lines.push(`- ${v.date.toISOString().slice(0, 10)} | ${v.appointmentNo} | ${v.disease || '—'} | ${v.prescription ? 'Rx written' : v.status}`)
    }
  }

  return lines.join('\n')
}
