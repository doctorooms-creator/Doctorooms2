/**
 * PrintOnMount — tiny client component that auto-triggers window.print()
 * when the print route mounts. Avoids the user needing to press Ctrl+P.
 * Also shows a "Back" button + "Print again" button that's hidden when
 * the actual print dialog is engaged (visibility: hidden on .no-print).
 */
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PrintOnMountProps {
  /** Auto-trigger print dialog on mount. Default true. */
  autoPrint?: boolean
  /** Delay before triggering (ms). Default 500ms (gives fonts/images time to load). */
  delay?: number
  /** Back URL — clicking "Back" navigates here. Default '/dashboard'. */
  backHref?: string
}

export function PrintOnMount({ autoPrint = true, delay = 500, backHref = '/dashboard' }: PrintOnMountProps) {
  const router = useRouter()

  useEffect(() => {
    if (!autoPrint) return
    const t = setTimeout(() => {
      try {
        window.print()
      } catch {
        // Print may fail if window is not focused; ignore silently
      }
    }, delay)
    return () => clearTimeout(t)
  }, [autoPrint, delay])

  return (
    <div className="no-print fixed top-4 left-4 z-50 flex gap-2 print:hidden">
      <button
        type="button"
        onClick={() => router.back()}
        className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
      >
        ← Back
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-md bg-teal-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-teal-700"
      >
        🖨️ Print
      </button>
    </div>
  )
}
