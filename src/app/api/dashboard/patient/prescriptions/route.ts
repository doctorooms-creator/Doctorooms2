import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'

import { resolveAvatarUrl } from '@/lib/avatar-url'

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    // SECURITY (P4.6): Add pagination — return 20 per page (max 100) instead of all.
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)))

    const where = {
      // Only finalized prescriptions — drafts are not real prescriptions yet.
      status: { not: 'Draft' } as const,
      booking: {
        userId: user.id,
        status: { in: ['Visited', 'Finish'] } as const,
      },
    }

    const [prescriptions, total] = await Promise.all([
      db.prescription.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          medicines: true,
          doctor: {
            include: {
              user: { select: { name: true, profileImg: true } },
            },
          },
          booking: {
            select: {
              id: true,
              appointmentNo: true,
              bookingDate: true,
              disease: true,
            },
          },
        },
      }),
      db.prescription.count({ where }),
    ])

    return NextResponse.json({
      prescriptions: prescriptions.map((p) => ({
        id: p.id,
        disease: p.disease,
        description: p.description,
        medicinesCount: p.medicines.length,
        medicines: p.medicines.map((m) => ({
          id: m.id,
          medicine: m.medicine,
          morning: m.morning,
          afternoon: m.afternoon,
          evening: m.evening,
          tab: m.tab,
          dose: m.dose,
          description: m.description,
        })),
        doctorName: p.doctor?.user?.name || 'Unknown',
        doctorImg: resolveAvatarUrl(p.doctor?.user?.profileImg),
        bookingId: p.bookingId,
        appointmentNo: p.booking?.appointmentNo || '',
        bookingDate: p.booking?.bookingDate || null,
        createdAt: p.createdAt,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Patient prescriptions error:', error)
    return NextResponse.json({ error: 'Failed to load prescriptions' }, { status: 500 })
  }
}
