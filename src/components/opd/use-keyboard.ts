'use client'

/**
 * Keyboard map for the OPD Cockpit (03 §5).
 * Enter = hero primary · N = Call Next · P = Pause · / = search · Esc = exit ladder.
 * Every binding ignores itself while an input is focused (typing stays typing).
 */

import { useEffect, useRef } from 'react'

export interface OpdKeyActions {
  onEnter?: () => void
  onCallNext?: () => void
  onTogglePause?: () => void
  onSearch?: () => void
  onEscape?: () => void
  onHelp?: () => void
}

export function useOpdKeyboard(actions: OpdKeyActions, enabled = true) {
  const ref = useRef(actions)
  ref.current = actions

  useEffect(() => {
    if (!enabled) return

    function onKeyDown(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null
      const tag = t?.tagName
      const typing =
        tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t?.isContentEditable

      if (e.key === 'Escape') {
        if (typing) return // let inputs clear themselves first
        e.preventDefault()
        ref.current.onEscape?.()
        return
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) {
        // Ctrl/Cmd+K still opens search even while typing elsewhere
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault()
          ref.current.onSearch?.()
        }
        return
      }

      switch (e.key) {
        case 'Enter':
          e.preventDefault()
          ref.current.onEnter?.()
          break
        case 'n':
        case 'N':
          e.preventDefault()
          ref.current.onCallNext?.()
          break
        case 'p':
        case 'P':
          e.preventDefault()
          ref.current.onTogglePause?.()
          break
        case '/':
          e.preventDefault()
          ref.current.onSearch?.()
          break
        case '?':
          e.preventDefault()
          ref.current.onHelp?.()
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled])
}
