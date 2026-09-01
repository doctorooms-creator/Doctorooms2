'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'missing'>('loading')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    if (!token) {
      setStatus('missing')
      setMessage('No verification token found. Please click the link in your email.')
      return
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
        const data = await res.json()
        if (res.ok && data.success) {
          setStatus('success')
          setMessage(data.message || 'Email verified successfully!')
        } else {
          setStatus('error')
          setMessage(data.message || 'Verification failed.')
        }
      } catch (err) {
        setStatus('error')
        setMessage('Network error. Please try again.')
      }
    }

    verify()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950">
              <Mail className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
            <CardTitle className="text-xl">
              {status === 'loading' && 'Verifying your email...'}
              {status === 'success' && 'Email verified!'}
              {status === 'error' && 'Verification failed'}
              {status === 'missing' && 'Token missing'}
            </CardTitle>
            <CardDescription className="text-center text-sm">
              Doctorooms account verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            {status === 'loading' && (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <p className="text-sm text-muted-foreground">Please wait...</p>
              </div>
            )}
            {status === 'success' && (
              <div className="flex flex-col items-center gap-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                <p className="text-sm text-muted-foreground">{message}</p>
                <Button asChild className="mt-2">
                  <Link href="/login">Go to Login</Link>
                </Button>
              </div>
            )}
            {(status === 'error' || status === 'missing') && (
              <div className="flex flex-col items-center gap-3">
                <XCircle className="h-12 w-12 text-rose-500" />
                <p className="text-sm text-muted-foreground">{message}</p>
                <Button variant="outline" asChild className="mt-2">
                  <Link href="/login">Back to Login</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
