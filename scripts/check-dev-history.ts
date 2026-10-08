import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main() {
  const doctorId = 'cmuyzs0u90007mod4350ozemb'
  const rxCount = await db.prescription.count({ where: { doctorId } })
  const pcoCount = await db.pCo.count({ where: { prescription: { doctorId } } })
  const pmedCount = await db.pMedicine.count({ where: { prescription: { doctorId } } })
  const topPco = await db.pCo.groupBy({
    by: ['coId'],
    where: { prescription: { doctorId } },
    _count: { _all: true },
    orderBy: { _count: { coId: 'desc' } },
    take: 5,
  })
  console.log(JSON.stringify({ rxCount, pcoCount, pmedCount, topPco }, null, 2))
}
main().finally(() => db.$disconnect())
