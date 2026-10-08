/**
 * SPECIALTY PACK INSTALL SERVICE
 * (docs/specialty-packs/03-IMPLEMENTATION-DESIGN.md §5)
 *
 * Copies a pack's content into the doctor's OWN per-doctor master tables.
 * The RX wizard never changes — it already reads these tables.
 *
 * Transaction strategy (DEVIATION from doc 03, noted in worklog):
 * a single 310-row interactive transaction breaks on the Supabase
 * transaction pooler (pgbouncer kills long interactive tx — "Transaction
 * not found"). Instead we install PHASE-WISE with createMany batches and
 * natural-key idempotency: every phase checks the doctor's existing rows
 * first and only inserts what's missing. A crashed install can simply be
 * re-run — it completes the remaining items without duplicating anything.
 * The DoctorPackInstall receipt is written ONLY on full completion.
 *
 * Guarantees:
 *   P3 Idempotent   — re-install of the same (doctorId, packCode) is a no-op;
 *                     a crashed partial install is safely re-runnable.
 *   P4 Append-only  — never overwrites/deletes a doctor's existing rows;
 *                     colliding items are SKIPPED and reported.
 *   P6 Auditable    — DoctorPackInstall receipt + audit log on every install.
 */

import { db } from '@/lib/db'
import { getPack } from './packs'
import { validatePack, packCounts, type SpecialtyPack } from './types'
import { resolvePackCode } from './registry'
import { getPackReviewState, getPackReviewStates, effectiveReview } from './review-status'

export interface InstallResult {
  ok: true
  packCode: string
  version: string
  title: string
  alreadyInstalled?: boolean
  /** true until an MBBS reviewer signs off pack doses (unverified-dose mode) */
  unverified: boolean
  counts: Record<string, number>
  skipped: number
  summary: string
}

export interface InstallError {
  ok: false
  error: string
}

