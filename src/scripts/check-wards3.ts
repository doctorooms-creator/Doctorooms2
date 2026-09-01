import { db } from '@/lib/db'

async function main() {
  const receps = await db.receptionist.findMany({
    select: { userId: true, hospitalId: true, user: { select: { name: true } } },
  })
  const users = await db.user.findMany({ where: { role: 'receptionist' }, select: { id: true, name: true, status: true } })
  const nurses = await db.staffNurse.findMany({ select: { userId: true, hospitalId: true, user: { select: { name: true } } } })
  const nurseUsers = await db.user.findMany({ where: { role: 'nurse' }, select: { id: true, name: true, status: true } })
  const admins = await db.user.findMany({ where: { role: 'admin' }, select: { id: true, name: true, status: true } })
  console.log(JSON.stringify({ receps, users, nurses, nurseUsers, admins }, null, 2))
}

main().catch(console.error).finally(() => db.$disconnect())
