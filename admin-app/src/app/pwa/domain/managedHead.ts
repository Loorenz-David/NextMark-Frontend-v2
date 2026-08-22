/**
 * A reconciler for the `<head>` tags that a route owns while it is mounted.
 *
 * The SPA has one `index.html` for every route, so a route that needs install
 * metadata has to write it into the live document — and, just as importantly,
 * take it back out again when the user navigates away. Add-to-Home-Screen reads
 * whatever is in the head at the moment the user taps it, so a stale tag left
 * behind by a route the user has left is not cosmetic: it is what an admin would
 * install by accident.
 *
 * Everything this module writes is marked with `MANAGED_HEAD_ATTRIBUTE`, which
 * is what makes removal exact — it never touches a tag the build put there.
 *
 * The DOM sits behind `ManagedHeadPort` so the reconciliation is testable
 * without a document.
 */

export const MANAGED_HEAD_ATTRIBUTE = 'data-pwa-managed'

export type ManagedHeadTagName = 'link' | 'meta'

export type ManagedHeadTag = {
  /** Stable identity for one slot in the head. Never rendered. */
  key: string
  tagName: ManagedHeadTagName
  attributes: Readonly<Record<string, string>>
}

export type ManagedHeadRecord = {
  key: string
  tagName: string
  attributes: Readonly<Record<string, string>>
}

export type ManagedHeadPort = {
  /** Every tag this mechanism previously wrote, in document order. */
  list: () => readonly ManagedHeadRecord[]
  create: (tag: ManagedHeadTag) => void
  update: (key: string, attributes: Readonly<Record<string, string>>) => void
  remove: (key: string) => void
  getTitle: () => string
  setTitle: (title: string) => void
}

export type ManagedHeadState = {
  tags: readonly ManagedHeadTag[]
  /** `null` means this route does not own the title, so it is handed back. */
  title: string | null
}

const sameAttributes = (
  left: Readonly<Record<string, string>>,
  right: Readonly<Record<string, string>>,
) => {
  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)
  if (leftKeys.length !== rightKeys.length) return false
  return leftKeys.every((key) => left[key] === right[key])
}

/**
 * Drives one head slot: applying a state replaces whatever the previous state
 * left behind, and clearing restores the document to how the build shipped it.
 *
 * Title restoration is why this holds state at all — the baseline is whatever
 * the title was before the first `apply`, and only the first one may capture it,
 * or a second apply would record our own title as the thing to restore.
 */
export const createManagedHead = (port: ManagedHeadPort) => {
  let baselineTitle: string | null = null

  const restoreTitle = () => {
    if (baselineTitle === null) return
    port.setTitle(baselineTitle)
    baselineTitle = null
  }

  const apply = (state: ManagedHeadState) => {
    const desired = new Map(state.tags.map((tag) => [tag.key, tag]))
    const present = new Map(port.list().map((record) => [record.key, record]))

    for (const [key, record] of present) {
      const next = desired.get(key)
      if (!next) {
        port.remove(key)
        continue
      }
      // A slot that changed element type cannot be patched in place.
      if (next.tagName !== record.tagName) {
        port.remove(key)
        port.create(next)
        continue
      }
      if (!sameAttributes(next.attributes, record.attributes)) {
        port.update(key, next.attributes)
      }
    }

    for (const [key, tag] of desired) {
      if (!present.has(key)) port.create(tag)
    }

    if (state.title === null) {
      // Leaving the route is not just about the tags: a title left behind means
      // every admin tab afterwards is still called "Customer Form".
      restoreTitle()
      return
    }

    if (baselineTitle === null) baselineTitle = port.getTitle()
    if (port.getTitle() !== state.title) port.setTitle(state.title)
  }

  const clear = () => {
    for (const record of [...port.list()]) port.remove(record.key)
    restoreTitle()
  }

  return { apply, clear }
}

export type ManagedHead = ReturnType<typeof createManagedHead>
