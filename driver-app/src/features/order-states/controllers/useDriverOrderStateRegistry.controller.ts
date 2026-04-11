import { useMemo } from 'react'
import { createOrderStateRegistry } from '@shared-domain'
import { useOrderStates } from './useOrderStates.controller'

export function useDriverOrderStateRegistry() {
  const states = useOrderStates()

  return useMemo(() => createOrderStateRegistry(states), [states])
}
