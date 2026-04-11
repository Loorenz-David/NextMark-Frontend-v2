import type { ShellStore } from '../domain/shell.types'
import { setBottomSheetHeightPercentState } from '../stores/shell.mutations'

export function setBottomSheetHeight(store: ShellStore, percent: number) {
  store.setState((state) => setBottomSheetHeightPercentState(state, percent))
}
