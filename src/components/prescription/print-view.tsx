'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { X } from 'lucide-react'
import { doctorDisplayName } from '@/lib/utils'
import { mergeVitalsWithLabels, type LabelLike } from '@/lib/prescription-labels'

// ─── Data Types ───────────────────────────────────────────

export interface PrintData {
  patient: {
    name: string
    age: string
    gender: string
    bloodGroup: string
    /** Queue token / appointment no — the searchable patient ID (e.g. SHARMA-001) */
    id?: string
    /** Patient contact number */
    contact?: string
  }
  doctor: {
    name: string
    specialization: string
    education: string
    registrationDetail: string
    city: string
    state: string
    address: string
    hospitalAddress: string
    phoneNo: string
    mobileNo: string
  }
  hospital: {
    hospitalName: string
    departmentName: string
    departmentFloor: string
    departmentOpdRoom: string
  } | null
  settings: {
    logo: string
    header: string
    fullHeader: string
    isFullHeader: boolean
    footer: string
    showCoInPrint: boolean
    showNextVisit: boolean
    printLayout: string
  }
  complaints: {
    coId: string
    coDetail: string
    coDetailEn: string
  }[]
  vitals: {
    weight: string
    bp: string
    temperature: string
    pulse: string
    spo2: string
  }
  labels: LabelLike[]
  medicines: {
    medicine: string
    dose: string
    morning: number
    afternoon: number
    evening: number
    tab: number
    description: string
  }[]
  tables: {
    rows: number
    cols: number
    headerLabel: string[]
    colsLabel: string[]
    footerLabel: string[]
    extraLabel: string
    cellValues: Record<string, string>
  }[]
  suggestions: {
    coId: string | null
    question: string
    questionEn: string
    suggestions: string
    suggestionsEn: string
  }[]
  nextVisit?: string
  createdAt: string
}

// ─── Legacy type alias for backward compatibility ─────────
export type PrescriptionPrintData = PrintData

interface PrescriptionPrintViewProps {
  data: PrintData
  onClose: () => void
  onPrint: () => void
  /** Auto-trigger the print dialog ~150ms after mount (default: true). Set false when the caller wants explicit Print buttons. */
  autoPrint?: boolean
  /** Extra actions (e.g. "Mark Visit Complete") rendered in a floating bar above the document. Hidden in print. */
  extraActions?: React.ReactNode
}

// ─── Shared styles ────────────────────────────────────────

const COLORS = {
  teal: '#0d9488',
  tealLight: '#f0fdfa',
  tealBorder: '#99f6e4',
  gray700: '#374151',
  gray500: '#6b7280',
  gray400: '#9ca3af',
  gray100: '#f9fafb',
  border: '#e5e7eb',
  text: '#1a1a1a',
}

