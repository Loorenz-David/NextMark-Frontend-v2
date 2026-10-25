const STORAGE_KEY = 'home.topBar.hidden.v1'

const isBrowser = typeof window !== 'undefined'

export const loadHomeTopBarHidden = (): boolean => {
  if (!isBrowser) return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export const saveHomeTopBarHidden = (hidden: boolean): void => {
  if (!isBrowser) return
  try {
    window.localStorage.setItem(STORAGE_KEY, hidden ? 'true' : 'false')
  } catch {
    // Storage can be unavailable (private mode); the bar still toggles for this session.
  }
}
