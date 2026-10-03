'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Stethoscope, Gift, ArrowRight, CheckCircle2 } from 'lucide-react'

/**
 * Referral landing: /r/DR-AMIT-4821
 * Stores the code in sessionStorage → the register form picks it up,
 * validates it live, and claims it on submit. Auto-redirects after 2s
 * (with a manual "Continue" button for impatient humans).
 */
export default function ReferralLandingPage() {
  const params = useParams<{ code: string }>()
  const router = useRouter()
  const code = (params?.code ?? '').toString().toUpperCase()

  const [referrerName, setReferrerName] = useState<string | null>(null)
  const [valid, setValid] = useState<boolean | null>(null)

  useEffect(() => {
    if (!code) return
    try {
      sessionStorage.setItem('dr_referral_code', code)
    } catch {
      /* private mode — register form will still work without the code */
    }

    fetch(`/api/referral/validate?code=${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((d) => {
        setValid(!!d.valid)
        setReferrerName(d.referrerName ?? null)
      })
      .catch(() => setValid(false))

    const t = setTimeout(() => router.push('/register'), 2200)
    return () => clearTimeout(t)
  }, [code, router])

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-teal-950/20">
      <div
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, #0d9488 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="rounded-2xl border-2 border-teal-200 dark:border-teal-800/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-500/30">
            <Gift className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {valid === false ? 'Invalid Referral Code' : "You're Invited! 🎉"}
          </h1>

          {valid === false ? (
            <p className="mt-2 text-muted-foreground text-sm">
              Ye referral code valid nahi hai — aap seedha register kar sakte hain.
            </p>
          ) : (
            <p className="mt-2 text-muted-foreground text-sm">
              {referrerName ? (
                <>
                  <span className="font-semibold text-teal-700 dark:text-teal-400">
                    {referrerName}
                  </span>{' '}
                  ne aapko Doctorooms par invite kiya hai.
                </>
              ) : (
                'Ek Doctorooms doctor ne aapko invite kiya hai.'
              )}{' '}
              Signup karo aur{' '}
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                30 din ka full access
              </span>{' '}
              pao.
            </p>
          )}

          <div className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 px-4 py-2.5">
            <span className="font-mono text-sm font-bold tracking-wider text-teal-800 dark:text-teal-300">
              {code}
            </span>
            {valid && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-2">
              <Stethoscope className="w-4 h-4 mx-auto mb-1 text-teal-600" />
              Digital Rx 30 sec
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-2">
              <ArrowRight className="w-4 h-4 mx-auto mb-1 text-teal-600" />
              OPD Queue
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-2">
              <Gift className="w-4 h-4 mx-auto mb-1 text-teal-600" />
              WhatsApp Reminders
            </div>
          </div>

          <button
            onClick={() => router.push('/register')}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 px-4 transition-all shadow-lg shadow-teal-500/25"
          >
            Registration Shuru Karein
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="mt-3 text-xs text-muted-foreground">
            Auto-redirect ho raha hai /register par…
          </p>
        </div>
      </motion.div>
    </div>
  )
}
