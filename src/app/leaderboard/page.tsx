import type { Metadata } from 'next'
import { PublicLayout } from '@/components/layout/public-layout'
import { getLeaderboard } from '@/lib/referral'
import { LeaderboardClient } from './client'

export const revalidate = 300 // ISR — 5-minute cache, SEO-friendly

export const metadata: Metadata = {
  title: 'Doctor Referral Leaderboard — Top Doctors of Doctorooms',
  description:
    'India ke top referring doctors ka public leaderboard. Referrals se points kamaye, Pro plan free pay karein, aur leaderboard par rank banayein.',
  openGraph: {
    title: 'Doctorooms Referral Leaderboard',
    description:
      'Top doctors referring colleagues on Doctorooms — masked names, real points. Join the referral program and earn your Pro plan free.',
    type: 'website',
  },
}

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard(20)

  return (
    <PublicLayout>
      <LeaderboardClient entries={leaderboard} />
    </PublicLayout>
  )
}
