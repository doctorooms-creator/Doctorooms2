// Phase 1: Backup old remote Supabase data to JSON, then DROP the old schema.
// Safety: every old table is exported to db/backup-old-supabase/<table>.json first.
import { Client } from 'pg'
import { mkdirSync, writeFileSync } from 'fs'

const REMOTE =
  process.env.REMOTE_DATABASE_URL || ''

const c = new Client({ connectionString: REMOTE, ssl: { rejectUnauthorized: false } })

async function main() {
  await c.connect()

  const { rows: tables } = await c.query(
    `select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by table_name`
  )
  console.log(`Found ${tables.length} tables to back up`)

  mkdirSync('db/backup-old-supabase', { recursive: true })
  for (const t of tables) {
    const name = t.table_name
    const { rows } = await c.query(`select * from "${name}"`)
    writeFileSync(
      `db/backup-old-supabase/${name}.json`,
      JSON.stringify(rows, (k, v) => (typeof v === 'bigint' ? Number(v) : v), 2)
    )
    console.log(`  backed up ${name}: ${rows.length} rows`)
  }

  // Count before drop
  const before = tables.length
  console.log(`\nDropping public schema (${before} tables)...`)
  await c.query('DROP SCHEMA public CASCADE;')
  await c.query('CREATE SCHEMA public;')
  // restore default grants the way Supabase expects (postgres-owned)
  await c.query('GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;')
  await c.query(
    'GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;'
  )
  const { rows: after } = await c.query(
    `select count(*)::int as n from information_schema.tables where table_schema='public'`
  )
  console.log(`Tables after drop: ${after[0].n}`)
  console.log('DONE — ready for prisma db push')
  await c.end()
}
main().catch((e) => {
  console.error('FATAL', e)
  process.exit(1)
})
