import { useCallback, useMemo, useRef, useState } from 'react'

import { appendVisibleRoutePlans, setVisibleRoutePlans } from '../store/routePlan.slice'
import { buildPlanQueryKey, usePlanQueries } from '../flows/planQueries.flow'
import type { PlanQueryFilters } from '../types/planMeta'
import {
  setRoutePlanListError,
  setRoutePlanListLoading,
  setRoutePlanListResult,
} from '../store/routePlanList.store'
import {
  selectRoutePlanCurrentPage,
  selectRoutePlanHasMore,
  selectRoutePlanIsLoadingPage,
  selectRoutePlanNextCursor,
  useRoutePlanPaginationStore,
} from '../store/routePlanPagination.store'
import { isRouteOperationsFixtureModeEnabled } from '@/features/home-route-operations/dev/routeOperationsFixtureMode'

type Params = {
  query?: PlanQueryFilters
  scrollToTop?: () => void
}

export const usePlanPaginationController = ({ query, scrollToTop }: Params = {}) => {
  const isFixtureMode = isRouteOperationsFixtureModeEnabled()
  const { fetchPlansPage } = usePlanQueries()
  const fetchPlansPageRef = useRef(fetchPlansPage)
  fetchPlansPageRef.current = fetchPlansPage
  const [isReplacingList, setIsReplacingList] = useState(false)
  const currentPage = useRoutePlanPaginationStore(selectRoutePlanCurrentPage)
  const hasMore = useRoutePlanPaginationStore(selectRoutePlanHasMore)
  const isLoadingPage = useRoutePlanPaginationStore(selectRoutePlanIsLoadingPage)
  const nextCursor = useRoutePlanPaginationStore(selectRoutePlanNextCursor)

  const queryKey = useMemo(() => buildPlanQueryKey(query), [query])

  const loadPage = useCallback(async (append: boolean) => {
    if (isFixtureMode) {
      return null
    }

    const paginationState = useRoutePlanPaginationStore.getState()
    const cursor = append ? paginationState.nextCursor : null

    if (!append) {
      setIsReplacingList(true)
      paginationState.reset(queryKey)
      setVisibleRoutePlans([])
      scrollToTop?.()
    }

    const requestVersion = paginationState.startRequest()

    setRoutePlanListLoading(true)
    const response = await fetchPlansPageRef.current({
      ...query,
      limit: 20,
      ...(append && cursor ? { after_cursor: cursor } : {}),
    })

    if (useRoutePlanPaginationStore.getState().requestVersion !== requestVersion) {
      if (!append) {
        setIsReplacingList(false)
      }
      return null
    }

    if (!response?.route_plan) {
      useRoutePlanPaginationStore.getState().setLoadingPage(false)
      setRoutePlanListError('Missing route plans response.')
      if (!append) {
        setIsReplacingList(false)
      }
      return null
    }

    if (append) {
      appendVisibleRoutePlans(response.route_plan.allIds)
    } else {
      setVisibleRoutePlans(response.route_plan.allIds)
    }

    setRoutePlanListResult({
      queryKey,
      query: {
        ...query,
        limit: 25,
      },
      stats: response.route_plan_stats,
      pagination: response.route_plan_pagination,
    })

    useRoutePlanPaginationStore.getState().applyPageResult({
      queryKey,
      nextCursor: response.route_plan_pagination?.next_cursor ?? null,
      hasMore: response.route_plan_pagination?.has_more ?? false,
      append,
    })

    if (!append) {
      setIsReplacingList(false)
    }

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
    isReplacingList,
    loadFirstPage,
    loadNextPage,
    queryKey,
  }
}
