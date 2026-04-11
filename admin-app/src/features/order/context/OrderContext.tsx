/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'


import type { Order } from '../types/order'
import type { useOrderActions } from '../actions/order.actions'
import type { OrderQueryFilters, OrderStats } from '../types/orderMeta'
import type { useOrderSelectionListActions } from '../actions/orderSelection.actions'

export type OrderContextValue = {
  orders: Order[]
  orderActions: ReturnType<typeof useOrderActions>
  orderSelectionActions: ReturnType<typeof useOrderSelectionListActions>
  isSelectionMode: boolean
  isOrderSelected: (order: Order) => boolean
  orderStats?: OrderStats
  hoveredClientId: string | null
  handleOrderRowMouseEnter: (order: Order) => void
  handleOrderRowMouseLeave: () => void
  currentPage: number
  hasMorePages: boolean
  isInitialLoading: boolean
  isLoadingNextPage: boolean
  loadNextPage: () => Promise<unknown>
  query: {
    q: string
    filters: OrderQueryFilters
  }
}

export const OrderContext = createContext<OrderContextValue | null>(null)

export const OrderContextProvider = ({ value, children }: { value: OrderContextValue; children: ReactNode }) => (
  <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
)

export const useOrderContext = () => {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrderContext must be used within OrderProvider')
  }
  return context
}
