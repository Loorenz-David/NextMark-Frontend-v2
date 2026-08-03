import type { OrderBatchSelectionPayload } from "@/features/order/types/orderBatchSelection";
import type { RoutePlanObjective } from "@/features/plan/types/plan";

export type PlanDndIntent =
  | {
      kind: "MOVE_ROUTE_STOP";
      fromStopClientId: string;
      toStopClientId: string;
    }
  | {
      kind: "MOVE_ROUTE_STOP_GROUP";
      routeSolutionId: number;
      routeStopIds: number[];
      position: number;
      anchorStopId: number;
    }
  | {
      kind: "MOVE_ORDER_TO_ROUTE_GROUP";
      orderIds: number[];
      planId: number;
      sourceRouteGroupId: number;
      targetRouteGroupId: number;
    }
  | {
      kind: "ASSIGN_ORDER_TO_PLAN";
      orderClientId: string;
      planClientId: string;
    }
  | {
      kind: "UNSCHEDULE_ORDER";
      orderClientId: string;
    }
  | {
      kind: "ASSIGN_ORDERS_TO_PLAN_BATCH";
      selection: OrderBatchSelectionPayload;
      planClientId: string;
      origin?: "order_list" | "route_group";
    }
  | {
      kind: "UNSCHEDULE_ORDERS_BATCH";
      selection: OrderBatchSelectionPayload;
      origin?: "order_list" | "route_group";
    }
  | {
      /** Drop on an empty calendar day: create the plan and link the orders in one call. */
      kind: "CREATE_PLAN_FOR_DATE";
      dateKey: string;
      orderServerIds: number[];
      /**
       * Which plan type to create, derived from the dragged orders' objectives.
       * Filled in by the DnD controller, which can read the order store; the
       * pure drop resolver cannot.
       */
      planType?: RoutePlanObjective;
    }
  | null;

export function derivePlanDndIntent(params: {
  activeType?: string;
  overType?: string;
  activeId?: string;
  overId?: string;
  activeOrderClientId?: string;
}): PlanDndIntent {
  const { activeType, overType, activeId, overId, activeOrderClientId } =
    params;

  if (
    activeType === "route_stop" &&
    overType === "route_stop" &&
    activeId &&
    overId
  ) {
    return {
      kind: "MOVE_ROUTE_STOP",
      fromStopClientId: activeId,
      toStopClientId: overId,
    };
  }

  if (
    (activeType === "order" || activeType === "route_stop") &&
    overType === "plan" &&
    activeOrderClientId &&
    overId
  ) {
    return {
      kind: "ASSIGN_ORDER_TO_PLAN",
      orderClientId: activeOrderClientId,
      planClientId: overId,
    };
  }

  if (
    (activeType === "order" || activeType === "route_stop") &&
    overType === "unschedule" &&
    activeOrderClientId
  ) {
    return {
      kind: "UNSCHEDULE_ORDER",
      orderClientId: activeOrderClientId,
    };
  }

  return null;
}
