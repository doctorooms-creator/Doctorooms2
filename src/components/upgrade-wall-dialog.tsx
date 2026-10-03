'use client'

/**
 * UpgradeWallDialog — the reusable soft upgrade wall (PRICING-STRATEGY §3.3).
 *
 * Any API that returns HTTP 402 with `{ upgrade: {...} }` payload renders here.
 * Growth-celebration framing (never "denied") + three paths:
 *   1. Points se Pro (referral wallet ≥ 2,000 → instant pro_month activation)
 *   2. Founder Pricing waitlist (₹4,999/yr forever — cash path via sales)
 *   3. Referral page (earn points: "1 referral = 1 mahina Pro free")
 *
 * Instrumented (§7): wall_viewed on open, wall_upgraded on points-redeem,
 * founder_interest on lock — all tagged with `source` so we learn which
 * trigger earns. Fire-and-forget, never blocks the UX.
 */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Sparkles, Gift, Crown, TrendingUp, RefreshCw, CheckCircle2,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface UpgradeWallPayload {
  reason: 'ai' | 'whatsapp' | 'receptionist_seats' | 'nurse_seats' | 'doctor_seats' | 'lost_revenue'
  used: number
  limit: number
  planKey: 'free' | 'pro' | 'hospital'
  planName: string
  message: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  wall: UpgradeWallPayload | null
  /** Referral wallet spendable points (fetched lazily if not provided). */
  walletSpendable?: number
  /** 'self' = the doctor/hospital themselves (upgrade actions live).
   *  'admin' = platform admin hit the wall on someone's hospital — inform only. */
  mode?: 'self' | 'admin'
  /** Funnel attribution (§7): which surface showed the wall. Defaults to wall.reason. */
  source?: string
}

/** Fire-and-forget funnel event — never blocks the UX. */
function track(type: string, source: string, meta?: Record<string, unknown>) {
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, source, meta }),
  }).catch(() => {})
}

const REASON_META: Record<UpgradeWallPayload['reason'], { title: string; highlight: string }> = {
  ai: { title: 'Dr. Copilot ke regular user ban gaye 🎉', highlight: 'Pro mein 500 AI credits/mo' },
  whatsapp: { title: 'Aapke reminders chale nahi ruk rahe 🚀', highlight: 'Pro mein 1,000 auto-reminders/mo' },
  receptionist_seats: { title: 'Clinic badh rahi hai! 🎉', highlight: 'Pro mein 3 receptionist + 3 nurse seats' },
  nurse_seats: { title: 'Clinic badh rahi hai! 🎉', highlight: 'Pro mein 3+3 staff accounts' },
  doctor_seats: { title: 'Practice badh rahi hai! 🎉', highlight: 'Pro mein 3 doctor seats' },
  lost_revenue: { title: 'No-shows aapka paisa le rahe hain 💸', highlight: 'Pro mein full Lost Revenue report + auto-reminders' },
}

const VALUE_STACK = [
  { item: 'WhatsApp auto-reminders (no-show recovery)', worth: '₹3,600' },
  { item: 'Patient recall campaigns', worth: '₹2,400' },
  { item: 'AI Copilot — Rx + summaries (2 hr/day)', worth: '₹3,000' },
  { item: 'Money dashboard + Lost Revenue report', worth: '₹500' },
  { item: 'Staff accounts (3+3 seats)', worth: '₹1,200' },
]

