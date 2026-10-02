/**
 * Dr. Copilot — Query Agent (deterministic data fetch layer)
 *
 * Takes the router's intent and runs the matching SCOPED repo function.
 * Produces a plain-text DATA BLOCK that is injected into the LLM system
 * prompt (L3 firewall) plus citation strings for the UI.
 *
 * This module contains ZERO LLM calls — data is fetched by code, so the
 * numbers/IDs the model narrates are always real rows from this doctor's
 * scope only.
 */

import * as repo from '../repo'
import type { CopilotCtx } from '../guard'
import type { RouterResult } from '../router'
import { buildPatientBrief } from './summary'

export interface FetchedData {
  agentName: string
  dataBlock: string
  citations: string[]
}

export async function fetchData(ctx: CopilotCtx, intent: RouterResult): Promise<FetchedData> {
  switch (intent.intent) {
    case 'queue_stats': {
      const [stats, queue] = await Promise.all([repo.todayStats(ctx), repo.todayQueue(ctx)])
      const lines = queue.slice(0, 12).map(
        (b) =>
          `- ${b.tokenNumber || '—'} | ${b.patientName}${b.isEmergency ? ' [EMERGENCY]' : ''} | ${b.status} | ${b.disease || 'no disease noted'}`
      )
      return {
        agentName: 'query',
        dataBlock: [
          `Today (${ctx.todayIST}) status counts: ${JSON.stringify(stats.counts)} — total ${stats.total}.`,
          `Next in queue (up to 12, ordered):`,
          lines.length ? lines.join('\n') : '(queue empty)',
        ].join('\n'),
        citations: queue.slice(0, 3).map((b) => b.appointmentNo || b.tokenNumber),
      }
    }

    case 'booking_by_token': {
      if (!intent.token) return empty('No valid token found in the question.')
      const b = await repo.findBookingByToken(ctx, intent.token)
      if (!b) return empty(`No booking found TODAY with token ${intent.token} for this doctor.`)
      return {
        agentName: 'query',
        dataBlock: [
          `Booking found for token ${b.tokenNumber}:`,
          `- Appointment ID: ${b.appointmentNo}`,
          `- Patient: ${b.patientName} (${b.gender || '—'}, age ${b.age ?? '—'})`,
          `- Status: ${b.status}${b.isEmergency ? ' [EMERGENCY]' : ''}`,
          `- Disease/complaint: ${b.disease || '—'}`,
          `- Notes: ${b.description || '—'}`,
          `- Date: ${b.bookingDate.toISOString().slice(0, 10)} · Mode: ${b.bookingMode} · By: ${b.bookingType}`,
        ].join('\n'),
        citations: [b.appointmentNo],
      }
    }

    case 'booking_by_appointment': {
      if (!intent.appointmentNo) return empty('No valid appointment ID found in the question.')
      const b = await repo.findBookingByAppointmentNo(ctx, intent.appointmentNo)
      if (!b) return empty(`No booking found with appointment ID containing "${intent.appointmentNo}" for this doctor.`)
      return {
        agentName: 'query',
        dataBlock: [
          `Booking found for appointment ${b.appointmentNo}:`,
          `- Token: ${b.tokenNumber || '—'}`,
          `- Patient: ${b.patientName} (${b.gender || '—'}, age ${b.age ?? '—'})`,
          `- Status: ${b.status}${b.isEmergency ? ' [EMERGENCY]' : ''}`,
          `- Disease/complaint: ${b.disease || '—'}`,
          `- Notes: ${b.description || '—'}`,
          `- Date: ${b.bookingDate.toISOString().slice(0, 10)}`,
        ].join('\n'),
        citations: [b.appointmentNo],
      }
    }

    case 'patient_summary': {
      if (!intent.mobile) return empty('No mobile number found in the question.')
      const history = await repo.patientHistoryByMobile(ctx, intent.mobile)
      if (!history) {
        return empty(
          `No patient record found for mobile ending ...${intent.mobile.slice(-4)} among THIS doctor's patients. (If this patient visits another doctor, that data is not visible here.)`
        )
      }
      const brief = buildPatientBrief(history)
      return { agentName: 'summary', dataBlock: brief, citations: history.visits.slice(0, 3).map((v) => v.appointmentNo) }
    }

    case 'patient_search_name': {
      if (!intent.name) return empty('No patient name found in the question.')
      const results = await repo.patientHistoryByName(ctx, intent.name)
      if (results.length === 0) {
        return empty(`No patient named "${intent.name}" found among THIS doctor's patients.`)
      }
      const blocks = results.map((h) => buildPatientBrief(h, true))
      return {
        agentName: 'summary',
        dataBlock: `Found ${results.length} matching patient(s):\n\n${blocks.join('\n\n')}`,
        citations: results.flatMap((h) => h.visits.slice(0, 1).map((v) => v.appointmentNo)),
      }
    }

    case 'recent_rx': {
      const rows = await repo.recentPrescriptions(ctx, intent.limit || 10)
      if (rows.length === 0) return empty('No prescriptions found yet for this doctor.')
      const lines = rows.map(
        (r) =>
          `- ${r.createdAt.toISOString().slice(0, 10)} | ${r.patientName} | ${r.disease || '—'} | ${r.booking?.appointmentNo || '—'} | meds: ${
            r.medicines.map((m) => `${m.medicine}${m.dose ? ` (${m.dose})` : ''}`).join(', ') || 'none'
          }`
      )
      return {
        agentName: 'query',
        dataBlock: `Recent prescriptions (newest first):\n${lines.join('\n')}`,
        citations: rows.slice(0, 3).map((r) => r.booking?.appointmentNo || r.id),
      }
    }

    case 'top_medicines': {
      const rows = await repo.topMedicines(ctx, intent.limit || 10)
      if (rows.length === 0) return empty('No medicine data yet for this doctor.')
      return {
        agentName: 'query',
        dataBlock: `Most prescribed medicines:\n${rows.map((r, i) => `${i + 1}. ${r.medicine} — ${r.count}×`).join('\n')}`,
        citations: [],
      }
    }

    case 'earnings': {
      const [earn, rx30] = await Promise.all([repo.earningsThisMonth(ctx), repo.rxCountRange(ctx, 30)])
      return {
        agentName: 'query',
        dataBlock: [
          `This month (since ${earn.monthStart.toISOString().slice(0, 10)}):`,
          `- Paid-status bookings (Approve/Visited/Finish): ${earn.bookings}`,
          `- OPD revenue sum: ₹${earn.revenue.toLocaleString('en-IN')}`,
          `- Prescriptions written in last 30 days: ${rx30.count}`,
          `(Consultation fee on record: ₹${ctx.fees})`,
        ].join('\n'),
        citations: [],
      }
    }

    case 'disease_split': {
      const rows = await repo.diseaseSplitThisMonth(ctx)
      if (rows.length === 0) return empty('No bookings this month yet for this doctor.')
      const total = rows.reduce((s, r) => s + r.count, 0)
      return {
        agentName: 'query',
        dataBlock: `Disease-wise split this month (total ${total}):\n${rows
          .map((r) => `- ${r.disease}: ${r.count} (${Math.round((r.count / total) * 100)}%)`)
          .join('\n')}`,
        citations: [],
      }
    }

    case 'followups': {
      const rows = await repo.upcomingFollowups(ctx, 7)
      if (rows.length === 0) return empty('No follow-ups scheduled in the next 7 days.')
      return {
        agentName: 'query',
        dataBlock: `Upcoming follow-ups (next 7 days):\n${rows
          .map((r) => `- ${r.nextVisit?.toISOString().slice(0, 10) || '—'} | ${r.patientName} | ${r.disease || '—'} | last appt ${r.booking?.appointmentNo || '—'}`)
          .join('\n')}`,
        citations: rows.slice(0, 3).map((r) => r.booking?.appointmentNo || r.id),
      }
    }

    default:
      return {
        agentName: 'router',
        dataBlock: [
          'No database lookup was needed for this message (greeting or general question).',
          'You may tell the doctor what you can do: today\'s queue, find by token or appointment ID, patient history by mobile number, recent prescriptions, top medicines, monthly earnings, disease split, and upcoming follow-ups.',
        ].join('\n'),
        citations: [],
      }
  }
}

function empty(note: string): FetchedData {
  return { agentName: 'query', dataBlock: note, citations: [] }
}