const sectionTitle: React.CSSProperties = {
  margin: '0 0 6px 0',
  fontSize: '12px',
  fontWeight: 700,
  color: COLORS.teal,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

// ─── Component ───────────────────────────────────────────

// Detect whether a string is an image URL/URI (vs plain text header content).
// Accepts http(s) URLs, root-relative paths (/foo.png), and data: image URLs.
function isImageUrl(s: string): boolean {
  if (!s) return false
  const t = s.trim()
  return /^(https?:\/\/|\/[^/\s]+|data:image\/)/i.test(t)
}

// Split a header text string into display lines (preserving explicit \n).
function splitHeaderLines(s: string): string[] {
  return (s || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
}

export function PrescriptionPrintView({ data, onClose, onPrint, autoPrint = true, extraActions }: PrescriptionPrintViewProps) {
  const { patient, doctor, hospital, settings, complaints, vitals, medicines, tables, suggestions, nextVisit, createdAt } = data
  // Step 2 of the wizard captures the common vitals AND custom label
  // measurements together — they are ALL vitals/in-clinic measurements, so
  // they print together under the "Vitals & Measurements" section. Vital-
  // named labels fill empty vital slots (pulse/SpO2 are only ever labels);
  // duplicates of filled slots are dropped; everything else (Respiratory
  // Rate, RBS, HbA1c, Height…) renders as an extra chip. Nothing entered in
  // the wizard belongs under a "Lab Results" heading — lab reports come from
  // the lab module.
  const { vitals: mergedVitals, extraLabels } = mergeVitalsWithLabels(vitals, data.labels || [])

  // Advice grouped complaint-wise (mirrors wizard Step 5/6 sections).
  // Legacy rows without coId fall under "General Advice".
  const adviceGroups = (() => {
    const coNameMap = new Map<string, { coDetail: string; coDetailEn: string }>()
    for (const c of complaints || []) {
      if (c.coId && (c.coDetail || c.coDetailEn)) {
        coNameMap.set(c.coId, { coDetail: c.coDetail, coDetailEn: c.coDetailEn })
      }
    }
    const all = suggestions || []
    const general = all.filter((s) => !s.coId)
    const other = all.filter((s) => s.coId && !coNameMap.has(s.coId))
    const sections: Array<{ key: string; name: string; items: typeof all }> = []
    for (const [coId, names] of coNameMap) {
      const items = all.filter((s) => s.coId === coId)
      if (items.length > 0) {
        sections.push({ key: coId, name: names.coDetailEn || names.coDetail, items })
      }
    }
    if (other.length > 0) {
      sections.push({ key: '__other__', name: 'Other Advice', items: other })
    }
    if (general.length > 0) {
      sections.push({ key: '__general__', name: 'General Advice', items: general })
    }
    return sections
  })()

  useEffect(() => {
    if (!autoPrint) return
    const timer = setTimeout(() => {
      onPrint()
    }, 150)
    return () => clearTimeout(timer)
  }, [autoPrint, onPrint])

  // Determine which time columns are needed based on medicine data
  const hasMorning = medicines.some((m) => m.morning > 0)
  const hasAfternoon = medicines.some((m) => m.afternoon > 0)
  const hasEvening = medicines.some((m) => m.evening > 0)

  return (
    <>
      {/* Print-only styles */}
      <style dangerouslySetInnerHTML={{ __html: `
          @media print {
          body * { visibility: hidden; }
          .prescription-print-area, .prescription-print-area * { visibility: visible; }
          .prescription-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .print-close-btn, .print-actions-bar { display: none !important; }
          @page { size: A4; margin: 10mm; }
        }
      ` }} />

      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-y-auto py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          {/* Extra actions bar (e.g. Print + Mark Visit Complete) - hidden in print */}
          {extraActions && (
            <div className="print-actions-bar fixed top-4 left-1/2 z-[60] -translate-x-1/2 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow-lg">
              {extraActions}
            </div>
          )}

          {/* Close button - hidden in print */}
          <button
            onClick={onClose}
            className="print-close-btn fixed top-4 right-4 z-[60] rounded-full bg-white/90 p-2 shadow-lg hover:bg-white transition-colors"
            aria-label="Close print preview"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>

          {/* Prescription document */}
          <motion.div
            className="prescription-print-area bg-white rounded-lg shadow-2xl"
            style={{ width: '210mm', maxWidth: '95vw' }}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div style={{ padding: '24px 32px', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', color: COLORS.text, fontSize: '13px', lineHeight: '1.5' }}>

              {/* ── Header ── */}
              <div style={{ borderBottom: `2px solid ${COLORS.teal}`, paddingBottom: '14px', marginBottom: '16px' }}>
                {/* Full header mode: doctor-provided letterhead (image OR custom text) */}
                {settings.isFullHeader && settings.fullHeader ? (
                  isImageUrl(settings.fullHeader) ? (
                    /* Image letterhead (e.g. uploaded clinic letterhead PNG) */
                    <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                      <img
                        src={settings.fullHeader}
                        alt="Doctor Header"
                        style={{ maxHeight: '120px', maxWidth: '100%', objectFit: 'contain' }}
                      />
                      {/* Hospital context line below full header image */}
                      {hospital && hospital.hospitalName && (
                        <div style={{ marginTop: '6px' }}>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: COLORS.text }}>{hospital.hospitalName}</p>
                          {(hospital.departmentName || hospital.departmentFloor || hospital.departmentOpdRoom) && (
                            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: COLORS.gray500, fontWeight: 500 }}>
                              {[hospital.departmentName, hospital.departmentFloor && `Floor ${hospital.departmentFloor}`, hospital.departmentOpdRoom].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Text letterhead (doctor typed multi-line clinic header — no image) */
                    <div style={{ textAlign: 'center' }}>
                      {splitHeaderLines(settings.fullHeader).map((line, i, arr) => (
                        <p
                          key={i}
                          style={{
                            margin: i === 0 ? '0 0 2px 0' : i === arr.length - 1 ? '2px 0 0 0' : '1px 0',
                            fontSize: i === 0 ? '20px' : '12px',
                            fontWeight: i === 0 ? 800 : 500,
                            color: i === 0 ? COLORS.teal : COLORS.gray700,
                            letterSpacing: i === 0 ? '0.3px' : 'normal',
                          }}
                        >
                          {line}
                        </p>
                      ))}
                      {/* Hospital context line below text header */}
                      {hospital && hospital.hospitalName && (
                        <div style={{ marginTop: '6px' }}>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: COLORS.text }}>{hospital.hospitalName}</p>
                          {(hospital.departmentName || hospital.departmentFloor || hospital.departmentOpdRoom) && (
                            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: COLORS.gray500, fontWeight: 500 }}>
                              {[hospital.departmentName, hospital.departmentFloor && `Floor ${hospital.departmentFloor}`, hospital.departmentOpdRoom].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  /* Standard header: logo + doctor info text */
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      {settings.logo && (
                        <div style={{ flexShrink: 0 }}>
                          <img
                            src={settings.logo}
                            alt="Logo"
                            style={{ height: '60px', width: '60px', objectFit: 'contain', borderRadius: '4px' }}
                          />
                        </div>
                      )}
                      <div>
                        {/* Hospital context — shown above doctor name when available */}
                        {hospital && hospital.hospitalName && (
                          <div style={{ marginBottom: '6px' }}>
                            <h2 style={{ margin: '0 0 3px 0', fontSize: '18px', fontWeight: 800, color: COLORS.text, letterSpacing: '0.2px' }}>
                              {hospital.hospitalName}
                            </h2>
                            {(hospital.departmentName || hospital.departmentFloor || hospital.departmentOpdRoom) && (
                              <p style={{ margin: 0, fontSize: '12px', color: COLORS.gray500, fontWeight: 500 }}>
                                {[hospital.departmentName, hospital.departmentFloor && `Floor ${hospital.departmentFloor}`, hospital.departmentOpdRoom].filter(Boolean).join(' · ')}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Doctor-supplied custom header text takes precedence over auto-generated block */}
                        {settings.header && settings.header.trim() ? (
                          <div>
                            {splitHeaderLines(settings.header).map((line, i, arr) => (
                              <p
                                key={i}
                                style={{
                                  margin: i === 0 ? '0 0 3px 0' : i === arr.length - 1 ? '0' : '0 0 3px 0',
                                  fontSize: i === 0 ? '20px' : '12px',
                                  fontWeight: i === 0 ? 700 : 500,
                                  color: i === 0 ? COLORS.teal : COLORS.gray500,
                                  letterSpacing: i === 0 ? '0.3px' : 'normal',
                                }}
                              >
                                {line}
                              </p>
                            ))}
                          </div>
                        ) : (
                          /* Auto-generated header from doctor profile */
                          <>
                            <h1 style={{ margin: '0 0 2px 0', fontSize: '20px', fontWeight: 700, color: COLORS.teal, letterSpacing: '0.3px' }}>
                              {doctorDisplayName(doctor.name) || 'Unknown'}
                            </h1>
                            {doctor.specialization && (
                              <p style={{ margin: '0 0 3px 0', fontSize: '13px', color: COLORS.gray700, fontWeight: 500 }}>
                                {doctor.specialization}
                              </p>
                            )}
                            {doctor.education && (
                              <p style={{ margin: '0 0 3px 0', fontSize: '12px', color: COLORS.gray500 }}>
                                {doctor.education}
                              </p>
                            )}
                            {doctor.registrationDetail && (
                              <p style={{ margin: '0', fontSize: '11px', color: COLORS.gray500 }}>
                                Reg. No: {doctor.registrationDetail}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: COLORS.gray700, fontWeight: 600 }}>
                        PRESCRIPTION
                      </p>
                      <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: COLORS.gray500 }}>
                        Date: {format(new Date(createdAt), 'dd MMM yyyy')}
                      </p>
                      {(doctor.phoneNo || doctor.mobileNo) && (
                        <p style={{ margin: '0', fontSize: '11px', color: COLORS.gray500 }}>
                          Ph: {doctor.phoneNo || doctor.mobileNo}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {/* Address line */}
                {(doctor.hospitalAddress || doctor.address) && (
                  <p style={{ margin: settings.isFullHeader && settings.fullHeader ? '4px 0 0 0' : '8px 0 0 0', fontSize: '11px', color: COLORS.gray500 }}>
                    {doctor.hospitalAddress || doctor.address}{doctor.city ? `, ${doctor.city}` : ''}{doctor.state ? `, ${doctor.state}` : ''}
                  </p>
                )}
              </div>

              {/* ── Patient Info ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '6px 24px', padding: '10px 14px', backgroundColor: COLORS.gray100, borderRadius: '6px', marginBottom: '16px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: COLORS.gray500 }}>Patient: </span>
                  <span style={{ fontWeight: 600 }}>{patient.name}</span>
                </div>
                {patient.id && (
                  <div>
                    <span style={{ color: COLORS.gray500 }}>Patient ID: </span>
                    <span style={{ fontWeight: 700, color: COLORS.teal, letterSpacing: '0.3px' }}>{patient.id}</span>
                  </div>
                )}
                {patient.age && (
                  <div>
                    <span style={{ color: COLORS.gray500 }}>Age: </span>
                    <span style={{ fontWeight: 500 }}>{patient.age}</span>
                  </div>
                )}
                {patient.gender && (
                  <div>
                    <span style={{ color: COLORS.gray500 }}>Gender: </span>
                    <span style={{ fontWeight: 500 }}>{patient.gender}</span>
                  </div>
                )}
                {patient.bloodGroup && (
                  <div>
                    <span style={{ color: COLORS.gray500 }}>Blood Group: </span>
                    <span style={{ fontWeight: 500 }}>{patient.bloodGroup}</span>
                  </div>
                )}
                {patient.contact && (
                  <div>
                    <span style={{ color: COLORS.gray500 }}>Contact: </span>
                    <span style={{ fontWeight: 500 }}>{patient.contact}</span>
                  </div>
                )}
              </div>

              {/* ── C/O Section (Chief Complaints) ── */}
              {settings.showCoInPrint && complaints && complaints.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <h3 style={sectionTitle}>Chief Complaints</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: COLORS.text }}>
                    C/O: {complaints.map((c) => c.coDetailEn || c.coDetail).filter(Boolean).join(', ')}
                  </p>
                </div>
              )}

              {/* ── Vitals & Measurements (common vitals + custom labels from Step 2) ── */}
              {(mergedVitals.bp || mergedVitals.temperature || mergedVitals.weight || mergedVitals.pulse || mergedVitals.spo2 || extraLabels.length > 0) && (
                <div style={{ marginBottom: '14px' }}>
                  <h3 style={sectionTitle}>Vitals & Measurements</h3>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {mergedVitals.weight && (
                      <div style={{ padding: '5px 12px', border: `1px solid ${COLORS.border}`, borderRadius: '4px', fontSize: '12px' }}>
                        <span style={{ color: COLORS.gray500 }}>Weight: </span>
                        <span style={{ fontWeight: 600 }}>{mergedVitals.weight} kg</span>
                      </div>
                    )}
                    {mergedVitals.bp && (
                      <div style={{ padding: '5px 12px', border: `1px solid ${COLORS.border}`, borderRadius: '4px', fontSize: '12px' }}>
                        <span style={{ color: COLORS.gray500 }}>BP: </span>
                        <span style={{ fontWeight: 600 }}>{mergedVitals.bp} mmHg</span>
                      </div>
                    )}
                    {mergedVitals.temperature && (
                      <div style={{ padding: '5px 12px', border: `1px solid ${COLORS.border}`, borderRadius: '4px', fontSize: '12px' }}>
                        <span style={{ color: COLORS.gray500 }}>Temp: </span>
                        <span style={{ fontWeight: 600 }}>{mergedVitals.temperature}°F</span>
                      </div>
                    )}
                    {mergedVitals.pulse && (
                      <div style={{ padding: '5px 12px', border: `1px solid ${COLORS.border}`, borderRadius: '4px', fontSize: '12px' }}>
                        <span style={{ color: COLORS.gray500 }}>Pulse: </span>
                        <span style={{ fontWeight: 600 }}>{mergedVitals.pulse} bpm</span>
                      </div>
                    )}
                    {mergedVitals.spo2 && (
                      <div style={{ padding: '5px 12px', border: `1px solid ${COLORS.border}`, borderRadius: '4px', fontSize: '12px' }}>
                        <span style={{ color: COLORS.gray500 }}>SpO2: </span>
                        <span style={{ fontWeight: 600 }}>{mergedVitals.spo2}%</span>
                      </div>
                    )}
                    {/* Additional measurements entered alongside vitals in Step 2 */}
                    {extraLabels.map((l, i) => (
                      <div key={`lbl-${i}`} style={{ padding: '5px 12px', border: `1px solid ${COLORS.border}`, borderRadius: '4px', fontSize: '12px' }}>
                        <span style={{ color: COLORS.gray500 }}>{l.labelEn || l.label}: </span>
                        <span style={{ fontWeight: 600 }}>
                          {l.value}{l.showUnit && l.labelUnit ? ` ${l.labelUnit}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Medicines Table ── */}
              {medicines && medicines.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <h3 style={sectionTitle}>Rx - Medicines</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${COLORS.teal}` }}>
                        <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, color: COLORS.gray700, fontSize: '11px' }}>#</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, color: COLORS.gray700, fontSize: '11px' }}>Medicine</th>
                        <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, color: COLORS.gray700, fontSize: '11px' }}>Dose</th>
                        {hasMorning && (
                          <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, color: COLORS.gray700, fontSize: '11px' }}>M</th>
                        )}
                        {hasAfternoon && (
                          <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, color: COLORS.gray700, fontSize: '11px' }}>A</th>
                        )}
                        {hasEvening && (
                          <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, color: COLORS.gray700, fontSize: '11px' }}>E</th>
                        )}
                        <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, color: COLORS.gray700, fontSize: '11px' }}>Days</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, color: COLORS.gray700, fontSize: '11px' }}>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.map((med, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '5px 8px', color: COLORS.gray500 }}>{i + 1}</td>
                          <td style={{ padding: '5px 8px', fontWeight: 600 }}>{med.medicine}</td>
                          <td style={{ padding: '5px 8px', textAlign: 'center' }}>{med.dose || '-'}</td>
                          {hasMorning && (
                            <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                              {med.morning > 0 ? med.morning : '-'}
                            </td>
                          )}
                          {hasAfternoon && (
                            <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                              {med.afternoon > 0 ? med.afternoon : '-'}
                            </td>
                          )}
                          {hasEvening && (
                            <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                              {med.evening > 0 ? med.evening : '-'}
                            </td>
                          )}
                          <td style={{ padding: '5px 8px', textAlign: 'center' }}>{med.tab > 0 ? med.tab : '-'}</td>
                          <td style={{ padding: '5px 8px', color: COLORS.gray500 }}>{med.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── Diagnosis Tables ── */}
              {tables && tables.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <h3 style={sectionTitle}>Diagnosis Tables</h3>
                  {tables.map((table, ti) => (
                    <div key={ti} style={{ marginBottom: '12px' }}>
                      {table.extraLabel && (
                        <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: 600, color: COLORS.gray700 }}>
                          {table.extraLabel}
                        </p>
                      )}
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: `1px solid ${COLORS.border}` }}>
                        {/* Column headers — headerLabel[0] is the row-label
                            column header (same geometry as the Step 3 grid). */}
                        {table.headerLabel && table.headerLabel.length > 0 && (
                          <thead>
                            <tr style={{ backgroundColor: COLORS.tealLight }}>
                              {table.headerLabel.map((h, hi) => (
                                <th key={hi} style={{ padding: '5px 8px', border: `1px solid ${COLORS.border}`, fontWeight: 600, color: COLORS.gray700, fontSize: '11px', textAlign: 'left' }}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                        )}
                        <tbody>
                          {Array.from({ length: table.rows }).map((_, ri) => (
                            <tr key={ri}>
                              <td style={{ padding: '4px 8px', border: `1px solid ${COLORS.border}`, fontWeight: 500, color: COLORS.gray500, fontSize: '11px' }}>
                                {table.colsLabel[ri] || ''}
                              </td>
                              {/* Value cells — keyed "row-col", cols 1..cols-1
                                  (col 0 is the row label above). */}
                              {Array.from({ length: Math.max(0, table.cols - 1) }).map((_, ci) => (
                                <td key={ci} style={{ padding: '4px 8px', border: `1px solid ${COLORS.border}`, color: COLORS.text }}>
                                  {table.cellValues?.[`${ri}-${ci + 1}`] || ''}
                                </td>
                              ))}
                            </tr>
                          ))}
                          {/* Footer rows */}
                          {table.footerLabel && table.footerLabel.length > 0 && table.footerLabel.map((f, fi) => (
                            <tr key={`footer-${fi}`}>
                              <td
                                colSpan={table.cols}
                                style={{ padding: '4px 8px', border: `1px solid ${COLORS.border}`, fontWeight: 500, color: COLORS.gray700, fontSize: '11px', textAlign: 'center' }}
                              >
                                {f}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Suggestions / Advice ── */}
              {suggestions && suggestions.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <h3 style={sectionTitle}>Advice / Suggestions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    {adviceGroups.map((sec) => (
                      <div key={sec.key}>
                        <p
                          style={{
                            margin: '0 0 2px 0',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: COLORS.teal,
                            letterSpacing: '0.02em',
                          }}
                        >
                          {sec.name}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {sec.items.map((s, i) => (
                            <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                              <span
                                style={{
                                  color: COLORS.teal,
                                  fontWeight: 600,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                &bull;{(s.questionEn || s.question) ? ` ${s.questionEn || s.question}:` : ''}
                              </span>
                              <span style={{ color: COLORS.gray700 }}>{s.suggestionsEn || s.suggestions}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Next Visit ── */}
              {settings.showNextVisit && nextVisit && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: COLORS.tealLight, border: `1px solid ${COLORS.tealBorder}`, borderRadius: '4px', fontSize: '12px' }}>
                    <span style={{ color: COLORS.gray500, fontWeight: 600 }}>Next Visit:</span>
                    <span style={{ color: COLORS.teal, fontWeight: 700 }}>{nextVisit}</span>
                  </div>
                </div>
              )}

              {/* ── Footer / Signature ── */}
              <div style={{ marginTop: '24px', paddingTop: '14px', borderTop: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ fontSize: '10px', color: COLORS.gray400 }}>
                  {settings.footer && (
                    <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: COLORS.gray500, fontStyle: 'italic', maxWidth: '280px' }}>
                      {settings.footer}
                    </p>
                  )}
                  <p style={{ margin: 0 }}>This is a computer-generated prescription.</p>
                  <p style={{ margin: '2px 0 0 0' }}>Generated on {format(new Date(createdAt), 'dd MMM yyyy \'at\' hh:mm a')}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '140px', borderBottom: `1px solid ${COLORS.text}`, marginBottom: '4px' }} />
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: COLORS.text }}>{doctorDisplayName(doctor.name) || ''}</p>
                  {doctor.specialization && (
                    <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: COLORS.gray500 }}>{doctor.specialization}</p>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
