/**
 * PACK LIBRARY — the registry of installed-able content packs.
 *
 * Add a pack: create `packs/<code>.<slug>.ts`, export the SpecialtyPack,
 * register it here. `packCode` entries in registry.ts must match a key
 * here when `packCode !== null` and content exists.
 *
 * Library contents (all v1.0.0, unverified-dose mode pending MBBS review):
 *   GP-01  General Practice (BASE — fallback for every specialty)
 *   PED-01 Pediatrics          OBG-01 Obstetrics & Gynecology
 *   DIA-01 Diabetology         MED-01 Internal Medicine (GP + depth)
 *   DRM-01 Dermatology         ORT-01 Orthopedics
 *   ENT-01 ENT                 SUR-01 General Surgery
 *   DEN-01 Dentistry
 * P2 batch 1 (T2):
 *   CAR-01 Cardiology          GAS-01 Gastroenterology
 *   OPH-01 Ophthalmology
 * P2 batch 2 (T2):
 *   PSY-01 Psychiatry          NEU-01 Neurology
 *   PUL-01 Pulmonology
 * P2 batch 3 (T2):
 *   URO-01 Urology             END-01 Endocrinology
 *   NEP-01 Nephrology
 * P2 batch 4 (T2 — COMPLETE):
 *   REP-01 IVF & Fertility      ONC-01 Oncology
 */

import type { SpecialtyPack } from '../types'
import { GP01_PACK } from './gp-01'
import { PED01_PACK } from './ped-01'
import { OBG01_PACK } from './obg-01'
import { DIA01_PACK } from './dia-01'
import { MED01_PACK } from './med-01'
import { DRM01_PACK } from './drm-01'
import { ORT01_PACK } from './ort-01'
import { ENT01_PACK } from './ent-01'
import { SUR01_PACK } from './sur-01'
import { DEN01_PACK } from './den-01'
import { GAS01_PACK } from './gas-01'
import { OPH01_PACK } from './oph-01'
import { CAR01_PACK } from './car-01'
import { PSY01_PACK } from './psy-01'
import { NEU01_PACK } from './neu-01'
import { PUL01_PACK } from './pul-01'
import { URO01_PACK } from './uro-01'
import { END01_PACK } from './end-01'
import { NEP01_PACK } from './nep-01'
import { REP01_PACK } from './rep-01'
import { ONC01_PACK } from './onc-01'

export const PACKS: Record<string, SpecialtyPack> = {
  'GP-01': GP01_PACK,
  'PED-01': PED01_PACK,
  'OBG-01': OBG01_PACK,
  'DIA-01': DIA01_PACK,
  'MED-01': MED01_PACK,
  'DRM-01': DRM01_PACK,
  'ORT-01': ORT01_PACK,
  'ENT-01': ENT01_PACK,
  'SUR-01': SUR01_PACK,
  'DEN-01': DEN01_PACK,
  'CAR-01': CAR01_PACK,
  'GAS-01': GAS01_PACK,
  'OPH-01': OPH01_PACK,
  'PSY-01': PSY01_PACK,
  'NEU-01': NEU01_PACK,
  'PUL-01': PUL01_PACK,
  'URO-01': URO01_PACK,
  'END-01': END01_PACK,
  'NEP-01': NEP01_PACK,
  'REP-01': REP01_PACK,
  'ONC-01': ONC01_PACK,
}

export function getPack(code: string): SpecialtyPack | null {
  return PACKS[code] ?? null
}
