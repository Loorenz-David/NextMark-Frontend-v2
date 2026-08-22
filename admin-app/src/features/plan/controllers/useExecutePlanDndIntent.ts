import { useOrderMutations, type Order } from "@/features/order";
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
import { normalizePlanCreateBundle } from "@/features/plan/api/mappers/planCreateResponse.mapper";
import {
  DEFAULT_PLAN_TYPE,
  resolvePlanType,
} from "@/features/plan/domain/planType";
import { usePlanController } from "@/features/plan/controllers/plan.controller";
import { usePlanStateRegistryFlow } from "@/features/plan/flows/planStateRegistry.flow";
import { buildCalendarPlanDefaults } from "@/features/plan/calendar/domain/buildCalendarPlanDefaults";
import { useDownloadTemplateByEventFlow } from "@/features/templates/printDocument/flows";
import { resolveActiveTemplateByChannelAndEvent } from "@/features/templates/printDocument";

const DEV = import.meta.env.DEV;

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
  const { createPlan } = usePlanController();
  const planStateRegistry = usePlanStateRegistryFlow();

  const loadOrderItemsForLabel = async (orderId: number) => {
    const stored = selectItemsByOrderId(orderId)(useItemStore.getState());
    if (stored.length > 0) return stored;

    try {
      const response = await getOrderItems(orderId);
      const payload = response.data;
      if (!payload?.items) return [];
      const normalized = normalizeItemsForOrder(payload.items, orderId);
      replaceItemsForOrder(orderId, normalized);
      setItemOrderSyncMeta(orderId, {
        itemsUpdatedAt: null,
        lastFetchedAt: Date.now(),
      });
      return selectItemsByOrderId(orderId)(useItemStore.getState());
    } catch {
      return [];
    }
  };

  /**
   * True when a print template is enabled for the item-rescheduled event, i.e.
   * dropping the order onto a plan should produce label PDFs. Callers use this
   * to decide whether the label download is worth showing as its own step.
   */
  const hasActiveItemLabelTemplate = (): boolean =>
    Boolean(
      resolveActiveTemplateByChannelAndEvent("item", "item_rescheduled"),
    );

  /**
   * Loads the order's items and renders their label PDFs. Awaitable so the
   * caller can surface it as a paced step rather than fire-and-forget.
   */
  const downloadItemLabelsForOrder = async (
    order: Order,
    orderId: number,
    targetDeliveryPlanId: number,
  ): Promise<void> => {
    const items = await loadOrderItemsForLabel(orderId);
    await startItemLabelDownload({
      downloadByEvent,
      event: "item_rescheduled",
      items,
      normalizeOrderPayload,
      order,
      orderId,
      targetDeliveryPlanId,
    });
  };

  const execute = async (intent: PlanDndIntent) => {
    if (DEV) {
      console.debug("[plan-dnd] execute:start", { intent });
    }
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
      if (DEV) {
        console.debug("[plan-dnd] ASSIGN_ORDER_TO_PLAN:resolvedPlan", {
          orderClientId: intent.orderClientId,
          planClientId: intent.planClientId,
          deliveryPlanId: deliveryPlan?.id ?? null,
          deliveryPlanState: deliveryPlan?.state_id ?? null,
          deliveryPlanStartDate: deliveryPlan?.start_date ?? null,
          deliveryPlanEndDate: deliveryPlan?.end_date ?? null,
        });
      }
      if (!deliveryPlan?.id) {
        if (DEV) {
          console.debug(
            "[plan-dnd] ASSIGN_ORDER_TO_PLAN:aborted - no deliveryPlan.id resolved from store",
          );
        }
        return { droppedPlanClientId: null as string | null, success: false };
      }

      // The item-label download is no longer fired here. For single-order
      // assignments it is orchestrated as its own paced step by the DnD
      // controller (see usePlanOrderDndController) so the user can see it run.
      const success = await updateOrderDeliveryPlan(
        intent.orderClientId,
        deliveryPlan.id,
      );
      if (DEV) {
        console.debug("[plan-dnd] ASSIGN_ORDER_TO_PLAN:result", { success });
      }
      return { droppedPlanClientId: intent.planClientId, success };
    } else if (intent.kind === "ASSIGN_ORDERS_TO_PLAN_BATCH") {
      const deliveryPlan = selectRoutePlanByClientId(intent.planClientId)(
        useRoutePlanStore.getState(),
      );
      if (DEV) {
        console.debug("[plan-dnd] ASSIGN_ORDERS_TO_PLAN_BATCH:resolvedPlan", {
          planClientId: intent.planClientId,
          deliveryPlanId: deliveryPlan?.id ?? null,
          deliveryPlanState: deliveryPlan?.state_id ?? null,
          deliveryPlanStartDate: deliveryPlan?.start_date ?? null,
          deliveryPlanEndDate: deliveryPlan?.end_date ?? null,
          origin: intent.origin,
          selection: intent.selection,
        });
      }
      if (!deliveryPlan?.id) {
        if (DEV) {
          console.debug(
            "[plan-dnd] ASSIGN_ORDERS_TO_PLAN_BATCH:aborted - no deliveryPlan.id resolved from store",
          );
        }
        return { droppedPlanClientId: null as string | null, success: false };
      }

      if (intent.origin === "route_group") {
        intent.selection.manual_order_ids.forEach((orderId) => {
          const order = selectOrderByServerId(orderId)(
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
        });
      }

      const success = await updateOrdersDeliveryPlanBatch({
        planId: deliveryPlan.id,
        // Orders adopt the destination plan's type; the backend does the same,
        // so the optimistic value matches what comes back.
        planType: resolvePlanType(deliveryPlan),
        selection: intent.selection,
        showIncomingRouteGroupPlaceholders: intent.origin === "route_group",
      });
      if (DEV) {
        console.debug("[plan-dnd] ASSIGN_ORDERS_TO_PLAN_BATCH:result", {
          success,
        });
      }
      return { droppedPlanClientId: intent.planClientId, success };
    } else if (intent.kind === "UNSCHEDULE_ORDER") {
      const success = await updateOrderDeliveryPlan(intent.orderClientId, null);
      return { droppedPlanClientId: null as string | null, success };
    } else if (intent.kind === "UNSCHEDULE_ORDERS_BATCH") {
      const success = await updateOrdersDeliveryPlanBatch({
        planId: null,
        planType: null,
        selection: intent.selection,
        showIncomingRouteGroupPlaceholders: false,
      });
      return { droppedPlanClientId: null as string | null, success };
    } else if (intent.kind === "CREATE_PLAN_FOR_DATE") {
      const openPlanStateId = planStateRegistry.getByName("Open")?.id ?? null;
      const planType = intent.planType ?? DEFAULT_PLAN_TYPE;
      const planDefaults = buildCalendarPlanDefaults(
        intent.dateKey,
        openPlanStateId,
        planType,
      );
      const created = await createPlan(planDefaults, {
        newOrderLinks: intent.orderServerIds,
        planType,
      });
      const createdBundle = normalizePlanCreateBundle(created?.created?.[0]);
      return {
        droppedPlanClientId: createdBundle?.plan.client_id ?? null,
        success: created != null,
      };
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

  return { execute, hasActiveItemLabelTemplate, downloadItemLabelsForOrder };
};
