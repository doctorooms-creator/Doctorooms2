'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'

/**
 * Error boundary for the /dashboard/* route group.
 * Catches any uncaught error in a dashboard page and shows a friendly
 * "Something went wrong" UI with a "Try again" button (calls reset()).
 *
 * SECURITY (P4.2): Previously, an uncaught error in any dashboard page would
 * show a white screen or the default Next.js error page (which can leak
 * stack traces in dev mode). This error boundary provides a consistent,
 * user-friendly error UX.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to console (Sentry will capture this in production via P4.1)
    console.error('[dashboard-error]', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950">
            <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred while loading this page. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          {process.env.NODE_ENV === 'development' && (
            <details className="w-full rounded-lg border border-border p-3 text-xs text-muted-foreground">
              <summary className="cursor-pointer font-medium">Error details (dev only)</summary>
              <pre className="mt-2 whitespace-pre-wrap break-all">
                {error.message}
                {error.digest ? `\nDigest: ${error.digest}` : ''}
              </pre>
            </details>
          )}
          <div className="flex gap-2">
            <Button onClick={reset} variant="default">
              <RotateCcw className="h-4 w-4 mr-2" />
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
