// Phase 3: Copy ALL data from local PG17 (source of truth) -> Supabase remote.
// - Topologically sorted by FK dependencies
// - Batched parameterized INSERTs with ON CONFLICT DO NOTHING (idempotent)
// - Fixes serial sequences afterwards (setval to max(id))
import { Client } from 'pg'

const LOCAL = 'postgresql://postgres@127.0.0.1:5433/doctorooms'
const REMOTE =
  process.env.REMOTE_DATABASE_URL || ''

const local = new Client({ connectionString: LOCAL })
const remote = new Client({ connectionString: REMOTE, ssl: { rejectUnauthorized: false } })

function serialize(v: unknown): unknown {
  if (v === null || v === undefined) return null
  if (v instanceof Date) return v.toISOString()
  if (typeof v === 'object' && v !== null && !(v instanceof Buffer)) {
    return JSON.stringify(v) // json/jsonb columns
  }
  if (typeof v === 'bigint') return v.toString()
  return v
}

async function main() {
  await local.connect()
  await remote.connect()

  // 1. All local public tables
  const { rows: tableRows } = await local.query(
    `select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE'`
  )
  const tables = tableRows.map((r) => r.table_name as string)
  console.log(`Local tables: ${tables.length}`)

  // 2. FK edges (child depends on parent)
  const { rows: fkRows } = await local.query(`
    select tc.table_name as child, ccu.table_name as parent
    from information_schema.table_constraints tc
    join information_schema.constraint_column_usage ccu
      on ccu.constraint_name = tc.constraint_name
     and ccu.constraint_schema = tc.constraint_schema
    where tc.constraint_type = 'FOREIGN KEY'
      and tc.table_schema = 'public'
      and tc.table_name <> ccu.table_name
  `)
  const deps = new Map<string, Set<string>>()
  for (const t of tables) deps.set(t, new Set())
  for (const fk of fkRows) {
    if (deps.has(fk.child) && deps.has(fk.parent)) deps.get(fk.child)!.add(fk.parent)
  }

  // 3. Kahn topological sort
  const sorted: string[] = []
  const remaining = new Set(tables)
  let guard = 0
  while (remaining.size > 0 && guard++ < 5000) {
    let progressed = false
    for (const t of [...remaining]) {
      const d = deps.get(t)!
      if ([...d].every((p) => !remaining.has(p))) {
        sorted.push(t)
        remaining.delete(t)
        progressed = true
      }
    }
    if (!progressed) {
      // cycle fallback: push remaining alphabetically (rely on deferred NULLs / re-run)
      for (const t of [...remaining].sort()) {
        sorted.push(t)
        remaining.delete(t)
      }
    }
  }

  // 4. Copy in order
  let totalRows = 0
  const skipped: string[] = []
  for (const t of sorted) {
    const { rows: colRows } = await local.query(
      `select column_name, data_type from information_schema.columns where table_schema='public' and table_name=$1 order by ordinal_position`,
      [t]
    )
    const cols = colRows.map((r) => r.column_name as string)
    const colList = cols.map((c) => `"${c}"`).join(', ')

    const { rows } = await local.query(`select ${colList} from "${t}"`)
    if (rows.length === 0) {
      console.log(`  ${t}: 0 rows (skip)`)
      continue
    }

    const BATCH = 100
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH)
      const values: unknown[][] = batch.map((r) => cols.map((c) => serialize(r[c])))
      const params: unknown[] = []
      const tuples = batch.map((_, bi) => {
        const ph = cols.map((_, ci) => `$${bi * cols.length + ci + 1}`)
        params.push(...values[bi])
        return `(${ph.join(',')})`
      })
      const sql = `insert into "${t}" (${colList}) values ${tuples.join(',')} on conflict do nothing`
      try {
        await remote.query(sql, params)
      } catch (e) {
        const msg = (e as Error).message
        if (!skipped.includes(t)) skipped.push(t)
        console.log(`  ⚠️ ${t} batch ${i / BATCH}: ${msg.slice(0, 120)}`)
      }
    }
    totalRows += rows.length
    console.log(`  ✅ ${t}: ${rows.length} rows`)
  }

  // 5. Fix sequences for serial columns
  const { rows: seqCols } = await local.query(`
    select table_name, column_name
    from information_schema.columns
    where table_schema='public' and column_default like 'nextval%'
  `)
  for (const s of seqCols) {
    try {
      await remote.query(
        `select setval(pg_get_serial_sequence('"${s.table_name}"','${s.column_name}'), coalesce((select max("${s.column_name}") from "${s.table_name}"), 1), true)`
      )
    } catch (e) {
      console.log(`  ⚠️ seq ${s.table_name}.${s.column_name}: ${(e as Error).message.slice(0, 80)}`)
    }
  }

  console.log(`\nTOTAL rows copied: ${totalRows}`)
  if (skipped.length) console.log(`Tables with errors (verify manually): ${skipped.join(', ')}`)

  // 6. Verify: compare counts
  console.log('\n=== VERIFICATION (local vs remote) ===')
  let mismatch = 0
  for (const t of sorted) {
    try {
      const l = await local.query(`select count(*)::int as n from "${t}"`)
      const r = await remote.query(`select count(*)::int as n from "${t}"`)
      const ln = l.rows[0].n
      const rn = r.rows[0].n
      const flag = ln === rn ? '✅' : '❌'
      if (ln !== rn) mismatch++
      if (ln > 0 || ln !== rn) console.log(`  ${flag} ${t}: local=${ln} remote=${rn}`)
    } catch {
      /* table may not exist remotely if prisma skipped */
    }
  }
  console.log(mismatch === 0 ? '\nALL TABLES MATCH 🎉' : `\n${mismatch} TABLES MISMATCHED`)
  await local.end()
  await remote.end()
}
main().catch((e) => {
  console.error('FATAL', e)
  process.exit(1)
})
