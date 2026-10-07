/**
 * QA: verify a pack install at DB level for the latest-matching doctor.
 * Usage: bun scripts/verify-pack-install.ts [email-like-pattern]
 */
import fs from 'fs'
import { Client } from 'pg'

const pattern = process.argv[2] || 'qa-final-%'
const url = fs.readFileSync('.env', 'utf8').match(/^DATABASE_URL="(.+)"/m)![1]
const c = new Client({ connectionString: url })

async function main() {
  await c.connect()
  const doc = await c.query(
    `SELECT d.id, u.email FROM "Doctor" d JOIN "User" u ON u.id = d."userId"
     WHERE u.email LIKE $1 ORDER BY u."createdAt" DESC LIMIT 1`,
    [pattern]
  )
  if (!doc.rows.length) {
    console.error('No doctor found for pattern:', pattern)
    process.exit(1)
  }
  const id: string = doc.rows[0].id
  console.log('Doctor:', doc.rows[0].email, '→', id)

  const checks: [string, string][] = [
    ['categories', `SELECT count(*) c FROM "CategoryMaster" WHERE "doctorId"=$1`],
    ['complaints', `SELECT count(*) c FROM "CoMaster" WHERE "doctorId"=$1`],
    ['complaints WITH category', `SELECT count(*) c FROM "CoMaster" WHERE "doctorId"=$1 AND "categoryId" IS NOT NULL`],
    ['questions', `SELECT count(*) c FROM "QuestionsMaster" WHERE "doctorId"=$1`],
    ['questions WITH coId', `SELECT count(*) c FROM "QuestionsMaster" WHERE "doctorId"=$1 AND "coId" IS NOT NULL`],
    ['suggestions', `SELECT count(*) c FROM "SuggestionsMaster" WHERE "doctorId"=$1`],
    ['labels', `SELECT count(*) c FROM "LabelMaster" WHERE "doctorId"=$1`],
    ['findings', `SELECT count(*) c FROM "FindingsMaster" WHERE "doctorId"=$1`],
    ['medicines', `SELECT count(*) c FROM "DoctorMedicine" WHERE "userId"=$1`],
    ['finding↔med LINKS', `SELECT count(*) c FROM "FindingsMedicine" fm JOIN "FindingsMaster" f ON f.id=fm."findingId" WHERE f."doctorId"=$1`],
    ['table templates', `SELECT count(*) c FROM "TableTemplateMaster" WHERE "doctorId"=$1`],
    ['rx templates', `SELECT count(*) c FROM "PrescriptionTemplate" WHERE "doctorId"=$1`],
  ]
  for (const [label, sql] of checks) {
    const r = await c.query(sql, [id])
    console.log(label.padEnd(24), '→', r.rows[0].c)
  }
  const rec = await c.query(
    `SELECT "packCode", "packVersion", status, "installedAt" FROM "DoctorPackInstall" WHERE "doctorId"=$1`,
    [id]
  )
  console.log('receipt                 →', JSON.stringify(rec.rows))
  await c.end()
}

main().catch((e) => {
  console.error('FAIL:', e.message)
  process.exit(1)
})
