import type { BottomSheetMotionState, ShellStore } from '../domain/shell.types'
import { setBottomSheetMotionState as setBottomSheetMotionStateMutation } from '../stores/shell.mutations'

export function setBottomSheetMotionState(store: ShellStore, motionState: BottomSheetMotionState) {
  store.setState((state) => setBottomSheetMotionStateMutation(state, motionState))
}
