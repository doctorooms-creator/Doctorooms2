import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { generateDoses } from '@/lib/sevika/schedule'

export const dynamic = 'force-dynamic'

const importSchema = z.object({
  prescriptionId: z.string().min(1),
  durationDays: z.number().int().min(1).max(90).optional().default(5),
})

/**
 * POST /api/dashboard/patient/sevika/import
 * Import medicines from one of the patient's OWN prescriptions (doctor's Rx)
 * into Sevika schedules. PMedicine.morning/afternoon/evening (0/1) map
 * directly to Sevika slots — exactly the "prescription → auto-schedule"
 * flow from AI-NURSE-PLAN.md §1 step 2-3 (doctor already confirmed the Rx;
 * no AI parse needed for in-app prescriptions).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    const parsed = importSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    // Ownership check: prescription → booking → THIS patient
    const prescription = await db.prescription.findFirst({
      where: { id: parsed.data.prescriptionId, booking: { userId: user.id } },
      include: { medicines: true },
    })
    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    const importable = prescription.medicines.filter(
      (m) => m.morning === 1 || m.afternoon === 1 || m.evening === 1
    )
    if (importable.length === 0) {
      return NextResponse.json(
        { error: 'Is prescription me koi timed medicine nahi mila' },
        { status: 422 }
      )
    }

    let totalDoses = 0
    const imported: string[] = []
    for (const m of importable) {
      const doseText = [m.tab && m.tab > 1 ? `${m.tab} tablet` : '', m.dose].filter(Boolean).join(' ').trim()
      const res = await generateDoses({
        userId: user.id,
        medicineName: m.medicine || 'Medicine',
        dose: doseText,
        instructions: m.description || '',
        morning: m.morning,
        afternoon: m.afternoon,
        evening: m.evening,
        durationDays: parsed.data.durationDays,
        source: 'Prescription',
        prescriptionId: prescription.id,
      })
      if (res.doses > 0) {
        totalDoses += res.doses
        imported.push(m.medicine)
      }
    }

    return NextResponse.json(
      { imported: imported.length, medicines: imported, doses: totalDoses },
      { status: 201 }
    )
  } catch (err) {
    console.error('[sevika/import] error:', err)
    return NextResponse.json({ error: 'Failed to import prescription' }, { status: 500 })
  }
}
