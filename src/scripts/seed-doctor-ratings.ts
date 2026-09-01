/**
 * ============================================================
 * SEED SCRIPT: Demo Doctor Ratings — Doctorooms HMS
 * ============================================================
 *
 * One-off script that seeds demo DoctorRating rows so the public
 * doctor profile "Patient Reviews" section has visible content.
 *
 *   - 6 ratings for Dr. Rajesh Sharma (incl. 1 with empty review text)
 *   - 5 ratings for Dr. Anita Desai
 *   - 5 ratings for Dr. Suresh Iyer
 *   - patientId = dev-patient (Rahul Verma), bookingId = null
 *   - NOTE: DoctorRating.doctorId references the doctor's USER id
 *     (relation "DoctorRatings" on User), not the Doctor profile id.
 *   - Varied stars (5/4/3), wouldRecommend mostly true, a few
 *     isAnonymous rows, staggered createdAt over the past months.
 *   - Idempotent: deletes this patient's existing ratings for the 3
 *     seeded doctors before inserting.
 *
 * Usage:
 *   bunx tsx src/scripts/seed-doctor-ratings.ts
 *   (or: bun run src/scripts/seed-doctor-ratings.ts)
 * ============================================================
 */

import { db } from '../lib/db'

// ──────────────────────────────────────────────────────────────
// DATE HELPERS
// ──────────────────────────────────────────────────────────────

const NOW = new Date()

/** Date N days in the past. */
function daysAgo(days: number): Date {
  const d = new Date(NOW)
  d.setDate(d.getDate() - days)
  return d
}

// ──────────────────────────────────────────────────────────────
// DATA
// ──────────────────────────────────────────────────────────────

interface SeedRating {
  star: number
  consultationRating: number
  waitTimeRating: number
  staffRating: number
  review: string
  wouldRecommend: boolean
  isAnonymous: boolean
  createdAt: Date
}

const sharmaRatings: SeedRating[] = [
  {
    star: 5,
    consultationRating: 5,
    waitTimeRating: 4,
    staffRating: 5,
    review:
      'Very patient doctor, explained my reports clearly and did not rush the consultation. He listened to all my doubts about my sugar levels and adjusted the dosage properly. Highly recommended.',
    wouldRecommend: true,
    isAnonymous: false,
    createdAt: daysAgo(12),
  },
  {
    star: 5,
    consultationRating: 5,
    waitTimeRating: 3,
    staffRating: 4,
    review:
      "Best physician in the area. My mother's fever was not coming down for a week, Dr. Sharma diagnosed typhoid on the first visit itself. Medicines were affordable too.",
    wouldRecommend: true,
    isAnonymous: true,
    createdAt: daysAgo(38),
  },
  {
    star: 4,
    consultationRating: 4,
    waitTimeRating: 3,
    staffRating: 4,
    review:
      'Good doctor, consultation was thorough. Waiting time was slightly long as he takes walk-ins also, but worth the wait. Staff at the clinic is polite.',
    wouldRecommend: true,
    isAnonymous: false,
    createdAt: daysAgo(67),
  },
  {
    star: 3,
    consultationRating: 4,
    waitTimeRating: 2,
    staffRating: 3,
    review:
      'Consultation was okay but I had to wait almost an hour beyond my appointment time. Doctor is knowledgeable, though I felt the explanation was a bit quick.',
    wouldRecommend: false,
    isAnonymous: false,
    createdAt: daysAgo(95),
  },
  {
    star: 4,
    consultationRating: 5,
    waitTimeRating: 4,
    staffRating: 4,
    review:
      'He explains the root cause instead of just prescribing medicines. Follow-up for my BP readings was very helpful. Clinic is easy to locate.',
    wouldRecommend: true,
    isAnonymous: false,
    createdAt: daysAgo(140),
  },
  {
    // Star-only rating (no written review) — counts in summary, excluded
    // from the public reviews list by the API.
    star: 5,
    consultationRating: 5,
    waitTimeRating: 4,
    staffRating: 5,
    review: '',
    wouldRecommend: true,
    isAnonymous: false,
    createdAt: daysAgo(180),
  },
]

const anitaRatings: SeedRating[] = [
  {
    star: 5,
    consultationRating: 5,
    waitTimeRating: 4,
    staffRating: 5,
    review:
      'Dr. Desai is very calm and reassuring. She explained my thyroid report in simple words and did not order unnecessary tests. The hospital staff was also very cooperative.',
    wouldRecommend: true,
    isAnonymous: false,
    createdAt: daysAgo(9),
  },
  {
    star: 4,
    consultationRating: 4,
    waitTimeRating: 3,
    staffRating: 4,
    review:
      'Detailed consultation and clear prescription. The hospital waiting area was crowded but the doctor herself was punctual.',
    wouldRecommend: true,
    isAnonymous: false,
    createdAt: daysAgo(45),
  },
  {
    star: 5,
    consultationRating: 5,
    waitTimeRating: 4,
    staffRating: 5,
    review:
      "She treated my father's diabetes very systematically. Sugar is under control for the first time in years. God bless her.",
    wouldRecommend: true,
    isAnonymous: true,
    createdAt: daysAgo(82),
  },
  {
    star: 4,
    consultationRating: 5,
    waitTimeRating: 3,
    staffRating: 4,
    review:
      'Very professional and soft-spoken. She spent good time understanding my symptoms before advising any medicines.',
    wouldRecommend: true,
    isAnonymous: false,
    createdAt: daysAgo(120),
  },
  {
    star: 3,
    consultationRating: 4,
    waitTimeRating: 2,
    staffRating: 3,
    review:
      'Doctor is good but getting an appointment slot is difficult, everything gets booked fast. Consultation felt a bit short for the wait.',
    wouldRecommend: false,
    isAnonymous: false,
    createdAt: daysAgo(165),
  },
]

