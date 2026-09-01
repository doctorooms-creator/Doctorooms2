// Shared insurance UI helpers

export const PREAUTH_STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-900/40 dark:text-slate-300',
  Submitted: 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  Approved: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
  PartiallyApproved: 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  Rejected: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300',
}

export const CLAIM_STATUS_BADGE: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-900/40 dark:text-slate-300',
  Submitted: 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  UnderReview: 'bg-violet-100 text-violet-800 hover:bg-violet-200 dark:bg-violet-900/30 dark:text-violet-300',
  Approved: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
  PartiallyApproved: 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  Rejected: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300',
  Settled: 'bg-teal-100 text-teal-800 hover:bg-teal-200 dark:bg-teal-900/30 dark:text-teal-300',
}

export const POLICY_STATUS_BADGE: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
  Expired: 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-900/40 dark:text-slate-300',
  Cancelled: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300',
}

export const INSURANCE_TYPE_BADGE: Record<string, string> = {
  Cash: 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300',
  Insurance: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  TPA: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  CGHS: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  ESIC: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
}

export function fmtINR(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function fmtINR2(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}
