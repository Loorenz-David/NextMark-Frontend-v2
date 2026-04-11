
import { useMemo, useRef } from 'react'

import { useOrderActions } from '@/features/order'
import { useDownloadTemplateByEventFlow } from '@/features/templates/printDocument/flows'
import { serializeRouteSolutionForTemplate } from '@/features/local-delivery-orders/domain/serializeRouteSolutionForTemplate'
import { buildRouteOptimizationPayload } from '@/features/local-delivery-orders/domain/buildRouteOptimizationPayload'
import { usePopupManager, useSectionManager } from '@/shared/resource-manager/useResourceManager'
import { useRouteOptimizationMutations } from '../controllers/routeOptimization.controller'
import { useRouteSolutionMutations } from '../controllers/routeSolution.controller'
import { useLocalDeliveryPlanSettingsMutations } from '@/features/local-delivery-orders/controllers/localDeliveryPlanSettings.controller'
import type { DeliveryPlan } from '@/features/plan/types/plan'
import type { RouteSolution, RouteSolutionWarning } from '@/features/local-delivery-orders/types/routeSolution'
import type { LocalDeliveryPlan } from '@/features/local-delivery-orders/types/localDeliveryPlan'
import { createRouteWarningActionRegistry } from './routeWarningActionRegistry'
import { useMessageHandler } from '@shared-message-handler'
import type { useLoadingController } from '../controllers/useLoadingController'
import { MIN_LOADER_VISIBLE_MS } from '../constants/optimization.constants'


type Props = {
  localDeliveryPlanId?: number | null
  planId?: number | null
  plan?: DeliveryPlan | null
  localDeliveryPlan?: LocalDeliveryPlan | null
  selectedRouteSolution?: RouteSolution | null
  isSelectedSolutionOptimized?: boolean
  loadingController: ReturnType<typeof useLoadingController>
}



const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })

export const useLocalDeliveryActions = ({
  localDeliveryPlanId,
  planId,
  plan,
  localDeliveryPlan,
  selectedRouteSolution,
  isSelectedSolutionOptimized = false,
  loadingController,
}: Props) => {
  const popupManager = usePopupManager()
  const sectionManager = useSectionManager()
  const {openOrderForm} = useOrderActions()
  const { routeReadyForDelivery, selectRouteSolution: selectRouteSolutionMutation } = useRouteSolutionMutations()
  const { createOptimization, updateOptimization } = useRouteOptimizationMutations()
  const { updateLocalDeliverySettings } = useLocalDeliveryPlanSettingsMutations()
  const { showMessage } = useMessageHandler()
  const { downloadByEvent } = useDownloadTemplateByEventFlow()
  const optimizationInFlightRef = useRef(0)
  const routeWarningActionRegistry = useMemo(
    () => createRouteWarningActionRegistry(),
    [],
  )

  const withOptimizationLoader = async (task: () => Promise<boolean>): Promise<boolean> => {
    const startedAt = Date.now()
    let keepMinimumVisibleTime = false
    optimizationInFlightRef.current += 1
    if (optimizationInFlightRef.current === 1) {
      loadingController.handleOptimizationLoader(true)
    }

    try {
      const succeeded = await task()
      keepMinimumVisibleTime = succeeded
      return succeeded
    } finally {
      if (keepMinimumVisibleTime) {
        const elapsed = Date.now() - startedAt
        const remaining = Math.max(MIN_LOADER_VISIBLE_MS - elapsed, 0)
        if (remaining > 0) {
          await wait(remaining)
        }
      }

      optimizationInFlightRef.current = Math.max(optimizationInFlightRef.current - 1, 0)
      if (optimizationInFlightRef.current === 0) {
        loadingController.handleOptimizationLoader(false)
      }
    }
  }
  
  const handleCreateOrder = () => {
    openOrderForm({
      mode:'create',
      deliveryPlanId:planId
    })
  }
  const handleEditLocalPlan = () => {
    popupManager.open({
      key: 'LocalDeliveryEditForm',
      payload: { localDeliveryPlanId: localDeliveryPlanId },
    })
  }

  const handleOpenRouteStats = () => {
    sectionManager.open({
      key: 'RouteGroupStatsPage',
      payload: { localDeliveryPlanId: localDeliveryPlanId, planId:planId },
    })
  }


  const handlePrintRouteSolution = async () => {
    const payload = serializeRouteSolutionForTemplate(planId, localDeliveryPlanId)
    if (!payload) return

    await downloadByEvent({
      channel: 'route',
      event: 'route_solution_for_printing',
      data: payload,
      fileName: `route-${payload.plan_date ?? 'plan'}.pdf`,
    })
  }
  const routeReadyForDeliveryAction = async ()=>{
    if(!planId) return
    await routeReadyForDelivery(planId)
  }

  const optimizeRoute = async () => {
    const payload = buildRouteOptimizationPayload({
      plan,
      localDeliveryPlan,
      selectedRouteSolution: selectedRouteSolution ?? null,
    })
    if (!payload) return

    await withOptimizationLoader(async () => {
      if (isSelectedSolutionOptimized) {
        const response = await updateOptimization(payload)
        return response != null
      }
      const response = await createOptimization(payload)
      return response != null
    })
  }

  const reOptimizeRoute = async () => {
    const payload = buildRouteOptimizationPayload({
      plan,
      localDeliveryPlan,
      selectedRouteSolution: selectedRouteSolution ?? null,
    })
    if (!payload) return

    await withOptimizationLoader(async () => {
      const response = await createOptimization(payload)
      return response != null
    })
  }

  const selectRouteSolution = (solutionId: number) => {
    if (!localDeliveryPlanId) return
    void selectRouteSolutionMutation(solutionId, localDeliveryPlanId)
  }

  const resolveRouteWarnings = async (warnings: RouteSolutionWarning[]) => {
    const warningList = Array.isArray(warnings) ? warnings : []
    if (warningList.length === 0) return false

    let hasSuccess = false
    for (const warning of warningList) {
      const warningType = warning?.type
      if (typeof warningType !== 'string') continue
      const handler = routeWarningActionRegistry[warningType]
      if (!handler) continue

      const didResolve = await handler(warning, {
        localDeliveryPlanId,
        plan,
        selectedRouteSolution,
        updateLocalDeliverySettings,
      })
      if (didResolve) {
        hasSuccess = true
      }
    }

    if (!hasSuccess) {
      showMessage({
        status: 'warning',
        message: 'No route warnings could be resolved with this action.',
      })
    }
    return hasSuccess
  }


  return {
    handleOpenRouteStats,
    handleCreateOrder,
    handleEditLocalPlan,
    handlePrintRouteSolution,
    routeReadyForDelivery: routeReadyForDeliveryAction,
    optimizeRoute,
    reOptimizeRoute,
    selectRouteSolution,
    resolveRouteWarnings,
  }
}
