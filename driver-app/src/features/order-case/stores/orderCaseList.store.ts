import { create } from 'zustand'
import type { OrderCasePagination, OrderCaseQueryFilters, OrderCaseStats } from '../domain'

export type OrderCaseListScopeState = {
  orderId: number
  queryKey?: string
  query?: OrderCaseQueryFilters
  stats?: OrderCaseStats
  pagination?: OrderCasePagination
  caseClientIds: string[]
  isLoading: boolean
  error?: string
}

export type OrderCaseListStoreState = {
  scopes: Record<number, OrderCaseListScopeState>
}

export const useOrderCaseListStore = create<OrderCaseListStoreState>(() => ({
  scopes: {},
}))
