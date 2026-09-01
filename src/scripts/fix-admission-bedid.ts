/**
 * One-off data fix (Round 9-b): IpdAdmission.bedId is no longer @unique +
 * non-nullable — historical admissions must stop pinning beds they no longer
 * occupy. Sets bedId: null for every admission whose status is NOT 'Admitted'
 * (Discharged / DAMA / LAMA / Expired / Transferred / Cancelled…).
 *
 * Run: bun src/scripts/fix-admission-bedid.ts
 */
import { db } from '../lib/db'

async function main() {
  const stale = await db.ipdAdmission.findMany({
    where: {
      bedId: { not: null },
      status: { not: 'Admitted' },
    },
    select: { id: true, admissionNo: true, patientName: true, status: true, bedId: true },
  })

  if (stale.length === 0) {
    console.log('No non-Admitted admissions hold a bedId — nothing to clear.')
    return
  }

  const result = await db.ipdAdmission.updateMany({
    where: {
      id: { in: stale.map((a) => a.id) },
    },
    data: { bedId: null },
  })

  console.log(`Cleared bedId on ${result.count} non-Admitted admission(s):`)
  for (const a of stale) {
    console.log(`  - ${a.admissionNo} (${a.patientName}, ${a.status}) — was holding bed ${a.bedId}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect?.())
