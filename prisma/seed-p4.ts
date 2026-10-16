/**
 * Aturseva Phase 4 seed — lab reports + diet plan + check-in history for the
 * QA patient (rahul@patient.com). IDEMPOTENT: skips anything that exists.
 *
 * Also imported (and awaited) at the tail of prisma/seed.ts so sandbox
 * recoveries automatically carry Phase-4 demo data.
 */
import { db } from '../src/lib/db'

function istDay(offsetDays: number): string {
  return new Date(Date.now() - offsetDays * 86400000).toISOString().slice(0, 10)
}

export async function seedPhase4(): Promise<void> {
  const patient = await db.user.findUnique({ where: { email: 'rahul@patient.com' } })
  if (!patient) {
    console.log('ℹ️  seedPhase4: rahul@patient.com not found — skipping (run after main seed)')
    return
  }
  const hospital = await db.hospital.findFirst({ select: { id: true, hospitalName: true } })
  if (!hospital) {
    console.log('ℹ️  seedPhase4: no hospital — skipping')
    return
  }
  const drRajesh = await db.doctor.findFirst({
    where: { user: { email: 'rajesh@doctorooms.com' } },
    select: { id: true },
  })

  // ── 1) Lab test catalogue (masters + parameters) ───────────────────────────
  const existingMasters = await db.labTestMaster.count()
  if (existingMasters === 0) {
    const mk = (
      name: string,
      shortCode: string,
      category: string,
      rate: number,
      params: Array<[string, string, string, number, number]>
    ) =>
      db.labTestMaster.create({
        data: {
          hospitalId: hospital.id,
          name,
          shortCode,
          category,
          specimenType: 'Blood',
          reportDays: 1,
          rate,
          parameters: {
            create: params.map(([paramName, unit, code, min, max], i) => ({
              paramName,
              shortCode: code,
              unit,
              normalMaleMin: min,
              normalMaleMax: max,
              normalFemaleMin: min,
              normalFemaleMax: max,
              sortOrder: i,
            })),
          },
        },
      })

    await mk('Complete Blood Count (CBC)', 'CBC', 'Hematology', 350, [
      ['Hemoglobin', 'g/dL', 'HGB', 13, 17],
      ['Total Leucocyte Count (WBC)', '10³/µL', 'WBC', 4, 11],
      ['Platelet Count', '10³/µL', 'PLT', 150, 450],
    ])
    await mk('Lipid Profile', 'LIPID', 'Biochemistry', 600, [
      ['Total Cholesterol', 'mg/dL', 'TC', 130, 200],
      ['LDL Cholesterol', 'mg/dL', 'LDL', 60, 100],
      ['HDL Cholesterol', 'mg/dL', 'HDL', 40, 60],
      ['Triglycerides', 'mg/dL', 'TGL', 60, 150],
    ])
    await mk('Blood Sugar (Fasting)', 'FBS', 'Biochemistry', 120, [
      ['Glucose (Fasting)', 'mg/dL', 'FBS', 70, 100],
    ])
    console.log('✅ seedPhase4: 3 lab test masters + 8 parameters')
  }

  // ── 2) Two verified LabReports for rahul (one clean-ish, one abnormal) ────
  const existingReports = await db.labReport.count({ where: { patientId: patient.id } })
  if (existingReports === 0) {
    const [cbc, lipid] = await Promise.all([
      db.labTestMaster.findFirst({ where: { shortCode: 'CBC' }, include: { parameters: true } }),
      db.labTestMaster.findFirst({ where: { shortCode: 'LIPID' }, include: { parameters: true } }),
    ])
    if (cbc && lipid) {
      const p = (master: typeof cbc, code: string) =>
        master.parameters.find((x) => x.shortCode === code)!

      const cbcReport = await db.labReport.create({
        data: {
          hospitalId: hospital.id,
          testMasterId: cbc.id,
          patientId: patient.id,
          patientName: patient.name,
          patientAge: 32,
          patientGender: 'Male',
          doctorId: drRajesh?.id || null,
          status: 'Verified',
          sampleCollectedAt: new Date(Date.now() - 2 * 86400000),
          resultEnteredAt: new Date(Date.now() - 2 * 86400000 + 3600000),
          verifiedAt: new Date(Date.now() - 2 * 86400000 + 7200000),
          notes: 'Routine check',
          parameterValues: {
            create: [
              { testParameterId: p(cbc, 'HGB').id, value: '11.2', isAbnormal: true, remarks: 'Mildly low' },
              { testParameterId: p(cbc, 'WBC').id, value: '7.4', isAbnormal: false },
              { testParameterId: p(cbc, 'PLT').id, value: '245', isAbnormal: false },
            ],
          },
        },
      })
      await db.labReport.update({
        where: { id: cbcReport.id },
        data: { reportNo: `RPT-${cbcReport.id.slice(-6).toUpperCase()}` },
      })

      const lipidReport = await db.labReport.create({
        data: {
          hospitalId: hospital.id,
          testMasterId: lipid.id,
          patientId: patient.id,
          patientName: patient.name,
          patientAge: 32,
          patientGender: 'Male',
          doctorId: drRajesh?.id || null,
          status: 'Verified',
          sampleCollectedAt: new Date(Date.now() - 9 * 86400000),
          resultEnteredAt: new Date(Date.now() - 9 * 86400000 + 3600000),
          verifiedAt: new Date(Date.now() - 9 * 86400000 + 7200000),
          notes: 'Annual screening',
          parameterValues: {
            create: [
              { testParameterId: p(lipid, 'TC').id, value: '224', isAbnormal: true, remarks: 'High' },
              { testParameterId: p(lipid, 'LDL').id, value: '142', isAbnormal: true, remarks: 'High' },
              { testParameterId: p(lipid, 'HDL').id, value: '44', isAbnormal: false },
              { testParameterId: p(lipid, 'TGL').id, value: '138', isAbnormal: false },
            ],
          },
        },
      })
      await db.labReport.update({
        where: { id: lipidReport.id },
        data: { reportNo: `RPT-${lipidReport.id.slice(-6).toUpperCase()}` },
      })
      console.log('✅ seedPhase4: 2 verified lab reports (CBC + Lipid) for rahul')
    }
  }

  // ── 3) Diet plan for rahul (7-day, Mon→Sun order per diet.ts contract) ────
  const existingDiet = await db.sevikaDietPlan.count({ where: { userId: patient.id } })
  if (existingDiet === 0) {
    const plan = {
      summary:
        'Aapki dawaiyon ke saath halka ghar ka khana + khoob paani. Cholesterol thoda high hai isliye fried aur mithai kam.',
      disclaimer:
        'Ye AI-suggested diet hai — apne doctor se confirm karke follow karein. Koi bhi allergy ho to wo item avoid karein.',
      days: Array.from({ length: 7 }, (_, i) => ({
        morning: '1 glass gunguna paani + 5 bheege badam',
        breakfast: i % 2 === 0 ? 'Moong dal chilla + mint chutney' : 'Oats upma + 1 cup doodh (low sugar)',
        lunch: '2 roti + dal + lauki sabzi + salad + dahi',
        evening: '1 fruit (apple / papaya) + green tea',
        dinner: 'Khichdi / 1-2 roti + halki sabzi (8 baje se pehle)',
        note: 'Din me 8-10 glass paani; namak aur tel kam rakhein.',
      })),
    }
    await db.sevikaDietPlan.create({
      data: {
        userId: patient.id,
        medicinesSummary: 'Paracetamol 500mg, Vitamin D3',
        planJson: JSON.stringify(plan),
        aiGenerated: true,
      },
    })
    console.log('✅ seedPhase4: 7-day diet plan for rahul')
  }

  // ── 4) Check-in history (last 5 days incl. today if missing) ──────────────
  const history: Array<{ day: string; mood: number; energy: number; symptoms: string; note?: string }> = [
    { day: istDay(4), mood: 3, energy: 2, symptoms: 'sardad,thakan', note: 'Office me busy tha' },
    { day: istDay(3), mood: 3, energy: 3, symptoms: 'sardad' },
    { day: istDay(2), mood: 4, energy: 3, symptoms: 'thakan' },
    { day: istDay(1), mood: 4, energy: 4, symptoms: '', note: 'Walk kiya shaam ko' },
    { day: istDay(0), mood: 4, energy: 3, symptoms: 'sardad' },
  ]
  let added = 0
  for (const h of history) {
    await db.atursevaCheckIn.upsert({
      where: { userId_day: { userId: patient.id, day: h.day } },
      create: {
        userId: patient.id,
        day: h.day,
        mood: h.mood,
        energy: h.energy,
        symptoms: h.symptoms,
        note: h.note || '',
      },
      update: {},
    }).then((r) => {
      if (r.createdAt.getTime() > Date.now() - 5000) added++
    })
  }
  console.log(`✅ seedPhase4: check-in history ensured (${added} new, 5 days)`)
}

// Direct execution: `bun prisma/seed-p4.ts`
if (process.argv[1] && process.argv[1].endsWith('seed-p4.ts')) {
  seedPhase4()
    .catch((e) => {
      console.error('❌ seedPhase4 error:', e)
      process.exit(1)
    })
    .finally(() => db.$disconnect())
}
