/**
 * Seed a second staff nurse (Evening shift, General Ward, City General)
 * so the shift-handover E2E flow has a valid "Hand Over To" target.
 * Idempotent — skips if the nurse already exists.
 */
import { db } from '../lib/db'

async function main() {
  const existing = await db.user.findUnique({ where: { id: 'dev-nurse-2' } })
  if (existing) {
    console.log('dev-nurse-2 already exists — skipping')
    return
  }

  const hospital = await db.hospital.findFirst({ where: { hospitalName: 'City General Hospital' } })
  if (!hospital) throw new Error('City General Hospital not found')

  const ward = await db.ward.findFirst({ where: { hospitalId: hospital.id, name: 'General Ward' } })
  if (!ward) throw new Error('General Ward not found')

  const user = await db.user.create({
    data: {
      id: 'dev-nurse-2',
      name: 'Anjali Nair',
      email: 'anjali.nair@doctorooms.com',
      role: 'nurse',
      status: 'Active',
      gender: 'Female',
      password: '',
      profileImg: 'default.png',
    },
  })

  const nurse = await db.staffNurse.create({
    data: {
      userId: user.id,
      hospitalId: hospital.id,
      wardId: ward.id,
      employeeId: 'SN-0002',
      qualification: 'B.Sc Nursing',
      designation: 'Staff Nurse',
      shift: 'Evening',
      phoneNo: '+91 9876543200',
      address: 'Nurse Quarters, City General',
    },
  })

  console.log(`Created nurse: ${user.name} (${nurse.employeeId}, ${nurse.shift} shift, ward=${ward.name})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect?.())
