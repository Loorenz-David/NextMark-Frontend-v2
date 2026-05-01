import { useCallback, useMemo, useRef } from 'react'

import {
  setOrderListLoading,
  setOrderListResult,
  useOrderListStore,
} from '../store/orderList.store'
import { appendVisibleOrders, setVisibleOrders } from '../store/order.store'
import { buildOrderQueryKey, useOrderFlow } from '../flows/order.flow'
import type { OrderQueryStoreFilters } from '../types/orderMeta'
import {
  useOrderPaginationStore,
  selectOrderCurrentPage,
  selectOrderHasMore,
  selectOrderLoadingMode,
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
  const loadingMode = useOrderPaginationStore(selectOrderLoadingMode)
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
      if (useOrderListStore.getState().queryKey == null) {
        setVisibleOrders([])
      }
      scrollToTop?.()
    }

    const requestVersion = paginationState.startRequest(append ? 'nextPage' : 'firstPage')

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
    if (loadingMode !== null || !hasMore || !nextCursor) return null
    return loadPage(true)
  }, [hasMore, loadPage, loadingMode, nextCursor])

  return {
    currentPage,
    hasMore,
    isLoadingFirstPage: loadingMode === 'firstPage',
    isLoadingNextPage: loadingMode === 'nextPage',
    loadFirstPage,
    loadNextPage,
    queryKey,
  }
}
