import type { BottomSheetSnap, ShellStoreState } from '../domain/shell.types'
import { BOTTOM_SHEET_HEIGHTS } from '../domain/shell.types'

type Listener = () => void
type StateUpdater = ShellStoreState | ((state: ShellStoreState) => ShellStoreState)

export type ShellStore = ReturnType<typeof createShellStore>

export function createInitialShellStoreState(): ShellStoreState {
  const initialSnap: BottomSheetSnap = 'workspace'

  return {
    bottomSheetStack: [],
    sideMenuStack: [],
    slidingPageStack: [],
    overlayStack: [],
    bottomSheetSnap: initialSnap,
    bottomSheetHeightPercent: BOTTOM_SHEET_HEIGHTS[initialSnap],
    bottomSheetMotionState: 'idle',
    currentLocation: null,
    currentLocationFocusRequestKey: 0,
    currentLocationStatus: 'idle',
    currentLocationError: null,
    surfaceFocus: 'bottom-sheet',
  }
}

export function createShellStore(initialState: ShellStoreState = createInitialShellStoreState()) {
  let state = initialState
  const listeners = new Set<Listener>()

  const getState = () => state

  const setState = (updater: StateUpdater) => {
    state = typeof updater === 'function' ? updater(state) : updater
    listeners.forEach((listener) => listener())
  }

  const subscribe = (listener: Listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  return {
    getState,
    setState,
    subscribe,
  }
}
