import { db } from '@/lib/db'

// Common physician medicines for Dr. Rajesh Sharma's clinic (medicine master)
const MEDICINES: Array<{ name: string; dose: string[]; morning: number; afternoon: number; evening: number; tab: number; description: string }> = [
  { name: 'Metformin 500mg', dose: ['1 Tablet'], morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'Diabetes control' },
  { name: 'Amlodipine 5mg', dose: ['1 Tablet'], morning: 1, afternoon: 0, evening: 0, tab: 1, description: 'Blood pressure control' },
  { name: 'Telmisartan 40mg', dose: ['1 Tablet'], morning: 1, afternoon: 0, evening: 0, tab: 1, description: 'Blood pressure control' },
  { name: 'Paracetamol 500mg', dose: ['1 Tablet'], morning: 1, afternoon: 1, evening: 1, tab: 1, description: 'Fever and pain relief' },
  { name: 'Cetirizine 10mg', dose: ['1 Tablet'], morning: 0, afternoon: 0, evening: 1, tab: 1, description: 'Allergy relief' },
  { name: 'Omeprazole 20mg', dose: ['1 Capsule'], morning: 1, afternoon: 0, evening: 0, tab: 1, description: 'Acid reflux / gastritis' },
  { name: 'Ibuprofen 400mg', dose: ['1 Tablet'], morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'Pain and inflammation' },
  { name: 'Azithromycin 500mg', dose: ['1 Tablet'], morning: 1, afternoon: 0, evening: 0, tab: 1, description: 'Antibiotic — throat/chest infection' },
  { name: 'ORS Powder Sachet', dose: ['1 Sachet in 1L water'], morning: 1, afternoon: 1, evening: 1, tab: 1, description: 'Dehydration / stomach infection' },
  { name: 'Vitamin D3 60000 IU', dose: ['1 Sachet weekly'], morning: 0, afternoon: 0, evening: 1, tab: 1, description: 'Vitamin D deficiency' },
  { name: 'Calcium 500mg', dose: ['1 Tablet'], morning: 0, afternoon: 0, evening: 1, tab: 1, description: 'Bone health / arthritis' },
  { name: 'Diclofenac Gel', dose: ['Apply locally'], morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'Joint and knee pain relief' },
]

async function main() {
  const existing = await db.doctorMedicine.count({ where: { userId: 'cmtffvm8p0005nnxl751a16o3' } })
  if (existing > 0) {
    console.log(`Medicine master already has ${existing} medicines — skipping`)
    return
  }
  for (const m of MEDICINES) {
    await db.doctorMedicine.create({
      data: {
        name: m.name,
        morning: m.morning,
        afternoon: m.afternoon,
        evening: m.evening,
        dose: JSON.stringify(m.dose),
        tab: m.tab,
        description: m.description,
        status: 'Active',
        userId: 'cmtffvm8p0005nnxl751a16o3',
      },
    })
    console.log(`  ✓ ${m.name}`)
  }
  console.log(`Seeded ${MEDICINES.length} medicines for Dr. Rajesh Sharma`)
}
main().catch(e => { console.error(e); process.exitCode = 1 }).finally(() => process.exit(0))
