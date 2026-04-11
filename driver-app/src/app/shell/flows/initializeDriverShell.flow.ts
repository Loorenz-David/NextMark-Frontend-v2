import type { DriverServices } from '@/app/providers/driverServices.context'
import { locateCurrentLocationAction } from '../actions/locateCurrentLocation.action'
import { openBottomSheet } from '../actions/openBottomSheet.action'
import { setBottomSheetSnap } from '../actions/setBottomSheetSnap.action'
import type { ShellStore } from '../domain/shell.types'

type InitializeDriverShellFlowDependencies = {
  browserLocationService: DriverServices['browserLocationService']
  store: ShellStore
}

export async function initializeDriverShellFlow({
  browserLocationService,
  store,
}: InitializeDriverShellFlowDependencies) {
  if (store.getState().bottomSheetStack.length > 0) {
    return
  }

  openBottomSheet(store, 'route-workspace', undefined)
  setBottomSheetSnap(store, 'workspace')

  try {
    await locateCurrentLocationAction({
      browserLocationService,
      store,
    })
  } catch {
    // Location access is optional at shell load; the explicit button remains available.
  }
}
