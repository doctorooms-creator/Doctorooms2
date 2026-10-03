'use client'

/**
 * Public referral leaderboard — social proof engine (docs/REFERRAL-SYSTEM-PLAN.md §6).
 * Data is server-rendered (masked names only — privacy by design) and passed
 * down as props. Shows: hero + champion spotlight, top-3 podium, ranked table,
 * how-it-works strip and a join CTA.
 */

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Crown, Medal, Trophy, Users, Gift, Sparkles, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface LeaderboardEntry {
  rank: number
  name: string
  specialty: string | null
  city: string | null
  points: number
  referrals: number
  conversions: number
  champion: boolean
}

const fmt = (n: number) => n.toLocaleString('en-IN')

const PODIUM_STYLES = [
  // 1st — gold
  {
    order: 'md:order-2',
    pedestal: 'h-28 bg-gradient-to-t from-amber-500/80 to-amber-300/60',
    ring: 'ring-2 ring-amber-400/70',
    medal: 'bg-gradient-to-br from-amber-400 to-amber-600',
    scale: 'md:scale-110',
  },
  // 2nd — silver
  {
    order: 'md:order-1',
    pedestal: 'h-20 bg-gradient-to-t from-slate-400/70 to-slate-300/50',
    ring: 'ring-2 ring-slate-300/70',
    medal: 'bg-gradient-to-br from-slate-300 to-slate-500',
    scale: 'md:scale-100',
  },
  // 3rd — bronze
  {
    order: 'md:order-3',
    pedestal: 'h-14 bg-gradient-to-t from-orange-600/70 to-orange-400/50',
    ring: 'ring-2 ring-orange-400/60',
    medal: 'bg-gradient-to-br from-orange-400 to-orange-600',
    scale: 'md:scale-95',
  },
]

