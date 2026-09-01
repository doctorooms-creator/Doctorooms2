import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { logCreate } from '@/lib/audit-log'
import { getAuditContext } from '@/lib/audit-context'

import { resolveAvatarUrl } from '@/lib/avatar-url'

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const completedBookings = await db.booking.findMany({
      where: {
        userId: user.id,
        status: { in: ['Visited', 'Finish'] },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        doctor: {
          include: {
            user: { select: { name: true, profileImg: true } },
          },
        },
      },
    })

    // Check ratings by bookingId for per-visit ratings
    const existingRatings = await db.doctorRating.findMany({
      where: { patientId: user.id },
      select: { bookingId: true, doctorId: true },
    })

    // Map bookingId -> rated for per-visit checks
    const ratedBookingIds = new Set(
      existingRatings.filter((r) => r.bookingId).map((r) => r.bookingId)
    )

    const feedbackList = completedBookings.map((b) => {
      const doctorUserId = b.doctor?.userId || ''
      return {
        id: b.id,
        appointmentNo: b.appointmentNo,
        doctorName: b.doctor?.user?.name || 'Unknown',
        doctorImg: resolveAvatarUrl(b.doctor?.user?.profileImg),
        doctorUserId,
        disease: b.disease,
        date: b.bookingDate,
        status: b.status,
        alreadyRated: ratedBookingIds.has(b.id),
      }
    })

    return NextResponse.json({ feedback: feedbackList })
  } catch (error) {
    console.error('Feedback list error:', error)
    return NextResponse.json({ error: 'Failed to load feedback' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'patient')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { bookingId, doctorUserId, star, consultationRating, waitTimeRating, staffRating, review, wouldRecommend, isAnonymous } = body

    if (!doctorUserId || !star) {
      return NextResponse.json({ error: 'Doctor and star rating are required' }, { status: 400 })
    }

    // If bookingId is provided, check for existing rating on this specific booking
    if (bookingId) {
      const existing = await db.doctorRating.findFirst({
        where: {
          patientId: user.id,
          bookingId: bookingId,
        },
      })

      if (existing) {
        // Update existing rating
        const updated = await db.doctorRating.update({
          where: { id: existing.id },
          data: {
            star,
            consultationRating: consultationRating || 0,
            waitTimeRating: waitTimeRating || 0,
            staffRating: staffRating || 0,
            review: review || '',
            wouldRecommend: wouldRecommend ?? true,
            isAnonymous: isAnonymous ?? false,
          },
        })
        return NextResponse.json(updated)
      }
    }

    // Check if already rated this doctor without bookingId (legacy behavior)
    const existingLegacy = await db.doctorRating.findFirst({
      where: {
        patientId: user.id,
        doctorId: doctorUserId,
        bookingId: null,
      },
    })

    if (existingLegacy && !bookingId) {
      return NextResponse.json({ error: 'Already rated this doctor' }, { status: 409 })
    }

    // Create new rating
    const rating = await db.doctorRating.create({
      data: {
        patientId: user.id,
        doctorId: doctorUserId,
        bookingId: bookingId || null,
        star,
        consultationRating: consultationRating || 0,
        waitTimeRating: waitTimeRating || 0,
        staffRating: staffRating || 0,
        review: review || '',
        wouldRecommend: wouldRecommend ?? true,
        isAnonymous: isAnonymous ?? false,
      },
    })

    // AUDIT (P2.8): Record patient-submitted doctor rating (new rating only).
    try {
      const auditCtx = getAuditContext(req)
      // Look up the doctor's display name for a meaningful audit message.
      let doctorName = doctorUserId
      try {
        const doctorUser = await db.user.findUnique({
          where: { id: doctorUserId },
          select: { name: true },
        })
        if (doctorUser?.name) doctorName = doctorUser.name
      } catch {
        // Fall back to the raw doctor userId if the name lookup fails
      }
      await logCreate(
        'doctor_rating',
        rating.id,
        user,
        `Rated Dr. ${doctorName} ${star}★ for booking ${bookingId || '—'}`,
        { doctorId: doctorUserId, rating: star, bookingId: bookingId || null },
        { ...auditCtx }
      )
    } catch (auditErr) {
      console.error('[audit-log] doctor rating create capture failed:', auditErr)
    }

    return NextResponse.json(rating, { status: 201 })
  } catch (error) {
    console.error('Feedback submit error:', error)
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}
