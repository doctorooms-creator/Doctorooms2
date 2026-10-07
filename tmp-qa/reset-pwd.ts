import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'
const hash = bcrypt.hashSync('Test@12345', 10)
const u = await db.user.update({
  where: { email: 'qa-fallback-9752@doctorooms.test' },
  data: { password: hash },
  select: { id: true, email: true, status: true },
})
console.log('reset:', u.id, u.email, u.status)
