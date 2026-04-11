import type { ShellStore } from '../domain/shell.types'
import { replaceOverlayStack } from '../stores/shell.mutations'

export function closeOverlay(store: ShellStore) {
  store.setState((state) => replaceOverlayStack(state, []))
}
