import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/patient/aturseva/unread — sidebar badge count.
 *
 * Aturseva's messages (roles 'aturseva' + 'action') newer than the last time
 * the patient SAW the thread (full chat window load / FAB sheet open — both
 * call GET /aturseva/chat?markRead=1). Today this lights up for booking
 * confirmations and turns answered while elsewhere; Phase 3's proactive
 * watcher will ride the same rail.
 */
export async function GET(req: NextRequest) {
  const user = await requireRole(req, 'patient')
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const conversation = await db.atursevaConversation.findUnique({
    where: { userId: user.id },
    select: { id: true, lastReadAt: true },
  })

  if (!conversation) {
    return NextResponse.json({ success: true, count: 0 })
  }

  const count = await db.atursevaMessage.count({
    where: {
      conversationId: conversation.id,
      role: { in: ['aturseva', 'action'] },
      createdAt: { gt: conversation.lastReadAt ?? new Date(0) },
    },
  })

  return NextResponse.json({ success: true, count })
}
