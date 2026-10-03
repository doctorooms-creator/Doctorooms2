/**
 * Phase 3 E2E seed — temporary referral test data.
 * Creates: 2 QA referrers, 4 QA referees (1 with Doctor profile + booking
 * to trigger stage-1 with the variant amount), ledger entries, viral loop.
 * Cleanup: scripts/p3-cleanup.ts
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  // ── QA users ──
  const mkUser = (email: string, name: string) =>
    db.user.create({
      data: {
        email,
        name,
        password: 'x',
        role: 'doctor',
        gender: 'Male',
        mobileNo: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
        status: 'Active',
      },
    })

  const ravi = await mkUser('qa-ravi-p3@test.dev', 'Dr. Ravi Kumar')
  const priya = await mkUser('qa-priya-p3@test.dev', 'Dr. Priya Singh')
  const ref1 = await mkUser('qa-ref1-p3@test.dev', 'Dr. Ref One')
  const ref2 = await mkUser('qa-ref2-p3@test.dev', 'Dr. Ref Two')
  const ref3 = await mkUser('qa-ref3-p3@test.dev', 'Dr. Ref Three')
  const patient = await db.user.findFirst({ where: { role: 'patient' }, select: { id: true } })

  // ── Referral codes (variants auto-assigned) ──
  const mkCode = (userId: string, code: string) =>
    db.referralCode.create({ data: { userId, code } })

  await mkCode(ravi.id, 'DR-RAVI-1001')
  await mkCode(priya.id, 'DR-PRIYA-1002')
  await mkCode(ref1.id, 'DR-REFONE-1003')

  // Aarti's code already exists (DR-AARTI-1987)
  const aarti = await db.user.findFirst({
    where: { email: 'aarti.shah@shalby.com' },
    select: { id: true, name: true },
  })

  // ── Doctor profile + 1 booking for ref1 (stage-1 trigger when Aarti's /me runs) ──
  const ref1Doctor = await db.doctor.create({
    data: { userId: ref1.id, specialization: 'General Physician', city: 'Ahmedabad', fees: 500 },
  })
  await db.booking.create({
    data: {
      doctorId: ref1Doctor.id,
      patientName: 'Test Patient',
      disease: 'Fever',
      status: 'Completed',
    },
  })

  // ── Referral rows ──
  // Aarti → ref1 stays PENDING so /me's lazy stage check awards stage 1 live
  const rAarti = await db.referral.create({
    data: { referrerUserId: aarti!.id, refereeUserId: ref1.id, code: 'DR-AARTI-1987' },
  })
  const rRavi = await db.referral.create({
    data: {
      referrerUserId: ravi.id,
      refereeUserId: ref2.id,
      code: 'DR-RAVI-1001',
      status: 'converted',
      activatedAt: new Date(),
      habitAt: new Date(),
      convertedAt: new Date(),
    },
  })
  const rPriya = await db.referral.create({
    data: {
      referrerUserId: priya.id,
      refereeUserId: ref3.id,
      code: 'DR-PRIYA-1002',
      status: 'activated',
      activatedAt: new Date(),
    },
  })
  // Viral loop: ref1 (a referred user) refers the patient
  await db.referral.create({
    data: {
      referrerUserId: ref1.id,
      refereeUserId: patient!.id,
      code: 'DR-REFONE-1003',
      status: 'pending',
    },
  })

  // ── Ledger entries (leaderboard rankings) ──
  const mkLedger = (userId: string, type: string, points: number, refId: string) =>
    db.pointsLedger.create({
      data: {
        userId,
        type,
        points,
        balanceAfter: points,
        refId,
        note: 'p3-e2e-test',
      },
    })

  await mkLedger(ravi.id, 'earn_activated', 300, rRavi.id)
  await mkLedger(ravi.id, 'earn_habit', 700, rRavi.id)
  await mkLedger(ravi.id, 'earn_converted', 1000, rRavi.id)
  await mkLedger(priya.id, 'earn_activated', 300, rPriya.id)

  console.log('P3 SEED DONE')
  console.log(`aarti=${aarti!.id} ravi=${ravi.id} priya=${priya.id}`)
  console.log(`ref1=${ref1.id} ref2=${ref2.id} ref3=${ref3.id} patient=${patient!.id}`)
  console.log(`aartiReferral=${rAarti.id}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
