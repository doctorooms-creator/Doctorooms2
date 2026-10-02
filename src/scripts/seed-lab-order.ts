import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  const hospital = await db.hospital.findFirst({ where: { hospitalName: { contains: 'City General' } } })
  const patient = await db.user.findFirst({ where: { email: { contains: 'rahul' } } })
  const anita = await db.doctor.findFirst({ where: { user: { name: { contains: 'Anita' } } } })
  const lipid = await db.labTestMaster.findFirst({
    where: { name: { contains: 'Lipid' } },
    include: { parameters: { orderBy: { sortOrder: 'asc' } } },
  })
  const count = await db.labReport.count({ where: { hospitalId: hospital!.id } })
  const report = await db.labReport.create({
    data: {
      reportNo: `LR-${String(count + 1).padStart(5, '0')}`,
      hospitalId: hospital!.id,
      testMasterId: lipid!.id,
      patientId: patient!.id,
      patientName: patient!.name,
      patientAge: 34,
      patientGender: 'Male',
      doctorId: anita!.id,
      orderedById: anita!.userId,
      status: 'Ordered',
      urgency: 'Urgent',
      notes: 'Fasting sample. Follow-up on cholesterol management.',
    },
  })
  await db.labParameterValue.createMany({
    data: lipid!.parameters.map((p) => ({ labReportId: report.id, testParameterId: p.id })),
  })
  console.log('created:', report.reportNo, 'Urgent, with', lipid!.parameters.length, 'params')
  await db.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
