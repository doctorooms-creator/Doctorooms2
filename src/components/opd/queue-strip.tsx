'use client'

/**
 * Queue strip (03 §3.4) — rules + alignment, no zebra, tabular tokens.
 * Existing FIFO + emergency tier data; row actions: No-show (waiting),
 * Send In Now (emergency). Called rows compact to done rows.
 */

import { motion } from 'framer-motion'
import { Check, Video } from 'lucide-react'
import { statusWords, waitLabel, type OpdQueueItem } from './types'
import { SpinnerDot } from './hero-patient-card'

interface QueueStripProps {
  queue: OpdQueueItem[]
  currentId: string | null
  onNoShow: (bookingId: string) => void
  noShowPendingId: string | null
  onSendIn: (bookingId: string) => void
  sendInPendingId: string | null
}

export function QueueStrip({ queue, currentId, onNoShow, noShowPendingId, onSendIn, sendInPendingId }: QueueStripProps) {
  if (queue.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-[var(--opd-radius-card)] border py-6"
        style={{ background: 'var(--opd-surface)', borderColor: 'var(--opd-border)' }}
      >
        <p className="text-[13px]" style={{ color: 'var(--opd-muted)' }}>
          No patients yet — the queue fills as reception books.
        </p>
      </div>
    )
  }

  return (
    <div
      className="opd-queue-scroll overflow-y-auto rounded-[var(--opd-radius-card)] border"
      style={{ background: 'var(--opd-surface)', borderColor: 'var(--opd-border)', maxHeight: 260 }}
      role="list"
      aria-label="Today's queue"
    >
      {queue.map((item, i) => {
        const isDone = item.status === 'Finish'
        const isNoShow = item.status === 'NoShow'
        const isCurrent = item.id === currentId
        const isEmergency = item.isEmergency && item.status === 'Approve'

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{
              opacity: isDone || isNoShow ? 0.55 : 1,
              x: 0,
              // Phase E (02 §5.3 step 5): the called row converts to a compact
              // done row — height eases 44→32 (220ms) while the wait-timer of
              // the next row picks up.
              height: isDone || isNoShow ? 32 : 44,
            }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: i < 3 ? i * 0.04 : 0 }}
            className="flex items-center gap-3 px-4"
            style={{
              borderBottom: '1px solid var(--opd-rule)',
              background: isCurrent ? 'var(--opd-accent-pale)' : 'transparent',
              transition: 'background-color var(--opd-dur-state) ease',
            }}
            role="listitem"
            onMouseEnter={(e) => !isCurrent && (e.currentTarget.style.background = 'var(--opd-raised)')}
            onMouseLeave={(e) => !isCurrent && (e.currentTarget.style.background = 'transparent')}
          >
            {/* Token — tabular ink 600 */}
            <span
              className="opd-num w-[76px] shrink-0 text-[13px] font-semibold"
              style={{ color: isEmergency ? 'var(--opd-negative)' : 'var(--opd-text)' }}
            >
              {item.tokenNumber || `#${item.tokenOrder || i + 1}`}
            </span>

            {/* Emergency mark — one red mark per object (02 §4) */}
            {isEmergency && (
              <span
                className="shrink-0 rounded-[var(--opd-radius-chip)] px-1 py-px text-[9px] font-semibold"
                style={{ background: 'var(--opd-neg-bg)', color: 'var(--opd-neg-ink)' }}
              >
                EMERGENCY
              </span>
            )}

            {/* Name + complaint */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium" style={{ color: 'var(--opd-text)' }}>
                {item.patientName}
                {item.age ? <span className="ml-1.5 font-normal" style={{ color: 'var(--opd-faint)' }}>{item.age}y</span> : null}
              </p>
              {!isDone && !isNoShow && (
                <p className="truncate text-[11px]" style={{ color: 'var(--opd-faint)' }}>
                  {item.disease || '—'}
                </p>
              )}
            </div>

            {/* Video badge */}
            {item.bookingMode === 'VideoCall' && !isDone && (
              <span
                className="flex shrink-0 items-center gap-0.5 rounded-[var(--opd-radius-chip)] px-1 py-px text-[9px] font-medium"
                style={{ background: 'var(--opd-accent-pale)', color: 'var(--opd-accent-deep)' }}
              >
                <Video className="h-2.5 w-2.5" aria-hidden="true" />
                VIDEO
              </span>
            )}

            {/* Wait timer — live, right-aligned tabular */}
            {item.status === 'Approve' && (
              <span className="opd-num shrink-0 text-[11px]" style={{ color: 'var(--opd-faint)' }}>
                {waitLabel(item.waitingSeconds)}
              </span>
            )}

            {/* Status — words of the trade */}
            {isDone && (
              <span className="flex shrink-0 items-center gap-1 text-[11px]" style={{ color: 'var(--opd-positive)' }}>
                <Check className="h-3 w-3" aria-hidden="true" />
                {statusWords(item.status)}
              </span>
            )}
            {isNoShow && (
              <span className="shrink-0 text-[11px]" style={{ color: 'var(--opd-warning)' }}>
                {statusWords(item.status)}
              </span>
            )}
            {item.status === 'Visited' && (
              <span
                className="shrink-0 rounded-[var(--opd-radius-chip)] px-1.5 py-0.5 text-[10px] font-medium"
                style={{ background: 'var(--opd-accent-pale)', color: 'var(--opd-accent-deep)' }}
              >
                {statusWords(item.status)}
              </span>
            )}

            {/* Row actions */}
            {isEmergency && (
              <button
                onClick={() => onSendIn(item.id)}
                disabled={sendInPendingId === item.id}
                className="opd-press shrink-0 rounded-[var(--opd-radius-chip)] px-2 py-1 text-[11px] font-semibold"
                style={{ background: 'var(--opd-primary)', color: 'var(--opd-primary-ink)' }}
                title="See this patient now — before the queue"
              >
                {sendInPendingId === item.id ? <SpinnerDot /> : 'Send In Now'}
              </button>
            )}
            {item.status === 'Approve' && !isEmergency && (
              <button
                onClick={() => onNoShow(item.id)}
                disabled={noShowPendingId === item.id}
                className="opd-press shrink-0 rounded-[var(--opd-radius-chip)] border px-2 py-1 text-[11px] font-medium"
                style={{ borderColor: 'var(--opd-control)', color: 'var(--opd-muted)' }}
                title="Mark as no-show"
              >
                {noShowPendingId === item.id ? <SpinnerDot /> : 'No-show'}
              </button>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
