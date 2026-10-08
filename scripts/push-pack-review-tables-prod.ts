/**
 * One-off: create PackReview + PackMedicineReview tables on the PRODUCTION
 * Supabase DB (aws-0 pooler) — `prisma db push` hangs on the pooler, so we
 * apply the exact Prisma-shaped DDL statement-by-statement (idempotent).
 *
 * Usage:
 *   DATABASE_URL="<prod pooler url>" bun scripts/push-pack-review-tables-prod.ts
 */
const { PrismaClient } = require('@prisma/client')

const db = new PrismaClient()

const STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS "PackReview" (
    "id" TEXT NOT NULL,
    "packCode" TEXT NOT NULL,
    "status" TEXT DEFAULT 'pending' NOT NULL,
    "reviewedByName" TEXT,
    "reviewedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "PackMedicineReview" (
    "id" TEXT NOT NULL,
    "packCode" TEXT NOT NULL,
    "medicineName" TEXT NOT NULL,
    "verdict" TEXT DEFAULT 'pending' NOT NULL,
    "notes" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL
  )`,
  // NOTE: pkey-named indexes are created via ADD CONSTRAINT PRIMARY KEY below
  // (the standalone index would collide with the constraint name).
  `CREATE UNIQUE INDEX IF NOT EXISTS "PackReview_packCode_key" ON "PackReview"("packCode")`,
  `CREATE INDEX IF NOT EXISTS "PackMedicineReview_packCode_idx" ON "PackMedicineReview"("packCode")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "PackMedicineReview_packCode_medicineName_key" ON "PackMedicineReview"("packCode", "medicineName")`,
]

const CONSTRAINTS: { table: string; name: string; def: string }[] = [
  { table: 'PackReview', name: 'PackReview_pkey', def: 'PRIMARY KEY ("id")' },
  {
    table: 'PackMedicineReview',
    name: 'PackMedicineReview_pkey',
    def: 'PRIMARY KEY ("id")',
  },
  {
    table: 'PackMedicineReview',
    name: 'PackMedicineReview_packCode_fkey',
    def: 'FOREIGN KEY ("packCode") REFERENCES "PackReview"("packCode") ON UPDATE CASCADE ON DELETE CASCADE',
  },
]

async function main() {
  for (const sql of STATEMENTS) {
    await db.$executeRawUnsafe(sql)
    console.log('✓', sql.slice(0, 72).replace(/\s+/g, ' ') + '…')
  }

  for (const c of CONSTRAINTS) {
    const exists = await db.$queryRawUnsafe(
      `SELECT COUNT(*)::int AS n FROM pg_constraint WHERE conname = '${c.name}'`
    )
    const n = (exists as { n: number }[])[0]?.n ?? 0
    if (n > 0) {
      console.log('· skip (exists):', c.name)
      continue
    }
    // A standalone unique index with the same name blocks ADD CONSTRAINT
    // PRIMARY KEY (which wants to create its own backing index) — drop it
    // first. Safe: the constraint re-creates the index.
    if (c.def.includes('PRIMARY KEY')) {
      await db.$executeRawUnsafe(`DROP INDEX IF EXISTS "${c.name}"`)
    }
    await db.$executeRawUnsafe(`ALTER TABLE "${c.table}" ADD CONSTRAINT "${c.name}" ${c.def}`)
    console.log('✓ constraint:', c.name)
  }

  // Verify shape
  for (const t of ['PackReview', 'PackMedicineReview']) {
    const cols = await db.$queryRawUnsafe(
      `SELECT column_name::text FROM information_schema.columns WHERE table_name='${t}' ORDER BY ordinal_position`
    )
    console.log(
      `${t} columns:`,
      (cols as { column_name: string }[]).map((c) => c.column_name).join(', ')
    )
  }
  console.log('DONE ✓')
}

main()
  .catch((e) => {
    console.error('FAILED:', String(e).slice(0, 500))
    process.exit(1)
  })
  .finally(() => db.$disconnect())
