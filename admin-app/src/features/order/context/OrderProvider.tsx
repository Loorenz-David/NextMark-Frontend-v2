import type { PropsWithChildren, RefObject } from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import {  useVisibleOrders } from '../store/orderHooks.store'
import { OrderContextProvider } from './OrderContext'
import { useOrderActions } from '../actions/order.actions'
import {   useOrderQuery } from "../store/orderQuery.store";
import { useOrderSelectionListActions } from '../actions/orderSelection.actions'
import { useBaseControlls, useMapManager, useSectionManager } from '@/shared/resource-manager/useResourceManager'
import { useOrderCircleSelectionFlow } from '../flows/orderCircleSelection.flow'
import { useOrderBatchSelectionResolveFlow } from '../flows/orderBatchSelectionResolve.flow'
import {
  selectOrderListLoading,
  selectOrderListQueryKey,
  useOrderListStore,
  useOrderStats,
} from '../store/orderList.store'
import {
  useHoveredOrderClientId,
  useHoveredOrderClientIds,
  useOrderMapInteractionActions,
  useOrderMarkerLookup,
} from '../store/orderMapInteractionHooks.store'
import { useStackActionEntries } from '@/shared/stack-manager/useStackActionEntries'
import type { Order } from '../types/order'
import {
  useOrderSelectionActions,
  useOrderSelectionMode,
  useSelectedOrderClientIds,
} from '../store/orderSelectionHooks.store'
import { MAP_MARKER_LAYERS } from '@/shared/map'
import { useOrderSelectionStore } from '../store/orderSelection.store'
import { useAuthSession } from '@/features/auth/login/hooks/useAuthSelectors'
import { useOrderGroupUIStore } from '../store/orderGroupUI.store'
import { useOrderPaginationController } from '../hooks/useOrderPaginationController'
import { useOrderMapDataFlow } from '../flows/orderMapData.flow'
import { useOrderDriverLiveMapFlow } from '../flows/orderDriverLiveMap.flow'
import { isRouteOperationsFixtureModeEnabled } from '@/features/home-route-operations/dev/routeOperationsFixtureMode'

type OrderProviderProps = PropsWithChildren<{
  scrollContainerRef?: RefObject<HTMLElement | null>
}>

