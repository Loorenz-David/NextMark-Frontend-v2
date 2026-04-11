import { useEffect, useRef, useState } from 'react'
import { useMobile } from '@/app/contexts/MobileContext'
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core'
import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import type { Order } from '@/features/order/types/order'
import { useOrderSelectionStore } from '@/features/order/store/orderSelection.store'
import { buildBatchSelectionPayload } from '@/features/order/store/orderSelectionHooks.store'
import { resolveSelectionAuthorityBatchCount } from '@/features/order/domain/orderBatchTargetIds'
import type { RouteSolutionStop } from '@/features/local-delivery-orders/types/routeSolutionStop'
import { useMessageHandler } from '@shared-message-handler'

import { useExecutePlanDndIntent } from '@/features/local-delivery-orders/controllers/useExecutePlanDndIntent'
import type { PlanDndIntent } from '@/features/local-delivery-orders/domain/planDndIntent'
import { resolveDropIntent, type RouteReorderPreview } from '@/features/local-delivery-orders/dnd/controller/resolveDropIntent'
import { resolveRouteSolutionPlanClientId } from '@/features/local-delivery-orders/dnd/domain/resolveRouteSolutionPlanClientId'
import type { PlanDropFeedback } from '@/shared/resource-manager/ResourceManagerContext'
import {
  selectRouteSolutionStopsBySolutionId,
  useRouteSolutionStopStore,
} from '@/features/local-delivery-orders/store/routeSolutionStop.store'

const MAX_BATCH_IDS = 200

export type ActiveDrag =
  | { type: 'order'; order: Order }
  | { type: 'order_batch'; order: Order; selectedCount: number; isLoading: boolean }
  | { type: 'order_group'; order: Order; count: number; label: string }
  | {
      type: 'route_stop'
      order: Order
      stop: RouteSolutionStop
      routeStopClientId: string
      planStartDate?: string | null
    }
  | {
      type: 'route_stop_group'
      order: Order
      stop: RouteSolutionStop
      count: number
      label: string
      firstStopOrder?: number | null
      lastStopOrder?: number | null
      planStartDate?: string | null
    }
  | null

