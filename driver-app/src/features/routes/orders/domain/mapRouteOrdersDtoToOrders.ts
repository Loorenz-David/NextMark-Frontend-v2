import type { RouteOrdersDto } from '../api/orders.dto'
import type { RouteOrdersPayload } from './orders.types'

export function mapRouteOrdersDtoToOrders(
  dto: RouteOrdersDto,
): RouteOrdersPayload {
  return {
    orders: {
      byClientId: { ...dto.orders.byClientId },
      allIds: [...dto.orders.allIds],
    },
  }
}
