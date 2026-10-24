/**
 * Viewport size boundaries. `desk:` remains the 1000px alias for existing
 * templates; new tablet and wide variants use the matching CSS breakpoints.
 */
export const MOBILE_MAX_WIDTH = 999
export const TABLET_MIN_WIDTH = 1000
export const DESKTOP_MIN_WIDTH = 1440

export const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_MAX_WIDTH}px)`
export const DESKTOP_MEDIA_QUERY = `(min-width: ${TABLET_MIN_WIDTH}px)`
export const TABLET_MEDIA_QUERY = `(min-width: ${TABLET_MIN_WIDTH}px) and (max-width: ${DESKTOP_MIN_WIDTH - 1}px)`
export const WIDE_DESKTOP_MEDIA_QUERY = `(min-width: ${DESKTOP_MIN_WIDTH}px)`
export const COARSE_POINTER_MEDIA_QUERY = '(pointer: coarse)'
export const HOVER_MEDIA_QUERY = '(hover: hover)'

export const resolveViewportSizeClass = (
  matchesPhone: boolean,
  matchesWideDesktop: boolean,
): 'phone' | 'tablet' | 'desktop' => {
  if (matchesPhone) return 'phone'
  return matchesWideDesktop ? 'desktop' : 'tablet'
}
