/**
 * The single breakpoint that separates the phone/tablet shell from the
 * desktop workspace. Templates use the matching Tailwind `desk:` variant
 * (declared in `index.css` as `--breakpoint-desk`), JS uses these queries.
 */
export const MOBILE_MAX_WIDTH = 999

export const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_MAX_WIDTH}px)`
export const DESKTOP_MEDIA_QUERY = `(min-width: ${MOBILE_MAX_WIDTH + 1}px)`
export const COARSE_POINTER_MEDIA_QUERY = '(pointer: coarse)'
export const HOVER_MEDIA_QUERY = '(hover: hover)'
