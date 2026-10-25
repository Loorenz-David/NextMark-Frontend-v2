import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export const HOME_HEADER_CENTER_SLOT = 'home-header-center'

type HeaderSlotContextValue = {
  register: (name: string, element: HTMLElement | null) => void
  getTarget: (name: string) => HTMLElement | null
}

const HeaderSlotContext = createContext<HeaderSlotContextValue | null>(null)

export function HeaderSlotProvider({ children }: { children: ReactNode }) {
  const [targets, setTargets] = useState<Map<string, HTMLElement | null>>(() => new Map())
  const register = useCallback((name: string, element: HTMLElement | null) => {
    setTargets((current) => {
      if ((current.get(name) ?? null) === element) return current
      const next = new Map(current)
      next.set(name, element)
      return next
    })
  }, [])
  const getTarget = useCallback((name: string) => targets.get(name) ?? null, [targets])

  return <HeaderSlotContext.Provider value={{ register, getTarget }}>{children}</HeaderSlotContext.Provider>
}

export function HeaderSlotTarget({ name, className }: { name: string; className?: string }) {
  const context = useContext(HeaderSlotContext)
  if (!context) throw new Error('HeaderSlotTarget requires HeaderSlotProvider')
  const { register } = context
  const setTarget = useCallback((element: HTMLDivElement | null) => register(name, element), [name, register])
  return <div className={className} ref={setTarget} />
}

export function HeaderSlotPortal({ name, children }: { name: string; children: ReactNode }) {
  const context = useContext(HeaderSlotContext)
  if (!context) throw new Error('HeaderSlotPortal requires HeaderSlotProvider')
  const target = context.getTarget(name)
  return target ? createPortal(children, target) : null
}
