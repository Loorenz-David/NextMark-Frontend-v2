import type { BottomSheetPageId, BottomSheetPageParamsMap, ShellStore } from '../domain/shell.types'
import { createStackKey } from '../domain/shell.types'
import { pushBottomSheetStackEntry } from '../stores/shell.mutations'

export function pushBottomSheet<PageId extends BottomSheetPageId>(
  store: ShellStore,
  page: PageId,
  params: BottomSheetPageParamsMap[PageId],
) {
  store.setState((state) => pushBottomSheetStackEntry(state, {
    key: createStackKey(page),
    page,
    params,
  } as Extract<typeof state.bottomSheetStack[number], { page: PageId }>))
}
