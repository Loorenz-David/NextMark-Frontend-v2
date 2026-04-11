import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import {
  buildOrderDriverLocationMarkers,
  resolveActiveRouteContextByDriverId,
  selectDriverLivePositions,
  selectDriverLiveVisibility,
  useDriverLiveMarkerOverlayStore,
  useDriverLiveStore,
  useDriverLiveVisibilityStore,
} from '@/realtime/driverLive'
import { usePlanQueries } from '@/features/plan/flows/planQueries.flow'
import { useRouteGroupDetailsFlow } from '@/features/plan/routeGroup/flows/routeGroupDetails.flow'
import { useRouteGroupOverviewFlow } from '@/features/plan/routeGroup/flows/routeGroupOverview.flow'
import {
  rememberRouteGroupForPlan,
  setActiveRouteGroupId,
} from '@/features/plan/routeGroup/store/activeRouteGroup.store'
import { selectRouteGroupByServerId, useRouteGroupStore } from '@/features/plan/routeGroup/store/routeGroup.slice'
import { useRouteGroups } from '@/features/plan/routeGroup/store/useRouteGroup.selector'
import { useRouteSolutions } from '@/features/plan/routeGroup/store/useRouteSolution.selector'
import { selectRoutePlanByServerId, useRoutePlanStore } from '@/features/plan/store/routePlan.slice'
import type { PayloadBase } from '@/features/home-route-operations/types/types'
import { MAP_MARKER_LAYERS } from '@/shared/map'
import { useBaseControlls, useMapManager } from '@/shared/resource-manager/useResourceManager'

export const useOrderDriverLiveMapFlow = () => {
  const mapManager = useMapManager()
  const baseControls = useBaseControlls<PayloadBase>()
  const isBaseOpen = baseControls.isBaseOpen
  const openBase = baseControls.openBase
  const liveDriverPositions = useDriverLiveStore(useShallow(selectDriverLivePositions))
  const routeSolutions = useRouteSolutions()
  const routeGroups = useRouteGroups()
  const isDriverLiveVisible = useDriverLiveVisibilityStore(selectDriverLiveVisibility)
  const { fetchPlanById } = usePlanQueries()
  const { fetchRouteGroupOverview } = useRouteGroupOverviewFlow()
  const { fetchRouteGroupDetails } = useRouteGroupDetailsFlow()

  useEffect(() => {
    const { openOverlay, closeOverlay } = useDriverLiveMarkerOverlayStore.getState()

    const markers = buildOrderDriverLocationMarkers({
      positions: liveDriverPositions,
      resolveRouteContextByDriverId: (driverId) =>
        resolveActiveRouteContextByDriverId({
          driverId,
          routeSolutions,
          routeGroups,
        }),
      onResolvedRouteContextClick: async (context) => {
        const storedPlan = selectRoutePlanByServerId(context.planId)(useRoutePlanStore.getState())
        if (!storedPlan) {
          await fetchPlanById(context.planId)
        }

        const storedRouteGroup = selectRouteGroupByServerId(context.routeGroupId)(
          useRouteGroupStore.getState(),
        )

        if (!storedRouteGroup) {
          const overviewPayload = await fetchRouteGroupOverview(context.planId)
          const resolvedRouteGroup = selectRouteGroupByServerId(context.routeGroupId)(
            useRouteGroupStore.getState(),
          )

          if (!resolvedRouteGroup && overviewPayload) {
            await fetchRouteGroupDetails(context.planId, context.routeGroupId)
          }
        }

        setActiveRouteGroupId(context.routeGroupId)
        rememberRouteGroupForPlan(context.planId, context.routeGroupId)

        openBase({
          payload: {
            planId: context.planId,
          },
        })
      },
      onMouseEnter: (event, position) => {
        const markerAnchorEl = event.currentTarget as HTMLElement | null
        if (!markerAnchorEl) return

        openOverlay({
          markerId: `driver-live:orders:${position.driver_id}`,
          markerAnchorEl,
          position,
        })
      },
      onMouseLeave: () => {
        closeOverlay()
      },
    })

    mapManager.setMarkerLayer(MAP_MARKER_LAYERS.driverLiveOrders, markers)
    mapManager.setMarkerLayerVisibility(
      MAP_MARKER_LAYERS.driverLiveOrders,
      !isBaseOpen && isDriverLiveVisible,
    )

    if (isBaseOpen || !isDriverLiveVisible) {
      closeOverlay()
    }
  }, [
    isDriverLiveVisible,
    isBaseOpen,
    liveDriverPositions,
    routeGroups,
    mapManager,
    openBase,
    fetchPlanById,
    fetchRouteGroupDetails,
    fetchRouteGroupOverview,
    routeSolutions,
  ])

  useEffect(() => {
    return () => {
      mapManager.clearMarkerLayer(MAP_MARKER_LAYERS.driverLiveOrders)
      useDriverLiveMarkerOverlayStore.getState().closeOverlay()
    }
  }, [mapManager])
}
