import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { requireRole } from '@/lib/api-auth'
import { parseRxPhoto } from '@/lib/sevika/rx-parse'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const photoSchema = z.object({
  imageBase64: z.string().min(50).max(6_500_000),
  mimeType: z.enum(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic', 'image/heif']),
})

/**
 * POST /api/dashboard/patient/sevika/parse-photo
 * Photo-RX parse (AI-NURSE-PLAN.md §2.1, P2): patient uploads a paper
 * prescription or medicine-strip photo → VLM extracts a DRAFT medicine list.
 * NOTHING is saved here — the patient reviews + confirms in the UI, and
 * schedules are then created via POST /schedules (confirm-first safety rail).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    const parsed = photoSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const result = await parseRxPhoto(parsed.data.imageBase64, parsed.data.mimeType)
    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 422 })
    }

    return NextResponse.json({
      doctorName: result.doctorName,
      patientNote: result.patientNote,
      medicines: result.medicines,
    })
  } catch (err) {
    console.error('[sevika/parse-photo] error:', err)
    return NextResponse.json({ error: 'Photo parse fail ho gaya' }, { status: 500 })
  }
}
