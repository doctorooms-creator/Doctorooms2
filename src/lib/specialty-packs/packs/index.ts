/**
 * PACK LIBRARY — the registry of installed-able content packs.
 *
 * Add a pack: create `packs/<code>.<slug>.ts`, export the SpecialtyPack,
 * register it here. `packCode` entries in registry.ts must match a key
 * here when `packCode !== null` and content exists.
 */

import type { SpecialtyPack } from '../types'
import { GP01_PACK } from './gp-01'

export const PACKS: Record<string, SpecialtyPack> = {
  'GP-01': GP01_PACK,
}

export function getPack(code: string): SpecialtyPack | null {
  return PACKS[code] ?? null
}
