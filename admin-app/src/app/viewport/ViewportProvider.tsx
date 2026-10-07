import { useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  COARSE_POINTER_MEDIA_QUERY,
  HOVER_MEDIA_QUERY,
  MOBILE_MEDIA_QUERY,
} from './viewport.config'
import { ViewportContext, type ViewportState } from './ViewportContext'

const readMatch = (query: string, fallback: boolean): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return fallback
  }
  return window.matchMedia(query).matches
}

const useMatchMedia = (query: string, fallback: boolean): boolean => {
  const [matches, setMatches] = useState(() => readMatch(query, fallback))

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia(query)
    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches)

    setMatches(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}

/**
 * App-level owner of viewport facts. Everything that branches on "is this a
 * phone" reads from here through `useMobile` / `useViewport`; nothing else
 * may measure the window for that purpose.
 */
export function ViewportProvider({ children }: { children: ReactNode }) {
  const isMobile = useMatchMedia(MOBILE_MEDIA_QUERY, false)
  const isCoarsePointer = useMatchMedia(COARSE_POINTER_MEDIA_QUERY, false)
  const hasHover = useMatchMedia(HOVER_MEDIA_QUERY, true)

  const value = useMemo<ViewportState>(
    () => ({ isMobile, isCoarsePointer, hasHover }),
    [hasHover, isCoarsePointer, isMobile],
  )

  return <ViewportContext.Provider value={value}>{children}</ViewportContext.Provider>
}
