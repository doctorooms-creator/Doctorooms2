'use client'

import { useState } from 'react'
import { Mail, Check, Loader2, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
    if (!emailOk) {
      toast.error('Please enter a valid email address')
      return
    }
    setSubmitting(true)
    // Simulated subscription request (no backend needed for demo)
    await new Promise((r) => setTimeout(r, 700))
    setSubmitting(false)
    setDone(true)
    setEmail('')
    toast.success('🎉 Subscribed! Check your inbox to confirm.')
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 text-teal-300">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/20 border border-teal-400/40">
          <Check className="h-5 w-5 text-teal-300" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">You&apos;re subscribed!</p>
          <p className="text-xs text-gray-400">Watch your inbox for the next newsletter.</p>
        </div>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="ml-auto text-xs text-gray-400 hover:text-teal-300 underline underline-offset-2"
        >
          Use another email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-10 h-11 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-teal-500 focus-visible:border-teal-500"
          aria-label="Email address"
          required
        />
      </div>
      <Button
        type="submit"
        disabled={submitting}
        className="h-11 px-6 bg-teal-600 hover:bg-teal-500 text-white font-semibold"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4 mr-2" />
        )}
        {submitting ? 'Subscribing...' : 'Subscribe'}
      </Button>
    </form>
  )
}
