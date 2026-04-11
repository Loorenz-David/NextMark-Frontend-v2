import type { ShellStore, SideMenuPageId, SideMenuPageParamsMap } from '../domain/shell.types'
import { createStackKey } from '../domain/shell.types'
import { replaceSideMenuStack } from '../stores/shell.mutations'

export function openSideMenu<PageId extends SideMenuPageId>(
  store: ShellStore,
  page: PageId,
  params: SideMenuPageParamsMap[PageId],
) {
  store.setState((state) => replaceSideMenuStack(state, [{
    key: createStackKey(page),
    page,
    params,
  }]))
}
