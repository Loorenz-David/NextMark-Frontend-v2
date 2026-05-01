import type { DragEndEvent, DragOverEvent } from "@dnd-kit/core";

import type { OrderBatchSelectionPayload } from "@/features/order/types/orderBatchSelection";
import type { PlanDndIntent } from "@/features/plan/domain/planDndIntent";
import { derivePlanDndIntent } from "@/features/plan/domain/planDndIntent";
import {
  resolveGroupPlacement,
  resolvePointerClientY,
} from "@/features/plan/dnd/domain/resolveGroupPlacement";
import { resolveMovePosition } from "@/features/plan/dnd/domain/resolveMovePosition";

export type RouteReorderPreview =
  | {
      kind: "MOVE_ROUTE_STOP";
      routeSolutionId: number;
      orderedStopClientIds: string[];
      fromStopClientId: string;
      toStopClientId: string;
    }
  | {
      kind: "MOVE_ROUTE_STOP_GROUP";
      routeSolutionId: number;
      orderedStopClientIds: string[];
      movingStopClientIds: string[];
      position: number;
    };

export type ResolveDropIntentResult =
  | {
      type: "intent";
      intent: PlanDndIntent;
      preview?: RouteReorderPreview | null;
    }
  | { type: "warning"; message: string; status?: number }
  | { type: "noop" };

type ResolveDropIntentParams = {
  event: DragOverEvent | DragEndEvent;
  activeId?: string;
  overId?: string;
  activeOrderClientId?: string;
  selectionState: unknown;
  selectionModeEnabled: boolean;
  isActiveOrderSelected: boolean;
  maxBatchIds: number;
  confirmLargeBatch: (count: number) => boolean;
  buildSelectionBatchPayload: (state: any) => OrderBatchSelectionPayload;
  buildManualBatchSelection: (orderIds: number[]) => OrderBatchSelectionPayload;
  resolvePlanClientIdByRouteSolutionId: (
    routeSolutionId: number | null | undefined,
  ) => string | null;
  resolveRouteGroupIdByRouteSolutionId: (
    routeSolutionId: number | null | undefined,
  ) => number | null;
  resolvePlanIdByRouteGroupId: (
    routeGroupId: number | null | undefined,
  ) => number | null;
  resolveOrderedStopClientIds: (routeSolutionId: number) => string[];
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const toPositiveInt = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const toPositiveIntArray = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => toPositiveInt(item))
    .filter((item): item is number => item != null);
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item ?? "").trim())
    .filter((item) => item.length > 0);
};

const resolveActiveRouteSolutionId = (
  activeData: Record<string, unknown>,
): number | null => {
  const fromField = toPositiveInt(activeData.routeSolutionId);
  if (fromField) return fromField;

  const stop = asRecord(activeData.stop);
  return toPositiveInt(stop.route_solution_id);
};

const resolveTargetRouteSolutionId = (
  overType: string,
  overData: Record<string, unknown>,
): number | null => {
  if (overType === "route_stop") {
    const stop = asRecord(overData.stop);
    return toPositiveInt(stop.route_solution_id);
  }

  if (overType === "route_stop_group_drop" || overType === "route_stop_group") {
    return toPositiveInt(overData.routeSolutionId);
  }

  return null;
};

type TargetAnchor = {
  routeSolutionId: number | null;
  anchorStopId: number | null;
  anchorStopClientId: string | null;
  placement: "before" | "after";
};

const resolveTargetAnchor = (
  event: DragOverEvent | DragEndEvent,
  overType: string,
  overData: Record<string, unknown>,
): TargetAnchor => {
  if (overType === "route_stop") {
    const stop = asRecord(overData.stop);
    const clientId = String(stop.client_id ?? "").trim();
    const pointerY = resolvePointerClientY(event);
    const placement = resolveGroupPlacement(
      pointerY,
      event.over?.rect as { top?: number; height?: number } | null,
    );

    return {
      routeSolutionId: toPositiveInt(stop.route_solution_id),
      anchorStopId: toPositiveInt(stop.id),
      anchorStopClientId: clientId || null,
      placement,
    };
  }

  if (overType !== "route_stop_group_drop" && overType !== "route_stop_group") {
    return {
      routeSolutionId: null,
      anchorStopId: null,
      anchorStopClientId: null,
      placement: "after",
    };
  }

  const pointerY = resolvePointerClientY(event);
  const placement = resolveGroupPlacement(
    pointerY,
    event.over?.rect as { top?: number; height?: number } | null,
  );

  const firstAnchorStopId = toPositiveInt(
    overData.firstAnchorStopId ?? overData.anchorStopId,
  );
  const firstAnchorStopClientId = String(
    overData.firstAnchorStopClientId ?? overData.anchorStopClientId ?? "",
  ).trim();
  const lastAnchorStopId = toPositiveInt(
    overData.lastAnchorStopId ?? overData.anchorStopId,
  );
  const lastAnchorStopClientId = String(
    overData.lastAnchorStopClientId ?? overData.anchorStopClientId ?? "",
  ).trim();

  if (placement === "before") {
    return {
      routeSolutionId: toPositiveInt(overData.routeSolutionId),
      anchorStopId: firstAnchorStopId,
      anchorStopClientId: firstAnchorStopClientId || null,
      placement: "before",
    };
  }

  return {
    routeSolutionId: toPositiveInt(overData.routeSolutionId),
    anchorStopId: lastAnchorStopId,
    anchorStopClientId: lastAnchorStopClientId || null,
    placement: "after",
  };
};

