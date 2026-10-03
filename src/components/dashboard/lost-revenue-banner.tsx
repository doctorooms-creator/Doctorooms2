'use client'

/**
 * LostRevenueBanner — in-product conversion moment #1 (PRICING-STRATEGY §6).
 *
 * Appears on the doctor dashboard + earnings page when THIS WEEK has
 * no-shows: "Is hafte N no-shows = ₹X gaya. Pro ke auto-reminders se
 * 80% bach sakte the." + 1-click upgrade (soft wall dialog).
 *
 * Pro users never see it (they already have the recovery engine) — instead
 * nothing renders. Self-contained: fetches its own weekly summary.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { TrendingDown, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UpgradeWallDialog, UpgradeWallPayload } from '@/components/upgrade-wall-dialog'

interface LostRevenueWeek {
  noShowCount: number
  lostTotal: number
  recoverableEstimate: number
  gated: boolean
  upgrade: UpgradeWallPayload | null
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

/** Minimum weekly no-shows before the banner fires (avoid noise). */
const MIN_NOSHOWS = 2

export function LostRevenueBanner({ surface = 'dashboard_banner' }: { surface?: 'dashboard_banner' | 'earnings_banner' }) {
  const [wallOpen, setWallOpen] = useState(false)
  const [walletSpendable, setWalletSpendable] = useState<number | null>(null)

  const { data } = useQuery<LostRevenueWeek>({
    queryKey: ['lost-revenue', 'week'],
    queryFn: async () => {
      const r = await fetch('/api/dashboard/doctor/lost-revenue?period=week')
      if (!r.ok) throw new Error('Failed')
      return r.json()
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  // Show only when pain exists AND user is on a gated (Free) plan
  if (!data || data.noShowCount < MIN_NOSHOWS || !data.gated || !data.upgrade) return null

  const openWall = async () => {
    // Lazily fetch wallet so the dialog can offer the points path instantly
    if (walletSpendable === null) {
      fetch('/api/referral/me')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setWalletSpendable(d?.wallet?.spendable ?? 0))
        .catch(() => setWalletSpendable(0))
    }
    setWallOpen(true)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-red-200/70 dark:border-red-900/50 bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 dark:from-red-950/30 dark:via-orange-950/20 dark:to-amber-950/20 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        role="alert"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shrink-0">
            <TrendingDown className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              Is hafte {data.noShowCount} no-show{data.noShowCount > 1 ? 's' : ''} ={' '}
              <span className="text-red-600 dark:text-red-400">{inr(data.lostTotal)}</span> gaya
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pro ke auto-reminders se 80% bach sakte the — lagbhag{' '}
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">{inr(data.recoverableEstimate)}</span>{' '}
              wapas.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={openWall}
            className="gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white h-9"
          >
            <Sparkles className="h-3.5 w-3.5" />
            1-click Pro
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground h-9">
            <a href="/dashboard/doctor/lost-revenue">
              Full report <ArrowRight className="ml-0.5 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </motion.div>

      <UpgradeWallDialog
        open={wallOpen}
        onOpenChange={setWallOpen}
        wall={data.upgrade}
        walletSpendable={walletSpendable ?? 0}
        source={surface}
      />
    </>
  )
}
