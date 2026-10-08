/**
 * One-off: create the RxFavorite table on the PRODUCTION Supabase DB
 * (aws-0 pooler) — `prisma db push` hangs on the pooler, so we apply the
 * exact Prisma-shaped DDL statement-by-statement (idempotent).
 *
 * Usage:
 *   DATABASE_URL="<prod pooler url>" bun scripts/push-rx-favorites-prod.ts
 */
const { PrismaClient } = await import('@prisma/client')

const db = new PrismaClient()

const STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS "RxFavorite" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "RxFavorite_doctorId_kind_refId_key" ON "RxFavorite"("doctorId", "kind", "refId")`,
  `CREATE INDEX IF NOT EXISTS "RxFavorite_doctorId_kind_idx" ON "RxFavorite"("doctorId", "kind")`,
]

const CONSTRAINTS: { table: string; name: string; def: string }[] = [
  { table: 'RxFavorite', name: 'RxFavorite_pkey', def: 'PRIMARY KEY ("id")' },
  {
    table: 'RxFavorite',
    name: 'RxFavorite_doctorId_fkey',
    def: 'FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON UPDATE CASCADE ON DELETE CASCADE',
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
  const cols = await db.$queryRawUnsafe(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'RxFavorite' ORDER BY ordinal_position`
  )
  console.log('\nRxFavorite columns:')
  for (const col of cols as { column_name: string; data_type: string }[]) {
    console.log(`  ${col.column_name} (${col.data_type})`)
  }
}

main()
  .catch((e) => {
    console.error('FATAL:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
