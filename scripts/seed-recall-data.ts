/**
 * RECALL-1 QA seed — dormant-patient bookings for the recall-campaign flow.
 *
 * Supabase (the sandbox/prod DB) currently has only 1 booking with NO patient
 * link, so every doctor's dormant audience is empty. This script creates:
 *   - Dr. Amit Shah (FREE plan — no hospital): 10 patient users with phones
 *     + 12 old bookings (95-400 days ago) + 1 recent-visit patient (control —
 *     must NOT appear in the audience) + 1 no-phone patient.
 *   - Dr. Srinivas Kulkarni (AIIMS Hospital — trialing = Pro): 6 dormant
 *     patients + old bookings.
 *
 * Phone formats deliberately mixed to exercise normalization:
 *   10-digit / +91 prefixed / spaced "98765 43210" / dashed.
 *
 * Idempotent: skips patients whose qa-recall-* email already exists;
 * safe to re-run.
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const DAY = 86_400_000
const daysAgo = (n: number) => new Date(Date.now() - n * DAY)

async function ensurePatient(email: string, name: string, mobileNo: string, gender = 'Male') {
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return existing
  return db.user.create({
    data: { email, name, password: 'x', role: 'patient', gender, mobileNo, status: 'Active' },
  })
}

async function ensureBooking(
  doctorId: string,
  userId: string,
  patientName: string,
  date: Date,
  status: string
) {
  const existing = await db.booking.findFirst({ where: { doctorId, userId, bookingDate: date } })
  if (existing) return existing
  return db.booking.create({
    data: {
      doctorId,
      userId,
      bookingDate: date,
      patientName,
      status,
      disease: 'Follow-up',
      bookingType: 'By Self',
      bookingMode: 'InPerson',
      timeSlot: '10:00 AM',
    },
  })
}

async function main() {
  // ── FREE-plan doctor: Dr. Amit Shah (first active doctor = the login card) ──
  const amit = await db.doctor.findUnique({ where: { userId: 'cmurz4qyw0005m7r40qf6y568' } })
  if (!amit) throw new Error('Dr. Amit Shah doctor row missing — check user id')

  // (name, phone, days-ago of LAST visit, earlier-visit days-ago|null, gender)
  const freePatients: [string, string, string, number, number | null, string][] = [
    ['Suresh Kumar', 'qa-recall-p1@test.dev', '9876500001', 120, 400, 'Male'],
    ['Meena Joshi', 'qa-recall-p2@test.dev', '+919876500002', 95, 210, 'Female'],
    ['Rahul Verma', 'qa-recall-p3@test.dev', '98765 00003', 150, null, 'Male'],
    ['Kavita Singh', 'qa-recall-p4@test.dev', '98765-00004', 200, 380, 'Female'],
    ['Anil Patel', 'qa-recall-p5@test.dev', '919876500005', 130, null, 'Male'],
    ['Geeta Rao', 'qa-recall-p6@test.dev', '9876500006', 180, 320, 'Female'],
    ['Mohit Shah', 'qa-recall-p7@test.dev', '9876500007', 110, null, 'Male'],
    ['Farida Khan', 'qa-recall-p8@test.dev', '+91 98765 00008', 260, null, 'Female'],
    ['Deepak Yadav', 'qa-recall-p9@test.dev', '9876500009', 400, null, 'Male'],
    ['Sunita Nair', 'qa-recall-p10@test.dev', '9876500010', 88, 150, 'Female'],
  ]

  for (const [name, email, phone, lastDays, earlierDays, gender] of freePatients) {
    const u = await ensurePatient(email, name, phone, gender)
    await ensureBooking(amit.id, u.id, name, daysAgo(lastDays), 'Finish')
    if (earlierDays) await ensureBooking(amit.id, u.id, name, daysAgo(earlierDays), 'Visited')
  }

  // Control: recent visitor — must NOT appear in any dormant audience
  const recent = await ensurePatient('qa-recall-recent@test.dev', 'Vikram Recent', '9876500011')
  await ensureBooking(amit.id, recent.id, 'Vikram Recent', daysAgo(5), 'Finish')

  // No-phone patient — counted in withoutPhone, excluded from audience
  const noPhone = await ensurePatient('qa-recall-nophone@test.dev', 'Nophone Patient', '')
  await ensureBooking(amit.id, noPhone.id, 'Nophone Patient', daysAgo(170), 'Completed')

  // ── PRO (trialing) doctor: Dr. Srinivas Kulkarni @ AIIMS ──
  const srinivas = await db.doctor.findUnique({ where: { userId: 'cmurz4rmj00d7m7r4vsfjv4cp' } })
  if (!srinivas) throw new Error('Dr. Srinivas doctor row missing — check user id')

  const proPatients: [string, string, string, number, string][] = [
    ['Delhi Patient One', 'qa-recall-aiims1@test.dev', '9811100001', 140, 'Male'],
    ['Delhi Patient Two', 'qa-recall-aiims2@test.dev', '9811100002', 100, 'Female'],
    ['Delhi Patient Three', 'qa-recall-aiims3@test.dev', '9811100003', 75, 'Male'],
    ['Delhi Patient Four', 'qa-recall-aiims4@test.dev', '9811100004', 210, 'Female'],
    ['Delhi Patient Five', 'qa-recall-aiims5@test.dev', '9811100005', 45, 'Male'],
    ['Delhi Patient Six', 'qa-recall-aiims6@test.dev', '9811100006', 160, 'Female'],
  ]
  for (const [name, email, phone, lastDays, gender] of proPatients) {
    const u = await ensurePatient(email, name, phone, gender)
    await ensureBooking(srinivas.id, u.id, name, daysAgo(lastDays), 'Completed')
  }

  const counts = {
    amitBookings: await db.booking.count({ where: { doctorId: amit.id } }),
    srinivasBookings: await db.booking.count({ where: { doctorId: srinivas.id } }),
  }
  console.log('[seed-recall] done:', JSON.stringify(counts))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
