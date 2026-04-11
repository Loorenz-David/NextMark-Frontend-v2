import { useOrderMutations } from "@/features/order";
import { useOrderBatchDeliveryPlanController } from "@/features/order/controllers/orderBatchDeliveryPlan.controller";
import { useMoveOrderToRouteGroupMutation } from "@/features/plan/routeGroup/controllers/useMoveOrderToRouteGroup.controller";
import { useRouteSolutionStopMutations } from "@/features/plan/routeGroup/controllers/routeSolutionStop.controller";
import {
  selectRoutePlanByClientId,
  useRoutePlanStore,
} from "@/features/plan/store/routePlan.slice";
import type { PlanDndIntent } from "@/features/plan/domain/planDndIntent";

export const useExecutePlanDndIntent = () => {
  const { updateOrderDeliveryPlan } = useOrderMutations();
  const { updateOrdersDeliveryPlanBatch } =
    useOrderBatchDeliveryPlanController();
  const { moveOrderToRouteGroup } = useMoveOrderToRouteGroupMutation();
  const {
    updateRouteStopPositionOptimistic,
    updateRouteStopGroupPositionOptimistic,
  } = useRouteSolutionStopMutations();

  const execute = async (intent: PlanDndIntent) => {
    if (!intent) {
      return { droppedPlanClientId: null as string | null, success: false };
    }

    if (intent.kind === "MOVE_ROUTE_STOP") {
      await updateRouteStopPositionOptimistic(
        intent.fromStopClientId,
        intent.toStopClientId,
      );
      return { droppedPlanClientId: null as string | null, success: true };
    } else if (intent.kind === "MOVE_ROUTE_STOP_GROUP") {
      await updateRouteStopGroupPositionOptimistic({
        routeSolutionId: intent.routeSolutionId,
        routeStopIds: intent.routeStopIds,
        position: intent.position,
        anchorStopId: intent.anchorStopId,
      });
      return { droppedPlanClientId: null as string | null, success: true };
    } else if (intent.kind === "ASSIGN_ORDER_TO_PLAN") {
      const deliveryPlan = selectRoutePlanByClientId(intent.planClientId)(
        useRoutePlanStore.getState(),
      );
      if (!deliveryPlan?.id) {
        return { droppedPlanClientId: null as string | null, success: false };
      }

      const success = await updateOrderDeliveryPlan(
        intent.orderClientId,
        deliveryPlan.id,
      );
      return { droppedPlanClientId: intent.planClientId, success };
    } else if (intent.kind === "ASSIGN_ORDERS_TO_PLAN_BATCH") {
      const deliveryPlan = selectRoutePlanByClientId(intent.planClientId)(
        useRoutePlanStore.getState(),
      );
      if (!deliveryPlan?.id) {
        return { droppedPlanClientId: null as string | null, success: false };
      }

      const success = await updateOrdersDeliveryPlanBatch({
        planId: deliveryPlan.id,
        planType: "local_delivery",
        selection: intent.selection,
      });
      return { droppedPlanClientId: intent.planClientId, success };
    } else if (intent.kind === "MOVE_ORDER_TO_ROUTE_GROUP") {
      const result = await moveOrderToRouteGroup({
        planId: intent.planId,
        orderIds: intent.orderIds,
        sourceRouteGroupId: intent.sourceRouteGroupId,
        targetRouteGroupId: intent.targetRouteGroupId,
      });
      return {
        droppedPlanClientId: null as string | null,
        success: result.success,
      };
    }

    return { droppedPlanClientId: null as string | null, success: false };
  };

  return { execute };
};
