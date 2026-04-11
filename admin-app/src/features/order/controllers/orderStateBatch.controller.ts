import { useOrderStateRegistry } from '../domain/useOrderStateRegistry'
import {
  selectOrdersByPlanId,
  useOrderStore,
} from '../store/order.store'
import type { Order } from '../types/order'
import type { OrderStates } from '../types/orderState'

type BatchSelector =
  | { type: 'deliveryPlanId'; deliveryPlanId: number }
  | { type: 'orderIds'; orderIds: number[] }

export const useOrderStateBatch = () => {
  const registry = useOrderStateRegistry()

 
  const resolveOrders = (selector: BatchSelector, state: ReturnType<typeof useOrderStore.getState>): Order[] => {
    switch (selector.type) {
      case 'deliveryPlanId':
        return selectOrdersByPlanId(selector.deliveryPlanId)(state)

      case 'orderIds':
        return selector.orderIds
          .map((orderId) => {
            const clientId = state.idIndex[orderId]
            return clientId ? state.byClientId[clientId] : undefined
          })
          .filter((order): order is Order => Boolean(order))
    }
  }


  const changeOrderStateBatch = (
    selector: BatchSelector,
    nextState: OrderStates,
  ): Record<string, number> => {
    const state = useOrderStore.getState()

    const orders = resolveOrders(selector, state)

    const stateId = registry.getStateIdByName(nextState)
    if (!stateId) {
      throw new Error(
        'State id was not found with state name: ' + nextState,
      )
    }

   
    const previousStateMap = orders.reduce<Record<string, number>>(
      (acc, order) => {
        if (order.order_state_id != null) {
          acc[order.client_id] = order.order_state_id
        }
        return acc
      },
      {},
    )

    state.patchMany(Object.keys(previousStateMap), {
      order_state_id: stateId,
    })

    return previousStateMap
  }

  
  const rollbackOrderStates = (previousStateMap: Record<string, number>) => {
    const state = useOrderStore.getState()
    
    Object.entries(previousStateMap).forEach(
      ([clientId, orderStateId]) => {
        state.patch(clientId, { order_state_id: orderStateId })
      },
    )
  }

  return {
    changeOrderStateBatch,
    rollbackOrderStates,
  }
}
