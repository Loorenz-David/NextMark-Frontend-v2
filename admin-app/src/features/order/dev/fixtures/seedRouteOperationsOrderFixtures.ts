import type { Item } from '@/features/order/item/types'
import type { Order } from '@/features/order/types/order'
import type { OrderState } from '@/features/order/types/orderState'
import type { OrderStats } from '@/features/order/types/orderMeta'

import { setItems } from '@/features/order/item/store/item.store'
import { setOrderListResult } from '@/features/order/store/orderList.store'
import { useOrderPaginationStore } from '@/features/order/store/orderPagination.store'
import { setOrders, setVisibleOrders } from '@/features/order/store/order.store'
import { insertOrderStates } from '@/features/order/store/orderState.store'

import { toEntityTable } from './tables/toEntityTable'

const FIXTURE_QUERY_KEY = 'route-operations-fixtures'

type SeedRouteOperationsOrderFixturesPayload = {
  orders: Order[]
  items: Item[]
  orderStates?: OrderState[]
  visibleOrderClientIds?: string[]
  orderStats?: OrderStats
}

export const seedRouteOperationsOrderFixtures = ({
  orders,
  items,
  orderStates = [],
  visibleOrderClientIds,
  orderStats,
}: SeedRouteOperationsOrderFixturesPayload) => {
  if (orderStates.length > 0) {
    insertOrderStates(toEntityTable(orderStates))
  }

  setOrders(toEntityTable(orders))
  setVisibleOrders(visibleOrderClientIds ?? orders.map((order) => order.client_id))
  setItems(toEntityTable(items))

  setOrderListResult({
    queryKey: FIXTURE_QUERY_KEY,
    query: {
      q: '',
      filters: {
        limit: 200,
      },
    },
    stats: orderStats,
    pagination: {
      has_more: false,
      next_cursor: null,
      prev_cursor: null,
    },
  })

  useOrderPaginationStore.getState().reset(FIXTURE_QUERY_KEY)
  useOrderPaginationStore.getState().applyPageResult({
    queryKey: FIXTURE_QUERY_KEY,
    nextCursor: null,
    hasMore: false,
    append: false,
  })
}
