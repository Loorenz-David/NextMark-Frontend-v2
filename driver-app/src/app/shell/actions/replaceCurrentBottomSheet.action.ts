import type { BottomSheetPageId, BottomSheetPageParamsMap, ShellStore } from '../domain/shell.types'
import { createStackKey } from '../domain/shell.types'
import { replaceBottomSheetStack } from '../stores/shell.mutations'

export function replaceCurrentBottomSheet<PageId extends BottomSheetPageId>(
  store: ShellStore,
  page: PageId,
  params: BottomSheetPageParamsMap[PageId],
) {
  store.setState((state) => {
    if (state.bottomSheetStack.length === 0) {
      return replaceBottomSheetStack(state, [{
        key: createStackKey(page),
        page,
        params,
      } as Extract<typeof state.bottomSheetStack[number], { page: PageId }>] as typeof state.bottomSheetStack)
    }

    const nextStack = [
      ...state.bottomSheetStack.slice(0, -1),
      {
        key: createStackKey(page),
        page,
        params,
      } as Extract<typeof state.bottomSheetStack[number], { page: PageId }>,
    ] as typeof state.bottomSheetStack

    return replaceBottomSheetStack(state, nextStack)
  })
}
