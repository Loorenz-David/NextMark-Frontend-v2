const STORAGE_KEY = 'home.desktop.mapVisible.v1'

const isBrowser = typeof window !== 'undefined'

export const loadDesktopMapVisible = (): boolean => {
  if (!isBrowser) return true
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'false'
  } catch {
    return true
  }
}

export const saveDesktopMapVisible = (visible: boolean): void => {
  if (!isBrowser) return
  try {
    window.localStorage.setItem(STORAGE_KEY, visible ? 'true' : 'false')
  } catch {
    // Ignore storage write errors to keep the layout toggle responsive.
  }
}
