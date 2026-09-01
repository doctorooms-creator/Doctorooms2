'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Bell,
  Volume2,
  VolumeX,
  Mail,
  MailOpen,
  Monitor,
  Save,
  Loader2,
  Play,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { EVENT_CONFIG } from '@/components/shared/RealtimeNotification'
import { playChime } from '@/lib/play-chime'

// ─── Types ───────────────────────────────────────────────────────────────

type EmailDigest = 'never' | 'daily' | 'weekly'

interface Preferences {
  id: string
  userId: string
  mutedEvents: string[]
  soundEnabled: boolean
  criticalChimeEnabled: boolean
  emailDigest: EmailDigest
  updatedAt: string
}

interface PreferencesResponse {
  preferences: Preferences
}

// ─── Component ────────────────────────────────────────────────────────────

export default function NotificationPreferencesClient() {
  const queryClient = useQueryClient()

  // Local form state — synced from server on first load
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [criticalChimeEnabled, setCriticalChimeEnabled] = useState(true)
  const [emailDigest, setEmailDigest] = useState<EmailDigest>('never')
  const [mutedEvents, setMutedEvents] = useState<string[]>([])
  // Browser push (UI-only placeholder) — persist locally for now
  const [browserPushEnabled, setBrowserPushEnabled] = useState(false)
  const [browserPermission, setBrowserPermission] =
    useState<NotificationPermission>('default')

  const { data, isLoading, error } = useQuery<PreferencesResponse>({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const res = await fetch('/api/notification-preferences', {
        cache: 'no-store',
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'Failed to load preferences')
      }
      return res.json()
    },
  })

  // Hydrate local state when server data arrives
  useEffect(() => {
    if (data?.preferences) {
      setSoundEnabled(data.preferences.soundEnabled)
      setCriticalChimeEnabled(data.preferences.criticalChimeEnabled)
      setEmailDigest(data.preferences.emailDigest as EmailDigest)
      setMutedEvents(data.preferences.mutedEvents || [])
    }
  }, [data])

  // Surface fetch errors as toast
  useEffect(() => {
    if (error) {
      toast.error((error as Error).message || 'Failed to load preferences')
    }
  }, [error])

  // Sync browser permission state on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    setBrowserPermission(Notification.permission)
  }, [])

  // ── Save mutation ───────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mutedEvents,
          soundEnabled,
          criticalChimeEnabled,
          emailDigest,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to save preferences')
      return data
    },
    onSuccess: () => {
      toast.success('Preferences saved')
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  function handleSave() {
    saveMutation.mutate()
  }

  function handleTestChime() {
    try {
      playChime()
      toast.success('Chime played', { duration: 1500 })
    } catch {
      toast.error('Failed to play chime')
    }
  }

  function handleBrowserPushToggle(checked: boolean) {
    if (checked) {
      // Request permission
      if (typeof window === 'undefined' || !('Notification' in window)) {
        toast.error('Browser notifications not supported in this browser')
        return
      }
      try {
        Notification.requestPermission().then((perm) => {
          setBrowserPermission(perm)
          if (perm === 'granted') {
            setBrowserPushEnabled(true)
            toast.success('Browser push enabled')
          } else if (perm === 'denied') {
            setBrowserPushEnabled(false)
            toast.error('Browser push was blocked — update site permissions to allow')
          } else {
            // dismissed
            setBrowserPushEnabled(false)
            toast.info('Permission request dismissed')
          }
        })
      } catch {
        toast.error('Failed to request browser permission')
      }
    } else {
      setBrowserPushEnabled(false)
      toast.info('Browser push disabled')
    }
  }

  function toggleMutedEvent(eventId: string, mute: boolean) {
    setMutedEvents((prev) => {
      const set = new Set(prev)
      if (mute) set.add(eventId)
      else set.delete(eventId)
      return Array.from(set)
    })
  }

  function muteAll() {
    setMutedEvents(Object.keys(EVENT_CONFIG))
  }

  function unmuteAll() {
    setMutedEvents([])
  }

  // Dirty check — show save button always, but highlight when changes pending
  const isDirty = useMemo(() => {
    const orig = data?.preferences
    if (!orig) return false
    const origMuted = (orig.mutedEvents || []).slice().sort().join(',')
    const newMuted = mutedEvents.slice().sort().join(',')
    return (
      orig.soundEnabled !== soundEnabled ||
      orig.criticalChimeEnabled !== criticalChimeEnabled ||
      orig.emailDigest !== emailDigest ||
      origMuted !== newMuted
    )
  }, [data, soundEnabled, criticalChimeEnabled, emailDigest, mutedEvents])

  const mutedSet = useMemo(() => new Set(mutedEvents), [mutedEvents])
  const eventEntries = Object.entries(EVENT_CONFIG)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bell className="h-6 w-6 text-teal-600" />
          Notification Preferences
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Control how you receive real-time updates — toasts, sounds, digests.
        </p>
      </div>

      {isLoading && !data ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <>
          {/* Card 1 — Sound Settings */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-300">
                  <Volume2 className="h-4 w-4" />
                </div>
                Sound Settings
              </CardTitle>
              <CardDescription>
                Master controls for audio feedback on incoming events.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Master Sound */}
              <div className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="master-sound" className="text-sm font-medium">
                    Master Sound
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    When OFF, no chime will play on any event — even critical ones.
                  </p>
                </div>
                <Switch
                  id="master-sound"
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>

              {/* Critical Chime Only */}
              <div className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="critical-chime" className="text-sm font-medium">
                    Critical Chime Only
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    When ON, only critical events (e.g. abnormal report, urgent test
                    order, surgery scheduled) trigger a chime; info events stay silent.
                  </p>
                </div>
                <Switch
                  id="critical-chime"
                  checked={criticalChimeEnabled}
                  disabled={!soundEnabled}
                  onCheckedChange={setCriticalChimeEnabled}
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestChime}
                  disabled={!soundEnabled}
                >
                  {soundEnabled ? (
                    <Play className="h-4 w-4 mr-2" />
                  ) : (
                    <VolumeX className="h-4 w-4 mr-2" />
                  )}
                  Test Sound
                </Button>
                <p className="text-xs text-muted-foreground">
                  Plays the chime once so you can verify it works.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 2 — Muted Events */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
                  <Bell className="h-4 w-4" />
                </div>
                Muted Events
              </CardTitle>
              <CardDescription>
                When muted, an event will still fire (badge updates, query
                invalidation happen) but <b>no toast</b> and <b>no sound</b>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={muteAll}>
                  Mute All
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={unmuteAll}>
                  Unmute All
                </Button>
                <Badge
                  variant="outline"
                  className="ml-auto text-xs"
                >
                  {mutedEvents.length} / {eventEntries.length} muted
                </Badge>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {eventEntries.map(([eventId, cfg]) => {
                  const Icon = cfg.icon
                  const muted = mutedSet.has(eventId)
                  return (
                    <label
                      key={eventId}
                      htmlFor={`mute-${eventId}`}
                      className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/40 ${
                        muted
                          ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20'
                          : 'border-border'
                      }`}
                    >
                      <Checkbox
                        id={`mute-${eventId}`}
                        checked={muted}
                        onCheckedChange={(c) =>
                          toggleMutedEvent(eventId, c === true)
                        }
                        className="mt-0.5"
                      />
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <Icon className={`h-4 w-4 shrink-0 ${cfg.color}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-tight">
                            {cfg.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate font-mono">
                            {eventId}
                          </p>
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Card 3 — Email Digest */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">
                  {emailDigest === 'never' ? (
                    <Mail className="h-4 w-4" />
                  ) : (
                    <MailOpen className="h-4 w-4" />
                  )}
                </div>
                Email Digest
              </CardTitle>
              <CardDescription>
                Receive an email summary of all notifications you missed while
                offline.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email-digest" className="text-xs text-muted-foreground">
                  Frequency
                </Label>
                <Select
                  value={emailDigest}
                  onValueChange={(v) => setEmailDigest(v as EmailDigest)}
                >
                  <SelectTrigger id="email-digest" className="w-full sm:w-[240px]">
                    <SelectValue placeholder="Never" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground max-w-prose">
                When enabled, you&apos;ll receive an email summary of all
                notifications you missed while offline. (Email gateway must be
                configured by admin.)
              </p>
            </CardContent>
          </Card>

          {/* Card 4 — Browser Push (Placeholder for future) */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <Monitor className="h-4 w-4" />
                </div>
                Browser Push
                <Badge
                  variant="outline"
                  className="text-[10px] font-normal ml-1"
                >
                  Coming soon
                </Badge>
              </CardTitle>
              <CardDescription>
                Receive native browser notifications when a critical event fires.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="browser-push" className="text-sm font-medium">
                    Enable browser push notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    When toggled ON, your browser will prompt for notification
                    permission. This is a UI-only toggle for now — actual push
                    wiring is coming soon.
                  </p>
                </div>
                <Switch
                  id="browser-push"
                  checked={browserPushEnabled}
                  onCheckedChange={handleBrowserPushToggle}
                />
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">Permission status:</span>{' '}
                <span
                  className={`font-medium capitalize ${
                    browserPermission === 'granted'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : browserPermission === 'denied'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-muted-foreground'
                  }`}
                >
                  {browserPermission === 'granted'
                    ? 'granted'
                    : browserPermission === 'denied'
                      ? 'denied'
                      : 'default (not requested)'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Save bar */}
          <div className="flex items-center justify-end gap-3 sticky bottom-4 z-10">
            <div className="rounded-lg bg-background/95 backdrop-blur border border-border shadow-sm px-4 py-2.5 flex items-center gap-3">
              {isDirty && (
                <span className="text-xs text-amber-600 dark:text-amber-400 hidden sm:inline">
                  Unsaved changes
                </span>
              )}
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending || !isDirty}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Preferences
              </Button>
            </div>
          </div>

          {/* Last updated footer */}
          {data?.preferences?.updatedAt && (
            <div className="text-xs text-muted-foreground text-right">
              Last saved: {new Date(data.preferences.updatedAt).toLocaleString()}
            </div>
          )}
        </>
      )}
    </div>
  )
}
