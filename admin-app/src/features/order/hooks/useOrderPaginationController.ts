import { useCallback, useMemo, useRef } from 'react'

import { setOrderListError, setOrderListLoading, setOrderListResult } from '../store/orderList.store'
import { appendVisibleOrders, setVisibleOrders } from '../store/order.store'
import { buildOrderQueryKey, useOrderFlow } from '../flows/order.flow'
import type { OrderQueryStoreFilters } from '../types/orderMeta'
import {
  useOrderPaginationStore,
  selectOrderCurrentPage,
  selectOrderHasMore,
  selectOrderIsLoadingPage,
  selectOrderNextCursor,
} from '../store/orderPagination.store'
import { isRouteOperationsFixtureModeEnabled } from '@/features/home-route-operations/dev/routeOperationsFixtureMode'

type Params = {
  query: OrderQueryStoreFilters
  scrollToTop?: () => void
}

export const useOrderPaginationController = ({ query, scrollToTop }: Params) => {
  const isFixtureMode = isRouteOperationsFixtureModeEnabled()
  const { loadOrdersPage } = useOrderFlow()
  const loadOrdersPageRef = useRef(loadOrdersPage)
  loadOrdersPageRef.current = loadOrdersPage
  const currentPage = useOrderPaginationStore(selectOrderCurrentPage)
  const hasMore = useOrderPaginationStore(selectOrderHasMore)
  const isLoadingPage = useOrderPaginationStore(selectOrderIsLoadingPage)
  const nextCursor = useOrderPaginationStore(selectOrderNextCursor)

  const queryKey = useMemo(() => buildOrderQueryKey(query), [query])

  const loadPage = useCallback(async (append: boolean) => {
    if (isFixtureMode) {
      return null
    }

    const paginationState = useOrderPaginationStore.getState()
    const cursor = append ? paginationState.nextCursor : null

    if (!append) {
      paginationState.reset(queryKey)
      setVisibleOrders([])
      scrollToTop?.()
    }

    const requestVersion = paginationState.startRequest()

    setOrderListLoading(true)
    const response = await loadOrdersPageRef.current({
      ...query,
      filters: {
        ...query.filters,
        limit: 50,
        ...(append && cursor ? { after_cursor: cursor } : {}),
      },
    })

    if (useOrderPaginationStore.getState().requestVersion !== requestVersion) {
      return null
    }

    if (!response) {
      useOrderPaginationStore.getState().setLoadingPage(false)
      return null
    }

    if (append) {
      appendVisibleOrders(response.normalized.allIds)
    } else {
      setVisibleOrders(response.normalized.allIds)
    }

    setOrderListResult({
      queryKey,
      query: {
        q: query.q,
        filters: {
          ...query.filters,
          limit: 200,
        },
      },
      stats: response.stats,
      pagination: response.pagination,
    })

    useOrderPaginationStore.getState().applyPageResult({
      queryKey,
      nextCursor: response.pagination?.next_cursor ?? null,
      hasMore: response.pagination?.has_more ?? false,
      append,
    })

    return response
  }, [isFixtureMode, query, queryKey, scrollToTop])

  const loadFirstPage = useCallback(async () => loadPage(false), [loadPage])
  const loadNextPage = useCallback(async () => {
    if (isLoadingPage || !hasMore || !nextCursor) return null
    return loadPage(true)
  }, [hasMore, isLoadingPage, loadPage, nextCursor])

  return {
    currentPage,
    hasMore,
    isLoadingPage,
    loadFirstPage,
    loadNextPage,
    queryKey,
  }
}
