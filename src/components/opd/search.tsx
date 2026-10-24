'use client'

/**
 * OPD search (S16) — "/" or Ctrl+K opens; searches by mobile / name / token
 * via the doctor's own patient-search + queue matching. Results open the
 * chart (brief) or the classic destinations. Esc closes.
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

interface SearchRow {
  id: string
  name: string
  mobile: string | null
  reason: string
  bookingId: string | null
}

interface OpdSearchProps {
  open: boolean
  onClose: () => void
}

export function OpdSearch({ open, onClose }: OpdSearchProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (open) {
      setValue('')
      setActive(0)
      // Focus after the panel is in the DOM
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Doctor-scoped patient search (opd API — token/name/mobile, today-aware)
  const { data, isFetching } = useQuery<{ patients: SearchRow[] }>({
    queryKey: ['opd-search', value],
    queryFn: async () => {
      const res = await fetch(`/api/opd/search?q=${encodeURIComponent(value)}`)
      if (!res.ok) return { patients: [] }
      const body = await res.json()
      return { patients: (body.patients || []).slice(0, 8) as SearchRow[] }
    },
    enabled: open && value.trim().length >= 2,
    staleTime: 30_000,
  })

  const rows = data?.patients || []

  useEffect(() => {
    setActive(0)
  }, [value])

  if (!open) return null

  function go(row: SearchRow) {
    if (row.bookingId) {
      router.push(`/dashboard/doctor/prescriptions/new?bookingId=${row.bookingId}&returnTo=/opd`)
    } else if (row.id) {
      router.push(`/dashboard/doctor/patients/${row.id}`)
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]"
      style={{ background: 'rgba(20,21,21,0.45)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search patients"
    >
      <div
        className="w-[min(560px,92vw)] overflow-hidden rounded-[var(--opd-radius-card)] border shadow-lg"
        style={{ background: 'var(--opd-surface)', borderColor: 'var(--opd-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault()
              onClose()
              return
            }
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((a) => Math.min(a + 1, rows.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => Math.max(a - 1, 0))
            } else if (e.key === 'Enter' && rows[active]) {
              e.preventDefault()
              go(rows[active])
            }
          }}
          placeholder="Mobile number, patient name, or token…"
          className="opd-searchinput w-full border-b px-4 py-3.5 text-[15px] outline-none"
          style={{ borderColor: 'var(--opd-rule)', background: 'var(--opd-surface)', color: 'var(--opd-text)' }}
          aria-label="Search query"
        />

        <div className="max-h-[320px] overflow-y-auto">
          {value.trim().length >= 2 && isFetching && (
            <div className="space-y-2 p-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="opd-skeleton h-11 rounded-[var(--opd-radius-chip)]" />
              ))}
            </div>
          )}

          {value.trim().length >= 2 && !isFetching && rows.length === 0 && (
            <p className="px-4 py-6 text-center text-[13px]" style={{ color: 'var(--opd-muted)' }}>
              No patients found for “{value.trim()}”.
            </p>
          )}

          {rows.map((row, i) => (
            <button
              key={row.id}
              onClick={() => go(row)}
              onMouseEnter={() => setActive(i)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left"
              style={{ background: i === active ? 'var(--opd-accent-pale)' : 'transparent' }}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium" style={{ color: 'var(--opd-text)' }}>
                  {row.name}
                </p>
                <p className="opd-num truncate text-[12px]" style={{ color: 'var(--opd-faint)' }}>
                  {row.mobile || 'no mobile'} · {row.reason}
                </p>
              </div>
            </button>
          ))}

          {value.trim().length < 2 && (
            <p className="px-4 py-6 text-center text-[12px]" style={{ color: 'var(--opd-faint)' }}>
              Type at least 2 characters — mobile, name, or today's token.
            </p>
          )}
        </div>

        <div
          className="flex items-center gap-3 border-t px-4 py-2 text-[11px]"
          style={{ borderColor: 'var(--opd-rule)', color: 'var(--opd-faint)' }}
        >
          <span>
            <kbd className="rounded-[3px] border px-1" style={{ borderColor: 'var(--opd-border)' }}>↑↓</kbd> navigate
          </span>
          <span>
            <kbd className="rounded-[3px] border px-1" style={{ borderColor: 'var(--opd-border)' }}>Enter</kbd> open
          </span>
          <span className="ml-auto">
            <kbd className="rounded-[3px] border px-1" style={{ borderColor: 'var(--opd-border)' }}>Esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  )
}
