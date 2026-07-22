const NOTICE_KEY = 'beyo.admin.auth-notice'
const isBrowser = typeof window !== 'undefined'

/**
 * One-shot, non-sensitive message survived across a `window.location.reload()`.
 * Used to inform the operator after an involuntary active-user eviction (e.g. a
 * revoked trusted-device session). Never store tokens or identities here.
 */
export const setAuthNotice = (message: string): void => {
  if (isBrowser) {
    window.sessionStorage.setItem(NOTICE_KEY, message)
  }
}

export const consumeAuthNotice = (): string | null => {
  if (!isBrowser) {
    return null
  }
  const message = window.sessionStorage.getItem(NOTICE_KEY)
  if (message) {
    window.sessionStorage.removeItem(NOTICE_KEY)
  }
  return message
}
