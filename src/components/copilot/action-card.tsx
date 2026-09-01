'use client'

/**
 * Dr. Copilot — Approve-Card (Phase B)
 *
 * Renders a proposed action (rx_draft / lab_order / followup) inside the
 * chat. The AI can only PROPOSE — the card stays "pending" until the doctor
 * taps Approve, which calls /api/copilot/action/[id] (server re-verifies
 * ownership and writes through production pathways).
 *
 * Visual states:
 *   pending  → Approve/Reject buttons (Approve disabled when safety=blocked)
 *   approved → emerald banner + execution result + deep link
 *   rejected → muted "Rejected" tag
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Pill,
  FlaskConical,
  CalendarClock,
  Layers,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  Ban,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { CopilotActionCard } from '@/lib/copilot/action-card'

const KIND_META = {
  rx_draft: { icon: Pill, label: 'Prescription draft', tint: 'text-teal-300', bg: 'bg-teal-500/15 border-teal-500/30' },
  lab_order: { icon: FlaskConical, label: 'Lab order', tint: 'text-amber-300', bg: 'bg-amber-500/15 border-amber-500/30' },
  followup: { icon: CalendarClock, label: 'Follow-up', tint: 'text-emerald-300', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  template_save: { icon: Layers, label: 'Rx template', tint: 'text-teal-300', bg: 'bg-teal-500/15 border-teal-500/30' },
} as const

export function ActionCardView({
  card,
  onDecided,
}: {
  card: CopilotActionCard
  onDecided?: (updated: CopilotActionCard) => void
}) {
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [local, setLocal] = useState<CopilotActionCard>(card)

  const meta = KIND_META[local.kind] ?? KIND_META.rx_draft
  const Icon = meta.icon
  const isPending = local.status === 'pending'
  const blocked = local.safety?.level === 'blocked'

  async function decide(decision: 'approve' | 'reject') {
    if (busy || !isPending) return
    setBusy(decision)
    setError(null)
    try {
      const res = await fetch(`/api/copilot/action/${local.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Action failed')
      }
      // Keep the original safety verdict visible after decision
      const updated: CopilotActionCard = { ...data.card, safety: local.safety }
      setLocal(updated)
      onDecided?.(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'w-full overflow-hidden rounded-xl border',
        local.status === 'approved' && 'border-emerald-500/40 bg-emerald-500/[0.07]',
        local.status === 'rejected' && 'border-zinc-800 bg-zinc-900/60 opacity-70',
        isPending && (blocked ? 'border-rose-500/40 bg-rose-500/[0.06]' : 'border-zinc-700 bg-zinc-900/80')
      )}
    >
      {/* Card header */}
      <div className="flex items-center gap-2.5 border-b border-zinc-800/80 px-3.5 py-2.5">
        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border', meta.bg)}>
          <Icon className={cn('h-4 w-4', meta.tint)} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-tight text-zinc-100">
            {meta.label}
          </p>
          <p className="truncate text-[11px] text-zinc-400">
            {local.patientName} · <span className="font-mono">{local.appointmentNo}</span>
          </p>
        </div>
        {local.status === 'approved' && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            <CheckCircle2 className="h-3 w-3" aria-hidden /> Approved
          </span>
        )}
        {local.status === 'rejected' && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
            <XCircle className="h-3 w-3" aria-hidden /> Rejected
          </span>
        )}
        {isPending && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" aria-hidden /> Pending
          </span>
        )}
      </div>

      {/* Body */}
      <div className="space-y-2.5 px-3.5 py-3">
        <p className="text-xs text-zinc-300">{local.summary}</p>

        {local.items?.length > 0 && (
          <ul className="space-y-1 rounded-lg border border-zinc-800 bg-zinc-950/60 p-2.5">
            {local.items.map((item, i) => (
              <li key={i} className="break-words font-mono text-[11px] leading-relaxed text-zinc-300">
                <span className="text-zinc-600">{i + 1}.</span> {item}
              </li>
            ))}
          </ul>
        )}

        {/* Safety verdict */}
        {isPending && local.safety && (
          <SafetyBanner level={local.safety.level} reasons={local.safety.reasons} />
        )}

        {/* Result (after approval) */}
        {local.status === 'approved' && local.result && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5">
            <p className="text-[11px] leading-relaxed text-emerald-200">{local.result.message}</p>
            {local.result.link && (
              <a
                href={local.result.link}
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 underline-offset-2 hover:underline"
              >
                <ExternalLink className="h-3 w-3" aria-hidden /> Open
              </a>
            )}
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-[11px] text-rose-300" role="alert">
            {error}
          </p>
        )}

        {/* Decision buttons */}
        {isPending && (
          <div className="flex items-center gap-2 pt-0.5">
            <Button
              size="sm"
              onClick={() => decide('approve')}
              disabled={busy !== null || blocked}
              className="h-8 flex-1 rounded-lg bg-teal-600 text-xs font-medium text-white hover:bg-teal-500 disabled:opacity-40"
            >
              {busy === 'approve' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              )}
              Approve &amp; save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => decide('reject')}
              disabled={busy !== null}
              className="h-8 flex-1 rounded-lg border border-zinc-700 bg-transparent text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              {busy === 'reject' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <XCircle className="h-3.5 w-3.5" aria-hidden />
              )}
              Reject
            </Button>
          </div>
        )}

        {isPending && blocked && (
          <p className="text-[10px] text-zinc-500">Approve is disabled — fix the issues above and ask again.</p>
        )}
      </div>
    </motion.div>
  )
}

function SafetyBanner({ level, reasons }: { level: 'ok' | 'warning' | 'blocked'; reasons: string[] }) {
  if (level === 'ok') {
    return (
      <p className="flex items-center gap-1.5 text-[10px] text-emerald-400">
        <ShieldCheck className="h-3 w-3" aria-hidden /> Safety checks passed ({SAFETY_RULE_COUNT} rules)
      </p>
    )
  }
  const isBlocked = level === 'blocked'
  return (
    <div
      className={cn(
        'rounded-lg border p-2.5',
        isBlocked ? 'border-rose-500/30 bg-rose-500/10' : 'border-amber-500/30 bg-amber-500/10'
      )}
      role="status"
    >
      <p className={cn('flex items-center gap-1.5 text-[11px] font-medium', isBlocked ? 'text-rose-300' : 'text-amber-300')}>
        {isBlocked ? (
          <Ban className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
        )}
        {isBlocked ? 'Blocked by safety check' : `Cautions (${reasons.length})`}
      </p>
      <ul className="mt-1 space-y-0.5">
        {reasons.map((r, i) => (
          <li key={i} className={cn('break-words text-[11px] leading-relaxed', isBlocked ? 'text-rose-200' : 'text-amber-200')}>
            • {r}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Kept in sync with agents/safety.ts rule count for the "passed" label. */
const SAFETY_RULE_COUNT = 12
