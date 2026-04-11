import type { OrderCaseQueryFilters } from '../domain'
import type { OrderCaseQueryScopeState } from './orderCaseQuery.store'
import { useOrderCaseQueryStore } from './orderCaseQuery.store'

function createScope(orderId: number): OrderCaseQueryScopeState {
  return {
    orderId,
    search: '',
    filters: {},
  }
}

export const setOrderCaseQuerySearch = (orderId: number, search: string) =>
  useOrderCaseQueryStore.setState((state) => ({
    scopes: {
      ...state.scopes,
      [orderId]: {
        ...(state.scopes[orderId] ?? createScope(orderId)),
        search,
      },
    },
  }))

export const setOrderCaseQueryFilters = (orderId: number, filters: OrderCaseQueryFilters) =>
  useOrderCaseQueryStore.setState((state) => ({
    scopes: {
      ...state.scopes,
      [orderId]: {
        ...(state.scopes[orderId] ?? createScope(orderId)),
        filters,
      },
    },
  }))

export const updateOrderCaseQueryFilters = (orderId: number, filters: Partial<OrderCaseQueryFilters>) =>
  useOrderCaseQueryStore.setState((state) => ({
    scopes: {
      ...state.scopes,
      [orderId]: {
        ...(state.scopes[orderId] ?? createScope(orderId)),
        filters: {
          ...(state.scopes[orderId]?.filters ?? {}),
          ...filters,
        },
      },
    },
  }))

export const resetOrderCaseQuery = (orderId: number) =>
  useOrderCaseQueryStore.setState((state) => ({
    scopes: {
      ...state.scopes,
      [orderId]: createScope(orderId),
    },
  }))
