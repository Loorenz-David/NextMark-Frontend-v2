/**
 * Pure decisions behind the silent auto-update (`10_AUTO_UPDATE.md` §3).
 *
 * Nothing here touches the DOM, the network or storage, so every rule that can
 * cost the user work — when to reload, when to refuse — is decided where it can
 * be exercised exhaustively.
 */

export const VERSION_MANIFEST_PATH = '/version.json'

/** Two triggers inside this window share one fetch. */
export const VERSION_CHECK_THROTTLE_MS = 30_000

/** Periodic check cadence; only runs while the document is visible. */
export const VERSION_CHECK_INTERVAL_MS = 5 * 60_000

/**
 * A file picker or print dialog hides or blurs the page and then hands it back;
 * the return looks exactly like an app resume. Within this window it is not one.
 */
export const RECENT_SYSTEM_DIALOG_MS = 10_000

export type VersionPayload = {
  buildId: string
  builtAt: string | null
}

/**
 * Reads the body of `/version.json`. Anything that is not the exact shape the
 * build emits — an empty body, a captive portal's HTML, a CDN error page, a
 * JSON value without an id — yields `null`, and `null` never reloads.
 */
export const parseVersionPayload = (body: string): VersionPayload | null => {
  let parsed: unknown
  try {
    parsed = JSON.parse(body)
  } catch {
    return null
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return null
  }

  const { buildId, builtAt } = parsed as Record<string, unknown>
  if (typeof buildId !== 'string' || buildId.trim().length === 0) {
    return null
  }

  return {
    buildId: buildId.trim(),
    builtAt: typeof builtAt === 'string' ? builtAt : null,
  }
}

export type ShouldApplyUpdateInput = {
  runningId: string
  /** `null` when the check failed or the payload was malformed. */
  remoteId: string | null
  /** Reasons currently holding the reload back. */
  blockers: readonly string[]
  /** The build this session already reloaded towards, if any. */
  lastAttemptedId: string | null
}

export const shouldApplyUpdate = ({
  runningId,
  remoteId,
  blockers,
  lastAttemptedId,
}: ShouldApplyUpdateInput): boolean => {
  if (remoteId === null) return false
  if (remoteId === runningId) return false
  if (blockers.length > 0) return false
  // Loop guard: a reload towards this build already happened in this session
  // and the old build is still running (stale cache, CDN lag). Reloading again
  // would loop; a newer deploy has a different id and is allowed.
  if (lastAttemptedId === remoteId) return false
  return true
}

/**
 * Whether a reload towards `attemptedId` happened in this session without the
 * running build changing — the one case worth a log line at boot.
 */
export const didReloadMissTarget = (
  runningId: string,
  attemptedId: string | null,
): boolean => attemptedId !== null && attemptedId !== runningId

export const isWithinThrottle = (
  lastCheckAt: number | null,
  now: number,
  windowMs: number = VERSION_CHECK_THROTTLE_MS,
): boolean => lastCheckAt !== null && now - lastCheckAt < windowMs

export type FocusedElementDescriptor = {
  tagName: string
  inputType: string | null
  isContentEditable: boolean
}

const NON_EDITABLE_INPUT_TYPES = new Set(['button', 'submit', 'reset', 'image', 'hidden'])

/** A focused field may hold text the user has not committed anywhere yet. */
export const isEditableElement = ({
  tagName,
  inputType,
  isContentEditable,
}: FocusedElementDescriptor): boolean => {
  if (isContentEditable) return true

  const tag = tagName.toLowerCase()
  if (tag === 'textarea' || tag === 'select') return true
  if (tag !== 'input') return false

  return !NON_EDITABLE_INPUT_TYPES.has((inputType ?? 'text').toLowerCase())
}
