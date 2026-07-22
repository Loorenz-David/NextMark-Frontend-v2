export type DeviceCredential = {
  client_id: string
  device_secret: string
}

type CredentialListener = (credential: DeviceCredential | null) => void

const STORAGE_KEY = 'beyo.admin.trusted-device-credential'
const ID_HEADER = 'X-Trusted-Device-Id'
const SECRET_HEADER = 'X-Trusted-Device-Secret'
const isBrowser = typeof window !== 'undefined'

const isValidCredential = (value: unknown): value is DeviceCredential =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as DeviceCredential).client_id === 'string' &&
  (value as DeviceCredential).client_id.length > 0 &&
  typeof (value as DeviceCredential).device_secret === 'string' &&
  (value as DeviceCredential).device_secret.length > 0

/**
 * Persists this browser's trusted-device credential under
 * `beyo.admin.trusted-device-credential`. The API client reads `getHeaders()`
 * on every request so, once a device is enrolled, `X-Trusted-Device-*` headers
 * flow on subsequent logins.
 *
 * SECURITY: the device secret is a renewable multi-user login credential for this
 * machine. It is never logged, rendered wholesale, or placed in URLs. Clearing it
 * (un-trust) returns the browser to single-user login.
 */
class DeviceCredentialStorage {
  private listeners = new Set<CredentialListener>()
  private cached: DeviceCredential | null = null
  private hydrated = false

  getCredential(): DeviceCredential | null {
    if (!this.hydrated) {
      this.cached = this.read()
      this.hydrated = true
    }
    return this.cached
  }

  /** Headers for the shared API client. Empty when no device is enrolled here. */
  getHeaders(): Record<string, string> {
    const credential = this.getCredential()
    if (!credential) {
      return {}
    }
    return {
      [ID_HEADER]: credential.client_id,
      [SECRET_HEADER]: credential.device_secret,
    }
  }

  saveCredential(credential: DeviceCredential): void {
    if (!isValidCredential(credential)) {
      return
    }
    this.cached = credential
    this.hydrated = true
    if (isBrowser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(credential))
    }
    this.emit(credential)
  }

  clearCredential(): void {
    this.cached = null
    this.hydrated = true
    if (isBrowser) {
      window.localStorage.removeItem(STORAGE_KEY)
    }
    this.emit(null)
  }

  subscribe(listener: CredentialListener): () => void {
    this.listeners.add(listener)
    listener(this.getCredential())
    return () => {
      this.listeners.delete(listener)
    }
  }

  private read(): DeviceCredential | null {
    if (!isBrowser) {
      return null
    }
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    try {
      const parsed: unknown = JSON.parse(raw)
      if (isValidCredential(parsed)) {
        return parsed
      }
    } catch {
      // fall through to cleanup
    }
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }

  private emit(value: DeviceCredential | null): void {
    this.listeners.forEach((listener) => listener(value))
  }
}

export const deviceCredentialStorage = new DeviceCredentialStorage()
