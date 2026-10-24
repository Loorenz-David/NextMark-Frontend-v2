import { isWithinThrottle, shouldApplyUpdate } from './domain/appVersion'

/**
 * Everything the checker needs from the outside world. The runtime supplies
 * the browser versions; tests supply fakes, so throttling, deferral and the
 * loop guard run without a DOM.
 */
export type AppVersionCheckerPorts = {
  runningBuildId: string
  /** The deployed build id, or `null` on any failure. Must not reject. */
  fetchRemoteBuildId: () => Promise<string | null>
  now: () => number
  getBlockers: () => string[]
  readAttemptedId: () => string | null
  writeAttemptedId: (buildId: string) => void
  /**
   * Refetches the entry document past the HTTP cache so the reload cannot land
   * on a stale `index.html`. `false` means it could not (offline) — no reload.
   */
  refreshEntryDocument: () => Promise<boolean>
  reload: () => void
  /** Runs once per real (unthrottled) check. */
  onCheck?: () => void
}

export type AppVersionChecker = {
  /** A trigger fired. Throttled unless `force`; never rejects. */
  check: (options?: { force?: boolean }) => Promise<void>
  /** Re-evaluates an already-known update without fetching (a blocker cleared). */
  retryPending: () => Promise<void>
}

export const createAppVersionChecker = (
  ports: AppVersionCheckerPorts,
): AppVersionChecker => {
  let lastCheckAt: number | null = null
  let inFlight: Promise<void> | null = null
  let pendingRemoteId: string | null = null
  let isApplying = false

  const canApply = (remoteId: string) =>
    shouldApplyUpdate({
      runningId: ports.runningBuildId,
      remoteId,
      blockers: ports.getBlockers(),
      lastAttemptedId: ports.readAttemptedId(),
    })

  const tryApply = async () => {
    const remoteId = pendingRemoteId
    if (isApplying || remoteId === null || !canApply(remoteId)) return

    isApplying = true
    try {
      const refreshed = await ports.refreshEntryDocument().catch(() => false)
      // The refetch takes time; the user may have started typing meanwhile.
      if (!refreshed || !canApply(remoteId)) return

      ports.writeAttemptedId(remoteId)
      ports.reload()
    } finally {
      isApplying = false
    }
  }

  const check: AppVersionChecker['check'] = ({ force = false } = {}) => {
    if (inFlight) return inFlight

    const now = ports.now()
    if (!force && isWithinThrottle(lastCheckAt, now)) {
      // No new fetch, but a trigger is still a moment to apply a deferred one.
      return tryApply()
    }

    lastCheckAt = now
    ports.onCheck?.()

    inFlight = ports
      .fetchRemoteBuildId()
      .catch(() => null)
      .then(async (remoteId) => {
        // A failed or malformed check decides nothing, including not to
        // apply an update an earlier check found.
        if (remoteId === null) return
        pendingRemoteId = remoteId
        await tryApply()
      })
      .finally(() => {
        inFlight = null
      })

    return inFlight
  }

  return {
    check,
    retryPending: tryApply,
  }
}
