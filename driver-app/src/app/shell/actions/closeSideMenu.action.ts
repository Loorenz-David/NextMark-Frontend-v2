import type { ShellStore } from '../domain/shell.types'
import { replaceSideMenuStack } from '../stores/shell.mutations'

export function closeSideMenu(store: ShellStore) {
  store.setState((state) => replaceSideMenuStack(state, []))
}
