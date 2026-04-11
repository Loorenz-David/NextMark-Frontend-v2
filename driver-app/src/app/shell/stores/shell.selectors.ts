import type { ShellStoreState } from '../domain/shell.types'
import { DRIVER_SHELL_CONFIG } from '../domain/shell.config'

export function selectBottomSheetState(state: ShellStoreState) {
  return {
    stack: state.bottomSheetStack,
    currentPage: state.bottomSheetStack.at(-1) ?? null,
    snap: state.bottomSheetSnap,
    heightPercent: state.bottomSheetHeightPercent,
    motionState: state.bottomSheetMotionState,
    canPop: state.bottomSheetStack.length > 1,
  }
}

export function selectSideMenuState(state: ShellStoreState) {
  return {
    stack: state.sideMenuStack,
    currentPage: state.sideMenuStack.at(-1) ?? null,
    isOpen: state.sideMenuStack.length > 0,
  }
}

export function selectSlidingPageState(state: ShellStoreState) {
  return {
    stack: state.slidingPageStack,
    currentPage: state.slidingPageStack.at(-1) ?? null,
    isOpen: state.slidingPageStack.length > 0,
  }
}

export function selectOverlayState(state: ShellStoreState) {
  return {
    stack: state.overlayStack,
    currentPage: state.overlayStack.at(-1) ?? null,
    isOpen: state.overlayStack.length > 0,
    canPop: state.overlayStack.length > 1,
  }
}

export function selectSurfaceFocus(state: ShellStoreState) {
  return state.surfaceFocus
}

export function selectMapSurfaceState(state: ShellStoreState) {
  return {
    bottomInsetPercent: Math.min(
      state.bottomSheetHeightPercent,
      DRIVER_SHELL_CONFIG.map.responsiveResizeThresholdPercent,
    ),
    bottomSheetMotionState: state.bottomSheetMotionState,
    currentLocation: state.currentLocation,
    currentLocationFocusRequestKey: state.currentLocationFocusRequestKey,
    currentLocationStatus: state.currentLocationStatus,
    currentLocationError: state.currentLocationError,
    isInteractionBlocked: state.surfaceFocus !== 'bottom-sheet',
  }
}
