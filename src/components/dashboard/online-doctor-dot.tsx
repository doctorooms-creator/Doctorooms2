'use client'

import { useState, useEffect } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { useAuthStore } from '@/lib/auth-store'

interface OnlineDoctorDotProps {
  /** User ID of the doctor (the `User.id`, not the `Doctor.id`). */
  doctorUserId: string
  doctorName?: string
  className?: string
}

/**
 * Small dot that shows whether a doctor is currently online (green) or
 * offline (muted), based on the notification-service's connection list.
 *
 * - Initial state is fetched from `/api/online-doctors` on mount.
 * - Live updates come from the `doctor-online` / `doctor-offline` socket
 *   events broadcast by the notification mini-service.
 *
 * Used on the patient booking page next to the doctor's name.
 */
export function OnlineDoctorDot({ doctorUserId, doctorName, className }: OnlineDoctorDotProps) {
  const { user } = useAuthStore()
  const [online, setOnline] = useState(false)
  const [checked, setChecked] = useState(false)

  // 1. Fetch initial online status on mount
  useEffect(() => {
    let cancelled = false
    fetch('/api/online-doctors')
      .then((r) => r.json())
      .then((data: { onlineDoctors?: { userId: string }[] }) => {
        if (cancelled) return
        setOnline(
          Array.isArray(data?.onlineDoctors) &&
            data.onlineDoctors.some((d) => d.userId === doctorUserId)
        )
        setChecked(true)
      })
      .catch(() => {
        if (!cancelled) setChecked(true)
      })
    return () => {
      cancelled = true
    }
  }, [doctorUserId])

  // 2. Subscribe to doctor-online / doctor-offline socket events for live updates
  const socket = useSocket({
    userId: user?.id,
    role: user?.role,
    name: user?.name,
    enabled: !!user,
  })

  useEffect(() => {
    if (!socket) return
    const onOnline = (payload: { doctorUserId?: string } | string) => {
      const id = typeof payload === 'string' ? payload : payload?.doctorUserId
      if (id === doctorUserId) setOnline(true)
    }
    const onOffline = (payload: { doctorUserId?: string } | string) => {
      const id = typeof payload === 'string' ? payload : payload?.doctorUserId
      if (id === doctorUserId) setOnline(false)
    }
    socket.on('doctor-online', onOnline)
    socket.on('doctor-offline', onOffline)
    return () => {
      socket.off('doctor-online', onOnline)
      socket.off('doctor-offline', onOffline)
    }
  }, [socket, doctorUserId])

  if (!checked) {
    return (
      <span
        className={`inline-block h-2 w-2 rounded-full bg-muted-foreground/30 ${className ?? ''}`}
        aria-hidden="true"
      />
    )
  }
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${
        online ? 'bg-emerald-500' : 'bg-muted-foreground/30'
      } ${className ?? ''}`}
      title={
        online
          ? `${doctorName || 'Doctor'} is online`
          : `${doctorName || 'Doctor'} is offline`
      }
      aria-label={
        online
          ? `${doctorName || 'Doctor'} is online`
          : `${doctorName || 'Doctor'} is offline`
      }
    />
  )
}
