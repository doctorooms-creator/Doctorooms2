import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { todayISTRange } from '@/lib/date-utils'

/**
 * PUBLIC: List doctors in a department (for kiosk doctor selection).
 * No auth required — only shows doctor name, specialization, fees, queue length.
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ hospitalId: string; departmentId: string }> }
) {
  try {
    const { hospitalId, departmentId } = await params

    const doctorLinks = await db.doctorHospital.findMany({
      where: {
        hospitalId,
        departmentId,
        status: 'Active',
        isAvailable: true,
      },
      include: {
        doctor: {
          include: {
            user: { select: { name: true, profileImg: true } },
          },
        },
      },
    })

    const { start: startOfDay, end: endOfDay } = todayISTRange()

    // Get queue counts for each doctor
    const doctorsWithQueue = await Promise.all(
      doctorLinks.map(async (link) => {
        const queueCount = await db.booking.count({
          where: {
            doctorId: link.doctorId,
            bookingDate: { gte: startOfDay, lte: endOfDay },
            status: { in: ['Approve', 'Visited'] },
          },
        })

        return {
          id: link.doctor.id,
          name: link.doctor.user.name,
          profileImg: link.doctor.user.profileImg,
          specialization: link.doctor.specialization,
          experience: link.doctor.experience,
          fees: link.fees || link.doctor.fees,
          designation: link.designation,
          queueLength: queueCount,
          dailyLimit: link.doctor.dailyLimit,
          isAvailable: queueCount < link.doctor.dailyLimit,
        }
      })
    )

    return NextResponse.json({ doctors: doctorsWithQueue })
  } catch (error) {
    console.error('Public doctors error:', error)
    return NextResponse.json({ error: 'Failed to load doctors' }, { status: 500 })
  }
}
