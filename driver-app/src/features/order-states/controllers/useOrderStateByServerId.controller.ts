import { useOrderStatesStore } from '../stores'
import { selectOrderStateByServerId } from '../stores/orderStates.store'

export const useOrderStateByServerId = (id: number | null | undefined) =>
  useOrderStatesStore(selectOrderStateByServerId(id))
