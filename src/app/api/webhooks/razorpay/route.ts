import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { markReferralConverted, applyClawback } from '@/lib/referral'

/**
 * POST /api/webhooks/razorpay   (header: x-razorpay-signature)
 * Billing events → referral hooks (docs/REFERRAL-SYSTEM-PLAN.md §4):
 *   payment.captured → referee's referral CONVERTED (+1,000 & milestones)
 *   refund.processed → clawback (reverse the conversion award)
 *
 * Signature: HMAC-SHA256 of the RAW request body with RAZORPAY_WEBHOOK_SECRET.
 * Until billing ships (secret unset) this responds 501 — an honest no-op that
 * keeps the integration surface stable. When Razorpay orders are created,
 * embed notes.userId (the payer's User.id) so payments resolve to referrals.
 */
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Billing not configured yet' }, { status: 501 })
  }

  const raw = await req.text()
  const signature = req.headers.get('x-razorpay-signature') || ''
  const expected = crypto.createHmac('sha256', webhookSecret).update(raw).digest('hex')
  const valid =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event = ''
  let payerUserId: string | undefined
  try {
    const payload = JSON.parse(raw) as {
      event?: string
      payload?: {
        payment?: { entity?: { notes?: Record<string, string> } }
        refund?: { entity?: { notes?: Record<string, string> } }
      }
    }
    event = payload.event ?? ''
    const entity = payload.payload?.payment?.entity ?? payload.payload?.refund?.entity
    payerUserId = entity?.notes?.userId ?? entity?.notes?.refereeUserId
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!payerUserId) {
    // No user linkage in notes (non-subscription payment etc.) — ack & ignore.
    return NextResponse.json({ success: true, ignored: 'no userId in notes' })
  }

  if (event === 'payment.captured') {
    await markReferralConverted(payerUserId, 'razorpay')
  } else if (event === 'refund.processed') {
    await applyClawback(payerUserId, 'razorpay refund')
  }

  return NextResponse.json({ success: true, event })
}
