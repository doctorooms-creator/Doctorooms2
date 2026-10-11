import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { buildWeeklyReport } from '@/lib/sevika/weekly-report'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * GET /api/dashboard/patient/sevika/weekly-report[?refresh=1]
 * Weekly adherence report card (AI-NURSE-PLAN.md §2.5, P2): deterministic
 * day-wise stats + a warm Hinglish nurse narrative (1 LLM call, 12h cache).
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const refresh = new URL(req.url).searchParams.get('refresh') === '1'
    const report = await buildWeeklyReport(user.id, refresh)
    return NextResponse.json(report)
  } catch (err) {
    console.error('[sevika/weekly-report] error:', err)
    return NextResponse.json({ error: 'Failed to build weekly report' }, { status: 500 })
  }
}
