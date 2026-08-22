/**
 * Whether this document is running as an installed web app rather than a tab.
 *
 * iPadOS is the target and it is the odd one out: Safari sets the non-standard
 * `navigator.standalone`, and older iOS versions do not report the
 * `display-mode` media feature at all. Reading only the media query — the
 * Chromium-shaped answer — would report "browser" on the exact device this
 * feature exists for.
 *
 * The environment is passed in rather than read from globals so the decision can
 * be exercised for both browsers without one.
 */

export type StandaloneDisplayEnvironment = {
  /** `navigator.standalone` — iOS Safari only, `undefined` everywhere else. */
  navigatorStandalone: boolean | undefined
  /** Answers `matchMedia(query).matches`; absent where matchMedia is not. */
  matchesDisplayMode: ((query: string) => boolean) | undefined
}

/**
 * `minimal-ui` is deliberately absent: it still draws browser chrome, which is
 * the thing this feature exists to remove.
 */
const STANDALONE_DISPLAY_MODES = ['standalone', 'fullscreen', 'window-controls-overlay'] as const

export const isStandaloneDisplay = (
  environment: StandaloneDisplayEnvironment,
): boolean => {
  if (environment.navigatorStandalone === true) return true

  const matches = environment.matchesDisplayMode
  if (!matches) return false

  return STANDALONE_DISPLAY_MODES.some((mode) =>
    matches(`(display-mode: ${mode})`),
  )
}

export const readStandaloneDisplayEnvironment =
  (): StandaloneDisplayEnvironment => {
    if (typeof window === 'undefined') {
      return { navigatorStandalone: undefined, matchesDisplayMode: undefined }
    }

    const navigatorStandalone = (
      window.navigator as Navigator & { standalone?: boolean }
    ).standalone

    return {
      navigatorStandalone,
      matchesDisplayMode:
        typeof window.matchMedia === 'function'
          ? (query: string) => window.matchMedia(query).matches
          : undefined,
    }
  }
