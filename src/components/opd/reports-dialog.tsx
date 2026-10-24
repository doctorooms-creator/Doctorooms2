'use client'

/**
 * Reports inbox dialog (03 §3.5 + Phase D) — the doctor's report-review
 * surface. Opens from the facts strip ("N reports ready") and the idle
 * reports hero. shadcn/ui Dialog (portal, focus trap, Esc) styled with the
 * cockpit token set so it reads as the same product.
 *
 * Data law: every value/flag/delta comes from the cockpit aggregate —
 * the dialog never invents a number. Deltas are neutral ink (clinical
 * direction semantics are the doctor's call); only the ABNORMAL flag
 * earns the red family, one mark per row.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ExternalLink } from 'lucide-react'
import type { OpdReportInboxItem } from './types'

interface ReportsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reports: OpdReportInboxItem[]
}

function readyLabel(readyAt: string): string {
  const d = new Date(readyAt)
  const mins = Math.floor((Date.now() - d.getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  // Day-level labels speak IST — the clinic's clock, not the browser's.
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })
}

export function ReportsDialog({ open, onOpenChange, reports }: ReportsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="opd-root max-w-[520px] gap-0 rounded-[var(--opd-radius-card)] p-0 sm:max-w-[520px]"
        style={{ background: 'var(--opd-surface)', borderColor: 'var(--opd-border)' }}
      >
        <DialogHeader className="px-5 pt-5 pb-3 text-left">
          <DialogTitle
            className="text-[16px] font-semibold leading-tight"
            style={{ color: 'var(--opd-text)' }}
          >
            Reports ready
          </DialogTitle>
          <DialogDescription className="text-[12px]" style={{ color: 'var(--opd-muted)' }}>
            {reports.length === 1
              ? '1 report from the last 7 days — values and changes below.'
              : `${reports.length} reports from the last 7 days — values and changes below.`}
          </DialogDescription>
        </DialogHeader>

        <div
          className="opd-queue-scroll max-h-[60vh] overflow-y-auto border-t"
          style={{ borderColor: 'var(--opd-rule)' }}
          role="list"
          aria-label="Reports ready to review"
        >
          {reports.map((r) => (
            <a
              key={r.labReportId}
              href={`/print/lab-report/${r.labReportId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="opd-press flex items-center gap-3 border-b px-5 py-3 no-underline"
              style={{ borderColor: 'var(--opd-rule)', color: 'inherit' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--opd-raised)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              role="listitem"
              title={`Open ${r.patientName}'s ${r.testName} report`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold" style={{ color: 'var(--opd-text)' }}>
                  {r.patientName}
                </p>
                <p className="truncate text-[12px]" style={{ color: 'var(--opd-muted)' }}>
                  {r.testName} · {readyLabel(r.readyAt)}
                </p>
                {r.previousValue && (
                  <p className="opd-num truncate text-[11px]" style={{ color: 'var(--opd-faint)' }}>
                    was {r.previousValue}
                    {r.previousDate ? ` (${r.previousDate.slice(5)})` : ''}
                  </p>
                )}
              </div>

              <div className="shrink-0 text-right">
                <p className="opd-num text-[15px] font-semibold" style={{ color: 'var(--opd-text)' }}>
                  {r.value ?? '—'}
                  {r.unit ? <span className="text-[11px] font-normal" style={{ color: 'var(--opd-faint)' }}> {r.unit}</span> : null}
                </p>
                {r.flag === 'abnormal' ? (
                  <span
                    className="rounded-[var(--opd-radius-chip)] px-1.5 py-px text-[10px] font-semibold"
                    style={{ background: 'var(--opd-neg-bg)', color: 'var(--opd-neg-ink)' }}
                  >
                    ABNORMAL
                  </span>
                ) : r.flag === 'normal' ? (
                  <span className="text-[11px]" style={{ color: 'var(--opd-positive)' }}>
                    normal
                  </span>
                ) : null}
              </div>

              <ExternalLink className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--opd-faint)' }} aria-hidden="true" />
            </a>
          ))}
        </div>

        <p
          className="border-t px-5 py-2.5 text-[11px]"
          style={{ borderColor: 'var(--opd-rule)', color: 'var(--opd-faint)' }}
        >
          Tap a report to open it — filing happens from the hospital lab page.
        </p>
      </DialogContent>
    </Dialog>
  )
}
