import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

/**
 * POST /api/plans/interest  body: { planKey?: 'pro'|'hospital' }
 * Founder-pricing / upgrade interest capture (payment gateway ships with
 * Razorpay). Logged as a HospitalInquiry so the sales funnel sees it in the
 * existing Inquiries pipeline — zero new infra.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user || !['doctor', 'hospital'].includes(user.role)) {
      return NextResponse.json({ error: 'Doctor or hospital access required' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const planKey = body.planKey === 'hospital' ? 'hospital' : 'pro'

    await db.hospitalInquiry.create({
      data: {
        name: user.name,
        email: user.email,
        phone: user.mobileNo || '',
        department: 'Sales',
        subject: `Founder Pricing Interest — ${planKey === 'hospital' ? 'Hospital Pro' : 'Pro'}`,
        message: `Doctorooms ${planKey === 'hospital' ? 'Hospital Pro' : 'Pro'} plan interest from ${user.name} (${user.role}, userId ${user.id}). Online payment launching soon — founder pricing lock requested.`,
        status: 'Pending',
        userId: user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[plans/interest] error:', err)
    return NextResponse.json({ error: 'Failed to record interest' }, { status: 500 })
  }
}
