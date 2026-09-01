'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Loader2, LogOut } from 'lucide-react'
import { toast } from 'sonner'

/**
 * LogoutAllButton — calls POST /api/auth/logout-all to revoke all other
 * sessions for the current user. The current session stays alive.
 *
 * SECURITY (P2.5): Useful when the user suspects unauthorized access.
 */
export function LogoutAllButton() {
  const [confirming, setConfirming] = useState(false)

  const mutation = useMutation({
    mutationFn: async () => {
      const r = await fetch('/api/auth/logout-all', { method: 'POST' })
      if (!r.ok) {
        const data = await r.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to logout other devices')
      }
      return r.json() as Promise<{ success: boolean; revokedCount: number; message: string }>
    },
    onSuccess: (data) => {
      toast.success(data.message)
      setConfirming(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
      setConfirming(false)
    },
  })

  if (confirming) {
    return (
      <div className="flex items-center gap-2 mt-3">
        <Button
          size="sm"
          variant="destructive"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <LogOut className="h-3 w-3 mr-1" />
          )}
          Yes, log out all other devices
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setConfirming(false)}
          disabled={mutation.isPending}
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="mt-3 text-xs"
      onClick={() => setConfirming(true)}
    >
      <LogOut className="h-3 w-3 mr-1" />
      Log out all other devices
    </Button>
  )
}
