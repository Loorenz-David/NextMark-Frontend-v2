import { useContext } from 'react'

import {
  DESKTOP_VIEWPORT_FALLBACK,
  ViewportContext,
  type ViewportState,
} from './ViewportContext'

export function useViewport(): ViewportState {
  const ctx = useContext(ViewportContext)
  return ctx ?? DESKTOP_VIEWPORT_FALLBACK
}

/** Historical name kept for the many call sites that only need `isMobile`. */
export const useMobile = useViewport
