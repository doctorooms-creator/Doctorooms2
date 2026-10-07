/**
 * Single-pack validation gate — for pack AUTHORING before registry wiring.
 * Run: bun scripts/validate-one-pack.ts PED-01
 * Validates structure + prints counts. Exits non-zero on errors.
 * (The full gate `bun scripts/validate-packs.ts` only sees packs registered
 *  in packs/index.ts — this script validates a pack file directly.)
 */
import { validatePack, packCounts } from '../src/lib/specialty-packs/types'

const code = process.argv[2]
if (!code) {
  console.error('Usage: bun scripts/validate-one-pack.ts <PACK-CODE>   e.g. PED-01')
  process.exit(2)
}

const slug = code.toLowerCase() // packs files are named ped-01.ts etc.
let mod: Record<string, unknown>
try {
  mod = (await import(`../src/lib/specialty-packs/packs/${slug}`)) as Record<string, unknown>
} catch (e) {
  console.error(`✗ Cannot import packs/${slug}.ts — file missing or has syntax errors:`)
  console.error(String(e))
  process.exit(1)
}

const packKey = Object.keys(mod).find((k) => /_PACK$/.test(k))
if (!packKey) {
  console.error(`✗ packs/${slug}.ts does not export a *_PACK constant`)
  process.exit(1)
}

const pack = mod[packKey] as Parameters<typeof validatePack>[0]
const result = validatePack(pack)
const counts = packCounts(pack)
const total =
  counts.categories + counts.complaints + counts.questions + counts.suggestions +
  counts.labels + counts.findings + counts.medicines + counts.findingMeds +
  counts.tables + counts.rxTemplates

console.log(`\n${result.ok ? '✓' : '✗'} ${code} v${pack.meta.version} — ${total} rows total (${packKey})`)
console.log(`   ${counts.categories} categories · ${counts.complaints} C/O · ${counts.questions} questions · ${counts.suggestions} suggestions · ${counts.labels} labels`)
console.log(`   ${counts.findings} findings · ${counts.medicines} medicines · ${counts.findingMeds} links · ${counts.tables} tables · ${counts.rxTemplates} Rx templates`)
console.log(`   reviewed: ${pack.meta.reviewedBy || '(unverified-dose mode)'}`)

if (result.errors.length) {
  for (const e of result.errors) console.error(`   ERROR: ${e}`)
}
for (const w of result.warnings) console.warn(`   warn: ${w}`)

if (!result.ok) {
  console.error(`\nPACK ${code} VALIDATION FAILED (${result.errors.length} errors)`)
  process.exit(1)
}
console.log(`\nPACK ${code} VALID ✓`)
