import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * PUBLIC endpoint — doctor reviews & rating summary.
 * Mirrors /api/doctors/[id] resolution (accepts User.id or Doctor.id in the
 * URL) and its public/no-auth behaviour. Never exposes patient email, mobile
 * or ids — only a server-computed display name.
 */

/** First name + last initial, e.g. "Rahul Verma" → "Rahul V." */
function toPatientDisplayName(name: string | null | undefined): string {
  if (!name || !name.trim()) return 'Anonymous Patient'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  const firstName = parts[0]
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase()
  return `${firstName} ${lastInitial}.`
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // Resolve the doctor: support both User.id and Doctor.id in the URL param
    // (same pattern as /api/doctors/[id]).
    let user = await db.user.findUnique({
      where: { id, role: 'doctor', status: 'Active' },
      select: { id: true },
    })

    if (!user) {
      const doctor = await db.doctor.findUnique({
        where: { id },
        select: { userId: true },
      })
      if (doctor) {
        user = await db.user.findUnique({
          where: { id: doctor.userId, role: 'doctor', status: 'Active' },
          select: { id: true },
        })
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    // DoctorRating.doctorId references the doctor's USER id (see schema
    // relation "DoctorRatings"), same as the feedback + stats APIs.
    const ratings = await db.doctorRating.findMany({
      where: { doctorId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        star: true,
        review: true,
        wouldRecommend: true,
        isAnonymous: true,
        createdAt: true,
        patient: {
          select: { name: true },
        },
      },
    })

    const total = ratings.length
    const average =
      total > 0
        ? Math.round(
            (ratings.reduce((sum, r) => sum + r.star, 0) / total) * 10
          ) / 10
        : 0

    // Star distribution — every rating counts (even ones without review text)
    const distribution: Record<string, number> = {
      '5': 0,
      '4': 0,
      '3': 0,
      '2': 0,
      '1': 0,
    }
    for (const r of ratings) {
      const key = String(Math.min(5, Math.max(1, r.star)))
      distribution[key] += 1
    }

    const recommendCount = ratings.filter((r) => r.wouldRecommend).length
    const wouldRecommendPercent =
      total > 0 ? Math.round((recommendCount / total) * 100) : 0

    // Reviews list — only rows with actual review text (ratings without text
    // still count toward the summary/distribution above).
    const reviews = ratings
      .filter((r) => r.review && r.review.trim().length > 0)
      .map((r) => ({
        id: r.id,
        star: r.star,
        review: r.review.trim(),
        createdAt: r.createdAt,
        wouldRecommend: r.wouldRecommend,
        isAnonymous: r.isAnonymous,
        patientName: r.isAnonymous
          ? 'Anonymous Patient'
          : toPatientDisplayName(r.patient?.name),
      }))

    return NextResponse.json({
      summary: {
        average,
        total,
        distribution,
        wouldRecommendPercent,
      },
      reviews,
    })
  } catch (error) {
    console.error('Doctor reviews API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
