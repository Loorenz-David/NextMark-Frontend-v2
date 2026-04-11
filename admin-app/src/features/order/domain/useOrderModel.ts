import type { Order, OrderMap } from '../types/order'

const isOrderMap = (value: OrderMap | Order): value is OrderMap =>
  Boolean((value as OrderMap).byClientId && (value as OrderMap).allIds)

export const useOrderModel = () => {
  const normalizeOrderPayload = (payload: OrderMap | Order): OrderMap => {
    if (isOrderMap(payload)) {
      return payload
    }

    return {
      byClientId: { [payload.client_id]: payload },
      allIds: [payload.client_id],
    }
  }

  return {
    normalizeOrderPayload,
  }
}
