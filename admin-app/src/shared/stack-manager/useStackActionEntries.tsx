import { useSyncExternalStore } from 'react'
import { StackActionManager } from './StackActionManager'

export function useStackActionEntries<TPayloadMap extends Record<PropertyKey, any>>(
  manager: StackActionManager<TPayloadMap>,
) {
  return useSyncExternalStore(
    (listener) => manager.subscribe(listener),
    () => manager.getSnapshot(),
  )
}
