import type { useDownloadTemplateByEventFlow } from "@/features/templates/printDocument/flows";
import { normalizeEntityMap } from "@/lib/utils/entities/normalizeEntityMap";
import { planApi } from "@/features/plan/api/plan.api";
import {
  selectRoutePlanByServerId,
  upsertRoutePlan,
  upsertRoutePlans,
  useRoutePlanStore,
} from "@/features/plan/store/routePlan.slice";
import type { DeliveryPlan, DeliveryPlanMap } from "@/features/plan/types/plan";

import { getOrder, getOrderRouteContext } from "../../api/orderApi";
import { useOrderModel } from "../../domain/useOrderModel";
import type { Order } from "../../types/order";
import {
  selectOrderByServerId,
  upsertOrders,
  useOrderStore,
} from "../../store/order.store";
import type { Item } from "../types";
import { itemsForDownloading } from "../domain/itemsForDownloading";
import type { availableEvents } from "@/features/templates/printDocument/types";

type DownloadByEvent = ReturnType<
  typeof useDownloadTemplateByEventFlow
>["downloadByEvent"];
type NormalizeOrderPayload = ReturnType<
  typeof useOrderModel
>["normalizeOrderPayload"];

const ensureRoutePlanForLabel = async (
  routePlanId: number | null | undefined,
) => {
  if (typeof routePlanId !== "number") return;

  const existingPlan = selectRoutePlanByServerId(routePlanId)(
    useRoutePlanStore.getState(),
  );
  if (existingPlan) return;

  const response = await planApi.getPlan(routePlanId);
  const normalized = normalizeEntityMap<DeliveryPlan>(
    response.data?.route_plan as DeliveryPlanMap | DeliveryPlan,
  );
  if (!normalized) return;

  if (normalized.allIds.length === 1) {
    upsertRoutePlan(normalized.byClientId[normalized.allIds[0]]);
    return;
  }

  upsertRoutePlans(normalized);
};

const resolveOrderForLabel = async (
  orderId: number,
  order: Order | null | undefined,
  normalizeOrderPayload: NormalizeOrderPayload,
) => {
  if (order) return order;

  const storedOrder = selectOrderByServerId(orderId)(useOrderStore.getState());
  if (storedOrder) return storedOrder;

  const response = await getOrder(orderId);
  if (response.data?.order) {
    upsertOrders(normalizeOrderPayload(response.data.order));
  }

  return selectOrderByServerId(orderId)(useOrderStore.getState()) ?? null;
};

const resolveRoutePlanIdForLabel = async (
  orderId: number,
  deliveryPlanId: number | null | undefined,
) => {
  if (typeof deliveryPlanId === "number") return deliveryPlanId;

  try {
    const response = await getOrderRouteContext(orderId);
    const routePlanId = response.data?.route_plan_id;
    return typeof routePlanId === "number" ? routePlanId : null;
  } catch {
    return null;
  }
};

export const startItemLabelDownload = ({
  downloadByEvent,
  event,
  items: initialItems,
  normalizeOrderPayload,
  order,
  orderId,
  onProgress,
  loadItems,
  targetDeliveryPlanId,
}: {
  downloadByEvent: DownloadByEvent;
  event: Extract<availableEvents, "item_created" | "item_edited" | "item_rescheduled">;
  items: Item[];
  normalizeOrderPayload: NormalizeOrderPayload;
  order?: Order | null;
  orderId: number;
  onProgress?: (progress: number) => void;
  loadItems?: (orderId: number) => Promise<Item[]>;
  targetDeliveryPlanId?: number | null;
}) => {
  if (initialItems.length === 0 && !loadItems) return Promise.resolve();

  return (async () => {
    let items = initialItems;
    if (items.length === 0 && loadItems) {
      items = await loadItems(orderId);
    }
    if (items.length === 0) return;

    const resolvedOrder = await resolveOrderForLabel(
      orderId,
      order,
      normalizeOrderPayload,
    );
    onProgress?.(0.03);
    const routePlanId = await resolveRoutePlanIdForLabel(
      orderId,
      targetDeliveryPlanId ?? resolvedOrder?.delivery_plan_id,
    );
    onProgress?.(0.05);
    try {
      await ensureRoutePlanForLabel(routePlanId);
    } catch {
      // Continue label download even if route-plan context cannot be hydrated.
    }
    onProgress?.(0.07);

    await downloadByEvent({
      channel: "item",
      event,
      data: itemsForDownloading(
        items,
        resolvedOrder?.order_scalar_id,
        routePlanId,
        resolvedOrder?.order_notes,
      ),
      fileName: "first test",
      onProgress,
    });
  })();
};
