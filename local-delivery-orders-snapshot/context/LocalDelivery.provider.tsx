import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { useLocalDeliveryActions } from '@/features/local-delivery-orders/actions/useLocalDeliveryActions'

import { useLocalDeliveryMapFlow } from '../flows/localDeliveryMap.flow'
import { useLocalDeliveryCircleSelectionFlow } from '../flows/localDeliveryCircleSelection.flow'
import { useLocalDeliveryResourcesFlow } from '../flows/localDeliveryResources.flow'
import { useLocalDeliveryDerivedFlow } from '../flows/localDeliveryDerived.flow'
import { useLocalDeliveryBootstrapFlow } from '../flows/localDeliveryBootstrap.flow'
import { useLocalDeliveryEscapeFlow } from '../flows/localDeliveryEscape.flow'

import {
  LocalDeliveryCommandsContext,
  LocalDeliveryStateContext,
  type LocalDeliveryCommandsContextValue,
  type LocalDeliveryStateContextValue,
} from './LocalDelivery.context'
import { useMobile } from '@/app/contexts/MobileContext'
import { useBaseControlls, usePopupManager, useSectionManager } from '@/shared/resource-manager/useResourceManager'
import { useRouteSolutionWarningRegistry } from '@/features/local-delivery-orders/hooks/useRouteSolutionWarningRegistry'
import { useLoadingController } from '../controllers/useLoadingController'
import type { PayloadBase } from '@/features/home-route-operations/types/types'

type LocalDeliveryProviderProps = {
  planId: number
  children: ReactNode
}

export function LocalDeliveryProvider({ planId, children }: LocalDeliveryProviderProps) {
  const { isMobile } = useMobile()
  const sectionManager = useSectionManager()
  const popupManager = usePopupManager()
  const baseControls = useBaseControlls<PayloadBase>()
  
  const isLocalDeliveryActive =
    baseControls.isBaseOpen && baseControls.payload?.ordersPlanType === 'local_delivery'

  const {
    plan,
    planStartDate,
    localDeliveryPlan,
    orders,
    localDeliveryPlanId,
    routeSolutions,
    selectedRouteSolution,
    routeSolutionId,
    routeSolutionStops,
  } = useLocalDeliveryResourcesFlow(planId)

  const {
    planState,
    routeSolutionsOrdered,
    bestRouteSolutionId,
    isSelectedSolutionOptimized,
    stopByOrderId,
    ordersById,
    boundaryLocations,
  } = useLocalDeliveryDerivedFlow({
    plan: plan ?? null,
    orders,
    routeSolutions,
    routeSolutionStops,
    selectedRouteSolution: selectedRouteSolution ?? null,
  })

  const loadingController = useLoadingController({
    localDeliveryClientId: localDeliveryPlan?.client_id,
  })

  const routeSolutionWarningRegistry = useRouteSolutionWarningRegistry()
  
  const localDeliveryActions = useLocalDeliveryActions({
    localDeliveryPlanId,
    planId: plan?.id ?? planId,
    plan: plan ?? null,
    localDeliveryPlan: localDeliveryPlan ?? null,
    selectedRouteSolution: selectedRouteSolution ?? null,
    isSelectedSolutionOptimized,
    loadingController,
  })

  useLocalDeliveryMapFlow({
    orders,
    stopByOrderId,
    selectedRouteSolution,
    isActive: isLocalDeliveryActive,
    boundaryLocations,
  })
  useLocalDeliveryCircleSelectionFlow(isLocalDeliveryActive)

  useLocalDeliveryBootstrapFlow(planId, baseControls.payload?.freshAfter ?? null)
  useLocalDeliveryEscapeFlow({
    isMobile,
    baseControls,
    popupManager,
    sectionManager,
  })
  
  const stateValue = useMemo<LocalDeliveryStateContextValue>(
    () => ({
      planId,
      plan: plan ?? null,
      planState,
      localDeliveryPlan: localDeliveryPlan ?? null,
      localDeliveryPlanId,
      planStartDate,
      orders,
      orderCount: orders.length,
      stopByOrderId,
      ordersById,
      selectedRouteSolution: selectedRouteSolution ?? null,
      routeSolutionsOrdered,
      bestRouteSolutionId,
      isSelectedSolutionOptimized,
      routeSolutionId,
      routeSolutionStops,
      boundaryLocations,
      routeSolutionWarningRegistry,
    }),
    [
      planId,
      plan,
      planState,
      localDeliveryPlan,
      localDeliveryPlanId,
      planStartDate,
      orders,
      stopByOrderId,
      ordersById,
      selectedRouteSolution,
      routeSolutionsOrdered,
      bestRouteSolutionId,
      isSelectedSolutionOptimized,
      routeSolutionId,
      routeSolutionStops,
      boundaryLocations,
      routeSolutionWarningRegistry,
    ],
  )

  const commandsValue = useMemo<LocalDeliveryCommandsContextValue>(
    () => ({
      localDeliveryActions,
      loadingController,
    }),
    [
      localDeliveryActions,
      loadingController,
    ],
  )

  return (
    <LocalDeliveryStateContext.Provider value={stateValue}>
      <LocalDeliveryCommandsContext.Provider value={commandsValue}>
        {children}
      </LocalDeliveryCommandsContext.Provider>
    </LocalDeliveryStateContext.Provider>
  )
}
