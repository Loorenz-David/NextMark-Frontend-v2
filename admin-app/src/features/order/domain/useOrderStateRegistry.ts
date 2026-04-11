import { useMemo } from 'react'
import { createOrderStateRegistry } from '@shared-domain'

import { useOrderStates } from '../store/orderStateHooks.store'
import type { OrderState } from '../types/orderState'

export { createOrderStateRegistry }

export const useOrderStateRegistry = () => {
  const states = useOrderStates()

  return useMemo(
    () => createOrderStateRegistry(states),
    [states],
  )
}