export const OrderProvider = ({ children, scrollContainerRef }: OrderProviderProps) => {
  const isFixtureMode = isRouteOperationsFixtureModeEnabled()
  const orders = useVisibleOrders()
  const isOrderListLoading = useOrderListStore(selectOrderListLoading)
  const completedOrderListQueryKey = useOrderListStore(selectOrderListQueryKey)
  const orderStats = useOrderStats()
  const orderActions = useOrderActions()
  const isSelectionMode = useOrderSelectionMode()
  const { disableSelectionMode } = useOrderSelectionActions()
  const baseControlls = useBaseControlls()
  const query = useOrderQuery()
  const session = useAuthSession()
  const previousTeamIdRef = useRef<number | null>(null)
  const mapManager = useMapManager()
  const sectionManager = useSectionManager()
  const sectionEntries = useStackActionEntries(sectionManager)
  const hoveredClientId = useHoveredOrderClientId()
  const hoveredClientIds = useHoveredOrderClientIds()
  const selectedOrderClientIds = useSelectedOrderClientIds()
  const markerLookup = useOrderMarkerLookup()
  const { setHovered, setHoveredMany, clearHovered, openGroupOverlay, closeGroupOverlay } = useOrderMapInteractionActions()
  const handleScrollToTop = useCallback(() => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTop = 0
    }
  }, [scrollContainerRef])

  const orderSelectionActions = useOrderSelectionListActions({
    query,
    orderStats,
    visibleOrders: orders,
  })
  const {
    currentPage,
    hasMore,
    isLoadingFirstPage,
    isLoadingNextPage,
    loadFirstPage,
    loadNextPage,
  } = useOrderPaginationController({
    query,
    scrollToTop: handleScrollToTop,
  })

  useOrderBatchSelectionResolveFlow()

  const activeOrderDetailClientId = useMemo(() => {
    const openOrderDetails = sectionEntries.filter(
      (entry) => !entry.isClosing && entry.key === 'order.details',
    )
    const latest = openOrderDetails.at(-1)
    const payload = latest?.payload as { clientId?: string } | undefined
    return payload?.clientId ?? null
  }, [sectionEntries])

  const handleOrderRowMouseEnter = useCallback(
    (order: Order) => {
      setHovered(order.client_id, 'list')
    },
    [setHovered],
  )

  const handleOrderRowMouseLeave = useCallback(() => {
    clearHovered('list')
  }, [clearHovered])

  const handleOrderMarkerMouseEnter = useCallback(
    (_event: MouseEvent, order: Order) => {
      setHovered(order.client_id, 'map')
    },
    [setHovered],
  )

  const handleOrderMarkerMouseLeave = useCallback(() => {
    clearHovered('map')
  }, [clearHovered])

  const handleGroupMarkerMouseEnter = useCallback(
    (_event: MouseEvent, groupedOrders: Order[]) => {
      setHoveredMany(
        groupedOrders.map((order) => order.client_id),
        'map',
      )
    },
    [setHoveredMany],
  )

  const handleGroupMarkerMouseLeave = useCallback(() => {
    clearHovered('map')
  }, [clearHovered])

  const handleMarkerClientIdsMouseEnter = useCallback(
    (_event: MouseEvent, clientIds: string[]) => {
      setHoveredMany(clientIds, 'map')
    },
    [setHoveredMany],
  )

  const handleMarkerClientIdsMouseLeave = useCallback(() => {
    clearHovered('map')
  }, [clearHovered])

  const handleGroupMarkerClick = useCallback(
    ({ markerId, markerAnchorEl, orders: groupedOrders }: {
      markerId: string
      markerAnchorEl: HTMLElement
      orders: Order[]
    }) => {
      openGroupOverlay({
        markerId,
        markerAnchorEl,
        orderClientIds: groupedOrders.map((order) => order.client_id),
      })
    },
    [openGroupOverlay],
  )
  

  useOrderMapDataFlow({
    query,
    bootstrapOrders: orders,
    onMarkerClick: orderActions.handleOrderMarkerClick,
    onGroupMarkerClick: handleGroupMarkerClick,
    onGroupMarkerMouseEnter: handleGroupMarkerMouseEnter,
    onGroupMarkerMouseLeave: handleGroupMarkerMouseLeave,
    onMarkerClientIdsMouseEnter: handleMarkerClientIdsMouseEnter,
    onMarkerClientIdsMouseLeave: handleMarkerClientIdsMouseLeave,
    onMarkerMouseEnter: handleOrderMarkerMouseEnter,
    onMarkerMouseLeave: handleOrderMarkerMouseLeave,
    markerClassName: 'order-marker',
    visible: !baseControlls.isBaseOpen,
    refreshEnabled: !isFixtureMode,
  })
  useOrderDriverLiveMapFlow()
  useOrderCircleSelectionFlow()

  useEffect(() => {
    const markerId = activeOrderDetailClientId
      ? markerLookup.markerIdByOrderClientId[activeOrderDetailClientId] ?? activeOrderDetailClientId
      : null
    mapManager.setSelectedMarker(markerId)
  }, [activeOrderDetailClientId, mapManager, markerLookup.markerIdByOrderClientId])

  useEffect(() => {
    const markerId = hoveredClientId
      ? markerLookup.markerIdByOrderClientId[hoveredClientId] ?? hoveredClientId
      : null
    mapManager.setHoveredMarker(markerId)
  }, [hoveredClientId, mapManager, markerLookup.markerIdByOrderClientId])

  useEffect(() => {
    if (!isSelectionMode) {
      mapManager.setMultiSelectedMarkerIds(MAP_MARKER_LAYERS.orders, [])
      return
    }

    const markerIds = Array.from(
      new Set(
        selectedOrderClientIds
          .map((clientId) => markerLookup.markerIdByOrderClientId[clientId] ?? null)
          .filter((markerId): markerId is string => typeof markerId === 'string' && markerId.length > 0),
      ),
    )

    mapManager.setMultiSelectedMarkerIds(MAP_MARKER_LAYERS.orders, markerIds)
  }, [
    isSelectionMode,
    mapManager,
    markerLookup.markerIdByOrderClientId,
    selectedOrderClientIds,
  ])

  useEffect(() => {
    void loadFirstPage()
  }, [loadFirstPage])

  useEffect(() => {
    return () => {
      useOrderSelectionStore.getState().disableSelectionMode()
      useOrderGroupUIStore.getState().clearGroupUI()
      closeGroupOverlay()
    }
  }, [closeGroupOverlay])

  useEffect(() => {
    if (baseControlls.isBaseOpen) {
      closeGroupOverlay()
    }
  }, [baseControlls.isBaseOpen, closeGroupOverlay])

  useEffect(() => {
    const teamIdRaw = (
      session?.identity?.team_id
      ?? session?.user?.teamId
      ?? null
    )
    const teamId = Number.isFinite(Number(teamIdRaw)) ? Number(teamIdRaw) : null

    if (previousTeamIdRef.current == null) {
      previousTeamIdRef.current = teamId
      return
    }

    if (teamId != null && previousTeamIdRef.current !== teamId) {
      disableSelectionMode()
    }

    previousTeamIdRef.current = teamId
  }, [disableSelectionMode, session?.identity, session?.user?.teamId])

  const isOrderSelected = useCallback((order: Order) => {
    const state = useOrderSelectionStore.getState()
    if (typeof order.id === 'number') {
      if (state.excludedServerIds.includes(order.id)) {
        return false
      }
      return state.manualSelectedServerIds.includes(order.id)
        || state.loadedSelectionIds.includes(order.id)
    }
    return state.manualSelectedClientIds.includes(order.client_id)
  }, [])



  const hasCompletedOrderListLoad = completedOrderListQueryKey != null
  const isInitialLoading = isOrderListLoading && !hasCompletedOrderListLoad
  const isRefreshingOrders = isOrderListLoading && hasCompletedOrderListLoad && isLoadingFirstPage

  const value = useMemo(
    () => ({
      orders,
      orderActions,
      orderSelectionActions,
      isSelectionMode,
      isOrderSelected,
      query,
      orderStats,
      hoveredClientId,
      hoveredClientIds,
      handleOrderRowMouseEnter,
      handleOrderRowMouseLeave,
      currentPage,
      hasMorePages: hasMore,
      isInitialLoading,
      isRefreshingOrders,
      isLoadingNextPage,
      loadNextPage,
    }),
    [
      completedOrderListQueryKey,
      currentPage,
      handleOrderRowMouseEnter,
      handleOrderRowMouseLeave,
      handleGroupMarkerMouseEnter,
      handleGroupMarkerMouseLeave,
      hasMore,
      hoveredClientId,
      hoveredClientIds,
      isOrderSelected,
      isSelectionMode,
      isInitialLoading,
      isLoadingNextPage,
      isRefreshingOrders,
      loadNextPage,
      orderActions,
      orderSelectionActions,
      orderStats,
      orders,
      query,
    ],
  )

  return <OrderContextProvider value={value}>{children}</OrderContextProvider>
}
