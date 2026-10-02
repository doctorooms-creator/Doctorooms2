import { db } from '@/lib/db'

async function main() {
  // Move dev-receptionist (Meera Joshi) from Sharma Clinic to City General Hospital
  // so the full IPD flow (receptionist admit → nurse ward → doctor manage) is exercisable.
  const cityGeneral = await db.hospital.findFirst({ where: { hospitalName: 'City General Hospital' } })
  if (!cityGeneral) throw new Error('City General Hospital not found')

  const updated = await db.receptionist.update({
    where: { userId: 'dev-receptionist' },
    data: { hospitalId: cityGeneral.id },
    select: { userId: true, hospitalId: true, user: { select: { name: true } } },
  })
  console.log('Updated:', JSON.stringify(updated))
}

main().catch(console.error).finally(() => db.$disconnect())
