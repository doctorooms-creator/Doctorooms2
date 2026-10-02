import { db } from '@/lib/db'

async function main() {
  const bed = await db.bed.findFirst({
    where: { bedNumber: 'B2' },
    select: { bedNumber: true, status: true },
  })
  const kavita = await db.ipdAdmission.findFirst({
    where: { patientName: 'Kavita Menon' },
    select: { status: true, dischargeDate: true, finalDiagnosis: true, dischargeSummary: true, dischargeType: true },
  })
  console.log(JSON.stringify({ bed, kavita }, null, 2))
}

main().catch(console.error).finally(() => db.$disconnect())
