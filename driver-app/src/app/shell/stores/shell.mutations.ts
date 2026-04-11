import type {
  BottomSheetMotionState,
  BottomSheetSnap,
  BottomSheetStackEntry,
  OverlayStackEntry,
  ShellStoreState,
  SlidingPageStackEntry,
  SideMenuStackEntry,
} from '../domain/shell.types'
import type { Coordinates } from '@/shared/map'
import { DRIVER_SHELL_CONFIG } from '../domain/shell.config'
import { BOTTOM_SHEET_HEIGHTS } from '../domain/shell.types'

function resolveSurfaceFocus(state: ShellStoreState): ShellStoreState['surfaceFocus'] {
  if (state.overlayStack.length > 0) {
    return 'overlay'
  }

  if (state.slidingPageStack.length > 0) {
    return 'sliding-page'
  }

  if (state.sideMenuStack.length > 0) {
    return 'side-menu'
  }

  return 'bottom-sheet'
}

export function replaceBottomSheetStack(
  state: ShellStoreState,
  stack: BottomSheetStackEntry[],
): ShellStoreState {
  const nextState = {
    ...state,
    bottomSheetStack: stack,
  }

  return {
    ...nextState,
    surfaceFocus: resolveSurfaceFocus(nextState),
  }
}

export function pushBottomSheetStackEntry(
  state: ShellStoreState,
  entry: BottomSheetStackEntry,
): ShellStoreState {
  return replaceBottomSheetStack(state, [...state.bottomSheetStack, entry])
}

export function popBottomSheetStackEntry(state: ShellStoreState): ShellStoreState {
  if (state.bottomSheetStack.length <= 1) {
    return state
  }

  return replaceBottomSheetStack(state, state.bottomSheetStack.slice(0, -1))
}

export function replaceSideMenuStack(
  state: ShellStoreState,
  stack: SideMenuStackEntry[],
): ShellStoreState {
  const nextState = {
    ...state,
    sideMenuStack: stack,
  }

  return {
    ...nextState,
    surfaceFocus: resolveSurfaceFocus(nextState),
  }
}

export function replaceSlidingPageStack(
  state: ShellStoreState,
  stack: SlidingPageStackEntry[],
): ShellStoreState {
  const nextState = {
    ...state,
    slidingPageStack: stack,
  }

  return {
    ...nextState,
    surfaceFocus: resolveSurfaceFocus(nextState),
  }
}

export function replaceOverlayStack(
  state: ShellStoreState,
  stack: OverlayStackEntry[],
): ShellStoreState {
  const nextState = {
    ...state,
    overlayStack: stack,
  }

  return {
    ...nextState,
    surfaceFocus: resolveSurfaceFocus(nextState),
  }
}

export function pushOverlayStackEntry(
  state: ShellStoreState,
  entry: OverlayStackEntry,
): ShellStoreState {
  return replaceOverlayStack(state, [...state.overlayStack, entry])
}

export function popOverlayStackEntry(state: ShellStoreState): ShellStoreState {
  if (state.overlayStack.length <= 1) {
    return replaceOverlayStack(state, [])
  }

  return replaceOverlayStack(state, state.overlayStack.slice(0, -1))
}

export function setBottomSheetSnapState(
  state: ShellStoreState,
  snap: BottomSheetSnap,
): ShellStoreState {
  return {
    ...state,
    bottomSheetSnap: snap,
    bottomSheetHeightPercent: BOTTOM_SHEET_HEIGHTS[snap],
  }
}

export function setBottomSheetHeightPercentState(
  state: ShellStoreState,
  percent: number,
): ShellStoreState {
  return {
    ...state,
    bottomSheetHeightPercent: Math.max(
      DRIVER_SHELL_CONFIG.bottomSheet.snapHeights.collapsed,
      Math.min(DRIVER_SHELL_CONFIG.bottomSheet.snapHeights.expanded, percent),
    ),
  }
}

export function setBottomSheetMotionState(
  state: ShellStoreState,
  motionState: BottomSheetMotionState,
): ShellStoreState {
  return {
    ...state,
    bottomSheetMotionState: motionState,
  }
}

export function setCurrentLocationState(
  state: ShellStoreState,
  coordinates: Coordinates | null,
): ShellStoreState {
  return {
    ...state,
    currentLocation: coordinates,
    currentLocationFocusRequestKey: state.currentLocationFocusRequestKey + (coordinates ? 1 : 0),
    currentLocationStatus: coordinates ? 'ready' : state.currentLocationStatus,
    currentLocationError: coordinates ? null : state.currentLocationError,
  }
}

export function setCurrentLocationStatusState(
  state: ShellStoreState,
  status: ShellStoreState['currentLocationStatus'],
  error: string | null = null,
): ShellStoreState {
  return {
    ...state,
    currentLocationStatus: status,
    currentLocationError: error,
  }
}
