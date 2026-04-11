import type { BottomSheetSnap, ShellStore } from '../domain/shell.types'
import { setBottomSheetSnapState } from '../stores/shell.mutations'

export function setBottomSheetSnap(store: ShellStore, snap: BottomSheetSnap) {
  store.setState((state) => setBottomSheetSnapState(state, snap))
}
