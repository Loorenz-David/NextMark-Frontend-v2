import { refreshAdminNotificationsServiceWorker } from '@/realtime/notifications/adminWebPush.runtime'

import { createAppVersionChecker } from './appVersionChecker'
import { APP_BUILD_ID } from './buildInfo'
import {
  didReloadMissTarget,
  isEditableElement,
  parseVersionPayload,
  RECENT_SYSTEM_DIALOG_MS,
  VERSION_CHECK_INTERVAL_MS,
  VERSION_MANIFEST_PATH,
} from './domain/appVersion'
import { getActiveReloadBlockers, subscribeReloadBlockers } from './reloadBlockers'

const RELOAD_TARGET_STORAGE_KEY = 'beyo.admin.version.reload-target'

/**
 * A form closing usually means its save was just sent. Waiting a moment before
 * acting on the cleared blocker lets that request finish first.
 */
const BLOCKER_RELEASE_SETTLE_MS = 5_000

// Safari throws on storage access in some private and locked-down modes; the
// loop guard then lasts only as long as the page, which is still one attempt.
let memoryReloadTarget: string | null = null

const readReloadTarget = (): string | null => {
  try {
    return window.sessionStorage.getItem(RELOAD_TARGET_STORAGE_KEY)
  } catch {
    return memoryReloadTarget
  }
}

const writeReloadTarget = (buildId: string) => {
  memoryReloadTarget = buildId
  try {
    window.sessionStorage.setItem(RELOAD_TARGET_STORAGE_KEY, buildId)
  } catch {
    // memoryReloadTarget already holds it.
  }
}

const clearReloadTarget = () => {
  memoryReloadTarget = null
  try {
    window.sessionStorage.removeItem(RELOAD_TARGET_STORAGE_KEY)
  } catch {
    // Nothing stored, nothing to clear.
  }
}

const fetchRemoteBuildId = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${VERSION_MANIFEST_PATH}?t=${Date.now()}`, {
      cache: 'no-store',
      credentials: 'omit',
    })
    if (!response.ok) return null
    return parseVersionPayload(await response.text())?.buildId ?? null
  } catch {
    return null
  }
}

/**
 * The reload must not be answered from Safari's heuristic cache. `/` has to
 * come back fresh or there is no reload (offline would leave the installed app
 * on an error page). The current deep link is refreshed best-effort: it is
 * served through the CDN's fallback and its status says nothing about the build.
 */
const refreshEntryDocument = async (): Promise<boolean> => {
  try {
    const root = await fetch('/', { cache: 'reload' })
    if (!root.ok) return false
  } catch {
    return false
  }

  const { pathname } = window.location
  if (pathname !== '/') {
    await fetch(pathname, { cache: 'reload' }).catch(() => undefined)
  }
  return true
}

let lastSystemDialogAt: number | null = null

const markSystemDialog = () => {
  lastSystemDialogAt = Date.now()
}

const readGenericBlockers = (): string[] => {
  const blockers: string[] = []

  const active = document.activeElement
  if (
    active instanceof HTMLElement &&
    isEditableElement({
      tagName: active.tagName,
      inputType: active instanceof HTMLInputElement ? active.type : null,
      isContentEditable: active.isContentEditable,
    })
  ) {
    blockers.push('focused-field')
  }

  if (
    lastSystemDialogAt !== null &&
    Date.now() - lastSystemDialogAt < RECENT_SYSTEM_DIALOG_MS
  ) {
    blockers.push('system-dialog')
  }

  return blockers
}

/**
 * Keeps an installed app on the deployed build without asking
 * (`10_AUTO_UPDATE.md` §3). Production only: the dev server has no
 * `/version.json` and HMR already keeps it current.
 */
export const startAppVersionMonitor = () => {
  if (!import.meta.env.PROD || typeof window === 'undefined') return

  const attemptedId = readReloadTarget()
  if (didReloadMissTarget(APP_BUILD_ID, attemptedId)) {
    console.warn('[app-version] reload did not take effect', {
      runningBuildId: APP_BUILD_ID,
      targetBuildId: attemptedId,
    })
  } else if (attemptedId !== null) {
    clearReloadTarget()
  }

  const checker = createAppVersionChecker({
    runningBuildId: APP_BUILD_ID,
    fetchRemoteBuildId,
    now: () => Date.now(),
    getBlockers: () => [...getActiveReloadBlockers(), ...readGenericBlockers()],
    readAttemptedId: readReloadTarget,
    writeAttemptedId: writeReloadTarget,
    refreshEntryDocument,
    reload: () => window.location.reload(),
    onCheck: () => {
      void refreshAdminNotificationsServiceWorker().catch(() => undefined)
    },
  })

  const runCheck = () => {
    void checker.check()
  }

  let intervalId: number | null = null
  const startInterval = () => {
    if (intervalId !== null) return
    intervalId = window.setInterval(runCheck, VERSION_CHECK_INTERVAL_MS)
  }
  const stopInterval = () => {
    if (intervalId === null) return
    window.clearInterval(intervalId)
    intervalId = null
  }

  // Reopening a home-screen app from the switcher resumes the suspended page;
  // this is the event that fires, and the moment a quick reload is expected.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      startInterval()
      runCheck()
      return
    }
    stopInterval()
  })

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) runCheck()
  })
  window.addEventListener('online', runCheck)
  window.addEventListener('focus', runCheck)

  // A file picker or the print dialog hands the page back with the same
  // events as a resume.
  document.addEventListener(
    'click',
    (event) => {
      if (event.target instanceof HTMLInputElement && event.target.type === 'file') {
        markSystemDialog()
      }
    },
    true,
  )
  window.addEventListener('beforeprint', markSystemDialog)
  window.addEventListener('afterprint', markSystemDialog)

  // An old page lazy-loading a chunk the deploy replaced. Handled here so the
  // failure becomes a reload to the build that has the chunk.
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault()
    void checker.check({ force: true })
  })

  let settleTimeoutId: number | null = null
  subscribeReloadBlockers(() => {
    if (settleTimeoutId !== null) {
      window.clearTimeout(settleTimeoutId)
      settleTimeoutId = null
    }
    if (getActiveReloadBlockers().length > 0) return

    settleTimeoutId = window.setTimeout(() => {
      settleTimeoutId = null
      void checker.retryPending()
    }, BLOCKER_RELEASE_SETTLE_MS)
  })

  if (document.visibilityState === 'visible') {
    startInterval()
    // A cold launch may itself have been answered from a stale cached
    // `index.html`.
    runCheck()
  }
}