export function UpgradeWallDialog({ open, onOpenChange, wall, walletSpendable = 0, mode = 'self', source }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [redeeming, setRedeeming] = useState(false)
  const [interestDone, setInterestDone] = useState(false)

  const funnelSource = source ?? wall?.reason ?? 'unknown'

  // §7 instrumentation: count every wall impression (self mode only)
  useEffect(() => {
    if (open && wall && mode === 'self') {
      track('wall_viewed', funnelSource, { reason: wall.reason, planKey: wall.planKey })
    }
  }, [open, wall, mode, funnelSource])

  if (!wall) return null
  const meta = REASON_META[wall.reason]
  const canPoints = walletSpendable >= 2000

  const redeemProMonth = async () => {
    setRedeeming(true)
    try {
      const r = await fetch('/api/referral/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemType: 'pro_month' }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || d.hint || 'Redemption failed')
      track('wall_upgraded', funnelSource, { via: 'points' })
      toast.success('🎉 Pro activated — 1 month, points se! (30 din valid)')
      queryClient.invalidateQueries({ queryKey: ['plans-me'] })
      queryClient.invalidateQueries({ queryKey: ['referral-me'] })
      onOpenChange(false)
      router.push('/dashboard/doctor/billing')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Redemption failed')
    } finally {
      setRedeeming(false)
    }
  }

  const lockFounder = async () => {
    try {
      const r = await fetch('/api/plans/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey: 'pro' }),
      })
      if (!r.ok) throw new Error('Failed')
      track('founder_interest', funnelSource)
      setInterestDone(true)
      toast.success('Founder Pricing interest lock ho gaya — team aapse contact karegi 🤝')
    } catch {
      toast.error('Thodi der baad try karein')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-amber-500" />
            {meta.title}
          </DialogTitle>
          <DialogDescription className="text-left">
            {wall.message}
          </DialogDescription>
        </DialogHeader>

        {/* Value stack */}
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 p-4">
          <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Pro value stack — ₹10,700/mo worth
          </p>
          <div className="space-y-1.5">
            {VALUE_STACK.map((v) => (
              <div key={v.item} className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">{v.item}</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">{v.worth}</span>
              </div>
            ))}
            <div className="pt-1.5 mt-1.5 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Aapki price</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                ₹833/mo · ₹9,999/yr
              </span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 italic">
            Ek patient ki fees = poore mahine ka software.
          </p>
        </div>

        {/* Actions */}
        {mode === 'admin' ? (
          <div className="space-y-2">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 p-3 text-xs text-muted-foreground">
              Yeh hospital <span className="font-semibold text-foreground">{wall.planName}</span> plan par hai
              ({wall.used}/{wall.limit} seats in use). Staff banane ke liye hospital ko Pro plan chahiye —
              pricing page par hospital admin ko bhejein.
            </div>
            <Button onClick={() => onOpenChange(false)} className="w-full h-11">
              Samajh gaya
            </Button>
          </div>
        ) : (
        <div className="space-y-2">
          {canPoints ? (
            <Button
              onClick={redeemProMonth}
              disabled={redeeming}
              className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 h-11"
            >
              {redeeming ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
              {redeeming ? 'Activating…' : `2,000 points se Pro activate karo (wallet: ${walletSpendable.toLocaleString('en-IN')})`}
            </Button>
          ) : (
            <Button
              onClick={() => { onOpenChange(false); router.push('/dashboard/doctor/referral') }}
              variant="outline"
              className="w-full gap-2 h-11 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            >
              <Gift className="h-4 w-4 text-emerald-600" />
              Points kamayo — 1 referral = 1 mahina Pro FREE
            </Button>
          )}

          {interestDone ? (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-medium py-2.5">
              <CheckCircle2 className="h-4 w-4" />
              Founder seat interest registered ✅
            </div>
          ) : (
            <Button onClick={lockFounder} variant="outline" className="w-full gap-2 h-11">
              <Crown className="h-4 w-4 text-amber-500" />
              Founder Pricing — ₹4,999/yr forever
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-0 text-[10px] ml-1">
                best deal
              </Badge>
            </Button>
          )}

          <Button
            onClick={() => { onOpenChange(false); router.push('/dashboard/doctor/billing') }}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            Saare plans dekhein →
          </Button>
        </div>
        )}

        <p className="text-[10px] text-center text-muted-foreground">
          60-day ROI guarantee · Cancel anytime · Data hamesha aapka (CSV export)
        </p>
      </DialogContent>
    </Dialog>
  )
}
