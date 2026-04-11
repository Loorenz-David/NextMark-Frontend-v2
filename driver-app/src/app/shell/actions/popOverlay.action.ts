import type { ShellStore } from '../domain/shell.types'
import { popOverlayStackEntry } from '../stores/shell.mutations'

export function popOverlay(store: ShellStore) {
  store.setState((state) => popOverlayStackEntry(state))
}
