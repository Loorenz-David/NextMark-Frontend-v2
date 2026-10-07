import { useSyncExternalStore } from 'react'

import { bottomSheetRegistry } from './bottomSheetRegistry'

/** Number of bottom sheets currently open anywhere in the app. */
export const useOpenBottomSheetCount = (): number =>
  useSyncExternalStore(
    bottomSheetRegistry.subscribe,
    bottomSheetRegistry.getOpenCount,
    bottomSheetRegistry.getOpenCount,
  )
