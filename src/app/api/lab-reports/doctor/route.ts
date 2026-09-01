import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

/**
 * GET /api/lab-reports/doctor
 *   Doctor: list all reports across all my patients' external test orders.
 *   Optional ?status=Completed to filter.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const doctor = await db.doctor.findUnique({ where: { userId: user.id } })
    if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || ''

    const where: Record<string, unknown> = {
      externalOrder: { doctorId: doctor.id },
    }
    if (status) where.externalOrder = { ...((where.externalOrder as object) || {}), status }

    const reports = await db.labReportUpload.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
      include: {
        externalOrder: {
          select: {
            id: true,
            orderNo: true,
            testName: true,
            testType: true,
            testFee: true,
            status: true,
            urgency: true,
            orderedAt: true,
            completedAt: true,
            notes: true,
            patient: { select: { id: true, name: true, gender: true, mobileNo: true } },
          },
        },
        labPartner: { select: { id: true, labName: true, city: true, mobile: true } },
      },
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('lab-reports/doctor GET error:', error)
    return NextResponse.json({ error: 'Failed to load doctor reports' }, { status: 500 })
  }
}
