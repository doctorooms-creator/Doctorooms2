/**
 * Seed insurance master data — major Indian insurance companies + TPAs.
 * Run: DATABASE_URL=postgresql://... bun run src/scripts/seed-insurance.ts
 */

import { db } from '../lib/db'

async function main() {
  console.log('🏥 Seeding insurance master data...\n')

  await db.insuranceDoc.deleteMany()
  await db.claimLineItem.deleteMany()
  await db.insuranceClaim.deleteMany()
  await db.insurancePreAuth.deleteMany()
  await db.patientInsurancePolicy.deleteMany()
  await db.tpaMaster.deleteMany()
  await db.insuranceCompany.deleteMany()

  const companies = [
    { name: 'Star Health Insurance', code: 'STAR', type: 'Health', cashlessSupported: true, contactNo: '044 4232 4232', email: 'claims@starhealth.in', website: 'starhealth.in' },
    { name: 'HDFC ERGO General Insurance', code: 'HDFCERGO', type: 'General', cashlessSupported: true, contactNo: '1800 2700 700', email: 'care@hdfcergo.com', website: 'hdfcergo.com' },
    { name: 'ICICI Lombard General Insurance', code: 'ICICILOMBARD', type: 'General', cashlessSupported: true, contactNo: '1800 2666', email: 'customersupport@icicilombard.com', website: 'icicilombard.com' },
    { name: 'Bajaj Allianz General Insurance', code: 'BAJAJALLIANZ', type: 'General', cashlessSupported: true, contactNo: '1800 209 5858', email: 'bagichelp@bajajallianz.co.in', website: 'bajajallianz.com' },
    { name: 'Niva Bupa Health Insurance', code: 'NIVABUPA', type: 'Health', cashlessSupported: true, contactNo: '1800 3010 3333', email: 'care@nivabupa.com', website: 'nivabupa.com' },
    { name: 'Care Health Insurance', code: 'CAREHEALTH', type: 'Health', cashlessSupported: true, contactNo: '1800 102 4488', email: 'customercare@careinsurance.com', website: 'careinsurance.com' },
    { name: 'CGHS (Central Government Health Scheme)', code: 'CGHS', type: 'Government', cashlessSupported: false, contactNo: '1800 11 3133', email: 'dg-cghs@nic.in', website: 'cghs.gov.in' },
    { name: 'ESIC (Employee State Insurance)', code: 'ESIC', type: 'Government', cashlessSupported: false, contactNo: '1800 11 2526', email: 'helpdesk@esic.in', website: 'esic.gov.in' },
  ]

  for (const c of companies) {
    await db.insuranceCompany.create({ data: c })
  }
  console.log(`  ✓ ${companies.length} insurance companies created`)

  const tpas = [
    { name: 'Medi Assist Insurance TPA', code: 'MEDIASSIST', contactNo: '1800 425 3232', email: 'info@mediassist.in', preAuthEmail: 'preauth@mediassist.in' },
    { name: 'Raksha Health TPA', code: 'RAKSHA', contactNo: '1800 425 4252', email: 'info@rakshatpa.com', preAuthEmail: 'preauth@rakshatpa.com' },
    { name: 'Vidal Health TPA', code: 'VIDAL', contactNo: '1800 3000 1313', email: 'info@vidalhealth.com', preAuthEmail: 'preauth@vidalhealth.com' },
    { name: 'Heritage Health TPA', code: 'HERITAGE', contactNo: '1800 22 4242', email: 'info@heritagehealthtpa.com', preAuthEmail: 'preauth@heritagehealthtpa.com' },
  ]

  const createdCompanies = await db.insuranceCompany.findMany({ take: 4, orderBy: { name: 'asc' } })
  for (let i = 0; i < tpas.length; i++) {
    if (createdCompanies[i]) {
      await db.tpaMaster.create({ data: { ...tpas[i], companyId: createdCompanies[i].id } })
    }
  }
  console.log(`  ✓ ${tpas.length} TPAs created`)

  const patient = await db.user.findUnique({ where: { id: 'dev-patient' } })
  const starHealth = await db.insuranceCompany.findUnique({ where: { code: 'STAR' } })
  const mediAssist = await db.tpaMaster.findFirst({ where: { code: 'MEDIASSIST' } })

  if (patient && starHealth) {
    await db.patientInsurancePolicy.create({
      data: {
        patientId: patient.id,
        companyId: starHealth.id,
        tpaId: mediAssist?.id || null,
        policyNo: 'STAR/2025/00123456',
        policyType: 'Family',
        memberName: 'Rahul Verma',
        memberRelation: 'Self',
        sumInsured: 500000,
        copayPercent: 10,
        roomRentLimit: 5000,
        validFrom: new Date('2025-01-01'),
        validTo: new Date('2025-12-31'),
        status: 'Active',
      },
    })
    console.log('  ✓ Test policy created for Rahul Verma (Star Health, ₹5L sum insured)')
  }

  console.log('\n✅ Insurance seed complete!')
  await db.$disconnect()
}

main().catch((err) => { console.error('Seed failed:', err); process.exit(1) })
