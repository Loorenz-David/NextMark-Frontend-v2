import { useCallback } from "react";

import { buildClientId } from "@/lib/utils/clientId";
import { useMessageHandler } from "@shared-message-handler";

import {
  useCreateItem,
  useDeleteItem,
  useUpdateItem as useUpdateItemApi,
} from "../api/item.api";
import { computeItemDelta } from "../domain/itemTotals";
import { useItemValidation } from "../domain/useItemValidation";
import {
  removeItemByClientId,
  selectItemByClientId,
  setItem,
  updateItemByClientId,
  useItemStore,
} from "../store/item.store";
import type { Item, ItemUpdateFields } from "../types";
import {
  patchOrderTotals,
  selectOrderByServerId,
  useOrderStore,
} from "../../store/order.store";
import { patchRoutePlanTotals } from "@/features/plan/store/routePlan.slice";
import { normalizeItemPosition } from "../domain/itemPosition";

export type SaveAutonomousItemResult =
  | { status: "created"; item: Item }
  | { status: "updated"; item: Item }
  | { status: "failure" };

const stripImmutableFields = (draft: Item): ItemUpdateFields => {
  return {
    article_number: draft.article_number,
    reference_number: draft.reference_number ?? null,
    item_type: draft.item_type,
    item_position: normalizeItemPosition(draft.item_position),
    properties: draft.properties ?? null,
    page_link: draft.page_link ?? null,
    dimension_depth: draft.dimension_depth ?? null,
    dimension_height: draft.dimension_height ?? null,
    dimension_width: draft.dimension_width ?? null,
    weight: draft.weight ?? null,
    quantity: draft.quantity ?? 1,
  };
};

