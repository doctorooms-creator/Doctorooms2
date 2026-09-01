/** Quick state dump: beds + admissions (Round 9-b verification helper). */
import { db } from '../lib/db'

async function main() {
  const beds = await db.bed.findMany({
    orderBy: { bedNumber: 'asc' },
    select: { id: true, bedNumber: true, status: true, ward: { select: { name: true } } },
  })
  console.log('BEDS:')
  for (const b of beds) {
    console.log(`  ${b.bedNumber} [${b.status}] ${b.ward.name} (${b.id})`)
  }
  const admissions = await db.ipdAdmission.findMany({
    select: {
      id: true, admissionNo: true, patientName: true, status: true, bedId: true,
      ward: { select: { name: true } },
    },
    orderBy: { admissionDate: 'desc' },
    take: 10,
  })
  console.log('\nADMISSIONS (latest 10):')
  for (const a of admissions) {
    console.log(`  ${a.admissionNo} ${a.patientName} [${a.status}] ward=${a.ward.name} bedId=${a.bedId ?? 'null'} (${a.id})`)
  }
  const transfers = await db.bedTransfer.findMany({ orderBy: { transferDate: 'desc' }, take: 5 })
  console.log(`\nTRANSFERS: ${transfers.length}`)
  for (const t of transfers) {
    console.log(`  ${t.id} adm=${t.admissionId} ${t.fromBedId} -> ${t.toBedId}`)
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect?.())
