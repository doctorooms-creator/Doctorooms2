/**
 * Phase 3 E2E cleanup — removes all p3 test data.
 * Keeps: Aarti's referral code (real), all seeded production data.
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const qaEmails = [
    'qa-ravi-p3@test.dev',
    'qa-priya-p3@test.dev',
    'qa-ref1-p3@test.dev',
    'qa-ref2-p3@test.dev',
    'qa-ref3-p3@test.dev',
  ]
  const qaUsers = await db.user.findMany({
    where: { email: { in: qaEmails } },
    select: { id: true },
  })
  const qaIds = qaUsers.map((u) => u.id)

  let deleted = { referrals: 0, ledger: 0, codes: 0, users: 0, bookings: 0, doctors: 0 }

  if (qaIds.length > 0) {
    // Aarti's test referral (ref1 was her referee)
    const aarti = await db.user.findUnique({
      where: { email: 'aarti.shah@shalby.com' },
      select: { id: true },
    })
    const aartiRef = await db.referral.findFirst({
      where: { referrerUserId: aarti!.id },
      select: { id: true, refereeUserId: true },
    })
    if (aartiRef) {
      // Her stage-1 award ledger entry (refId = the referral)
      const l1 = await db.pointsLedger.deleteMany({ where: { refId: aartiRef.id } })
      deleted.ledger += l1.count
      const r1 = await db.referral.deleteMany({ where: { id: aartiRef.id } })
      deleted.referrals += r1.count
    }

    // All QA rows
    const r2 = await db.referral.deleteMany({
      where: { OR: [{ referrerUserId: { in: qaIds } }, { refereeUserId: { in: qaIds } }] },
    })
    deleted.referrals += r2.count
    const l2 = await db.pointsLedger.deleteMany({ where: { userId: { in: qaIds } } })
    deleted.ledger += l2.count
    const c2 = await db.referralCode.deleteMany({ where: { userId: { in: qaIds } } })
    deleted.codes += c2.count
    // The patient's referral (ref1 → patient viral loop)
    const patient = await db.user.findFirst({ where: { role: 'patient' }, select: { id: true } })
    if (patient) {
      const r3 = await db.referral.deleteMany({ where: { refereeUserId: patient.id } })
      deleted.referrals += r3.count
    }
    // Bookings + doctor profile of ref1
    const b = await db.booking.deleteMany({ where: { doctor: { userId: { in: qaIds } } } })
    deleted.bookings += b.count
    const d = await db.doctor.deleteMany({ where: { userId: { in: qaIds } } })
    deleted.doctors += d.count
    const u = await db.user.deleteMany({ where: { id: { in: qaIds } } })
    deleted.users += u.count
  }

  console.log('P3 CLEANUP DONE:', JSON.stringify(deleted))

  // Verify: no ledger entries with p3-e2e-test note remain
  const remain = await db.pointsLedger.count({ where: { note: 'p3-e2e-test' } })
  console.log('remaining test notes:', remain)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
