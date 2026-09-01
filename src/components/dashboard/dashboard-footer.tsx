/**
 * DashboardFooter — sticky footer for the dashboard layout.
 *
 * Layout contract (with src/app/dashboard/layout.tsx):
 *   <main className="flex-1 overflow-y-auto flex flex-col p-4 md:p-6">
 *     <div className="flex-1">{children}</div>
 *     <DashboardFooter />   ← this component
 *   </main>
 *
 * Behavior:
 *   • Short content → footer sticks to the bottom of the viewport (no blank gap).
 *   • Long content → footer is pushed down naturally and scrolls with the
 *     content (never overlays).
 */

import { Heart } from 'lucide-react'
import { version } from '@/lib/app-version'

export function DashboardFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-6 shrink-0 border-t border-border pt-4">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <p className="flex items-center gap-1.5">
          <span className="font-semibold text-foreground">Doctorooms</span>
          <span className="text-muted-foreground/60">·</span>
          <span>Your Health, Our Priority</span>
        </p>
        <p className="flex items-center gap-1.5">
          <span>© {year} Doctorooms HMS</span>
          {version && (
            <>
              <span className="text-muted-foreground/60">·</span>
              <span className="font-mono">v{version}</span>
            </>
          )}
        </p>
        <p className="flex items-center gap-1">
          <span>Built with</span>
          <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
          <span>for healthcare</span>
        </p>
      </div>
    </footer>
  )
}
