/**
 * Shared types for the OPD Cockpit.
 * Mirror of GET /api/opd/cockpit response — single source of truth
 * for every zone of the screen (one poll → one truth).
 * Contract: docs/opd-cockpit/04-TECH-IMPLEMENTATION.md §2.1
 */

export interface OpdQueueItem {
  id: string
  tokenNumber: string | null
  tokenOrder: number
  patientName: string
  patientImg: string | null
  age?: number | null
  gender?: string | null
  disease: string
  timeSlot: string
  status: 'Approve' | 'Visited' | 'Finish' | 'NoShow'
  bookingType: string
  bookingMode?: string
  videoRoomId?: string
  isEmergency?: boolean
  calledAt?: string | null
  waitingSeconds: number
}

export interface OpdReportInboxItem {
  labReportId: string
  patientName: string
  testName: string
  value?: string | null
  unit?: string | null
  flag?: 'normal' | 'abnormal' | null
  previousValue?: string | null
  previousDate?: string | null
  readyAt: string
}

export interface OpdCockpitData {
  doctor: {
    id: string
    name: string
    specialization: string
    profileImg: string | null
    queuePaused: boolean
  }
  scope: {
    hospitalName: string | null
    departmentName: string | null
    shortCode: string | null
    floorNo: string | null
    opdRoom: string | null
    opdTimings: string | null
    closesAt: string | null
  }
  date: string
  queue: OpdQueueItem[]
  stats: {
    done: number
    waiting: number
    inConsultation: number
    backlogMinutes: number
    noShows: number
  }
  currentServing: {
    id: string
    tokenNumber: string | null
    patientName: string
    calledAt: string | null
    bookingMode?: string
    videoRoomId?: string
  } | null
  nextUp: {
    id: string
    tokenNumber: string | null
    patientName: string
    isEmergency: boolean
    bookingMode?: string
  } | null
  reportsInbox: OpdReportInboxItem[]
  pendingApprovals: number
  draftsOpen: { bookingId: string; patientName: string; updatedAt: string }[]
  videoUpcoming: {
    bookingId: string
    patientName: string
    timeSlot: string
    minutesUntil: number
  } | null
  autoAdvance: boolean
}

/** Human words for booking statuses (03 §3.2 — words of the trade). */
export function statusWords(s: string): string {
  switch (s) {
    case 'Approve':
      return 'Waiting'
    case 'Visited':
      return 'In OPD'
    case 'Finish':
      return 'Done'
    case 'NoShow':
      return 'No-show'
    default:
      return s
  }
}

/** mm:ss-style wait formatting from seconds (tabular-friendly). */
export function waitLabel(seconds: number): string {
  if (seconds < 60) return `${Math.max(0, Math.floor(seconds))}s`
  const m = Math.floor(seconds / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m`
}
