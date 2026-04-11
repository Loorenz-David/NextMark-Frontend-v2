import type { ShellStore } from '../domain/shell.types'
import {
  setBottomSheetSnapState,
  popBottomSheetStackEntry,
  popOverlayStackEntry,
  replaceOverlayStack,
  replaceSideMenuStack,
  replaceSlidingPageStack,
} from '../stores/shell.mutations'

export function handleSurfaceBack(store: ShellStore) {
  const state = store.getState()

  if (state.overlayStack.length > 0) {
    store.setState((currentState) =>
      currentState.overlayStack.length > 1
        ? popOverlayStackEntry(currentState)
        : replaceOverlayStack(currentState, []),
    )
    return true
  }

  if (state.slidingPageStack.length > 0) {
    store.setState((currentState) => replaceSlidingPageStack(currentState, []))
    return true
  }

  if (state.sideMenuStack.length > 0) {
    store.setState((currentState) => replaceSideMenuStack(currentState, []))
    return true
  }

  if (state.bottomSheetStack.length > 1) {
    store.setState((currentState) => popBottomSheetStackEntry(currentState))
    return true
  }

  if (state.bottomSheetSnap !== 'workspace') {
    store.setState((currentState) => setBottomSheetSnapState(currentState, 'workspace'))
    return true
  }

  return false
}