const resolveManualIdsForActive = (
  activeType: string,
  activeData: Record<string, unknown>,
): number[] => {
  if (activeType === "route_stop_group") {
    return toPositiveIntArray(activeData.orderIds);
  }

  if (activeType === "route_stop") {
    const order = asRecord(activeData.order);
    const orderId = toPositiveInt(order.id);
    return orderId ? [orderId] : [];
  }

  return [];
};

const resolveRouteStopIdsForReorder = (
  activeType: string,
  activeData: Record<string, unknown>,
): number[] => {
  if (activeType === "route_stop_group") {
    return toPositiveIntArray(activeData.routeStopIds);
  }

  if (activeType === "route_stop") {
    const routeStopId = toPositiveInt(
      activeData.routeStopId ?? asRecord(activeData.stop).id,
    );
    return routeStopId ? [routeStopId] : [];
  }

  return [];
};

const buildOrderedIds = (
  activeData: Record<string, unknown>,
  routeSolutionId: number,
  resolveOrderedStopClientIds: ResolveDropIntentParams["resolveOrderedStopClientIds"],
): string[] => {
  const fromActive = toStringArray(activeData.allOrderedStopClientIds);
  if (fromActive.length) return fromActive;
  return resolveOrderedStopClientIds(routeSolutionId);
};

