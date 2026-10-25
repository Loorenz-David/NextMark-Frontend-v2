/**
 * Registry of reasons the app must not reload right now.
 *
 * Features report their own unsaved or in-flight state here; the version
 * monitor only reads the list, so the app never reaches into feature internals.
 * Each registration is its own token, so two open forms with the same reason
 * both have to clear before a reload is allowed.
 */

type Listener = () => void

const activeBlockers = new Map<symbol, string>()
const listeners = new Set<Listener>()

const notify = () => {
  listeners.forEach((listener) => listener())
}

/** Non-React entry point (stores, imperative flows). Returns the release. */
export const registerReloadBlocker = (reason: string): (() => void) => {
  const token = Symbol(reason)
  activeBlockers.set(token, reason)
  notify()

  return () => {
    if (!activeBlockers.delete(token)) return
    notify()
  }
}

export const getActiveReloadBlockers = (): string[] =>
  Array.from(activeBlockers.values())

/** Called after every registration and release. */
export const subscribeReloadBlockers = (listener: Listener): (() => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
