import { useEffect, useRef, useState } from "react";
import { useMobile } from "@/app/contexts/MobileContext";
import type {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import {
  useOrderClientFormHandoffController,
  type LinkedDeviceOrderFormAvailability,
  type Order,
} from "@/features/order";
import { useOrderSelectionStore } from "@/features/order/store/orderSelection.store";
import {
  selectOrderByClientId,
  selectOrderByServerId,
  useOrderStore,
} from "@/features/order/store/order.store";
import { buildBatchSelectionPayload } from "@/features/order/store/orderSelectionHooks.store";
import { resolveSelectionAuthorityBatchCount } from "@/features/order/domain/orderBatchTargetIds";
import type { RouteSolutionStop } from "@/features/plan/routeGroup/types/routeSolutionStop";
import { useMessageHandler } from "@shared-message-handler";
import { ORDER_DETAIL_SUBHEADER_SWEEP_EVENT } from "@/features/order/domain/orderDetailHeaderAnimation.events";
import { useOpenCreatePlanFormAction } from "@/features/plan/actions/usePlanActions";
import { resolveCreatePlanOrderIds } from "@/features/plan/dnd/domain/resolveCreatePlanOrderIds";

import { useExecutePlanDndIntent } from "@/features/plan/controllers/useExecutePlanDndIntent";
import type { PlanDndIntent } from "@/features/plan/domain/planDndIntent";
import {
  resolveDropIntent,
  type RouteReorderPreview,
} from "@/features/plan/dnd/controller/resolveDropIntent";
import { resolvePlanIdByRouteGroupId } from "@/features/plan/dnd/domain/resolveRouteGroupPlanId";
import { resolveRouteGroupIdByRouteSolutionId } from "@/features/plan/dnd/domain/resolveRouteSolutionRouteGroupId";
import { resolveRouteSolutionPlanClientId } from "@/features/plan/dnd/domain/resolveRouteSolutionPlanClientId";
import type {
  PlanDropFeedback,
  UnscheduleDropFeedback,
} from "@/shared/resource-manager/ResourceManagerContext";
import {
  selectRouteSolutionStopByClientId,
  selectRouteSolutionStopsBySolutionId,
  useRouteSolutionStopStore,
} from "@/features/plan/routeGroup/store/routeSolutionStop.store";
import { runWithRouteMapRefresh } from "@/features/plan/routeGroup/flows/runWithRouteMapRefresh.flow";
import { usePlanDndContactWarningController } from "@/features/plan/controllers/usePlanDndContactWarning.controller";
import { usePlanObjectiveMismatchController } from "@/features/plan/controllers/usePlanObjectiveMismatchController";
import { resolveAutoCreatePlanType } from "@/features/plan/domain/planObjectiveMismatch.domain";
import { resolvePlanType } from "@/features/plan/domain/planType";
import { resolveBatchTargetOrderIds } from "@/features/order/domain/orderBatchTargetIds";
import type { OrderAssignmentContactWarningDecision } from "@/features/plan/domain/orderAssignmentContactWarning.domain";
import { runPlanDndMoveWithHandoff } from "@/features/plan/flows/runPlanDndMoveWithHandoff.flow";
import {
  selectRoutePlanByClientId,
  useRoutePlanStore,
} from "@/features/plan/store/routePlan.slice";
import {
  useStepSequence,
  type SequenceStep,
} from "@/shared/overlays/stepSequence";

const MAX_BATCH_IDS = 200;

export type ActiveDrag =
  | { type: "order"; order: Order }
  | {
      type: "order_batch";
      selectedCount: number;
      isLoading: boolean;
    }
  | { type: "order_group"; order: Order; count: number; label: string }
  | {
      type: "route_stop";
      order: Order;
      stop: RouteSolutionStop;
      routeStopClientId: string;
      planStartDate?: string | null;
    }
  | {
      type: "route_stop_group";
      order: Order;
      stop: RouteSolutionStop;
      count: number;
      label: string;
      firstStopOrder?: number | null;
      lastStopOrder?: number | null;
      planStartDate?: string | null;
    }
  | null;

export const usePlanOrderDndController = () => {
  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null);
  const [planDropFeedback, setPlanDropFeedback] =
    useState<PlanDropFeedback | null>(null);
  const [unscheduleDropFeedback, setUnscheduleDropFeedback] =
    useState<UnscheduleDropFeedback | null>(null);
  const [routeReorderPreview, setRouteReorderPreview] =
    useState<RouteReorderPreview | null>(null);
  const pendingIntentRef = useRef<PlanDndIntent>(null);
  const routeDragSnapshotRef = useRef<{
    routeSolutionId: number;
    orderedStopClientIds: string[];
  } | null>(null);
  const dropFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const unscheduleDropFeedbackTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const { isMobile } = useMobile();
  const { showMessage } = useMessageHandler();
  const { execute, hasActiveItemLabelTemplate, downloadItemLabelsForOrder } =
    useExecutePlanDndIntent();
  const { run: runStepSequence } = useStepSequence();
  const contactWarningController = usePlanDndContactWarningController();
  const objectiveMismatchController = usePlanObjectiveMismatchController();
  const clientFormHandoffController = useOrderClientFormHandoffController();
  const openCreatePlanForm = useOpenCreatePlanFormAction();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: isMobile ? { distance: 10 } : { distance: 6 },
    }),
  );

  const setPlanDropFeedbackWithTimeout = (
    feedback: PlanDropFeedback,
    timeoutMs = 900,
  ) => {
    if (dropFeedbackTimeoutRef.current) {
      clearTimeout(dropFeedbackTimeoutRef.current);
    }
    setPlanDropFeedback(feedback);
    dropFeedbackTimeoutRef.current = setTimeout(() => {
      setPlanDropFeedback(null);
      dropFeedbackTimeoutRef.current = null;
    }, timeoutMs);
  };

  const setUnscheduleDropFeedbackWithTimeout = (
    feedback: UnscheduleDropFeedback,
    timeoutMs = 900,
  ) => {
    if (unscheduleDropFeedbackTimeoutRef.current) {
      clearTimeout(unscheduleDropFeedbackTimeoutRef.current);
    }
    setUnscheduleDropFeedback(feedback);
    unscheduleDropFeedbackTimeoutRef.current = setTimeout(() => {
      setUnscheduleDropFeedback(null);
      unscheduleDropFeedbackTimeoutRef.current = null;
    }, timeoutMs);
  };

  useEffect(() => {
    return () => {
      if (dropFeedbackTimeoutRef.current) {
        clearTimeout(dropFeedbackTimeoutRef.current);
      }
      if (unscheduleDropFeedbackTimeoutRef.current) {
        clearTimeout(unscheduleDropFeedbackTimeoutRef.current);
      }
      document.body.style.cursor = "";
    };
  }, []);

  const clearPendingDrop = () => {
    pendingIntentRef.current = null;
    setRouteReorderPreview(null);
  };

  const readOrderedStopClientIds = (routeSolutionId: number): string[] => {
    if (
      routeDragSnapshotRef.current &&
      routeDragSnapshotRef.current.routeSolutionId === routeSolutionId &&
      routeDragSnapshotRef.current.orderedStopClientIds.length
    ) {
      return routeDragSnapshotRef.current.orderedStopClientIds;
    }

    return selectRouteSolutionStopsBySolutionId(routeSolutionId)(
      useRouteSolutionStopStore.getState(),
    )
      .sort((a, b) => {
        const left =
          typeof a.stop_order === "number"
            ? a.stop_order
            : Number.POSITIVE_INFINITY;
        const right =
          typeof b.stop_order === "number"
            ? b.stop_order
            : Number.POSITIVE_INFINITY;
        return left - right;
      })
      .map((stop) => stop.client_id);
  };

  const resetDragUi = () => {
    document.body.style.cursor = "";
    routeDragSnapshotRef.current = null;
    clearPendingDrop();
    setActiveDrag(null);
  };

  const isOrderSelectedForBatch = (
    order: Order | null | undefined,
    state: ReturnType<typeof useOrderSelectionStore.getState>,
  ) => {
    if (!order) return false;
    if (typeof order.id === "number") {
      if (state.excludedServerIds.includes(order.id)) {
        return false;
      }
      return (
        state.manualSelectedServerIds.includes(order.id) ||
        state.loadedSelectionIds.includes(order.id)
      );
    }
    return state.manualSelectedClientIds.includes(order.client_id);
  };

  const hasSelectionIntent = (
    state: ReturnType<typeof useOrderSelectionStore.getState>,
  ) =>
    state.manualSelectedServerIds.some(
      (id) => !state.excludedServerIds.includes(id),
    ) || state.selectAllSnapshots.length > 0;

  const buildManualBatchSelection = (orderIds: number[]) => ({
    manual_order_ids: orderIds.filter((id) => Number.isFinite(id) && id > 0),
    select_all_snapshots: [],
    excluded_order_ids: [],
    source: "group" as const,
  });

  const resolveOptimisticMovedCount = (
    intent: Exclude<PlanDndIntent, null>,
    selectionState: ReturnType<typeof useOrderSelectionStore.getState>,
  ): number => {
    if (
      intent.kind === "ASSIGN_ORDER_TO_PLAN" ||
      intent.kind === "UNSCHEDULE_ORDER"
    ) {
      return 1;
    }
    if (
      intent.kind !== "ASSIGN_ORDERS_TO_PLAN_BATCH" &&
      intent.kind !== "UNSCHEDULE_ORDERS_BATCH"
    ) {
      return 0;
    }

    const source = intent.selection.source;
    if (source === "selection") {
      return resolveSelectionAuthorityBatchCount(selectionState);
    }

    // Manual/group fallback only.
    return intent.selection.manual_order_ids.length;
  };

  const getAssignIntentPlanClientId = (
    intent: Exclude<PlanDndIntent, null>,
  ): string | null => {
    if (
      intent.kind === "ASSIGN_ORDER_TO_PLAN" ||
      intent.kind === "ASSIGN_ORDERS_TO_PLAN_BATCH"
    ) {
      return intent.planClientId;
    }
    return null;
  };

  const emitOrderDetailHeaderSweep = (orderClientId: string) => {
    if (typeof window === "undefined") {
      return;
    }
    window.dispatchEvent(
      new CustomEvent(ORDER_DETAIL_SUBHEADER_SWEEP_EVENT, {
        detail: { orderClientId },
      }),
    );
  };

  const resolveRouteMapRefreshPlanId = (
    intent: Exclude<PlanDndIntent, null>,
    activeData: Record<string, unknown>,
  ): number | null => {
    if (intent.kind === "MOVE_ORDER_TO_ROUTE_GROUP") {
      return intent.planId;
    }

    let routeSolutionId: number | null = null;
    if (intent.kind === "MOVE_ROUTE_STOP_GROUP") {
      routeSolutionId = intent.routeSolutionId;
    } else if (intent.kind === "MOVE_ROUTE_STOP") {
      routeSolutionId =
        selectRouteSolutionStopByClientId(intent.fromStopClientId)(
          useRouteSolutionStopStore.getState(),
        )?.route_solution_id ?? null;
    } else if (
      activeData.type === "route_stop" ||
      activeData.type === "route_stop_group"
    ) {
      const stop =
        activeData.stop && typeof activeData.stop === "object"
          ? (activeData.stop as { route_solution_id?: unknown })
          : null;
      const candidate = Number(
        activeData.routeSolutionId ?? stop?.route_solution_id ?? NaN,
      );
      routeSolutionId =
        Number.isFinite(candidate) && candidate > 0 ? candidate : null;
    }

    if (routeSolutionId == null) return null;
    return resolvePlanIdByRouteGroupId(
      resolveRouteGroupIdByRouteSolutionId(routeSolutionId),
    );
  };

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    document.body.style.cursor = "grabbing";
    clearPendingDrop();

    const activeData = active.data.current;
    const routeSolutionId = Number(
      activeData?.routeSolutionId ?? activeData?.stop?.route_solution_id ?? NaN,
    );
    if (Number.isFinite(routeSolutionId) && routeSolutionId > 0) {
      routeDragSnapshotRef.current = {
        routeSolutionId,
        orderedStopClientIds: readOrderedStopClientIds(routeSolutionId),
      };
    }

    if (active.data.current?.type === "order_batch") {
      const selectionState = useOrderSelectionStore.getState();
      const dragSelectedCount = Number(active.data.current.selectedCount);
      setActiveDrag({
        type: "order_batch",
        selectedCount:
          Number.isFinite(dragSelectedCount) && dragSelectedCount > 0
            ? dragSelectedCount
            : resolveSelectionAuthorityBatchCount(selectionState),
        isLoading:
          Boolean(active.data.current.isLoading) ||
          selectionState.resolvedSelection.isLoading,
      });
      return;
    }

    if (active.data.current?.type === "order" && active.data.current?.order) {
      const draggedOrder = active.data.current.order as Order;
      const selectionState = useOrderSelectionStore.getState();
      if (
        selectionState.isSelectionMode &&
        hasSelectionIntent(selectionState) &&
        isOrderSelectedForBatch(draggedOrder, selectionState)
      ) {
        setActiveDrag({
          type: "order_batch",
          selectedCount: resolveSelectionAuthorityBatchCount(selectionState),
          isLoading: selectionState.resolvedSelection.isLoading,
        });
      } else {
        setActiveDrag({ type: "order", order: draggedOrder });
      }
      return;
    }
    if (active.data.current?.type === "order") {
      const draggedOrderClientId =
        typeof active.data.current?.id === "string"
          ? active.data.current.id
          : String(active.id ?? "");
      const draggedOrder =
        draggedOrderClientId.length > 0
          ? selectOrderByClientId(draggedOrderClientId)(
              useOrderStore.getState(),
            )
          : null;
      if (draggedOrder) {
        const selectionState = useOrderSelectionStore.getState();
        if (
          selectionState.isSelectionMode &&
          hasSelectionIntent(selectionState) &&
          isOrderSelectedForBatch(draggedOrder, selectionState)
        ) {
          setActiveDrag({
            type: "order_batch",
            selectedCount: resolveSelectionAuthorityBatchCount(selectionState),
            isLoading: selectionState.resolvedSelection.isLoading,
          });
        } else {
          setActiveDrag({ type: "order", order: draggedOrder });
        }
      }
      return;
    }
    if (
      active.data.current?.type === "order_group" &&
      active.data.current?.order
    ) {
      setActiveDrag({
        type: "order_group",
        order: active.data.current.order,
        count: Number(active.data.current.orderCount) || 0,
        label: String(active.data.current.label || ""),
      });
      return;
    }
    if (
      active.data.current?.type === "route_stop" &&
      active.data.current?.order
    ) {
      setActiveDrag({
        type: "route_stop",
        order: active.data.current.order,
        stop: active.data.current.stop as RouteSolutionStop,
        routeStopClientId: active.id.toString(),
        planStartDate: active.data.current.planStartDate as
          | string
          | null
          | undefined,
      });
      return;
    }
    if (
      active.data.current?.type === "route_stop_group" &&
      active.data.current?.order
    ) {
      setActiveDrag({
        type: "route_stop_group",
        order: active.data.current.order,
        stop: active.data.current.stop as RouteSolutionStop,
        count: Number(active.data.current.orderCount) || 0,
        label: String(active.data.current.label || ""),
        firstStopOrder:
          (active.data.current.firstStopOrder as number | null | undefined) ??
          null,
        lastStopOrder:
          (active.data.current.lastStopOrder as number | null | undefined) ??
          null,
        planStartDate: active.data.current.planStartDate as
          | string
          | null
          | undefined,
      });
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    if (!event.over || !event.active.data.current) {
      clearPendingDrop();
      return;
    }

    const activeData = event.active.data.current;
    const overData = event.over.data.current;
    const activeId = event.active.id ? String(event.active.id) : undefined;
    const overId = overData?.id ? String(overData.id) : undefined;
    const activeOrderClientId =
      activeData.type === "order"
        ? typeof activeData.id === "string"
          ? activeData.id
          : activeId
        : activeData.type === "route_stop"
          ? (activeData.order?.client_id as string | undefined)
          : undefined;

    const selectionState = useOrderSelectionStore.getState();
    const activeOrder = (activeData?.order as Order | undefined) ?? null;
    const selectionModeEnabled =
      (selectionState.isSelectionMode && hasSelectionIntent(selectionState)) ||
      activeData.type === "order_batch";
    const isActiveOrderSelected = isOrderSelectedForBatch(
      activeOrder,
      selectionState,
    );

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
      resolveRouteGroupIdByRouteSolutionId,
      resolvePlanIdByRouteGroupId,
      resolveOrderedStopClientIds: readOrderedStopClientIds,
    });

    if (resolved.type !== "intent" || !resolved.intent) {
      clearPendingDrop();
      return;
    }

    pendingIntentRef.current = resolved.intent;
    setRouteReorderPreview(resolved.preview ?? null);
  };

  const onDragCancel = () => {
    resetDragUi();
  };

  /**
   * An order assigned to a plan adopts that plan's type, so a drop can silently
   * rewrite the objective the order was created with. This confirms that first,
   * and for an empty-day drop also decides which plan type to create.
   *
   * Returns the intent to run — augmented with the resolved plan type for
   * `CREATE_PLAN_FOR_DATE` — or null when the user declined.
   *
   * Selection-authority batches ("select all matching these filters") are only
   * inspected for the orders currently in the store; rows outside the loaded
   * page are moved without a prompt. The backend still performs the transition
   * correctly, so this is a missing warning, not a wrong move.
   */
  const confirmPlanTypeForIntent = async (
    intent: NonNullable<PlanDndIntent>,
    selectionState: ReturnType<typeof useOrderSelectionStore.getState>,
  ): Promise<PlanDndIntent | null> => {
    const orderState = useOrderStore.getState();

    if (intent.kind === "CREATE_PLAN_FOR_DATE") {
      const orders = intent.orderServerIds.map((orderId) =>
        selectOrderByServerId(orderId)(orderState),
      );
      const planType = resolveAutoCreatePlanType(orders);
      const confirmed = await objectiveMismatchController.confirmObjectiveChange(
        { orders, targetPlanType: planType },
      );
      return confirmed ? { ...intent, planType } : null;
    }

    if (
      intent.kind !== "ASSIGN_ORDER_TO_PLAN" &&
      intent.kind !== "ASSIGN_ORDERS_TO_PLAN_BATCH"
    ) {
      return intent;
    }

    const destinationPlan = selectRoutePlanByClientId(intent.planClientId)(
      useRoutePlanStore.getState(),
    );
    if (!destinationPlan) return intent;

    const orders =
      intent.kind === "ASSIGN_ORDER_TO_PLAN"
        ? [selectOrderByClientId(intent.orderClientId)(orderState)]
        : resolveBatchTargetOrderIds(intent.selection, selectionState).map(
            (orderId) => selectOrderByServerId(orderId)(orderState),
          );

    const confirmed = await objectiveMismatchController.confirmObjectiveChange({
      orders,
      targetPlanType: resolvePlanType(destinationPlan),
      targetPlanLabel: destinationPlan.label ?? null,
    });
    return confirmed ? intent : null;
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      resetDragUi();
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;
    if (!activeData) {
      resetDragUi();
      return;
    }

    if (String(overData?.type ?? "") === "create-plan") {
      const selectionState = useOrderSelectionStore.getState();
      const activeOrder = (activeData.order as Order | undefined) ?? null;
      const selectionModeEnabled =
        (selectionState.isSelectionMode &&
          hasSelectionIntent(selectionState)) ||
        activeData.type === "order_batch";
      const isActiveOrderSelected = isOrderSelectedForBatch(
        activeOrder,
        selectionState,
      );

      if (
        activeData.type === "order" &&
        selectionModeEnabled &&
        !isActiveOrderSelected
      ) {
        showMessage({
          status: 400,
          message: "Drag a selected order when selection mode is active.",
        });
        resetDragUi();
        return;
      }

      const selectedOrderServerIds = resolveCreatePlanOrderIds({
        activeData,
        selectedServerIds: selectionState.selectedServerIds,
        selectionModeEnabled,
        isActiveOrderSelected,
      });

      if (selectedOrderServerIds.length === 0) {
        showMessage({
          status: 400,
          message: "The dropped order does not have a valid server ID.",
        });
        resetDragUi();
        return;
      }

      openCreatePlanForm({
        selectedOrderServerIds,
        ...(activeData.type === "order_batch"
          ? { source: "order_multi_select" as const }
          : {}),
      });
      resetDragUi();
      return;
    }

    const activeId = active.id ? String(active.id) : undefined;
    const overId = overData?.id ? String(overData.id) : undefined;
    const activeOrderClientId =
      activeData.type === "order"
        ? typeof activeData.id === "string"
          ? activeData.id
          : activeId
        : activeData.type === "route_stop"
          ? (activeData.order?.client_id as string | undefined)
          : undefined;

    let intent: PlanDndIntent = pendingIntentRef.current;
    const selectionState = useOrderSelectionStore.getState();
    const activeOrder = (activeData?.order as Order | undefined) ?? null;
    const selectionModeEnabled =
      (selectionState.isSelectionMode && hasSelectionIntent(selectionState)) ||
      activeData.type === "order_batch";
    const isActiveOrderSelected = isOrderSelectedForBatch(
      activeOrder,
      selectionState,
    );
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
          window.confirm(
            "This action will move more than 200 orders. Continue?",
          ),
        buildSelectionBatchPayload: buildBatchSelectionPayload,
        buildManualBatchSelection,
        resolvePlanClientIdByRouteSolutionId: resolveRouteSolutionPlanClientId,
        resolveRouteGroupIdByRouteSolutionId,
        resolvePlanIdByRouteGroupId,
        resolveOrderedStopClientIds: readOrderedStopClientIds,
      });

      if (resolved.type === "warning") {
        showMessage({
          status: resolved.status ?? "warning",
          message: resolved.message,
        });
        resetDragUi();
        return;
      }

      if (resolved.type === "noop" || !resolved.intent) {
        resetDragUi();
        return;
      }

      intent = resolved.intent;
    }

    // Confirm the objective change before anything else asks the user a
    // question — declining here means the drop never happened.
    const planTypeConfirmedIntent = await confirmPlanTypeForIntent(
      intent,
      selectionState,
    );
    if (!planTypeConfirmedIntent) {
      resetDragUi();
      return;
    }
    intent = planTypeConfirmedIntent;

    const contactWarningOrder =
      intent.kind === "ASSIGN_ORDER_TO_PLAN"
        ? selectOrderByClientId(intent.orderClientId)(useOrderStore.getState())
        : intent.kind === "CREATE_PLAN_FOR_DATE" &&
            intent.orderServerIds.length === 1
          ? selectOrderByServerId(intent.orderServerIds[0])(
              useOrderStore.getState(),
            )
          : null;
    let contactWarningDecision: OrderAssignmentContactWarningDecision = {
      kind: "move_anyway",
    };

    if (
      contactWarningController.requiresConfirmation(
        intent,
        contactWarningOrder,
      ) &&
      contactWarningOrder
    ) {
      const linkedDeviceAvailability: LinkedDeviceOrderFormAvailability =
        typeof contactWarningOrder.id === "number"
          ? clientFormHandoffController.getLinkedDeviceAvailability(
              contactWarningOrder.id,
            )
          : {
              available: false,
              message:
                "The order must be synced before it can use a linked device.",
            };

      resetDragUi();
      contactWarningDecision = await contactWarningController.requestDecision({
        order: contactWarningOrder,
        linkedDeviceAvailability,
      });
      if (contactWarningDecision.kind === "cancel") {
        return;
      }
    }

    const isAssignIntent =
      intent.kind === "ASSIGN_ORDER_TO_PLAN" ||
      intent.kind === "ASSIGN_ORDERS_TO_PLAN_BATCH";
    const isUnscheduleIntent =
      intent.kind === "UNSCHEDULE_ORDER" ||
      intent.kind === "UNSCHEDULE_ORDERS_BATCH";
    let optimisticToken = "";

    if (isAssignIntent) {
      const movedCount = resolveOptimisticMovedCount(intent, selectionState);
      optimisticToken = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const planClientId = getAssignIntentPlanClientId(intent);
      if (!planClientId) {
        resetDragUi();
        return;
      }
      setPlanDropFeedbackWithTimeout({
        planClientId,
        movedCount,
        status: "success",
        token: optimisticToken,
      });
    }

    if (isUnscheduleIntent) {
      optimisticToken = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setUnscheduleDropFeedbackWithTimeout({
        movedCount: resolveOptimisticMovedCount(intent, selectionState),
        status: "success",
        token: optimisticToken,
      });
    }

    const routeMapRefreshPlanId = resolveRouteMapRefreshPlanId(
      intent,
      activeData as Record<string, unknown>,
    );
    let handoff:
      | (() => ReturnType<typeof clientFormHandoffController.executeHandoff>)
      | undefined;
    if (
      typeof contactWarningOrder?.id === "number" &&
      contactWarningDecision.kind === "send_customer"
    ) {
      const recipients = contactWarningDecision.recipients;
      const order = contactWarningOrder;
      const orderId = contactWarningOrder.id;
      handoff = () =>
        clientFormHandoffController.executeHandoff({
          kind: "customer",
          orderId,
          orderClientId: order.client_id,
          hasGeneratedLink: Boolean(order.client_form_token_hash),
          recipients,
        });
    } else if (
      typeof contactWarningOrder?.id === "number" &&
      contactWarningDecision.kind === "send_linked_device"
    ) {
      const order = contactWarningOrder;
      const orderId = contactWarningOrder.id;
      handoff = () =>
        clientFormHandoffController.executeHandoff({
          kind: "linked_device",
          orderId,
          referenceNumber: order.reference_number ?? "",
        });
    }

    // Single-order assignment can fan out into several side-effects (move,
    // client-form handoff, item-label download). When more than the move is in
    // play, replay them as a paced, non-dismissible step sequence so the user
    // can follow each one instead of everything happening at once.
    if (intent.kind === "ASSIGN_ORDER_TO_PLAN") {
      const assignPlanClientId = intent.planClientId;
      const deliveryPlan = selectRoutePlanByClientId(assignPlanClientId)(
        useRoutePlanStore.getState(),
      );
      const labelOrder = contactWarningOrder;
      const wantsLabels =
        hasActiveItemLabelTemplate() &&
        typeof deliveryPlan?.id === "number" &&
        typeof labelOrder?.id === "number";

      if (handoff || wantsLabels) {
        // Start the move eagerly so its synchronous optimistic assignment lands
        // before the label and form steps run — the linked-device form streams
        // the order's route-plan schedule and needs the plan already applied.
        // Its confirmation is still surfaced as the final, awaited step below.
        let moveSucceeded = false;
        const movePromise = (async () => {
          const moveResult = await runWithRouteMapRefresh(
            routeMapRefreshPlanId,
            () => execute(intent),
          );
          if (!moveResult.success) {
            throw new Error("move_failed");
          }
          moveSucceeded = true;
          return moveResult;
        })();
        // Keep the eventual rejection handled by the move step (below); this
        // no-op guard only silences the unhandled-rejection warning until then.
        movePromise.catch(() => {});

        const steps: SequenceStep[] = [];

        // 1. Item labels — reads the explicit target plan id, so it is safe to
        //    run before the move server round-trip completes.
        if (wantsLabels && labelOrder && typeof deliveryPlan?.id === "number") {
          const targetOrder = labelOrder;
          const targetOrderId = labelOrder.id as number;
          const targetPlanId = deliveryPlan.id;
          steps.push({
            id: "item_labels",
            runningLabel: "Preparing item labels…",
            successLabel: "Item labels downloaded",
            errorLabel: "Couldn't generate item labels",
            optional: true,
            run: () =>
              downloadItemLabelsForOrder(
                targetOrder,
                targetOrderId,
                targetPlanId,
              ),
          });
        }

        // 2. Client form handoff.
        if (handoff) {
          const isLinkedDevice =
            contactWarningDecision.kind === "send_linked_device";
          const stepHandoff = handoff;
          steps.push({
            id: "client_form",
            runningLabel: isLinkedDevice
              ? "Sending form to linked device…"
              : "Sending client form…",
            successLabel: isLinkedDevice
              ? "Form sent to linked device"
              : "Client form sent",
            errorLabel: "Couldn't send the client form",
            minRunMs: 1000,
            holdMs: 1200,
            optional: true,
            run: () => stepHandoff(),
          });
        }

        // 3. Move confirmation — awaits the eagerly-started move. Kept optional
        //    so a failed move never traps the overlay: the sequence always
        //    completes and auto-closes, and the failure is surfaced by the red
        //    step state plus the plan-drop error feedback below.
        steps.push({
          id: "move",
          runningLabel: "Moving order to route plan…",
          successLabel: "Order added to route plan",
          errorLabel: "Couldn't move the order",
          minRunMs: 1200,
          holdMs: 1200,
          optional: true,
          run: () => movePromise,
        });

        await runStepSequence({ title: "Assigning order", steps });

        if (!moveSucceeded) {
          setPlanDropFeedbackWithTimeout(
            {
              planClientId: assignPlanClientId,
              movedCount: resolveOptimisticMovedCount(intent, selectionState),
              status: "error",
              token:
                optimisticToken ||
                `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            },
            1200,
          );
        } else if (
          activeData?.type === "order" &&
          activeData?.dragSource === "order_detail_header"
        ) {
          emitOrderDetailHeaderSweep(intent.orderClientId);
        }

        resetDragUi();
        return;
      }
    }

    const { moveResult: result } = await runPlanDndMoveWithHandoff({
      move: () =>
        runWithRouteMapRefresh(routeMapRefreshPlanId, () => execute(intent)),
      handoff,
      handoffMode:
        intent.kind === "CREATE_PLAN_FOR_DATE"
          ? "after_move_success"
          : "concurrent",
    });
    if (
      result?.success &&
      intent.kind === "ASSIGN_ORDER_TO_PLAN" &&
      activeData?.type === "order" &&
      activeData?.dragSource === "order_detail_header"
    ) {
      emitOrderDetailHeaderSweep(intent.orderClientId);
    }

    if (isAssignIntent && !result?.success) {
      const planClientId = getAssignIntentPlanClientId(intent);
      if (!planClientId) {
        resetDragUi();
        return;
      }
      setPlanDropFeedbackWithTimeout(
        {
          planClientId,
          movedCount: resolveOptimisticMovedCount(intent, selectionState),
          status: "error",
          token:
            optimisticToken ||
            `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        },
        1200,
      );
    }

    if (isUnscheduleIntent && !result?.success) {
      setUnscheduleDropFeedbackWithTimeout(
        {
          movedCount: resolveOptimisticMovedCount(intent, selectionState),
          status: "error",
          token:
            optimisticToken ||
            `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        },
        1200,
      );
    }

    resetDragUi();
  };

  return {
    onDragOver,
    onDragEnd,
    onDragStart,
    onDragCancel,
    sensors,
    planDropFeedback,
    unscheduleDropFeedback,
    activeDrag,
    routeReorderPreview,
  };
};
