import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

import { resolveAvatarUrl } from '@/lib/avatar-url'

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const where: Prisma.BookingWhereInput = { userId: user.id }
    if (status && status !== 'All') {
      where.status = status
    }
    if (from && to) {
      where.bookingDate = { gte: new Date(from), lte: new Date(to + 'T23:59:59') }
    } else if (from) {
      where.bookingDate = { gte: new Date(from) }
    } else if (to) {
      where.bookingDate = { lte: new Date(to + 'T23:59:59') }
    }

    // SECURITY (P4.6): Add pagination — return 20 per page (max 100) instead of all.
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)))

    const [appointments, total] = await Promise.all([
      db.booking.findMany({
        where,
        orderBy: { bookingDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          doctor: {
            include: {
              user: { select: { name: true, profileImg: true } },
            },
          },
          prescriptions: {
            take: 1,
            select: { id: true },
          },
        },
      }),
      db.booking.count({ where }),
    ])

    const statusCounts = await db.booking.groupBy({
      by: ['status'],
      where: { userId: user.id },
      _count: { status: true },
    })

    const counts = statusCounts.reduce(
      (acc, s) => {
        acc[s.status] = s._count.status
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      appointments: appointments.map((b) => ({
        id: b.id,
        appointmentNo: b.appointmentNo,
        doctorName: b.doctor?.user?.name || 'Unknown',
        doctorImg: resolveAvatarUrl(b.doctor?.user?.profileImg),
        doctorSpecialization: b.doctor?.specialization || '',
        date: b.bookingDate,
        timeSlot: b.timeSlot,
        bookingMode: b.bookingMode,
        videoRoomId: b.videoRoomId,
        disease: b.disease,
        description: b.description,
        status: b.status,
        charge: b.appointmentCharge,
        hasPrescription: b.prescriptions.length > 0,
        createdAt: b.createdAt,
      })),
      counts,
      // Pagination metadata (P4.6)
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Patient appointments error:', error)
    return NextResponse.json({ error: 'Failed to load appointments' }, { status: 500 })
  }
}
