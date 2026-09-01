import { db } from '@/lib/db'

async function main() {
  const recep = await db.receptionist.findFirst({ select: { userId: true, hospitalId: true, user: { select: { name: true } } } })
  const wards = await db.ward.findMany({
    select: { id: true, name: true, wardType: true, hospitalId: true, totalBeds: true, status: true, _count: { select: { beds: true } } },
  })
  const beds = await db.bed.findMany({ select: { id: true, bedNumber: true, status: true, wardId: true, bedType: true, dailyRate: true } })
  const adm = await db.ipdAdmission.findMany({
    select: { id: true, admissionNo: true, patientName: true, status: true, hospitalId: true, wardId: true, bedId: true },
  })
  console.log(JSON.stringify({ receptionist: recep, wards, beds, admissions: adm }, null, 2))
}

main().catch(console.error).finally(() => db.$disconnect())
