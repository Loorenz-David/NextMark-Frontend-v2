import { createContext } from 'react'

export type ViewportState = {
  sizeClass: 'phone' | 'tablet' | 'desktop'
  /** Phone shell is active (viewport narrower than `TABLET_MIN_WIDTH`). */
  isMobile: boolean
  isTablet: boolean
  isStandalone: boolean
  /** Primary input is a finger: enlarge hit areas, replace hover-only affordances. */
  isCoarsePointer: boolean
  /** The device can hover; when false, hover popovers need a tap fallback. */
  hasHover: boolean
}

export const DESKTOP_VIEWPORT_FALLBACK: ViewportState = {
  sizeClass: 'desktop',
  isMobile: false,
  isTablet: false,
  isStandalone: false,
  isCoarsePointer: false,
  hasHover: true,
}

export const ViewportContext = createContext<ViewportState | null>(null)
