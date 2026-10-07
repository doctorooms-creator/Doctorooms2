import { PrismaClient } from '@prisma/client'
const db = new PrismaClient({ datasources: { db: { url: 'postgresql://postgres.dauhputqahqutczyrfme:Ea6MpaTlsKwAtOmW@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres' } } })
try {
  const installs = await db.doctorPackInstall.findMany({ take: 12, orderBy: { installedAt: 'desc' }, select: { packCode: true, status: true, doctorId: true, installedAt: true } })
  console.log('PROD/SUPABASE DB reachable ✓ — pack installs:', installs.length)
  for (const i of installs) console.log(' -', i.packCode, i.status, i.installedAt.toISOString())
  // storage evidence: any supabase URLs in profileImg?
  const withSb = await db.user.count({ where: { profileImg: { contains: 'supabase' } } })
  const withCloud = await db.user.count({ where: { profileImg: { contains: 'cloudinary' } } })
  const total = await db.user.count()
  console.log(`profileImg: supabase=${withSb} cloudinary=${withCloud} of ${total} users`)
} finally { await db.$disconnect() }
