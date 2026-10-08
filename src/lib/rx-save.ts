import type { QueryClient } from '@tanstack/react-query'
import type { Vitals, LabelValue, TableData, MedicineRow, CustomSuggestion } from '@/lib/prescription-store'

/**
 * P4-G — shared save/cache helpers for the RX wizard.
 *
 * Every step saves through ONE transactional batch endpoint
 * (`POST /api/prescription/:id/save`) and then PATCHES the shared
 * ['rx-prescription-data', id] cache with the server's saved rows —
 * replacing the old save→invalidate→full-refetch chain (which cost one
 * full-Rx GET after every step save plus one on step-6 mount ≈ 7 GETs
 * per consultation). Result: exactly ONE full-Rx GET per consultation
 * (the initial draft resume) — everything after that is served from the
 * patched cache.
 */

/** Stale time for the shared full-Rx query — patched on every save, so it
 *  stays content-fresh without refetching for the whole consultation. */
export const RX_DATA_STALE = 5 * 60 * 1000

/** The cache key every step reads the full Rx through. */
export const rxDataKey = (rxId: string | null) => ['rx-prescription-data', rxId] as const

export interface RxSaveResponse {
  saved: string[]
  complaints?: Array<{ coId: string; [k: string]: unknown }>
  vitals?: { weight: string; bp: string; temperature: string }
  labels?: Array<Record<string, unknown>>
  tables?: Array<Record<string, unknown>>
  medicines?: Array<Record<string, unknown>>
  disease?: string
  suggestions?: Array<Record<string, unknown>>
}

/** Payload accepted by the batch endpoint — any subset of the step sections. */
export interface RxSavePayload {
  complaintIds?: string[]
  vitals?: Partial<Vitals>
  labels?: LabelValue[]
  tables?: TableData[]
  medicines?: MedicineRow[]
  disease?: string
  suggestionIds?: string[]
  customSuggestions?: CustomSuggestion[]
}

/**
 * POST one step section (or any combination) to the transactional batch
 * save endpoint. Hard-rejects non-2xx so mutation onError fires — no fake
 * success toasts (P4-D semantics preserved).
 */
export async function saveRxSection(
  rxId: string,
  payload: RxSavePayload
): Promise<RxSaveResponse> {
  const r = await fetch(`/api/prescription/${rxId}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!r.ok) {
    throw new Error(`Save failed (HTTP ${r.status})`)
  }
  return r.json()
}

/**
 * Merge the batch-save response into the shared full-Rx cache — zero
 * network. Only the sections present in the response are patched, and the
 * object identity changes so mounted steps re-render with fresh data.
 * (Field names mirror the GET /api/prescription/:id response exactly.)
 */
export function patchRxCache(
  qc: QueryClient,
  rxId: string | null,
  res: RxSaveResponse
): void {
  if (!rxId) return
  qc.setQueryData<{ prescription?: Record<string, unknown> }>(
    rxDataKey(rxId),
    (old) => {
      if (!old?.prescription) return old
      const rx = old.prescription
      const next: Record<string, unknown> = { ...rx }

      if (res.complaints) next.chiefComplaints = res.complaints
      if (res.vitals) {
        next.weight = res.vitals.weight
        next.bp = res.vitals.bp
        next.temperature = res.vitals.temperature
      }
      if (res.labels) next.labels = res.labels
      if (res.tables) next.diagnosisTables = res.tables
      if (res.medicines) next.medicines = res.medicines
      if (res.disease !== undefined) next.disease = res.disease
      if (res.suggestions) next.suggestions = res.suggestions

      return { prescription: next }
    }
  )
}
