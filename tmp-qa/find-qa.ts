import { db } from '../src/lib/db'
const docs = await db.doctor.findMany({
  where: { specialization: { contains: 'Pediatr' } },
  select: { id: true, specialization: true, user: { select: { email: true, name: true } } },
})
for (const d of docs) console.log(d.id, '|', d.specialization, '|', d.user.email)
const installs = await db.doctorPackInstall.findMany({ select: { doctorId: true, packCode: true, status: true } })
console.log('--- installs ---')
for (const i of installs) console.log(i.doctorId, i.packCode, i.status)
