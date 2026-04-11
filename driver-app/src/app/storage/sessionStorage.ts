import type { SessionSnapshot } from '@shared-api'

type SessionListener = (session: SessionSnapshot | null) => void

const STORAGE_KEY = 'beyo.driver.session'
const isBrowser = typeof window !== 'undefined'

export class SessionStorage {
  private listeners = new Set<SessionListener>()
  private cached: SessionSnapshot | null = null

  getSession(): SessionSnapshot | null {
    if (this.cached) return this.cached
    this.cached = this.read()
    return this.cached
  }

  setSession(session: Omit<SessionSnapshot, 'updatedAt'>): void {
    const next: SessionSnapshot = {
      ...session,
      updatedAt: Date.now(),
    }

    this.cached = next

    if (isBrowser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    }

    this.emit(next)
  }

  clear(): void {
    this.cached = null

    if (isBrowser) {
      window.localStorage.removeItem(STORAGE_KEY)
    }

    this.emit(null)
  }

  subscribe(listener: SessionListener): () => void {
    this.listeners.add(listener)
    listener(this.getSession())

    return () => {
      this.listeners.delete(listener)
    }
  }

  private read(): SessionSnapshot | null {
    if (!isBrowser) return null

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw) as SessionSnapshot
    } catch (error) {
      console.warn('Failed to parse driver session, clearing it.', error)
      window.localStorage.removeItem(STORAGE_KEY)
      return null
    }
  }

  private emit(value: SessionSnapshot | null): void {
    this.listeners.forEach((listener) => listener(value))
  }
}

export const sessionStorage = new SessionStorage()
