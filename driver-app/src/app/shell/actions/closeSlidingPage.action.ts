import type { ShellStore } from '../domain/shell.types'
import { replaceSlidingPageStack } from '../stores/shell.mutations'

export function closeSlidingPage(store: ShellStore) {
  store.setState((state) => replaceSlidingPageStack(state, []))
}
