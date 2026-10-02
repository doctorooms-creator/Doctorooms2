import { db } from '@/lib/db'

async function main() {
  const wards = await db.ward.count()
  const beds = await db.bed.count()
  const admissions = await db.ipdAdmission.count()
  const depts = await db.department.findMany({ select: { id: true, name: true, hospitalId: true } })
  const hospitals = await db.hospital.findMany({ select: { id: true, hospitalName: true } })
  const doctors = await db.doctor.findMany({
    where: { hospitalId: { not: null } },
    select: { id: true, userId: true, user: { select: { name: true } }, hospitalId: true },
    take: 5,
  })
  console.log(JSON.stringify({ wards, beds, admissions, departments: depts.length, hospitals, doctors }, null, 2))
}

main().catch(console.error).finally(() => db.$disconnect())