export const usePlanOrderDndController = () => {
  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null)
  const [planDropFeedback, setPlanDropFeedback] = useState<PlanDropFeedback | null>(null)
  const [routeReorderPreview, setRouteReorderPreview] = useState<RouteReorderPreview | null>(null)
  const pendingIntentRef = useRef<PlanDndIntent>(null)
  const routeDragSnapshotRef = useRef<{
    routeSolutionId: number
    orderedStopClientIds: string[]
  } | null>(null)
  const dropFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { isMobile } = useMobile()
  const { showMessage } = useMessageHandler()
  const { execute } = useExecutePlanDndIntent()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: isMobile ? { distance: 10 } : { distance: 6 },
    }),
  )

  const setPlanDropFeedbackWithTimeout = (feedback: PlanDropFeedback, timeoutMs = 900) => {
    if (dropFeedbackTimeoutRef.current) {
      clearTimeout(dropFeedbackTimeoutRef.current)
    }
    setPlanDropFeedback(feedback)
    dropFeedbackTimeoutRef.current = setTimeout(() => {
      setPlanDropFeedback(null)
      dropFeedbackTimeoutRef.current = null
    }, timeoutMs)
  }

  useEffect(() => {
    return () => {
      if (dropFeedbackTimeoutRef.current) {
        clearTimeout(dropFeedbackTimeoutRef.current)
      }
      document.body.style.cursor = ''
    }
  }, [])

  const clearPendingDrop = () => {
    pendingIntentRef.current = null
    setRouteReorderPreview(null)
  }

  const readOrderedStopClientIds = (routeSolutionId: number): string[] => {
    if (
      routeDragSnapshotRef.current
      && routeDragSnapshotRef.current.routeSolutionId === routeSolutionId
      && routeDragSnapshotRef.current.orderedStopClientIds.length
    ) {
      return routeDragSnapshotRef.current.orderedStopClientIds
    }

    return selectRouteSolutionStopsBySolutionId(routeSolutionId)(useRouteSolutionStopStore.getState())
      .sort((a, b) => {
        const left = typeof a.stop_order === 'number' ? a.stop_order : Number.POSITIVE_INFINITY
        const right = typeof b.stop_order === 'number' ? b.stop_order : Number.POSITIVE_INFINITY
        return left - right
      })
      .map((stop) => stop.client_id)
  }

  const resetDragUi = () => {
    document.body.style.cursor = ''
    routeDragSnapshotRef.current = null
    clearPendingDrop()
    setActiveDrag(null)
  }

  const isOrderSelectedForBatch = (
    order: Order | null | undefined,
    state: ReturnType<typeof useOrderSelectionStore.getState>,
  ) => {
    if (!order) return false
    if (typeof order.id === 'number') {
      if (state.excludedServerIds.includes(order.id)) {
        return false
      }
      return state.manualSelectedServerIds.includes(order.id)
        || state.loadedSelectionIds.includes(order.id)
    }
    return state.manualSelectedClientIds.includes(order.client_id)
  }

  const hasSelectionIntent = (state: ReturnType<typeof useOrderSelectionStore.getState>) =>
    state.manualSelectedServerIds.some((id) => !state.excludedServerIds.includes(id))
    || state.selectAllSnapshots.length > 0

  const buildManualBatchSelection = (orderIds: number[]) => ({
    manual_order_ids: orderIds.filter((id) => Number.isFinite(id) && id > 0),
    select_all_snapshots: [],
    excluded_order_ids: [],
    source: 'group' as const,
  })

  const resolveOptimisticMovedCount = (
    intent: Exclude<PlanDndIntent, null>,
    selectionState: ReturnType<typeof useOrderSelectionStore.getState>,
  ): number => {
    if (intent.kind === 'ASSIGN_ORDER_TO_PLAN') {
      return 1
    }
    if (intent.kind !== 'ASSIGN_ORDERS_TO_PLAN_BATCH') {
      return 0
    }

    const source = intent.selection.source
    if (source === 'selection') {
      return resolveSelectionAuthorityBatchCount(selectionState)
    }

    // Manual/group fallback only.
    return intent.selection.manual_order_ids.length
  }

  const getAssignIntentPlanClientId = (intent: Exclude<PlanDndIntent, null>): string | null => {
    if (intent.kind === 'ASSIGN_ORDER_TO_PLAN' || intent.kind === 'ASSIGN_ORDERS_TO_PLAN_BATCH') {
      return intent.planClientId
    }
    return null
  }

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event
    document.body.style.cursor = 'grabbing'
    clearPendingDrop()

    const activeData = active.data.current
    const routeSolutionId = Number(
      activeData?.routeSolutionId
      ?? activeData?.stop?.route_solution_id
      ?? NaN,
    )
    if (Number.isFinite(routeSolutionId) && routeSolutionId > 0) {
      routeDragSnapshotRef.current = {
        routeSolutionId,
        orderedStopClientIds: readOrderedStopClientIds(routeSolutionId),
      }
    }

    if (active.data.current?.type === 'order' && active.data.current?.order) {
      const draggedOrder = active.data.current.order as Order
      const selectionState = useOrderSelectionStore.getState()
      if (
        selectionState.isSelectionMode
        && hasSelectionIntent(selectionState)
        && isOrderSelectedForBatch(draggedOrder, selectionState)
      ) {
        setActiveDrag({
          type: 'order_batch',
          order: draggedOrder,
          selectedCount: resolveSelectionAuthorityBatchCount(selectionState),
          isLoading: selectionState.resolvedSelection.isLoading,
        })
      } else {
        setActiveDrag({ type: 'order', order: draggedOrder })
      }
      return
    }
    if (active.data.current?.type === 'order_group' && active.data.current?.order) {
      setActiveDrag({
        type: 'order_group',
        order: active.data.current.order,
        count: Number(active.data.current.orderCount) || 0,
        label: String(active.data.current.label || ''),
      })
      return
    }
    if (active.data.current?.type === 'route_stop' && active.data.current?.order) {
      setActiveDrag({
        type: 'route_stop',
        order: active.data.current.order,
        stop: active.data.current.stop as RouteSolutionStop,
        routeStopClientId: active.id.toString(),
        planStartDate: active.data.current.planStartDate as string | null | undefined,
      })
      return
    }
    if (active.data.current?.type === 'route_stop_group' && active.data.current?.order) {
      setActiveDrag({
        type: 'route_stop_group',
        order: active.data.current.order,
        stop: active.data.current.stop as RouteSolutionStop,
        count: Number(active.data.current.orderCount) || 0,
        label: String(active.data.current.label || ''),
        firstStopOrder: (active.data.current.firstStopOrder as number | null | undefined) ?? null,
        lastStopOrder: (active.data.current.lastStopOrder as number | null | undefined) ?? null,
        planStartDate: active.data.current.planStartDate as string | null | undefined,
      })
    }
  }

  const onDragOver = (event: DragOverEvent) => {
    if (!event.over || !event.active.data.current) {
      clearPendingDrop()
      return
    }

    const activeData = event.active.data.current
    const overData = event.over.data.current
    const activeId = event.active.id ? String(event.active.id) : undefined
    const overId = overData?.id ? String(overData.id) : undefined
    const activeOrderClientId =
      activeData.type === 'order'
        ? (typeof activeData.id === 'string' ? activeData.id : activeId)
        : activeData.type === 'route_stop'
          ? (activeData.order?.client_id as string | undefined)
          : undefined

    const selectionState = useOrderSelectionStore.getState()
    const activeOrder = (activeData?.order as Order | undefined) ?? null
    const selectionModeEnabled = selectionState.isSelectionMode && hasSelectionIntent(selectionState)
    const isActiveOrderSelected = isOrderSelectedForBatch(activeOrder, selectionState)

    const resolved = resolveDropIntent({
      event,
      activeId,
      overId,
      activeOrderClientId,
      selectionState,
      selectionModeEnabled,
      isActiveOrderSelected,
      maxBatchIds: MAX_BATCH_IDS,
      confirmLargeBatch: () => false,
      buildSelectionBatchPayload: buildBatchSelectionPayload,
      buildManualBatchSelection,
      resolvePlanClientIdByRouteSolutionId: resolveRouteSolutionPlanClientId,
      resolveOrderedStopClientIds: readOrderedStopClientIds,
    })

    if (resolved.type !== 'intent' || !resolved.intent) {
      clearPendingDrop()
      return
    }

    pendingIntentRef.current = resolved.intent
    setRouteReorderPreview(resolved.preview ?? null)
  }

  const onDragCancel = () => {
    resetDragUi()
  }

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      resetDragUi()
      return
    }

    const activeData = active.data.current
    const overData = over.data.current
    if (!activeData) {
      resetDragUi()
      return
    }

    const activeId = active.id ? String(active.id) : undefined
    const overId = overData?.id ? String(overData.id) : undefined
    const activeOrderClientId =
      activeData.type === 'order'
        ? (typeof activeData.id === 'string' ? activeData.id : activeId)
        : activeData.type === 'route_stop'
          ? (activeData.order?.client_id as string | undefined)
          : undefined

    let intent: PlanDndIntent = pendingIntentRef.current
    const selectionState = useOrderSelectionStore.getState()
    const activeOrder = (activeData?.order as Order | undefined) ?? null
    const selectionModeEnabled = selectionState.isSelectionMode && hasSelectionIntent(selectionState)
    const isActiveOrderSelected = isOrderSelectedForBatch(activeOrder, selectionState)
    if (!intent) {
      const resolved = resolveDropIntent({
        event,
        activeId,
        overId,
        activeOrderClientId,
        selectionState,
        selectionModeEnabled,
        isActiveOrderSelected,
        maxBatchIds: MAX_BATCH_IDS,
        confirmLargeBatch: () =>
          window.confirm('This action will move more than 200 orders. Continue?'),
        buildSelectionBatchPayload: buildBatchSelectionPayload,
        buildManualBatchSelection,
        resolvePlanClientIdByRouteSolutionId: resolveRouteSolutionPlanClientId,
        resolveOrderedStopClientIds: readOrderedStopClientIds,
      })

      if (resolved.type === 'warning') {
        showMessage({
          status: resolved.status ?? 'warning',
          message: resolved.message,
        })
        resetDragUi()
        return
      }

      if (resolved.type === 'noop' || !resolved.intent) {
        resetDragUi()
        return
      }

      intent = resolved.intent
    }

    const isAssignIntent = intent.kind === 'ASSIGN_ORDER_TO_PLAN' || intent.kind === 'ASSIGN_ORDERS_TO_PLAN_BATCH'
    let optimisticToken = ''

    if (isAssignIntent) {
      const movedCount = resolveOptimisticMovedCount(intent, selectionState)
      optimisticToken = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const planClientId = getAssignIntentPlanClientId(intent)
      if (!planClientId) {
        resetDragUi()
        return
      }
      setPlanDropFeedbackWithTimeout({
        planClientId,
        movedCount,
        status: 'success',
        token: optimisticToken,
      })
    }

    const result = await execute(intent)
    if (isAssignIntent && !result?.success) {
      const planClientId = getAssignIntentPlanClientId(intent)
      if (!planClientId) {
        resetDragUi()
        return
      }
      setPlanDropFeedbackWithTimeout({
        planClientId,
        movedCount: resolveOptimisticMovedCount(intent, selectionState),
        status: 'error',
        token: optimisticToken || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      }, 1200)
    }

    resetDragUi()
  }

  return {
    onDragOver,
    onDragEnd,
    onDragStart,
    onDragCancel,
    sensors,
    planDropFeedback,
    activeDrag,
    routeReorderPreview,
  }
}
