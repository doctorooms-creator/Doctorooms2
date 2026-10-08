import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'

/**
 * P4-G: Transactional batch save for the RX wizard.
 *
 * One endpoint accepts ANY SUBSET of the wizard's step payloads and applies
 * every present section inside a single database transaction:
 *
 *   {
 *     complaintIds?:       string[]                    // Step 1
 *     vitals?:             { weight?, bp?, temperature? } // Step 2 (scalars)
 *     labels?:             Array<{ label, labelEn, value, labelUnit, showUnit }>
 *     tables?:             Array<{ ... }>              // Step 3
 *     medicines?:          Array<{ ... }>              // Step 4
 *     disease?:            string                      // Step 4 (diagnosis)
 *     suggestionIds?:      string[]                    // Step 5 (linked)
 *     customSuggestions?:  Array<{ ... }>              // Step 5 (custom)
 *   }
 *
 * vs. the legacy per-step endpoints (still available, untouched):
 *   - 1 auth check + 1 ownership check instead of one per step
 *   - all deletes/creates/updates commit atomically — a failure mid-way can
 *     never leave the prescription half-saved
 *   - the response echoes the SAVED rows for every submitted section (same
 *     shapes the GET route returns), so the client patches its shared
 *     ['rx-prescription-data'] cache directly — zero follow-up refetches
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const {
      complaintIds,
      vitals,
      labels,
      tables,
      medicines,
      disease,
      suggestionIds,
      customSuggestions,
    } = body ?? {}

    // ── Validation: at least one section must be present ──
    const hasComplaints = Array.isArray(complaintIds)
    const hasVitals = typeof vitals === 'object' && vitals !== null
    const hasLabels = Array.isArray(labels)
    const hasTables = Array.isArray(tables)
    const hasMedicines = Array.isArray(medicines)
    const hasSuggestions =
      Array.isArray(suggestionIds) || Array.isArray(customSuggestions)
    const hasDisease = typeof disease === 'string' && disease.trim() !== ''

    const anySection =
      hasComplaints ||
      hasVitals ||
      hasLabels ||
      hasTables ||
      hasMedicines ||
      hasSuggestions ||
      hasDisease

    if (!anySection) {
      return NextResponse.json(
        { error: 'Nothing to save — send at least one step section' },
        { status: 400 }
      )
    }

    // ── Ownership check (single read) ──
    const prescription = await db.prescription.findUnique({
      where: { id },
      select: { id: true, doctorId: true },
    })
    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }
    const doctor = await db.doctor.findUnique({
      where: { id: prescription.doctorId, userId: user.id },
      select: { id: true },
    })
    if (!doctor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Apply every present section inside ONE transaction ──
    // (delete-then-create mirrors the legacy endpoints exactly, so the
    // resulting rows are byte-identical to a per-step save.)
    const savedRows = await db.$transaction(async (tx) => {
      const out: {
        saved: string[]
      } = { saved: [] }

      // Step 1 — chief complaints
      if (hasComplaints) {
        await tx.pCo.deleteMany({ where: { prescriptionId: id } })
        if (complaintIds.length > 0) {
          await tx.pCo.createMany({
            data: complaintIds.map((coId: string) => ({
              prescriptionId: id,
              coId,
              createdById: user.id,
            })),
          })
        }
        out.saved.push('complaints')
      }

      // Step 2 — vitals scalars + custom labels
      if (hasVitals) {
        await tx.prescription.update({
          where: { id },
          data: {
            weight: vitals?.weight?.toString() || '',
            bp: vitals?.bp?.toString() || '',
            temperature: vitals?.temperature?.toString() || '',
          },
        })
        out.saved.push('vitals')
      }
      if (hasLabels) {
        await tx.pLabel.deleteMany({ where: { prescriptionId: id } })
        if (labels.length > 0) {
          await tx.pLabel.createMany({
            data: labels.map((lbl: Record<string, unknown>) => ({
              prescriptionId: id,
              label: String(lbl.label || ''),
              labelEn: String(lbl.labelEn || ''),
              value: String(lbl.value || ''),
              labelUnit: String(lbl.labelUnit || ''),
              showUnit: Boolean(lbl.showUnit !== false),
              createdById: user.id,
            })),
          })
        }
        if (!out.saved.includes('vitals')) out.saved.push('vitals')
      }

      // Step 3 — diagnosis tables
      if (hasTables) {
        await tx.pDignoTable.deleteMany({ where: { prescriptionId: id } })
        if (tables.length > 0) {
          await tx.pDignoTable.createMany({
            data: tables.map((t: Record<string, unknown>) => ({
              prescriptionId: id,
              templateId: t.templateId || null,
              rows: Math.max(1, Number(t.rows) || 1),
              cols: Math.max(1, Number(t.cols) || 1),
              headerLabel: JSON.stringify(t.headerLabel || []),
              colsLabel: JSON.stringify(t.colsLabel || []),
              footerLabel: JSON.stringify(t.footerLabel || []),
              extraLabel: String(t.extraLabel || ''),
              // Typed cell data — object keyed "row-col", stored as JSON
              // (same convention as headerLabel/colsLabel).
              cellValues: JSON.stringify(t.cellValues || {}),
              createdById: user.id,
            })),
          })
        }
        out.saved.push('tables')
      }

      // Step 4 — medicines + diagnosis
      if (hasDisease) {
        // Manual saves without a finding never blank an existing diagnosis —
        // only the non-empty value is written (legacy semantics preserved).
        await tx.prescription.update({
          where: { id },
          data: { disease: disease.trim() },
        })
        out.saved.push('disease')
      }
      if (hasMedicines) {
        await tx.pMedicine.deleteMany({ where: { prescriptionId: id } })
        const validMeds = medicines.filter(
          (m: Record<string, unknown>) => String(m.medicineName || m.medicine || '').trim()
        )
        if (validMeds.length > 0) {
          await tx.pMedicine.createMany({
            data: validMeds.map((m: Record<string, unknown>) => ({
              prescriptionId: id,
              medicine: String(m.medicineName || m.medicine || ''),
              dose: String(m.selectedDose || m.dose || ''),
              morning: Math.max(0, Math.round(Number(m.morning) || 0)),
              afternoon: Math.max(0, Math.round(Number(m.afternoon) || 0)),
              evening: Math.max(0, Math.round(Number(m.evening) || 0)),
              tab: Math.max(0, Math.round(Number(m.tab) || 1)),
              description: String(m.description || ''),
              createdById: user.id,
            })),
          })
        }
        out.saved.push('medicines')
      }

      // Step 5 — linked + custom suggestions
      if (hasSuggestions) {
        await tx.pSuggestion.deleteMany({ where: { prescriptionId: id } })

        const toCreate: Array<{
          prescriptionId: string
          coId: string | null
          question: string
          questionEn: string
          suggestions: string
          suggestionsEn: string
          createdById: string
        }> = []

        if (Array.isArray(suggestionIds) && suggestionIds.length > 0) {
          const masterSuggestions = await tx.suggestionsMaster.findMany({
            where: { id: { in: suggestionIds } },
            include: {
              question: {
                select: { question: true, questionEn: true, coId: true },
              },
            },
          })
          for (const ms of masterSuggestions) {
            toCreate.push({
              prescriptionId: id,
              coId: ms.question.coId || null,
              question: ms.question.question,
              questionEn: ms.question.questionEn,
              suggestions: ms.suggestions,
              suggestionsEn: ms.suggestionsEn,
              createdById: user.id,
            })
          }
        }

        if (Array.isArray(customSuggestions)) {
          for (const cs of customSuggestions) {
            toCreate.push({
              prescriptionId: id,
              coId:
                typeof cs.coId === 'string' && cs.coId.trim() !== ''
                  ? cs.coId.trim()
                  : null,
              question: String(cs.question || ''),
              questionEn: String(cs.questionEn || ''),
              suggestions: String(cs.suggestions || ''),
              suggestionsEn: String(cs.suggestionsEn || ''),
              createdById: user.id,
            })
          }
        }

        if (toCreate.length > 0) {
          await tx.pSuggestion.createMany({ data: toCreate })
        }
        out.saved.push('suggestions')
      }

      return out
    })

    // ── Echo saved rows (same shapes the GET route returns) ──
    // Fetched AFTER the transaction committed; each read only runs for the
    // sections the client actually submitted, so the response stays small.
    const response: Record<string, unknown> = { saved: savedRows.saved }

    if (savedRows.saved.includes('complaints')) {
      const rows = await db.pCo.findMany({ where: { prescriptionId: id } })
      const coIds = rows.map((c) => c.coId).filter(Boolean)
      const coMasters = coIds.length
        ? await db.coMaster.findMany({ where: { id: { in: coIds } } })
        : []
      const coMap = new Map(coMasters.map((c) => [c.id, c]))
      response.complaints = rows.map((c) => {
        const co = coMap.get(c.coId)
        return {
          ...c,
          co: co
            ? {
                id: co.id,
                coDetail: co.coDetail,
                coDetailEn: co.coDetailEn,
                coCode: co.coCode,
              }
            : null,
        }
      })
    }

    if (savedRows.saved.includes('vitals')) {
      if (hasLabels) {
        response.labels = await db.pLabel.findMany({
          where: { prescriptionId: id },
        })
      }
      if (hasVitals) {
        response.vitals = {
          weight: vitals?.weight?.toString() || '',
          bp: vitals?.bp?.toString() || '',
          temperature: vitals?.temperature?.toString() || '',
        }
      }
    }

    if (savedRows.saved.includes('tables')) {
      response.tables = await db.pDignoTable.findMany({
        where: { prescriptionId: id },
        orderBy: { createdAt: 'asc' },
      })
    }

    if (savedRows.saved.includes('medicines')) {
      response.medicines = await db.pMedicine.findMany({
        where: { prescriptionId: id },
        orderBy: { createdAt: 'asc' },
      })
    }

    if (savedRows.saved.includes('disease')) {
      response.disease = disease.trim()
    }

    if (savedRows.saved.includes('suggestions')) {
      response.suggestions = await db.pSuggestion.findMany({
        where: { prescriptionId: id },
        orderBy: { createdAt: 'asc' },
      })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Batch save prescription error:', error)
    return NextResponse.json({ error: 'Failed to save prescription' }, { status: 500 })
  }
}
