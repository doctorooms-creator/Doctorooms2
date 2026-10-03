import type { Metadata } from 'next'
import { db } from '@/lib/db'
import ReferralLandingClient from './client'

/**
 * Referral landing: /r/DR-AMIT-4821 (server wrapper)
 *
 * SEO (plan §9 Phase 3): per-invite metadata — WhatsApp/unfurl previews show
 * the referrer's name, so shared links feel personal and get clicked more.
 */

async function getReferrer(code: string): Promise<{ name: string } | null> {
  try {
    const row = await db.referralCode.findUnique({
      where: { code },
      select: {
        userId: true,
      },
    })
    if (!row) return null
    const user = await db.user.findUnique({
      where: { id: row.userId },
      select: { name: true },
    })
    return user ? { name: user.name } : null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>
}): Promise<Metadata> {
  const { code } = await params
  const cleanCode = (code ?? '').toString().toUpperCase()
  const referrer = await getReferrer(cleanCode)
  const title = referrer
    ? `${referrer.name} ne aapko Doctorooms par invite kiya`
    : 'Doctorooms par invite — 30 din ka full access'

  return {
    title,
    description:
      'Digital Rx 30 second mein, OPD queue management, WhatsApp reminders. Referral link se signup karo aur 30 din ka full access pao.',
    openGraph: {
      title,
      description:
        'Digital Rx 30 sec · OPD Queue · WhatsApp Reminders — referral link se 30 din free access',
      images: [{ url: '/referral/og-share.png', width: 1344, height: 768, alt: 'Doctorooms — Refer a Doctor, Earn Rewards' }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: 'Referral link se 30 din ka full access — Doctorooms',
      images: ['/referral/og-share.png'],
    },
    robots: { index: false }, // invite links are ephemeral — keep them out of SERPs
  }
}

export default async function ReferralLandingPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const cleanCode = (code ?? '').toString().toUpperCase()
  const referrer = await getReferrer(cleanCode)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'InviteAction',
    name: 'Doctorooms Doctor Referral',
    ...(referrer ? { actor: { '@type': 'Person', name: referrer.name } } : {}),
    target: `https://doctorooms.com/r/${cleanCode}`,
    description:
      'Signup with this referral link for 30 days of full Doctorooms access — digital Rx, OPD queue, WhatsApp reminders.',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReferralLandingClient />
    </>
  )
}
