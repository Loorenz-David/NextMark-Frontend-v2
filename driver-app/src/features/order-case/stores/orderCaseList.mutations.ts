import type { OrderCasePagination, OrderCaseQueryFilters, OrderCaseStats } from '../domain'
import type { OrderCaseListScopeState } from './orderCaseList.store'
import { useOrderCaseListStore } from './orderCaseList.store'

function createScope(orderId: number): OrderCaseListScopeState {
  return {
    orderId,
    caseClientIds: [],
    isLoading: false,
  }
}

export const setOrderCaseListLoading = (orderId: number, loading: boolean) =>
  useOrderCaseListStore.setState((state) => ({
    scopes: {
      ...state.scopes,
      [orderId]: {
        ...(state.scopes[orderId] ?? createScope(orderId)),
        isLoading: loading,
        error: loading ? undefined : state.scopes[orderId]?.error,
      },
    },
  }))

export const setOrderCaseListError = (orderId: number, error?: string) =>
  useOrderCaseListStore.setState((state) => ({
    scopes: {
      ...state.scopes,
      [orderId]: {
        ...(state.scopes[orderId] ?? createScope(orderId)),
        isLoading: false,
        error,
      },
    },
  }))

export const setOrderCaseListResult = (
  orderId: number,
  payload: {
    queryKey: string
    caseClientIds: string[]
    query?: OrderCaseQueryFilters
    stats?: OrderCaseStats
    pagination?: OrderCasePagination
  },
) =>
  useOrderCaseListStore.setState((state) => ({
    scopes: {
      ...state.scopes,
      [orderId]: {
        ...(state.scopes[orderId] ?? createScope(orderId)),
        queryKey: payload.queryKey,
        query: payload.query,
        stats: payload.stats,
        pagination: payload.pagination,
        caseClientIds: payload.caseClientIds,
        isLoading: false,
        error: undefined,
      },
    },
  }))

export const clearOrderCaseListScope = (orderId: number) =>
  useOrderCaseListStore.setState((state) => {
    const nextScopes = { ...state.scopes }
    delete nextScopes[orderId]
    return { scopes: nextScopes }
  })
