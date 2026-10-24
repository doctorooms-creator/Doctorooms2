import type { Metadata } from 'next'
import './opd.css'

export const metadata: Metadata = {
  title: 'OPD Cockpit — Doctorooms',
  description: 'Doctorooms full-screen OPD cockpit — queue, patients, and reports at a glance.',
}

// Minimal by design: NO dashboard chrome (sidebar/header/footer/copilot).
// The cockpit IS the interface while the doctor is in OPD.
export default function OpdLayout({ children }: { children: React.ReactNode }) {
  return children
}
