import { clearItems } from '@/features/order/item/store/item.store'
import { clearOrderList } from '@/features/order/store/orderList.store'
import { useOrderPaginationStore } from '@/features/order/store/orderPagination.store'
import { clearOrders } from '@/features/order/store/order.store'
import { clearOrderStates } from '@/features/order/store/orderState.store'

const FIXTURE_QUERY_KEY = 'route-operations-fixtures'

export const resetRouteOperationsOrderFixtures = () => {
  clearOrders()
  clearItems()
  clearOrderStates()
  clearOrderList()
  useOrderPaginationStore.getState().reset(FIXTURE_QUERY_KEY)
}
