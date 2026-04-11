import type { DriverWorkspaceScopeKey } from '../contracts/driverSession.types'

export type PersistedRouteSelection = {
  routeClientId: string
  selectedAt: string
}

type RouteSelectionStorageState = Record<DriverWorkspaceScopeKey, PersistedRouteSelection>

const STORAGE_KEY = 'beyo.driver.route-selection'
const isBrowser = typeof window !== 'undefined'

export class RouteSelectionStorage {
  private cached: RouteSelectionStorageState | null = null

  get(workspaceScopeKey: DriverWorkspaceScopeKey): PersistedRouteSelection | null {
    const state = this.read()
    return state[workspaceScopeKey] ?? null
  }

  set(workspaceScopeKey: DriverWorkspaceScopeKey, selection: PersistedRouteSelection): void {
    const next = {
      ...this.read(),
      [workspaceScopeKey]: selection,
    }

    this.cached = next
    this.write(next)
  }

  clear(workspaceScopeKey: DriverWorkspaceScopeKey): void {
    const next = { ...this.read() }
    delete next[workspaceScopeKey]
    this.cached = next
    this.write(next)
  }

  clearInvalid(workspaceScopeKey: DriverWorkspaceScopeKey): void {
    this.clear(workspaceScopeKey)
  }

  private read(): RouteSelectionStorageState {
    if (this.cached) {
      return this.cached
    }

    if (!isBrowser) {
      this.cached = {}
      return this.cached
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      this.cached = raw ? JSON.parse(raw) as RouteSelectionStorageState : {}
      return this.cached
    } catch (error) {
      console.warn('Failed to parse route selection storage, clearing it.', error)
      window.localStorage.removeItem(STORAGE_KEY)
      this.cached = {}
      return this.cached
    }
  }

  private write(next: RouteSelectionStorageState): void {
    if (!isBrowser) {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
}

export const routeSelectionStorage = new RouteSelectionStorage()
