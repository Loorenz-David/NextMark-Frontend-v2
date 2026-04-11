import type {
  ShellStore,
  SlidingPagePageId,
  SlidingPagePageParamsMap,
  SlidingPageStackEntry,
} from '../domain/shell.types'
import { createStackKey } from '../domain/shell.types'
import { replaceSlidingPageStack } from '../stores/shell.mutations'

export function openSlidingPage<PageId extends SlidingPagePageId>(
  store: ShellStore,
  page: PageId,
  params: SlidingPagePageParamsMap[PageId],
) {
  const entry: SlidingPageStackEntry = {
    key: createStackKey(page),
    page,
    params,
  } as SlidingPageStackEntry

  store.setState((state) => replaceSlidingPageStack(state, [entry]))
}
