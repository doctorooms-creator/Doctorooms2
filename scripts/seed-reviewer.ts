/**
 * Seed / update the scoped reviewer user (P3-BATCH5).
 *
 * Creates role='reviewer' user with a bcrypt password + Active status.
 * Works against whatever DATABASE_URL is set — run for sandbox or prod:
 *
 *   # sandbox
 *   DATABASE_URL="postgresql://postgres@127.0.0.1:5433/doctorooms?schema=public" \
 *     bun scripts/seed-reviewer.ts
 *
 *   # prod (pooler)
 *   DATABASE_URL="<prod pooler url>" bun scripts/seed-reviewer.ts --password '<new-password>'
 *
 * Idempotent: upsert by email. Never touches other users.
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

const args = process.argv.slice(2)
const passIdx = args.indexOf('--password')
const password =
  passIdx >= 0 && args[passIdx + 1] ? args[passIdx + 1] : 'Reviewer#2026'

const EMAIL = 'reviewer@doctorooms.com'

async function main() {
  const hash = await bcrypt.hash(password, 10)

  const user = await db.user.upsert({
    where: { email: EMAIL },
    update: {
      role: 'reviewer',
      status: 'Active',
      name: 'Dr. Meera Iyer, MBBS',
      gender: 'Female',
      password: hash,
    },
    create: {
      email: EMAIL,
      name: 'Dr. Meera Iyer, MBBS',
      gender: 'Female',
      role: 'reviewer',
      status: 'Active',
      password: hash,
      mobileNo: '',
      emailVerifiedAt: new Date(),
    },
  })

  const review = await db.user.findUnique({
    where: { email: EMAIL },
    select: { id: true, email: true, role: true, status: true, name: true },
  })

  console.log('[seed-reviewer] upserted:', review)
  console.log('[seed-reviewer] id:', user.id)
  console.log('[seed-reviewer] password set via arg:', passIdx >= 0)
}

main()
  .catch((e) => {
    console.error('[seed-reviewer] FAILED:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
