import type { OverlayPageId, OverlayPageParamsMap, OverlayStackEntry, ShellStore } from '../domain/shell.types'
import { createStackKey } from '../domain/shell.types'
import { replaceOverlayStack } from '../stores/shell.mutations'

export function openOverlay<PageId extends OverlayPageId>(
  store: ShellStore,
  page: PageId,
  params: OverlayPageParamsMap[PageId],
) {
  const entry: OverlayStackEntry = {
    key: createStackKey(page),
    page,
    params,
  } as OverlayStackEntry

  store.setState((state) => replaceOverlayStack(state, [{
    ...entry,
  }]))
}
