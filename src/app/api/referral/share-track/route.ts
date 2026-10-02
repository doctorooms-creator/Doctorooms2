import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

/**
 * POST /api/referral/share-track
 * Fire-and-forget analytics — increments the code's click counter when the
 * doctor uses the share buttons. Never blocks the UI.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rc = await db.referralCode.findUnique({ where: { userId: user.id } })
    if (!rc) {
      return NextResponse.json({ success: false }, { status: 404 })
    }

    await db.referralCode.update({
      where: { id: rc.id },
      data: { clicks: { increment: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
