import { db } from '../src/lib/db'
const u = await db.user.findUnique({ where: { email: 'qa-p1-derm@doctorooms.test' }, select: { id: true, role: true } })
console.log(u?.id, u?.role)
