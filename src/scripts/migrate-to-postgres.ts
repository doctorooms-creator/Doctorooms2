/**
 * ═══════════════════════════════════════════════════════════════
 * Migration Script: SQLite → PostgreSQL
 * ═══════════════════════════════════════════════════════════════
 *
 * SECURITY (P5.1): Migrates all data from SQLite to PostgreSQL.
 *
 * Prerequisites:
 *   1. Provision a PostgreSQL database (Neon, Supabase, or self-hosted)
 *   2. Update prisma/schema.prisma: change `provider = "sqlite"` to `provider = "postgresql"`
 *   3. Set DATABASE_URL to the PostgreSQL connection string
 *   4. Run `bun run db:push` to create tables in Postgres
 *   5. Run this script: `bun run src/scripts/migrate-to-postgres.ts`
 *
 * What this script does:
 *   - Reads ALL data from the SQLite database (via a separate Prisma client)
 *   - Writes ALL data to the PostgreSQL database (via the main Prisma client)
 *   - Reports row counts before + after for verification
 *
 * Notes:
 *   - This script must be run ONCE, after the schema is switched to PostgreSQL.
 *   - The SQLite file is NOT modified — it remains as a backup.
 *   - All IDs (cuids) are preserved — no ID remapping needed.
 *   - Relations are preserved — the script writes parent tables first, then children.
 *
 * Usage:
 *   bun run src/scripts/migrate-to-postgres.ts
 * ═══════════════════════════════════════════════════════════════
 */

import { PrismaClient } from '@prisma/client'

// Source: SQLite (read-only)
const sqliteUrl = 'file:/home/z/my-project/db/custom.db'
const sourceDb = new PrismaClient({
  datasources: { db: { url: sqliteUrl } },
})

// Destination: PostgreSQL (from DATABASE_URL env var)
const destDb = new PrismaClient()

// ─── Migration order (parent tables first, children last) ────────
const TABLES = [
  'user',
  'doctor',
  'hospital',
  'department',
  'doctorHospital',
  'doctorSchedule',
  'doctorHoliday',
  'doctorMedicine',
  'categoryMaster',
  'coMaster',
  'findingsMaster',
  'findingsMedicine',
  'questionsMaster',
  'suggestionsMaster',
  'labelMaster',
  'tableTemplateMaster',
  'pOtherSetting',
  'labTestMaster',
  'labTestParameter',
  'chargeCategory',
  'chargeItem',
  'inventoryItem',
  'operationTheater',
  'ward',
  'bed',
  'staffNurse',
  'receptionist',
  'doctorAssistant',
  'doctorPharmacist',
  'doctorRating',
  'doctorGallery',
  'post',
  'slider',
  'hospitalInquiry',
  'diseaseMaster',
  'booking',
  'bookingChat',
  'prescription',
  'pMedicine',
  'pLabel',
  'pSuggestion',
  'pDignoTable',
  'pCo',
  'medicalDocument',
  'notification',
  'notificationPreference',
  'doctorTypeMaster',
  'systemSettings',
  'session',
  'auditLog',
  'otpCode',
  'labPartner',
  'doctorLabAssociation',
  'externalTestOrder',
  'labReportUpload',
  'labBilling',
  'commissionPayment',
  'labTestCatalog',
  'otSchedule',
  'dietOrder',
  'bedTransfer',
  'ipdAdmission',
  'vitalRecord',
  'doctorOrder',
  'medicineAdministration',
  'sampleCollection',
  'investigationReport',
  'doctorVisit',
  'shiftHandover',
  'opdBill',
  'ipdBill',
  'billLineItem',
  'billPayment',
  'patientAdvance',
  'paymentGatewayTransaction',
  'nursePatientAssignment',
  'prescriptionAccessRequest',
  'prescriptionTemplate',
  'patientInsurancePolicy',
  'familyAccess',
  'stockMovement',
  'purchaseOrder',
  'purchaseOrderItem',
  'vendor',
  'vendorPayment',
  'expenseCategory',
  'expense',
  'notificationLog',
  'notificationTemplate',
  'bedTransferRequest',
  'insurancePreAuth',
  'insuranceClaim',
]

async function main() {
  console.log('═══════════════════════════════════════════════')
  console.log('  SQLite → PostgreSQL Migration')
  console.log('═══════════════════════════════════════════════')
  console.log(`Source: SQLite (${sqliteUrl})`)
  console.log(`Destination: PostgreSQL (${process.env.DATABASE_URL?.slice(0, 30)}...)`)
  console.log('')

  let totalRows = 0
  const counts: Record<string, { source: number; dest: number }> = {}

  for (const table of TABLES) {
    try {
      // Read from SQLite
      // @ts-expect-error — dynamic model access
      const rows = await sourceDb[table].findMany()
      counts[table] = { source: rows.length, dest: 0 }

      if (rows.length === 0) {
        console.log(`  ${table.padEnd(30)} 0 rows (skip)`)
        continue
      }

      // Write to PostgreSQL in batches of 50
      const batchSize = 50
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize)
        // @ts-expect-error — dynamic model access
        await destDb[table].createMany({
          data: batch,
          skipDuplicates: true,
        })
      }

      // Verify count
      // @ts-expect-error — dynamic model access
      const destCount = await destDb[table].count()
      counts[table].dest = destCount
      totalRows += rows.length

      const status = destCount === rows.length ? '✓' : '⚠ MISMATCH'
      console.log(`  ${table.padEnd(30)} ${String(rows.length).padStart(6)} → ${String(destCount).padStart(6)} ${status}`)
    } catch (err) {
      console.error(`  ${table.padEnd(30)} ERROR:`, err instanceof Error ? err.message : String(err))
      // Continue with next table — some tables may not exist in both schemas
    }
  }

  console.log('')
  console.log('═══════════════════════════════════════════════')
  console.log(`  Total rows migrated: ${totalRows}`)
  console.log('═══════════════════════════════════════════════')

  // Verify integrity
  let mismatches = 0
  for (const [table, { source, dest }] of Object.entries(counts)) {
    if (source !== dest) {
      console.warn(`  ⚠ MISMATCH: ${table} — source=${source} dest=${dest}`)
      mismatches++
    }
  }

  if (mismatches === 0) {
    console.log('  ✓ All table counts match — migration successful!')
  } else {
    console.warn(`  ⚠ ${mismatches} table(s) have count mismatches — investigate before going live.`)
  }

  await sourceDb.$disconnect()
  await destDb.$disconnect()
}

main().catch(console.error)