export const resolveDropIntent = ({
  event,
  activeId,
  overId,
  activeOrderClientId,
  selectionState,
  selectionModeEnabled,
  isActiveOrderSelected,
  maxBatchIds,
  confirmLargeBatch,
  buildSelectionBatchPayload,
  buildManualBatchSelection,
  resolvePlanClientIdByRouteSolutionId,
  resolveRouteGroupIdByRouteSolutionId,
  resolvePlanIdByRouteGroupId,
  resolveOrderedStopClientIds,
}: ResolveDropIntentParams): ResolveDropIntentResult => {
  const activeData = asRecord(event.active.data.current);
  const overData = asRecord(event.over?.data.current);

  const activeType = String(activeData.type ?? "");
  const overType = String(overData.type ?? "");

  if (!activeType || !overType) {
    return { type: "noop" };
  }

  if (activeType === "order") {
    if (overType === "plan" && overId && selectionModeEnabled) {
      if (!isActiveOrderSelected) {
        return {
          type: "warning",
          status: 400,
          message: "Drag a selected order when selection mode is active.",
        };
      }

      return {
        type: "intent",
        intent: {
          kind: "ASSIGN_ORDERS_TO_PLAN_BATCH",
          planClientId: overId,
          selection: buildSelectionBatchPayload(selectionState),
          origin: "order_list",
        },
      };
    }

    return {
      type: "intent",
      intent: derivePlanDndIntent({
        activeType,
        overType,
        activeId,
        overId,
        activeOrderClientId,
      }),
    };
  }

  if (activeType === "order_batch") {
    if (overType !== "plan" || !overId || !selectionModeEnabled) {
      return { type: "noop" };
    }

    return {
      type: "intent",
      intent: {
        kind: "ASSIGN_ORDERS_TO_PLAN_BATCH",
        planClientId: overId,
        selection: buildSelectionBatchPayload(selectionState),
        origin: "order_list",
      },
    };
  }

  if (activeType === "order_group") {
    if (overType !== "plan" || !overId) {
      return { type: "noop" };
    }

    const manualIds = toPositiveIntArray(activeData.orderIds);
    if (!manualIds.length) {
      return { type: "noop" };
    }

    if (
      manualIds.length > maxBatchIds &&
      !confirmLargeBatch(manualIds.length)
    ) {
      return { type: "noop" };
    }

    return {
      type: "intent",
      intent: {
        kind: "ASSIGN_ORDERS_TO_PLAN_BATCH",
        planClientId: overId,
        selection: buildManualBatchSelection(manualIds),
        origin: "order_list",
      },
    };
  }

  if (activeType === "route_stop_group" || activeType === "route_stop") {
    if (overType === "route_group_rail") {
      const targetRouteGroupId = toPositiveInt(overData.routeGroupId);
      if (!targetRouteGroupId) {
        return { type: "noop" };
      }

      const sourceRouteSolutionId = resolveActiveRouteSolutionId(activeData);
      const sourceRouteGroupId = resolveRouteGroupIdByRouteSolutionId(
        sourceRouteSolutionId,
      );
      if (!sourceRouteGroupId || sourceRouteGroupId === targetRouteGroupId) {
        return { type: "noop" };
      }

      const planId = resolvePlanIdByRouteGroupId(sourceRouteGroupId);
      if (!planId) {
        return { type: "noop" };
      }

      const orderIds = resolveManualIdsForActive(activeType, activeData);
      if (!orderIds.length) {
        return { type: "noop" };
      }

      return {
        type: "intent",
        intent: {
          kind: "MOVE_ORDER_TO_ROUTE_GROUP",
          orderIds,
          planId,
          sourceRouteGroupId,
          targetRouteGroupId,
        },
      };
    }

    if (overType === "plan" && overId) {
      const manualIds = resolveManualIdsForActive(activeType, activeData);
      if (!manualIds.length) {
        return { type: "noop" };
      }

      if (
        manualIds.length > maxBatchIds &&
        !confirmLargeBatch(manualIds.length)
      ) {
        return { type: "noop" };
      }

      return {
        type: "intent",
        intent: {
          kind: "ASSIGN_ORDERS_TO_PLAN_BATCH",
          planClientId: overId,
          selection: buildManualBatchSelection(manualIds),
          origin: "route_group",
        },
      };
    }

    if (
      overType !== "route_stop" &&
      overType !== "route_stop_group_drop" &&
      overType !== "route_stop_group"
    ) {
      return { type: "noop" };
    }

    const sourceRouteSolutionId = resolveActiveRouteSolutionId(activeData);
    const targetRouteSolutionId = resolveTargetRouteSolutionId(
      overType,
      overData,
    );
    const targetAnchor = resolveTargetAnchor(event, overType, overData);
    const sourcePlanClientId = resolvePlanClientIdByRouteSolutionId(
      sourceRouteSolutionId,
    );
    const targetPlanClientId = resolvePlanClientIdByRouteSolutionId(
      targetRouteSolutionId,
    );

    if (
      sourcePlanClientId &&
      targetPlanClientId &&
      sourcePlanClientId !== targetPlanClientId
    ) {
      const manualIds = resolveManualIdsForActive(activeType, activeData);
      if (!manualIds.length) {
        return { type: "noop" };
      }

      if (
        manualIds.length > maxBatchIds &&
        !confirmLargeBatch(manualIds.length)
      ) {
        return { type: "noop" };
      }

      return {
        type: "intent",
        intent: {
          kind: "ASSIGN_ORDERS_TO_PLAN_BATCH",
          planClientId: targetPlanClientId,
          selection: buildManualBatchSelection(manualIds),
          origin: "route_group",
        },
      };
    }

    const routeSolutionId =
      sourceRouteSolutionId ?? targetAnchor.routeSolutionId;
    if (!routeSolutionId) {
      return { type: "noop" };
    }

    const orderedStopClientIds = buildOrderedIds(
      activeData,
      routeSolutionId,
      resolveOrderedStopClientIds,
    );

    if (activeType === "route_stop" && overType === "route_stop") {
      const fromStopClientId = String(
        activeData.routeStopClientId ?? activeId ?? "",
      ).trim();
      const toStopClientId = String(
        asRecord(overData.stop).client_id ?? "",
      ).trim();

      if (
        !fromStopClientId ||
        !toStopClientId ||
        fromStopClientId === toStopClientId
      ) {
        return { type: "noop" };
      }

      if (!orderedStopClientIds.length) {
        return { type: "noop" };
      }

      return {
        type: "intent",
        intent: {
          kind: "MOVE_ROUTE_STOP",
          fromStopClientId,
          toStopClientId,
        },
        preview: {
          kind: "MOVE_ROUTE_STOP",
          routeSolutionId,
          orderedStopClientIds,
          fromStopClientId,
          toStopClientId,
        },
      };
    }

    const anchorStopId = targetAnchor.anchorStopId;
    const anchorStopClientId = targetAnchor.anchorStopClientId;

    const routeStopIds = resolveRouteStopIdsForReorder(activeType, activeData);
    const movingStopClientIds =
      activeType === "route_stop_group"
        ? toStringArray(activeData.routeStopClientIds)
        : [
            String(activeData.routeStopClientId ?? activeId ?? "").trim(),
          ].filter(Boolean);

    if (
      !anchorStopId ||
      !anchorStopClientId ||
      !routeStopIds.length ||
      !movingStopClientIds.length ||
      !orderedStopClientIds.length
    ) {
      return { type: "noop" };
    }

    const position = resolveMovePosition({
      orderedStopClientIds,
      movingStopClientIds,
      anchorStopClientId,
      placement: targetAnchor.placement,
    });

    if (!position) {
      return { type: "noop" };
    }

    return {
      type: "intent",
      intent: {
        kind: "MOVE_ROUTE_STOP_GROUP",
        routeSolutionId,
        routeStopIds,
        position,
        anchorStopId,
      },
      preview: {
        kind: "MOVE_ROUTE_STOP_GROUP",
        routeSolutionId,
        orderedStopClientIds,
        movingStopClientIds,
        position,
      },
    };
  }

  return {
    type: "intent",
    intent: derivePlanDndIntent({
      activeType,
      overType,
      activeId,
      overId,
      activeOrderClientId,
    }),
  };
};
