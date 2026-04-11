import type { BottomSheetPageId, BottomSheetPageParamsMap, ShellStore } from '../domain/shell.types'
import { createStackKey } from '../domain/shell.types'
import { replaceBottomSheetStack } from '../stores/shell.mutations'

export function openBottomSheet<PageId extends BottomSheetPageId>(
  store: ShellStore,
  page: PageId,
  params: BottomSheetPageParamsMap[PageId],
) {
  store.setState((state) => replaceBottomSheetStack(state, [{
    key: createStackKey(page),
    page,
    params,
  } as Extract<typeof state.bottomSheetStack[number], { page: PageId }>] as typeof state.bottomSheetStack))
}