export async function installPack(opts: {
  userId: string
  doctorId: string
  packCode?: string
  specialization?: string
  installedById?: string | null
}): Promise<InstallResult | InstallError> {
  const { userId, doctorId } = opts

  // ── Resolve pack ──────────────────────────────────────────────────────
  const packCode = opts.packCode || resolvePackCode(opts.specialization || '')
  const pack: SpecialtyPack | null = getPack(packCode)
  if (!pack) {
    return { ok: false, error: `Unknown pack code: ${packCode}` }
  }

  // Dose-review state: a pack whose doses were verified via the admin
  // MBBS review console installs WITHOUT the unverified-dose note.
  const reviewState = await getPackReviewState(packCode)
  const packReviewed = effectiveReview(packCode, reviewState).reviewed

  // ── Structural validation (defense in depth) ─────────────────────────
  const validation = validatePack(pack)
  if (!validation.ok) {
    console.error(`[pack-install] pack ${packCode} failed validation:`, validation.errors)
    return { ok: false, error: `Pack ${packCode} failed structural validation (${validation.errors.length} errors)` }
  }

  // ── Idempotency check (P3) ────────────────────────────────────────────
  const existing = await db.doctorPackInstall.findUnique({
    where: { doctorId_packCode: { doctorId, packCode } },
  })
  if (existing && existing.status === 'Installed') {
    const counts = safeParseCounts(existing.counts)
    return {
      ok: true,
      packCode,
      version: existing.packVersion,
      title: pack.meta.title,
      alreadyInstalled: true,
      unverified: !packReviewed,
      counts,
      skipped: 0,
      summary: `${packCounts(pack).complaints} complaints · ${packCounts(pack).medicines} medicines · ${packCounts(pack).questions} questions`,
    }
  }

  let skipped = 0

  // ══ Phase 1: Categories → id map (keyed by PACK category key) ════════
  const existingCats = await db.categoryMaster.findMany({
    where: { doctorId },
    select: { id: true, name: true },
  })
  const catMap = new Map<string, string>()
  for (const c of pack.categories) {
    const match = existingCats.find((e) => e.name === c.name)
    if (match) catMap.set(c.key, match.id)
  }
  const newCats = pack.categories.filter((c) => !catMap.has(c.key))
  if (newCats.length) {
    await db.categoryMaster.createMany({
      data: newCats.map((c) => ({
        name: c.name,
        nameEn: c.nameEn,
        status: 'Active',
        doctorId,
        createdById: userId,
      })),
    })
    const refreshed = await db.categoryMaster.findMany({
      where: { doctorId },
      select: { id: true, name: true },
    })
    for (const c of pack.categories) {
      const match = refreshed.find((e) => e.name === c.name)
      if (match) catMap.set(c.key, match.id)
    }
  }
  skipped += pack.categories.length - newCats.length

  // ══ Phase 2: Complaints → id map (by coCode) ═════════════════════════
  const existingCos = await db.coMaster.findMany({
    where: { doctorId },
    select: { id: true, coCode: true },
  })
  const coMap = new Map<string, string>(existingCos.map((c) => [c.coCode, c.id]))
  const newCos = pack.complaints.filter((c) => !coMap.has(c.code))
  if (newCos.length) {
    await db.coMaster.createMany({
      data: newCos.map((c) => ({
        coCode: c.code,
        coDetail: c.detail,
        coDetailEn: c.detailEn,
        categoryId: catMap.get(c.categoryKey) ?? null,
        status: 'Active',
        doctorId,
        createdById: userId,
      })),
    })
    const refreshed = await db.coMaster.findMany({
      where: { doctorId },
      select: { id: true, coCode: true },
    })
    for (const r of refreshed) coMap.set(r.coCode, r.id)
  }
  skipped += pack.complaints.length - newCos.length

  // ══ Phase 3: Questions → id map (by questionEn+question) ═════════════
  const existingQs = await db.questionsMaster.findMany({
    where: { doctorId },
    select: { id: true, question: true, questionEn: true, coId: true },
  })
  const qKey = (q: { question: string; questionEn: string }) => `${q.questionEn}::${q.question}`
  const qMap = new Map<string, string>(existingQs.map((q) => [qKey(q), q.id]))
  const newQs = pack.questions.filter((q) => !qMap.has(qKey(q)))
  if (newQs.length) {
    await db.questionsMaster.createMany({
      data: newQs.map((q) => ({
        question: q.question,
        questionEn: q.questionEn,
        explanation: q.explanation || '',
        coId: coMap.get(q.complaintCode) ?? null,
        status: 'Active',
        doctorId,
        createdById: userId,
      })),
    })
    const refreshed = await db.questionsMaster.findMany({
      where: { doctorId },
      select: { id: true, question: true, questionEn: true },
    })
    for (const r of refreshed) qMap.set(qKey(r), r.id)
  }
  skipped += pack.questions.length - newQs.length

  // ══ Phase 4: Suggestions (questionId from map) ═══════════════════════
  const existingSug = await db.suggestionsMaster.findMany({
    where: { doctorId },
    select: { questionId: true, suggestions: true },
  })
  const sugSet = new Set(existingSug.map((s) => `${s.questionId}::${s.suggestions}`))
  const newSugs = pack.suggestions.filter((s) => {
    const questionId = qMap.get(qKey(pack.questions[s.questionIndex]))
    return !questionId || !sugSet.has(`${questionId}::${s.text}`)
  })
  if (newSugs.length) {
    await db.suggestionsMaster.createMany({
      data: newSugs
        .map((s) => {
          const questionId = qMap.get(qKey(pack.questions[s.questionIndex]))
          if (!questionId) return null
          return {
            questionId,
            suggestions: s.text,
            suggestionsEn: s.textEn,
            status: 'Active',
            doctorId,
            createdById: userId,
          }
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    })
  }
  skipped += pack.suggestions.length - newSugs.length

  // ══ Phase 5: Labels (no FKs) ═════════════════════════════════════════
  const existingLabels = await db.labelMaster.findMany({
    where: { doctorId },
    select: { id: true, label: true, labelEn: true },
  })
  const labelKey = (l: { label: string; labelEn: string }) => `${l.labelEn}::${l.label}`
  const labelSet = new Set(existingLabels.map(labelKey))
  const newLabels = pack.labels.filter((l) => !labelSet.has(labelKey(l)))
  if (newLabels.length) {
    await db.labelMaster.createMany({
      data: newLabels.map((l) => ({
        label: l.label,
        labelEn: l.labelEn,
        unit: l.unit,
        showUnit: l.showUnit ?? true,
        status: 'Active',
        doctorId,
        createdById: userId,
      })),
    })
  }
  skipped += pack.labels.length - newLabels.length

  // ══ Phase 6: Findings → id map (keyed by PACK finding key) ════════════
  const existingFindings = await db.findingsMaster.findMany({
    where: { doctorId },
    select: { id: true, name: true, nameEn: true },
  })
  const matchFinding = (
    rows: { id: string; name: string; nameEn: string }[],
    f: { name: string; nameEn: string }
  ) => rows.find((e) => e.nameEn === f.nameEn && e.name === f.name)
  const findingMap = new Map<string, string>()
  for (const f of pack.findings) {
    const match = matchFinding(existingFindings, f)
    if (match) findingMap.set(f.key, match.id)
  }
  const newFindings = pack.findings.filter((f) => !findingMap.has(f.key))
  if (newFindings.length) {
    await db.findingsMaster.createMany({
      data: newFindings.map((f) => ({
        name: f.name,
        nameEn: f.nameEn,
        status: 'Active',
        doctorId,
        createdById: userId,
      })),
    })
    const refreshed = await db.findingsMaster.findMany({
      where: { doctorId },
      select: { id: true, name: true, nameEn: true },
    })
    for (const f of pack.findings) {
      const match = matchFinding(refreshed, f)
      if (match) findingMap.set(f.key, match.id)
    }
  }
  skipped += pack.findings.length - newFindings.length

  // ══ Phase 7: Medicines → id map (by name) ════════════════════════════
  // NOTE: DoctorMedicine.userId = Doctor.id (legacy naming).
  const existingMeds = await db.doctorMedicine.findMany({
    where: { userId: doctorId },
    select: { id: true, name: true },
  })
  const medLowerMap = new Map(existingMeds.map((m) => [m.name.toLowerCase(), m.id]))
  const newMeds = pack.medicines.filter((m) => !medLowerMap.has(m.name.toLowerCase()))
  if (newMeds.length) {
    await db.doctorMedicine.createMany({
      data: newMeds.map((m) => {
        const flagNote = m.flags
          ? ` | ${m.flags.pregnancy !== 'na' ? `Preg: ${m.flags.pregnancy}` : ''}${
              m.flags.schedule !== 'na' ? ` · Sch: ${m.flags.schedule}` : ''
            }${m.flags.verified || packReviewed ? '' : ' · UNVERIFIED DOSE'}`
          : ''
        return {
          name: m.name,
          dose: JSON.stringify(m.doseOptions),
          morning: m.morning,
          afternoon: m.afternoon,
          evening: m.evening,
          tab: m.tab,
          description: `${m.salt}${flagNote}`,
          status: 'Active',
          userId: doctorId,
        }
      }),
    })
    const refreshed = await db.doctorMedicine.findMany({
      where: { userId: doctorId },
      select: { id: true, name: true },
    })
    for (const r of refreshed) medLowerMap.set(r.name.toLowerCase(), r.id)
  }
  skipped += pack.medicines.length - newMeds.length

  // ══ Phase 8: Finding ↔ Medicine links (unique constraint) ════════════
  const findingIdSet = new Set(findingMap.values())
  const existingLinks = await db.findingsMedicine.findMany({
    where: { findingId: { in: Array.from(findingIdSet) } },
    select: { findingId: true, medicineId: true },
  })
  const linkSet = new Set(existingLinks.map((l) => `${l.findingId}::${l.medicineId}`))
  const newLinks = pack.findingMeds
    .map((fm) => {
      const findingId = findingMap.get(fm.findingKey)
      const medicineId = medLowerMap.get(fm.medicineName.toLowerCase())
      if (!findingId || !medicineId) return null
      if (linkSet.has(`${findingId}::${medicineId}`)) return null
      const med = pack.medicines.find((m) => m.name === fm.medicineName)!
      return {
        findingId,
        medicineId,
        dose: fm.dose || (med.doseOptions.length ? med.doseOptions[0] : ''),
        morning: fm.morning ?? med.morning,
        afternoon: fm.afternoon ?? med.afternoon,
        evening: fm.evening ?? med.evening,
        tab: fm.tab ?? med.tab,
        description: fm.description || '',
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
  if (newLinks.length) {
    await db.findingsMedicine.createMany({ data: newLinks })
  }
  skipped += pack.findingMeds.length - newLinks.length

  // ══ Phase 9: Table templates (no FKs; name dedupe) ═══════════════════
  const existingTables = await db.tableTemplateMaster.findMany({
    where: { doctorId },
    select: { name: true },
  })
  const tableSet = new Set(existingTables.map((t) => t.name))
  const newTables = pack.tables.filter((t) => !tableSet.has(t.name))
  if (newTables.length) {
    await db.tableTemplateMaster.createMany({
      data: newTables.map((t) => ({
        name: t.name,
        rows: t.rows,
        cols: t.cols,
        headerLabel: JSON.stringify(t.headerLabel),
        colsLabel: JSON.stringify(t.colsLabel),
        footerLabel: JSON.stringify(t.footerLabel),
        extraLabel: t.extraLabel || '',
        status: 'Active',
        doctorId,
        createdById: userId,
      })),
    })
  }
  skipped += pack.tables.length - newTables.length

  // ══ Phase 10: Rx quick-packages (name dedupe) ════════════════════════
  const existingRx = await db.prescriptionTemplate.findMany({
    where: { doctorId },
    select: { name: true },
  })
  const rxSet = new Set(existingRx.map((r) => r.name))
  const newRx = pack.rxTemplates.filter((t) => !rxSet.has(t.name))
  if (newRx.length) {
    await db.prescriptionTemplate.createMany({
      data: newRx.map((t) => ({
        doctorId,
        name: t.name,
        diagnosis: t.diagnosis,
        medicines: JSON.stringify(t.medicines),
        labs: JSON.stringify(t.labs),
        advice: t.advice,
        followUpDays: t.followUpDays,
        isCommon: t.isCommon ?? false,
      })),
    })
  }
  skipped += pack.rxTemplates.length - newRx.length

  // ══ Phase 11: Install receipt (upsert — RolledBack rows can re-install) ══
  const c = packCounts(pack)
  const receipt = {
    categories: c.categories,
    complaints: c.complaints,
    questions: c.questions,
    suggestions: c.suggestions,
    labels: c.labels,
    findings: c.findings,
    medicines: c.medicines,
    findingMeds: c.findingMeds,
    tables: c.tables,
    rxTemplates: c.rxTemplates,
  }
  await db.doctorPackInstall.upsert({
    where: { doctorId_packCode: { doctorId, packCode } },
    update: {
      packVersion: pack.meta.version,
      status: 'Installed',
      counts: JSON.stringify(receipt),
      installedById: opts.installedById ?? null,
    },
    create: {
      doctorId,
      packCode,
      packVersion: pack.meta.version,
      status: 'Installed',
      counts: JSON.stringify(receipt),
      installedById: opts.installedById ?? null,
    },
  })

  const summary = `${c.complaints} complaints · ${c.medicines} medicines · ${c.questions} questions`

  return {
    ok: true,
    packCode,
    version: pack.meta.version,
    title: pack.meta.title,
    unverified: !packReviewed,
    counts: receipt,
    skipped,
    summary,
  }
}

function safeParseCounts(raw: string): Record<string, number> {
  try {
    return JSON.parse(raw || '{}')
  } catch {
    return {}
  }
}

/**
 * Pack status for a doctor — drives the empty-state banner and settings chip.
 */
export async function packStatusForDoctor(doctorId: string, specialization: string) {
  const [installs, complaints, reviewStates] = await Promise.all([
    db.doctorPackInstall.findMany({
      where: { doctorId, status: 'Installed' },
      select: { packCode: true, packVersion: true, counts: true, installedAt: true },
      orderBy: { installedAt: 'desc' },
    }),
    db.coMaster.count({ where: { doctorId } }),
    getPackReviewStates(),
  ])

  const suggestedPackCode = resolvePackCode(specialization)
  const suggestedPack = getPack(suggestedPackCode)
  const hasInstalled = installs.some((i) => i.packCode === suggestedPackCode)
  const effective = effectiveReview(
    suggestedPackCode,
    reviewStates.get(suggestedPackCode) ?? null
  )

  return {
    installedPacks: installs.map((i) => ({
      packCode: i.packCode,
      version: i.packVersion,
      counts: safeParseCounts(i.counts),
      installedAt: i.installedAt,
    })),
    mastersEmpty: complaints < 5,
    suggestedPack: suggestedPack
      ? {
          code: suggestedPack.meta.code,
          title: suggestedPack.meta.title,
          version: suggestedPack.meta.version,
          tier: suggestedPack.meta.tier,
          reviewed: effective.reviewed,
          reviewedBy: effective.reviewedBy,
          summary: `${packCounts(suggestedPack).complaints} complaints · ${packCounts(suggestedPack).medicines} medicines · ${packCounts(suggestedPack).questions} questions`,
          alreadyInstalled: hasInstalled,
        }
      : null,
  }
}
