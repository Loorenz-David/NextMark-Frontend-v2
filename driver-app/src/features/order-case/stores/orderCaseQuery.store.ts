import { create } from 'zustand'
import type { OrderCaseQueryFilters } from '../domain'

export type OrderCaseQueryScopeState = {
  orderId: number
  search: string
  filters: OrderCaseQueryFilters
}

export type OrderCaseQueryStoreState = {
  scopes: Record<number, OrderCaseQueryScopeState>
}

export const useOrderCaseQueryStore = create<OrderCaseQueryStoreState>(() => ({
  scopes: {},
}))
