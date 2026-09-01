import { db } from '@/lib/db'

async function main() {
  const nurse = await db.staffNurse.findFirst({ where: { userId: 'dev-nurse' }, select: { id: true } })
  if (!nurse) throw new Error('Nurse not found')

  // Assign nurse to all currently-admitted patients in her hospital
  const admissions = await db.ipdAdmission.findMany({
    where: { status: 'Admitted' },
    select: { id: true, bedId: true },
  })
  if (admissions.length === 0) {
    console.log('No admitted patients — nothing to assign')
    return
  }

  await db.nursePatientAssignment.deleteMany({
    where: { nurseId: nurse.id, status: 'Active' },
  })

  for (const adm of admissions) {
    if (!adm.bedId) continue
    await db.nursePatientAssignment.create({
      data: {
        nurseId: nurse.id,
        admissionId: adm.id,
        bedId: adm.bedId,
        shiftDate: new Date(),
        shiftType: 'Morning',
        status: 'Active',
      },
    })
    console.log(`Assigned nurse to admission ${adm.id}`)
  }
}

main().catch(console.error).finally(() => db.$disconnect())