export const useItemController = () => {
  const createItemApi = useCreateItem();
  const updateItemApi = useUpdateItemApi();
  const deleteItemApi = useDeleteItem();
  const validation = useItemValidation();
  const { showMessage } = useMessageHandler();

  const saveAutonomousItem = useCallback(
    async ({
      orderId,
      itemId,
      draft,
    }: {
      orderId: number;
      itemId?: string;
      draft: Item;
    }): Promise<SaveAutonomousItemResult> => {
      const normalizedDraft: Item = {
        ...draft,
        order_id: orderId,
        client_id: draft.client_id || buildClientId("item"),
        item_position: normalizeItemPosition(draft.item_position),
      };

      if (!validation.validateItemDraft(normalizedDraft)) {
        showMessage({ status: 400, message: "Please check the item fields." });
        return { status: "failure" };
      }

      if (itemId) {
        const existing = selectItemByClientId(itemId)(useItemStore.getState());
        if (!existing) {
          showMessage({ status: 404, message: "Item not found for update." });
          return { status: "failure" };
        }

        if (existing.order_id !== orderId) {
          showMessage({
            status: 400,
            message: "Item does not belong to this order.",
          });
          return { status: "failure" };
        }

        if (!existing.id) {
          showMessage({
            status: 400,
            message: "Item must be synced before update.",
          });
          return { status: "failure" };
        }

        const previous = { ...existing };

        // Snapshot order totals and compute deltas before the optimistic item update
        const orderSnapshot =
          typeof existing.order_id === "number"
            ? selectOrderByServerId(existing.order_id)(useOrderStore.getState())
            : null;
        const snapshotTotals = orderSnapshot
          ? {
              total_weight: orderSnapshot.total_weight,
              total_volume: orderSnapshot.total_volume,
              total_items: orderSnapshot.total_items,
            }
          : null;
        const oldDelta = computeItemDelta(existing);
        const newDelta = computeItemDelta(normalizedDraft);

        updateItemByClientId(existing.client_id, () => ({
          ...existing,
          ...normalizedDraft,
        }));

        // Optimistic order totals update
        if (typeof existing.order_id === "number" && snapshotTotals !== null) {
          patchOrderTotals(existing.order_id, {
            total_weight:
              (snapshotTotals.total_weight ?? 0) -
              oldDelta.weight +
              newDelta.weight,
            total_volume:
              (snapshotTotals.total_volume ?? 0) -
              oldDelta.volume +
              newDelta.volume,
            total_items:
              (snapshotTotals.total_items ?? 0) -
              oldDelta.count +
              newDelta.count,
          });
        }

        try {
          const response = await updateItemApi({
            target_id: existing.id,
            fields: stripImmutableFields(normalizedDraft),
          });
          const orderTotals = response.data?.order_totals ?? [];
          orderTotals.forEach(
            ({ id, total_weight, total_volume, total_items }) => {
              patchOrderTotals(id, { total_weight, total_volume, total_items });
            },
          );
          response.data?.plan_totals?.forEach((p) => {
            patchRoutePlanTotals(p.id, {
              total_weight: p.total_weight,
              total_volume: p.total_volume,
              total_items: p.total_items,
              item_type_counts: p.item_type_counts,
              total_orders: p.total_orders,
            });
          });
          return { status: "updated", item: normalizedDraft };
        } catch (error) {
          console.error("Failed to update item", error);
          updateItemByClientId(existing.client_id, () => previous);
          if (
            typeof existing.order_id === "number" &&
            snapshotTotals !== null
          ) {
            patchOrderTotals(existing.order_id, snapshotTotals);
          }
          showMessage({ status: 500, message: "Unable to update item." });
          return { status: "failure" };
        }
      }

      const optimisticItem: Item = {
        ...normalizedDraft,
      };

      // Snapshot order totals and compute delta before the optimistic item insert
      const orderSnapshot = orderId
        ? selectOrderByServerId(orderId)(useOrderStore.getState())
        : null;
      const snapshotTotals = orderSnapshot
        ? {
            total_weight: orderSnapshot.total_weight,
            total_volume: orderSnapshot.total_volume,
            total_items: orderSnapshot.total_items,
          }
        : null;
      const delta = computeItemDelta(normalizedDraft);

      setItem(optimisticItem);

      // Optimistic order totals update
      if (orderId && snapshotTotals !== null) {
        patchOrderTotals(orderId, {
          total_weight: (snapshotTotals.total_weight ?? 0) + delta.weight,
          total_volume: (snapshotTotals.total_volume ?? 0) + delta.volume,
          total_items: (snapshotTotals.total_items ?? 0) + delta.count,
        });
      }

      try {
        const response = await createItemApi(optimisticItem);

        const serverItem = response.data?.item?.find(
          (i) => i.client_id === optimisticItem.client_id,
        );
        if (serverItem && typeof serverItem.id === "number") {
          updateItemByClientId(optimisticItem.client_id, (current) => ({
            ...current,
            id: serverItem.id,
            item_state_id: serverItem.item_state_id,
          }));
        }

        const orderTotals = response.data?.order_totals ?? [];
        orderTotals.forEach(
          ({ id, total_weight, total_volume, total_items }) => {
            patchOrderTotals(id, { total_weight, total_volume, total_items });
          },
        );
        response.data?.plan_totals?.forEach((p) => {
          patchRoutePlanTotals(p.id, {
            total_weight: p.total_weight,
            total_volume: p.total_volume,
            total_items: p.total_items,
            item_type_counts: p.item_type_counts,
            total_orders: p.total_orders,
          });
        });

        return {
          status: "created",
          item:
            serverItem && typeof serverItem.id === "number"
              ? {
                  ...optimisticItem,
                  id: serverItem.id,
                  item_state_id: serverItem.item_state_id,
                }
              : optimisticItem,
        };
      } catch (error) {
        console.error("Failed to create item", error);
        removeItemByClientId(optimisticItem.client_id);
        if (orderId && snapshotTotals !== null) {
          patchOrderTotals(orderId, snapshotTotals);
        }
        showMessage({ status: 500, message: "Unable to create item." });
        return { status: "failure" };
      }
    },
    [createItemApi, showMessage, updateItemApi, validation],
  );

  const deleteAutonomousItem = useCallback(
    async (itemId: string) => {
      const existing = selectItemByClientId(itemId)(useItemStore.getState());
      if (!existing) {
        showMessage({ status: 404, message: "Item not found for deletion." });
        return false;
      }

      const previous = { ...existing };

      // Snapshot order totals and compute delta BEFORE removing from item store
      const orderSnapshot =
        typeof existing.order_id === "number"
          ? selectOrderByServerId(existing.order_id)(useOrderStore.getState())
          : null;
      const snapshotTotals = orderSnapshot
        ? {
            total_weight: orderSnapshot.total_weight,
            total_volume: orderSnapshot.total_volume,
            total_items: orderSnapshot.total_items,
          }
        : null;
      const delta = computeItemDelta(existing);
      const affectedOrderId =
        typeof existing.order_id === "number" ? existing.order_id : null;

      removeItemByClientId(existing.client_id);

      // Optimistic order totals subtraction (applies even for unsynced items with no server id)
      if (affectedOrderId !== null && snapshotTotals !== null) {
        patchOrderTotals(affectedOrderId, {
          total_weight: Math.max(
            0,
            (snapshotTotals.total_weight ?? 0) - delta.weight,
          ),
          total_volume: Math.max(
            0,
            (snapshotTotals.total_volume ?? 0) - delta.volume,
          ),
          total_items: Math.max(
            0,
            (snapshotTotals.total_items ?? 0) - delta.count,
          ),
        });
      }

      if (!existing.id) {
        return true;
      }

      try {
        const response = await deleteItemApi({ target_id: existing.id });
        const orderTotals = response.data?.order_totals ?? [];
        orderTotals.forEach(
          ({ id, total_weight, total_volume, total_items }) => {
            patchOrderTotals(id, { total_weight, total_volume, total_items });
          },
        );
        response.data?.plan_totals?.forEach((p) => {
          patchRoutePlanTotals(p.id, {
            total_weight: p.total_weight,
            total_volume: p.total_volume,
            total_items: p.total_items,
            item_type_counts: p.item_type_counts,
            total_orders: p.total_orders,
          });
        });
        return true;
      } catch (error) {
        console.error("Failed to delete item", error);
        setItem(previous);
        if (affectedOrderId !== null && snapshotTotals !== null) {
          patchOrderTotals(affectedOrderId, snapshotTotals);
        }
        showMessage({ status: 500, message: "Unable to delete item." });
        return false;
      }
    },
    [deleteItemApi, showMessage],
  );

  return {
    saveAutonomousItem,
    deleteAutonomousItem,
  };
};
