'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { getAvatarDisplayUrl } from '@/lib/avatar-url'
import { useAuthStore } from '@/lib/auth-store'
import { sidebarConfig } from '@/lib/sidebar-config'
import { formatIST } from '@/lib/date-utils'
import {
  Search,
  LayoutDashboard,
  Stethoscope,
  Loader2,
  UserRound,
  CalendarDays,
  FileText,
  Phone,
  CornerDownLeft,
} from 'lucide-react'

interface PatientResult {
  userId: string
  name: string
  accountName: string
  img: string
  gender: string
  mobile: string
  tokenNumber: string
  bookingId: string
  status: string
  bookingDate: string
  complaint: string
  totalVisits: number
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function statusChipClass(status: string) {
  switch (status) {
    case 'Finish':
    case 'Visited':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
    case 'Approve':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
    case 'Pending':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
    case 'Cancel':
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
    default:
      return 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400'
  }
}

/**
 * Global search command palette (⌘K).
 *
 * - Quick navigation group: role-aware pages from sidebar-config.
 * - Patients group (doctor only): debounced search over the doctor's own
 *   patients by name / token / mobile; selecting a patient with an active
 *   booking offers to resume the Rx wizard directly.
 */
export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter()
  const { user } = useAuthStore()
  const role = user?.role || 'patient'
  const slug = role === 'lab_technician' ? 'lab-technician' : role

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PatientResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const isDoctor = role === 'doctor'

  // Quick-nav items: top-level sidebar entries for this role (max 8)
  const navItems = (sidebarConfig[role] || sidebarConfig.patient)
    .filter((i) => !i.children)
    .slice(0, 8)

  // Debounced patient search (doctor only)
  useEffect(() => {
    if (!isDoctor || !open) return
    const q = query.trim()

    if (q.length < 1) {
      setResults([])
      setHasSearched(false)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      // Abort any in-flight search (patient typing fast)
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      try {
        const r = await fetch(
          `/api/dashboard/doctor/global-search?q=${encodeURIComponent(q)}`,
          { signal: ctrl.signal }
        )
        const data = await r.json()
        setResults(Array.isArray(data?.results) ? data.results : [])
        setHasSearched(true)
      } catch {
        /* aborted or network error — keep previous results */
      } finally {
        setIsSearching(false)
      }
    }, 250)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, open, isDoctor])

  // Abort in-flight requests when the palette closes
  useEffect(() => {
    if (!open) {
      abortRef.current?.abort()
      setQuery('')
      setResults([])
      setHasSearched(false)
    }
  }, [open])

  const go = useCallback(
    (href: string) => {
      onOpenChange(false)
      router.push(href)
    },
    [onOpenChange, router]
  )

  const navIcon = (label: string) => {
    const item = navItems.find((n) => n.label === label)
    const Icon = item?.icon || LayoutDashboard
    return <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder={isDoctor ? 'Search patients, token no, mobile… or jump to a page' : 'Search pages…'}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[420px]">
        {/* Loading skeletons */}
        {isSearching && (
          <div className="space-y-2 px-2 py-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 px-2">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-36" />
                  <Skeleton className="h-3 w-52" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isSearching && (
          <CommandEmpty>
            {isDoctor && query.trim().length > 0 && hasSearched
              ? 'No patients found for this search.'
              : 'Start typing to search, or pick a page below.'}
          </CommandEmpty>
        )}

        {/* Patients (doctor only) */}
        {isDoctor && results.length > 0 && !isSearching && (
          <CommandGroup heading="Patients">
            {results.map((p) => (
              <CommandItem
                key={p.userId}
                value={`patient ${p.name} ${p.tokenNumber} ${p.mobile}`}
                onSelect={() => go(`/dashboard/doctor/patients?focus=${p.userId}`)}
                className="py-2.5"
              >
                <Avatar className="h-9 w-9 shrink-0 border border-border">
                  <AvatarImage src={getAvatarDisplayUrl(p.img)} alt={p.name} />
                  <AvatarFallback className="bg-teal-100 text-xs font-semibold text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                    {getInitials(p.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{p.name}</span>
                    {p.tokenNumber && (
                      <span className="shrink-0 rounded bg-teal-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-teal-700 dark:bg-teal-900/50 dark:text-teal-400">
                        {p.tokenNumber}
                      </span>
                    )}
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${statusChipClass(p.status)}`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 truncate">
                      <Stethoscope className="h-3 w-3 shrink-0" />
                      {p.complaint ? p.complaint : 'No complaint recorded'}
                    </span>
                    {p.mobile && (
                      <span className="hidden items-center gap-1 shrink-0 sm:flex">
                        <Phone className="h-3 w-3" />
                        {p.mobile}
                      </span>
                    )}
                  </div>
                  {p.accountName && p.accountName !== p.name && (
                    <p className="mt-0.5 text-[11px] italic text-muted-foreground/80">
                      Booked by {p.accountName}
                    </p>
                  )}
                </div>
                <div className="ml-2 hidden shrink-0 text-right text-[11px] leading-tight text-muted-foreground sm:block">
                  <div>{p.totalVisits} visit{p.totalVisits === 1 ? '' : 's'}</div>
                  {p.bookingDate && <div>{formatIST(p.bookingDate, { day: 'numeric', month: 'short' })}</div>}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {isDoctor && results.length > 0 && !isSearching && <CommandSeparator />}

        {/* Quick navigation */}
        <CommandGroup heading="Quick Navigation">
          {navItems.map((item) => (
            <CommandItem key={item.href} value={`go ${item.label}`} onSelect={() => go(item.href)}>
              {navIcon(item.label)}
              <span className="text-sm">{item.label}</span>
              {item.label === 'Dashboard' && <CommandShortcut>Home</CommandShortcut>}
            </CommandItem>
          ))}
          {role === 'doctor' && (
            <CommandItem value="go new prescription wizard" onSelect={() => go('/dashboard/doctor/appointments')}>
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Start a Prescription</span>
              <CommandShortcut>
                <CornerDownLeft className="h-3 w-3" />
              </CommandShortcut>
            </CommandItem>
          )}
        </CommandGroup>

        {query.trim().length === 0 && (
          <>
            <CommandSeparator />
            <div className="flex items-center justify-between px-3 py-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Search className="h-3 w-3" />
                {isDoctor ? 'Search by name, token (PEDI-004) or mobile' : 'Type to filter pages'}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1 font-mono">esc</kbd>
                to close
              </span>
            </div>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