export function LeaderboardClient({ entries }: { entries: LeaderboardEntry[] }) {
  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)
  const champion = entries.find((e) => e.champion)
  const totalReferrals = entries.reduce((s, e) => s + e.referrals, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-background to-background dark:from-amber-950/10">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 py-16 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-amber-400/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <Badge
            variant="secondary"
            className="mb-4 gap-1.5 rounded-full border border-amber-200/60 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Doctors Helping Doctors
          </Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Referral{' '}
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              Leaderboard
            </span>
          </h1>
          <p className="mx-auto mb-6 max-w-xl text-base text-muted-foreground">
            Top doctors jo apne colleagues ko Doctorooms par la rahe hain — har referral se points,
            aur points se poora Pro plan FREE. Names privacy ke liye masked hain.
          </p>
          <div className="mb-8 flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 text-amber-500" aria-hidden="true" />
              <span>
                <strong className="text-foreground">{totalReferrals}</strong> total referrals
              </span>
            </div>
            {champion && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Crown className="h-4 w-4 text-amber-500" aria-hidden="true" />
                <span>
                  Champion: <strong className="text-foreground">{champion.name}</strong>
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:from-amber-600 hover:to-orange-600"
            >
              <Link href="/register">
                <Gift className="mr-2 h-4 w-4" aria-hidden="true" />
                Join & Earn Points
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">
                Doctor Login
                <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Podium (top 3) ───────────────────────────────────────────── */}
      {top3.length > 0 && (
        <section aria-label="Top 3 referrers" className="px-4 pb-8">
          <div className="mx-auto flex max-w-3xl items-end justify-center gap-3 sm:gap-6">
            {top3.map((entry, i) => {
              const s = PODIUM_STYLES[i] ?? PODIUM_STYLES[2]
              return (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 * i, duration: 0.5, ease: 'easeOut' }}
                  className={`flex w-1/3 flex-col items-center ${s.order} ${s.scale}`}
                >
                  {/* Medal */}
                  <div
                    className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white shadow-lg ${s.medal}`}
                    aria-label={`Rank ${entry.rank}`}
                  >
                    {entry.rank === 1 ? (
                      <Trophy className="h-7 w-7" aria-hidden="true" />
                    ) : (
                      entry.rank
                    )}
                  </div>
                  {entry.champion && (
                    <Crown
                      className="mb-1 h-5 w-5 text-amber-500"
                      aria-label="Referral Champion"
                    />
                  )}
                  <Card className={`w-full ${s.ring} border-0 shadow-md`}>
                    <CardContent className="px-2 py-4 text-center sm:px-4">
                      <p className="truncate text-sm font-semibold text-foreground">{entry.name}</p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {entry.specialty || 'Doctor'}
                        {entry.city ? ` · ${entry.city}` : ''}
                      </p>
                      <p className="mt-2 text-lg font-bold text-amber-600 dark:text-amber-400">
                        {fmt(entry.points)}
                        <span className="ml-1 text-[10px] font-normal uppercase tracking-wide text-muted-foreground">
                          pts
                        </span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {entry.referrals} referrals · {entry.conversions} paid
                      </p>
                    </CardContent>
                  </Card>
                  <div className={`mt-0 w-full rounded-b-xl ${s.pedestal}`} aria-hidden="true" />
                </motion.div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Full table ───────────────────────────────────────────────── */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Medal className="h-5 w-5 text-amber-500" aria-hidden="true" />
            Full Rankings
          </h2>

          {rest.length === 0 && top3.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" aria-hidden="true" />
                <p className="font-medium text-foreground">Leaderboard abhi khali hai</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pehla referral karo aur #1 rank banne ka mauka pakdo!
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden border shadow-sm">
              <div className="divide-y">
                {entries.map((entry, i) => (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.35 }}
                    className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 sm:grid-cols-[3.5rem_1fr_6rem_7rem]"
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        entry.rank <= 3
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                      aria-label={`Rank ${entry.rank}`}
                    >
                      {entry.rank}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
                        {entry.name}
                        {entry.champion && (
                          <Crown
                            className="h-3.5 w-3.5 shrink-0 text-amber-500"
                            aria-label="Referral Champion"
                          />
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {entry.specialty || 'Doctor'}
                        {entry.city ? ` · ${entry.city}` : ''}
                      </p>
                    </div>
                    <span className="hidden text-xs text-muted-foreground sm:block">
                      {entry.referrals} refs · {entry.conversions} paid
                    </span>
                    <span className="text-right text-sm font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                      {fmt(entry.points)}
                      <span className="ml-1 text-[10px] font-normal uppercase text-muted-foreground">
                        pts
                      </span>
                    </span>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}

          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Points sirf earned referrals se (milestones included). Data 5-minute cache ke saath
            live update hota hai. — Top referring doctors, social proof engine ke liye banaya gaya
            hai.
          </p>
        </div>
      </section>

      {/* ── How it works strip ───────────────────────────────────────── */}
      <section className="border-t bg-muted/30 px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-foreground">
            Kaise rank banayein?
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Users,
                title: '1. Colleague ko refer karo',
                desc: 'Apna referral code share karo — WhatsApp creatives dashboard par ready milte hain.',
              },
              {
                icon: Sparkles,
                title: '2. Vo practice chalaye',
                desc: 'Pehla booking +300 pts, 20 bookings (regular practice) +700 pts, paid conversion +1,000 pts.',
              },
              {
                icon: Gift,
                title: '3. Points kharch karo',
                desc: '2,000 pts = 1 month Pro FREE. 20,000 pts = poora saal. Milestones par extra bonus!',
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
              >
                <Card className="h-full border-border/60">
                  <CardContent className="p-6">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                      <step.icon className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    </div>
                    <h3 className="mb-1.5 text-sm font-semibold text-foreground">{step.title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button
              asChild
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
            >
              <Link href="/register">
                <Gift className="mr-2 h-4 w-4" aria-hidden="true" />
                Referral program join karo
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
