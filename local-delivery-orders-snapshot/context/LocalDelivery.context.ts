import { createContext } from 'react'


import type { Order } from '@/features/order/types/order'
import type { DeliveryPlan } from '@/features/plan/types/plan'
import type { LocalDeliveryPlan } from '../types/localDeliveryPlan'
import type { RouteSolution } from '../types/routeSolution'
import type { RouteSolutionStop } from '../types/routeSolutionStop'
import type { useLocalDeliveryActions } from '../actions/useLocalDeliveryActions'
import type { DeliveryPlanState } from '@/features/plan/types/planState'
import type { BoundaryLocationMeta } from '@/features/local-delivery-orders/domain/getLocalDeliveryBoundaryLocations'
import type { RouteSolutionWarningRegistry } from '@/features/local-delivery-orders/domain/routeSolutionWarningRegistry'
import type { useLoadingController } from '../controllers/useLoadingController'

export type LocalDeliveryStateContextValue = {
  planId: number
  plan: DeliveryPlan | null
  planState: DeliveryPlanState | null
  localDeliveryPlan: LocalDeliveryPlan | null
  localDeliveryPlanId: number | null
  planStartDate: string | null
  orders: Order[]
  orderCount:number
  stopByOrderId: Map<number, RouteSolutionStop>
  ordersById: Map<number, Order>
  selectedRouteSolution: RouteSolution | null
  routeSolutionsOrdered: RouteSolution[]
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

export type LocalDeliveryCommandsContextValue = {
  localDeliveryActions: ReturnType<typeof useLocalDeliveryActions>
  loadingController: ReturnType<typeof useLoadingController>
}

export type LocalDeliveryContextValue = LocalDeliveryStateContextValue & LocalDeliveryCommandsContextValue

export const LocalDeliveryStateContext = createContext<LocalDeliveryStateContextValue | null>(null)
export const LocalDeliveryCommandsContext = createContext<LocalDeliveryCommandsContextValue | null>(null)
