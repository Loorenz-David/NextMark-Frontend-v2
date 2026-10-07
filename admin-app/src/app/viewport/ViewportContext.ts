import { createContext } from 'react'

export type ViewportState = {
  /** Phone/tablet shell is active (viewport narrower than `MOBILE_MAX_WIDTH`). */
  isMobile: boolean
  /** Primary input is a finger: enlarge hit areas, replace hover-only affordances. */
  isCoarsePointer: boolean
  /** The device can hover; when false, hover popovers need a tap fallback. */
  hasHover: boolean
}

export const DESKTOP_VIEWPORT_FALLBACK: ViewportState = {
  isMobile: false,
  isCoarsePointer: false,
  hasHover: true,
}

export const ViewportContext = createContext<ViewportState | null>(null)
