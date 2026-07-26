const STORAGE_KEY = 'plan.routeGroup.statsOverlay.hidden.v1'

const isBrowser = typeof window !== 'undefined'

export const loadRouteGroupStatsOverlayHidden = (): boolean => {
  if (!isBrowser) return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export const saveRouteGroupStatsOverlayHidden = (hidden: boolean): void => {
  if (!isBrowser) return
  try {
    window.localStorage.setItem(STORAGE_KEY, hidden ? 'true' : 'false')
  } catch {
    // Ignore storage write errors to keep overlay interactions responsive.
  }
}
