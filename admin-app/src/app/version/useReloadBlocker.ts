import { useEffect } from 'react'

import { registerReloadBlocker } from './reloadBlockers'

/**
 * Holds back the silent update reload while `isBlocking` is true — an open
 * form with unsaved edits, a drag in progress. Released on unmount.
 */
export const useReloadBlocker = (isBlocking: boolean, reason: string) => {
  useEffect(() => {
    if (!isBlocking) return
    return registerReloadBlocker(reason)
  }, [isBlocking, reason])
}
