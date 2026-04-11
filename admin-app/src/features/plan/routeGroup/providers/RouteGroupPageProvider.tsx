import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { useRouteGroupPageInitializationFlow } from '../flows/routeGroupPageInitialization.flow'
import { useRouteGroupPageEscapeFlow } from '../flows/routeGroupPageEscape.flow'
import { useRouteGroupPageResourcesController } from '../controllers/useRouteGroupPageResources.controller'
import { useRouteGroupPageCommandsController } from '../controllers/useRouteGroupPageCommands.controller'
import { useSyncActiveRouteGroupSelectionFlow } from '../flows/syncActiveRouteGroupSelection.flow'
import { useSyncActiveRouteSolutionSelectionFlow } from '../flows/syncActiveRouteSolutionSelection.flow'
import { useActiveRouteGroupDetailsHydrationFlow } from '../flows/activeRouteGroupDetailsHydration.flow'
import { useSyncActiveRouteGroupZonePreviewFlow } from '../flows/syncActiveRouteGroupZonePreview.flow'
import {
  selectRouteGroupZonePreviewMode,
  useRouteGroupZonePreviewStore,
} from '../store/routeGroupZonePreview.store'

import {
  RouteGroupPageCommandsContext,
  RouteGroupPageStateContext,
  type RouteGroupPageCommandsContextValue,
  type RouteGroupPageStateContextValue,
} from '../context/RouteGroupPage.context'
import { useMobile } from '@/app/contexts/MobileContext'
import { useBaseControlls, usePopupManager, useSectionManager } from '@/shared/resource-manager/useResourceManager'
import type { PayloadBase } from '@/features/home-route-operations/types/types'

type RouteGroupPageProviderProps = {
  planId: number | null
  freshAfter?: string | null
  children: ReactNode
}

export function RouteGroupPageProvider({
  planId,
  freshAfter,
  children,
}: RouteGroupPageProviderProps) {
  const { isMobile } = useMobile()
  const sectionManager = useSectionManager()
  const popupManager = usePopupManager()
  const baseControls = useBaseControlls<PayloadBase>()
  const {
    plan,
    planState,
    routeGroupState,
    planStartDate,
    routeGroups,
    activeRouteGroupId,
    routeGroup,
    orders,
    orderCount,
    routeGroupId,
    routeSolutions,
    routeSolutionsOrdered,
    previewedSolutionId,
    isLoadingPreview,
    selectedRouteSolution,
    routeSolutionId,
    routeSolutionStops,
    bestRouteSolutionId,
    isSelectedSolutionOptimized,
    stopByOrderId,
    ordersById,
    boundaryLocations,
    storedSelectedRouteSolutionId,
    loadingController,
    routeSolutionWarningRegistry,
  } = useRouteGroupPageResourcesController(planId)
  const previewMode = useRouteGroupZonePreviewStore(
    selectRouteGroupZonePreviewMode,
  )
  const hasActiveZonePreview = routeGroup?.zone_snapshot?.geometry != null
  const hasAnyZonePreview = routeGroups.some(
    (candidateRouteGroup) =>
      candidateRouteGroup.zone_snapshot?.geometry != null,
  )

  useSyncActiveRouteGroupSelectionFlow({
    planId,
    routeGroups,
    activeRouteGroupId,
  })
  useSyncActiveRouteSolutionSelectionFlow({
    routeGroupId: routeGroupId,
    routeSolutions,
    storedSelectedRouteSolutionId,
    fallbackRouteSolutionId: routeSolutionId,
  })
  useActiveRouteGroupDetailsHydrationFlow({
    planId,
    routeGroup: routeGroup ?? null,
    selectedRouteSolution: selectedRouteSolution ?? null,
    routeSolutionStops,
  })
  useSyncActiveRouteGroupZonePreviewFlow({
    planId,
    previewMode,
    hasActiveZonePreview,
    hasAnyZonePreview,
  })

  const { routeGroupPageActions, loadingController: commandLoadingController } = useRouteGroupPageCommandsController({
    routeGroupId,
    planId: plan?.id ?? planId,
    plan: plan ?? null,
    routeGroup: routeGroup ?? null,
    selectedRouteSolution: selectedRouteSolution ?? null,
    isSelectedSolutionOptimized,
    loadingController,
  })

  useRouteGroupPageInitializationFlow(
    planId,
    freshAfter ?? baseControls.payload?.freshAfter ?? null,
  )
  useRouteGroupPageEscapeFlow({
    isMobile,
    baseControls,
    popupManager,
    sectionManager,
  })
  
  const stateValue = useMemo<RouteGroupPageStateContextValue>(
    () => ({
      planId,
      plan: plan ?? null,
      planState,
      routeGroupState,
      routeGroups,
      routeGroup: routeGroup ?? null,
      routeGroupId,
      planStartDate,
      orders,
      orderCount,
      stopByOrderId,
      ordersById,
      selectedRouteSolution: selectedRouteSolution ?? null,
      routeSolutionsOrdered,
      previewedSolutionId,
      isLoadingPreview,
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
      routeGroupState,
      routeGroups,
      routeGroup,
      routeGroupId,
      planStartDate,
      orders,
      orderCount,
      stopByOrderId,
      ordersById,
      selectedRouteSolution,
      routeSolutionsOrdered,
      previewedSolutionId,
      isLoadingPreview,
      bestRouteSolutionId,
      isSelectedSolutionOptimized,
      routeSolutionId,
      routeSolutionStops,
      boundaryLocations,
      routeSolutionWarningRegistry,
    ],
  )

  const commandsValue = useMemo<RouteGroupPageCommandsContextValue>(
    () => ({
      routeGroupPageActions,
      loadingController: commandLoadingController,
    }),
    [
      routeGroupPageActions,
      commandLoadingController,
    ],
  )

  return (
    <RouteGroupPageStateContext.Provider value={stateValue}>
      <RouteGroupPageCommandsContext.Provider value={commandsValue}>
        {children}
      </RouteGroupPageCommandsContext.Provider>
    </RouteGroupPageStateContext.Provider>
  )
}
