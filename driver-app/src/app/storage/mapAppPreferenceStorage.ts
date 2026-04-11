const STORAGE_KEY = 'beyo.driver.map-app-preference'
const isBrowser = typeof window !== 'undefined'

export type PreferredMapAppId = 'google-maps' | 'apple-maps' | 'waze'

export const KNOWN_MAP_APPS: PreferredMapAppId[] = ['google-maps', 'apple-maps', 'waze']

export class MapAppPreferenceStorage {
  private cached: PreferredMapAppId | null | undefined = undefined

  get(): PreferredMapAppId | null {
    if (this.cached !== undefined) {
      return this.cached
    }

    if (!isBrowser) {
      this.cached = null
      return this.cached
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw && KNOWN_MAP_APPS.includes(raw as PreferredMapAppId)) {
        this.cached = raw as PreferredMapAppId
        return this.cached
      }

      if (raw) {
        window.localStorage.removeItem(STORAGE_KEY)
      }

      this.cached = null
      return null
    } catch {
      this.cached = null
      return null
    }
  }

  set(appId: PreferredMapAppId): void {
    this.cached = appId
    if (!isBrowser) {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, appId)
  }

  clear(): void {
    this.cached = null
    if (!isBrowser) {
      return
    }

    window.localStorage.removeItem(STORAGE_KEY)
  }
}

export const mapAppPreferenceStorage = new MapAppPreferenceStorage()
