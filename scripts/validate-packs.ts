/**
 * Pack validation gate (docs/specialty-packs/04-CONTENT-WORKFLOW.md §3).
 * Run: bun scripts/validate-packs.ts
 * Exits non-zero if any registered pack fails structural validation.
 * Also asserts registry↔pack consistency (every packAvailable code has content).
 */
import { PACKS } from '../src/lib/specialty-packs/packs'
import { validatePack, packCounts } from '../src/lib/specialty-packs/types'
import { SPECIALTY_REGISTRY } from '../src/lib/specialty-packs/registry'

let failed = false

for (const [code, pack] of Object.entries(PACKS)) {
  const result = validatePack(pack)
  const counts = packCounts(pack)
  const total =
    counts.categories + counts.complaints + counts.questions + counts.suggestions +
    counts.labels + counts.findings + counts.medicines + counts.findingMeds +
    counts.tables + counts.rxTemplates

  console.log(`\n${result.ok ? '✓' : '✗'} ${code} v${pack.meta.version} — ${total} rows total`)
  console.log(`   ${counts.complaints} C/O · ${counts.questions} questions · ${counts.suggestions} suggestions · ${counts.medicines} medicines · ${counts.findingMeds} links · ${counts.rxTemplates} Rx templates`)
  console.log(`   reviewed: ${pack.meta.reviewedBy || '(unverified-dose mode)'}`)

  if (result.errors.length) {
    failed = true
    for (const e of result.errors) console.error(`   ERROR: ${e}`)
  }
  for (const w of result.warnings) console.warn(`   warn: ${w}`)
}

// Registry ↔ pack consistency
for (const entry of SPECIALTY_REGISTRY) {
  if (entry.packCode && !PACKS[entry.packCode]) {
    console.error(`✗ Registry: ${entry.code} declares packCode ${entry.packCode} but no pack content exists`)
    failed = true
  }
}
for (const code of Object.keys(PACKS)) {
  const entry = SPECIALTY_REGISTRY.find((s) => s.code === code)
  if (!entry) {
    console.error(`✗ Pack ${code} exists but has no registry entry`)
    failed = true
  }
}

if (failed) {
  console.error('\nPACK VALIDATION FAILED')
  process.exit(1)
}
console.log('\nALL PACKS VALID ✓')
