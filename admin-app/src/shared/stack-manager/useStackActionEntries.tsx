import { useSyncExternalStore } from 'react'
import { StackActionManager } from './StackActionManager'

export function useStackActionEntries<TPayloadMap extends Record<string, unknown>>(
  manager: StackActionManager<TPayloadMap>,
) {
  return useSyncExternalStore(
    (listener) => manager.subscribe(listener),
    () => manager.getSnapshot(),
  )
}
