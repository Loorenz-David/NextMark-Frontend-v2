import { createContext } from 'react'


import type { Order } from '@/features/order/types/order'
import type { DeliveryPlan } from '@/features/plan/types/plan'
import type { RouteGroup } from '../types/routeGroup'
import type { RouteSolution } from '../types/routeSolution'
import type { RouteSolutionStop } from '../types/routeSolutionStop'
import type { useRouteGroupPageActions } from '../actions/useRouteGroupPageActions'
import type { DeliveryPlanState } from '@/features/plan/types/planState'
import type { BoundaryLocationMeta } from '@/features/plan/routeGroup/domain/getRouteGroupBoundaryLocations'
import type { RouteSolutionWarningRegistry } from '@/features/plan/routeGroup/domain/routeSolutionWarningRegistry'
import type { useLoadingController } from '../controllers/useLoadingController'

export type RouteGroupPageStateContextValue = {
  planId: number | null
  plan: DeliveryPlan | null
  planState: DeliveryPlanState | null
  routeGroupState: DeliveryPlanState | null
  routeGroups: RouteGroup[]
  routeGroup: RouteGroup | null
  routeGroupId: number | null
  planStartDate: string | null
  orders: Order[]
  orderCount:number
  stopByOrderId: Map<number, RouteSolutionStop>
  ordersById: Map<number, Order>
  selectedRouteSolution: RouteSolution | null
  routeSolutionsOrdered: RouteSolution[]
  previewedSolutionId: number | null
  isLoadingPreview: boolean
  bestRouteSolutionId: number | null
  isSelectedSolutionOptimized: boolean
  routeSolutionId: number | null
  routeSolutionStops: RouteSolutionStop[]
  boundaryLocations: {
    start: BoundaryLocationMeta
    end: BoundaryLocationMeta
  }
  routeSolutionWarningRegistry: RouteSolutionWarningRegistry
}

export type RouteGroupPageCommandsContextValue = {
  routeGroupPageActions: ReturnType<typeof useRouteGroupPageActions>
  loadingController: ReturnType<typeof useLoadingController>
}

export type RouteGroupPageContextValue = RouteGroupPageStateContextValue & RouteGroupPageCommandsContextValue

export const RouteGroupPageStateContext = createContext<RouteGroupPageStateContextValue | null>(null)
export const RouteGroupPageCommandsContext = createContext<RouteGroupPageCommandsContextValue | null>(null)
