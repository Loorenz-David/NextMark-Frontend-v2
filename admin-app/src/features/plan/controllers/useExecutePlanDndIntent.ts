import { useOrderMutations } from "@/features/order";
import { useOrderBatchDeliveryPlanController } from "@/features/order/controllers/orderBatchDeliveryPlan.controller";
import { useOrderModel } from "@/features/order/domain/useOrderModel";
import { getOrderItems } from "@/features/order/item/api/item.api";
import { startItemLabelDownload } from "@/features/order/item/flows/startItemLabelDownload.flow";
import { useItemModel } from "@/features/order/item/domain/useItemModel";
import {
  replaceItemsForOrder,
  selectItemsByOrderId,
  setItemOrderSyncMeta,
  useItemStore,
} from "@/features/order/item/store/item.store";
import {
  selectOrderByClientId,
  selectOrderByServerId,
  useOrderStore,
} from "@/features/order/store/order.store";
import { useMoveOrderToRouteGroupMutation } from "@/features/plan/routeGroup/controllers/useMoveOrderToRouteGroup.controller";
import { useRouteSolutionStopMutations } from "@/features/plan/routeGroup/controllers/routeSolutionStop.controller";
import {
  selectRoutePlanByClientId,
  useRoutePlanStore,
} from "@/features/plan/store/routePlan.slice";
import type { PlanDndIntent } from "@/features/plan/domain/planDndIntent";
import { useDownloadTemplateByEventFlow } from "@/features/templates/printDocument/flows";

export const useExecutePlanDndIntent = () => {
  const { updateOrderDeliveryPlan } = useOrderMutations();
  const { updateOrdersDeliveryPlanBatch } =
    useOrderBatchDeliveryPlanController();
  const { moveOrderToRouteGroup } = useMoveOrderToRouteGroupMutation();
  const {
    updateRouteStopPositionOptimistic,
    updateRouteStopGroupPositionOptimistic,
  } = useRouteSolutionStopMutations();
  const { downloadByEvent } = useDownloadTemplateByEventFlow();
  const { normalizeOrderPayload } = useOrderModel();
  const { normalizeItemsForOrder } = useItemModel();

  const loadOrderItemsForLabel = async (orderId: number) => {
    const stored = selectItemsByOrderId(orderId)(useItemStore.getState());
    if (stored.length > 0) return stored;

    try {
      const response = await getOrderItems(orderId);
      const payload = response.data;
      if (!payload?.items) return [];
      const normalized = normalizeItemsForOrder(payload.items, orderId);
      replaceItemsForOrder(orderId, normalized);
      setItemOrderSyncMeta(orderId, { itemsUpdatedAt: null, lastFetchedAt: Date.now() });
      return selectItemsByOrderId(orderId)(useItemStore.getState());
    } catch {
      return [];
    }
  };

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

      const order = selectOrderByClientId(intent.orderClientId)(
        useOrderStore.getState(),
      );

      if (order?.id) {
        const orderId = order.id;
        loadOrderItemsForLabel(orderId).then((items) => {
          startItemLabelDownload({
            downloadByEvent,
            event: "item_rescheduled",
            items,
            normalizeOrderPayload,
            order,
            orderId,
            targetDeliveryPlanId: deliveryPlan.id,
          });
        });
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

      if (intent.origin === "route_group") {
        intent.selection.manual_order_ids.forEach((orderId) => {
          const order = selectOrderByServerId(orderId)(useOrderStore.getState());
          if (order?.id) {
            const orderId = order.id;
            loadOrderItemsForLabel(orderId).then((items) => {
              startItemLabelDownload({
                downloadByEvent,
                event: "item_rescheduled",
                items,
                normalizeOrderPayload,
                order,
                orderId,
                targetDeliveryPlanId: deliveryPlan.id,
              });
            });
          }
        });
      }

      const success = await updateOrdersDeliveryPlanBatch({
        planId: deliveryPlan.id,
        planType: "local_delivery",
        selection: intent.selection,
        showIncomingRouteGroupPlaceholders: intent.origin === "route_group",
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