const sureshRatings: SeedRating[] = [
  {
    star: 5,
    consultationRating: 5,
    waitTimeRating: 4,
    staffRating: 5,
    review:
      'Excellent cardiologist. My ECG and echo were done in-house and he explained every point on the report. Chest discomfort while walking is now much better with his treatment.',
    wouldRecommend: true,
    isAnonymous: false,
    createdAt: daysAgo(15),
  },
  {
    star: 5,
    consultationRating: 5,
    waitTimeRating: 3,
    staffRating: 4,
    review:
      'I had palpitations for months. Dr. Iyer found the exact cause and reassured me without loading me with unnecessary medicines. Very genuine doctor.',
    wouldRecommend: true,
    isAnonymous: true,
    createdAt: daysAgo(55),
  },
  {
    star: 4,
    consultationRating: 5,
    waitTimeRating: 3,
    staffRating: 4,
    review:
      'Very experienced senior doctor. He reviews the full history carefully. OPD waiting time on Saturday is long, so reach early.',
    wouldRecommend: true,
    isAnonymous: false,
    createdAt: daysAgo(88),
  },
  {
    star: 3,
    consultationRating: 4,
    waitTimeRating: 2,
    staffRating: 3,
    review:
      'Knowledgeable doctor but the evening OPD was very crowded and the actual consultation was quick. Treatment is working fine so far.',
    wouldRecommend: true,
    isAnonymous: false,
    createdAt: daysAgo(110),
  },
  {
    star: 4,
    consultationRating: 5,
    waitTimeRating: 4,
    staffRating: 4,
    review:
      "He explained my father's angiography need clearly with all options and costs upfront. No unnecessary tests done. Very transparent.",
    wouldRecommend: true,
    isAnonymous: false,
    createdAt: daysAgo(150),
  },
]

// ──────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────

async function main() {
  // Patient (dev-patient — Rahul Verma)
  const patient = await db.user.findFirst({
    where: { email: { contains: 'rahul' }, role: 'patient' },
    select: { id: true, name: true },
  })
  if (!patient) throw new Error('Patient user (email contains "rahul") not found')

  // Doctors — via Doctor profile with user name contains
  const sharma = await db.doctor.findFirst({
    where: { user: { name: { contains: 'Rajesh Sharma' } } },
    include: { user: { select: { id: true, name: true } } },
  })
  const anita = await db.doctor.findFirst({
    where: { user: { name: { contains: 'Anita Desai' } } },
    include: { user: { select: { id: true, name: true } } },
  })
  const suresh = await db.doctor.findFirst({
    where: { user: { name: { contains: 'Suresh Iyer' } } },
    include: { user: { select: { id: true, name: true } } },
  })

  if (!sharma || !anita || !suresh) {
    throw new Error('One or more doctors not found (Rajesh Sharma / Anita Desai / Suresh Iyer)')
  }

  // DoctorRating.doctorId = the doctor's USER id
  const doctorUserIds = [sharma.user.id, anita.user.id, suresh.user.id]

  // Idempotent: clear this patient's existing ratings for these doctors
  const deleted = await db.doctorRating.deleteMany({
    where: { patientId: patient.id, doctorId: { in: doctorUserIds } },
  })
  if (deleted.count > 0) {
    console.log(`🧹 Removed ${deleted.count} existing rating(s) for re-seed`)
  }

  const plan: { doctorName: string; doctorUserId: string; ratings: SeedRating[] }[] = [
    { doctorName: sharma.user.name, doctorUserId: sharma.user.id, ratings: sharmaRatings },
    { doctorName: anita.user.name, doctorUserId: anita.user.id, ratings: anitaRatings },
    { doctorName: suresh.user.name, doctorUserId: suresh.user.id, ratings: sureshRatings },
  ]

  for (const { doctorName, doctorUserId, ratings } of plan) {
    await db.doctorRating.createMany({
      data: ratings.map((r) => ({
        patientId: patient.id,
        doctorId: doctorUserId,
        bookingId: null,
        star: r.star,
        consultationRating: r.consultationRating,
        waitTimeRating: r.waitTimeRating,
        staffRating: r.staffRating,
        review: r.review,
        wouldRecommend: r.wouldRecommend,
        isAnonymous: r.isAnonymous,
        createdAt: r.createdAt,
      })),
    })

    const avg =
      Math.round((ratings.reduce((s, r) => s + r.star, 0) / ratings.length) * 10) / 10
    const withText = ratings.filter((r) => r.review.trim().length > 0).length
    const recPct = Math.round((ratings.filter((r) => r.wouldRecommend).length / ratings.length) * 100)
    console.log(
      `⭐ ${doctorName}: ${ratings.length} ratings | avg ${avg} | ${withText} with text | ${recPct}% would recommend | anonymous: ${ratings.filter((r) => r.isAnonymous).length}`
    )
  }

  console.log('✅ Seed complete (patient:', patient.name + ')')
  await db.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
