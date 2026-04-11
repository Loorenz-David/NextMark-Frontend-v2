import { optimisticTransaction } from '@shared-optimistic'
import type { OrderCaseState } from '../domain'
import { isOrderCaseStateTransitionAllowed } from '../domain'
import { updateOrderCaseStateAction } from '../actions'
import {
  patchOrderCaseByClientId,
  selectOrderCaseByClientId,
  useOrderCasesStore,
} from '../stores'

type UpdateOrderCaseStateFlowOptions = {
  orderCaseClientId: string
  orderCaseId: number
  nextState: OrderCaseState
}

const inFlightStateUpdates = new Map<string, Promise<boolean>>()

export async function updateOrderCaseStateFlow({
  orderCaseClientId,
  orderCaseId,
  nextState,
}: UpdateOrderCaseStateFlowOptions) {
  const currentOrderCase = selectOrderCaseByClientId(orderCaseClientId)(useOrderCasesStore.getState())

  if (!currentOrderCase) {
    return false
  }

  if (!isOrderCaseStateTransitionAllowed(currentOrderCase.state, nextState)) {
    return false
  }

  const inFlightKey = `${orderCaseId}:${nextState}`
  const existingRequest = inFlightStateUpdates.get(inFlightKey)
  if (existingRequest) {
    return existingRequest
  }

  const request = optimisticTransaction({
    snapshot: () => currentOrderCase.state,
    mutate: () => {
      patchOrderCaseByClientId(orderCaseClientId, { state: nextState })
    },
    request: () =>
      updateOrderCaseStateAction({
        orderCaseId,
        nextState,
      }),
    commit: () => undefined,
    rollback: (previousState) => {
      patchOrderCaseByClientId(orderCaseClientId, {
        state: previousState as OrderCaseState,
      })
    },
    onError: (error) => {
      console.error('Failed to update order case state', error)
    },
  }).finally(() => {
    inFlightStateUpdates.delete(inFlightKey)
  })

  inFlightStateUpdates.set(inFlightKey, request)
  return request
}
