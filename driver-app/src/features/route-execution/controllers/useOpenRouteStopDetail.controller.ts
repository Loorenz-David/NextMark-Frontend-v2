import { useCallback, useSyncExternalStore } from 'react'
import type { BottomSheetSnap } from '@/app/shell/domain/shell.types'
import { useDriverAppShell } from '@/app/shell/providers/driverAppShell.context'
import { useRouteExecutionShell } from '../providers/routeExecutionShell.context'

export function useOpenRouteStopDetail() {
  const {
    store: shellStore,
    pushBottomSheet,
    replaceCurrentBottomSheet,
    snapBottomSheetTo,
  } = useDriverAppShell()
  const { prepareRouteStopDetailTransition } = useRouteExecutionShell()

  useSyncExternalStore(
    shellStore.subscribe,
    shellStore.getState,
    shellStore.getState,
  )

  return useCallback((stopClientId: string, options?: { snap?: BottomSheetSnap | null }) => {
    const currentBottomSheetPage = shellStore.getState().bottomSheetStack.at(-1)
    const previousStopClientId = currentBottomSheetPage?.page === 'route-stop-detail'
      ? currentBottomSheetPage.params.stopClientId
      : null
    const shouldOpen = prepareRouteStopDetailTransition(previousStopClientId, stopClientId)
    if (!shouldOpen) {
      if (options?.snap) {
        snapBottomSheetTo(options.snap)
      }
      return
    }

    if (currentBottomSheetPage?.page === 'route-stop-detail') {
      replaceCurrentBottomSheet('route-stop-detail', { stopClientId })
    } else {
      pushBottomSheet('route-stop-detail', { stopClientId })
    }

    if (options?.snap) {
      snapBottomSheetTo(options.snap)
    }
  }, [prepareRouteStopDetailTransition, pushBottomSheet, replaceCurrentBottomSheet, shellStore, snapBottomSheetTo])
}
