import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useOrders } from '@/features/order/store/orderHooks.store'
import { useRoutePlanByServerId } from '@/features/plan/store/useRoutePlan.selector'

import { useRouteGroupDerivedResources } from '../flows/routeGroupDerivedResources.flow'
import { useActiveRouteGroupId } from '../store/useActiveRouteGroup.selector'
import { useRouteGroupsByPlanId } from '../store/useRouteGroup.selector'
import {
  useRouteSolutionsByRouteGroupId,
  useSelectedRouteSolutionByRouteGroupId,
} from '../store/useRouteSolution.selector'
import { useRouteSolutionPreviewStore } from '../store/routeSolutionPreview.store'
import {
  selectRouteSolutionStopsBySolutionId,
  useRouteSolutionStopStore,
} from '../store/routeSolutionStop.store'

export const useActiveRouteGroupResourcesController = (planId: number | null) => {
  const plan = useRoutePlanByServerId(planId)
  const routeGroups = useRouteGroupsByPlanId(planId)
  const activeRouteGroupId = useActiveRouteGroupId()
  const routeGroup = routeGroups.find((candidateRouteGroup) => candidateRouteGroup.id === activeRouteGroupId)
    ?? null
  const routeGroupId = routeGroup?.id ?? null
  const allOrders = useOrders()
  const routeSolutions = useRouteSolutionsByRouteGroupId(routeGroupId)
  const previewedSolutionId = useRouteSolutionPreviewStore(
    (state) => state.previewedIdByGroupId[routeGroupId ?? -1] ?? null,
  )
  const isLoadingPreview = useRouteSolutionPreviewStore(
    (state) => state.loadingPreviewGroupId === routeGroupId,
  )
  const storedSelectedRouteSolution = useSelectedRouteSolutionByRouteGroupId(routeGroupId)
  const selectedRouteSolution = useMemo(() => {
    if (previewedSolutionId != null) {
      const previewed =
        routeSolutions.find((routeSolution) => routeSolution.id === previewedSolutionId) ?? null
      if (previewed) return previewed
    }
    return storedSelectedRouteSolution ?? routeSolutions[0] ?? null
  }, [previewedSolutionId, routeSolutions, storedSelectedRouteSolution])
  const routeSolutionId = selectedRouteSolution?.id ?? null
  const routeSolutionStops = useRouteSolutionStopStore(
    useShallow(selectRouteSolutionStopsBySolutionId(routeSolutionId)),
  )
  const activeOrderIds = useMemo(() => {
    const orderIds = new Set<number>()
    routeSolutionStops.forEach((routeSolutionStop) => {
      if (typeof routeSolutionStop.order_id === 'number') {
        orderIds.add(routeSolutionStop.order_id)
      }
    })
    return orderIds
  }, [routeSolutionStops])
  const orders = useMemo(
    () =>
      allOrders.filter(
        (order) =>
          typeof order.id === 'number' && activeOrderIds.has(order.id),
      ),
    [activeOrderIds, allOrders],
  )
  const planStartDate = plan?.start_date ?? null

  const {
    planState,
    routeGroupState,
    routeSolutionsOrdered,
    bestRouteSolutionId,
    isSelectedSolutionOptimized,
    stopByOrderId,
    ordersById,
    boundaryLocations,
  } = useRouteGroupDerivedResources({
    plan: plan ?? null,
    routeGroupStateId: routeGroup?.state_id ?? null,
    orders,
    routeSolutions,
    routeSolutionStops,
    selectedRouteSolution,
  })

  return {
    plan,
    planState,
    routeGroupState,
    planStartDate,
    routeGroups,
    activeRouteGroupId,
    routeGroup,
    routeGroupId,
    orders,
    orderCount: Math.max(0, routeGroup?.total_orders ?? orders.length),
    routeSolutions,
    routeSolutionsOrdered,
    previewedSolutionId,
    isLoadingPreview,
    storedSelectedRouteSolutionId: storedSelectedRouteSolution?.id ?? null,
    selectedRouteSolution,
    routeSolutionId,
    routeSolutionStops,
    bestRouteSolutionId,
    isSelectedSolutionOptimized,
    stopByOrderId,
    ordersById,
    boundaryLocations,
  }
}
