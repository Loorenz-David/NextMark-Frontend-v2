import { useMemo } from 'react'
import { useOrderStatesStore } from '../stores'
import { selectAllOrderStates } from '../stores/orderStates.store'

export const useOrderStates = () => {
  const state = useOrderStatesStore((store) => store)

  return useMemo(() => selectAllOrderStates(state), [state])
}
