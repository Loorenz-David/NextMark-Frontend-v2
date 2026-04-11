import type { RefObject } from "react";

import { getObjectDiff } from "@shared-utils";

import type { useOrderItemDraftController } from "../../../item";
import type { Item, ItemUpdateFields } from "../../../item";
import type {
  ItemCreateResponse,
  ItemMutationResponse,
} from "../../../item/api/item.api";
import type { Order, OrderUpdateFields } from "../../../types/order";
import type { OrderFormMode, OrderFormState } from "../state/OrderForm.types";
import {
  normalizeFormStateForSave,
  stripImmutableItemFields,
} from "../../../api/mappers/orderForm.normalize";
import type { Costumer } from "@/features/costumer";
import { patchOrderTotals } from "../../../store/order.store";
import { patchRoutePlanTotals } from "@/features/plan/store/routePlan.slice";

type ItemDraftControllerApi = Pick<
  ReturnType<typeof useOrderItemDraftController>,
  "getCreatedItems" | "getUpdatedItems" | "getDeletedItems" | "reset"
>;

export type OrderFormSubmitResult =
  | {
      status: "success_create";
      createdOrderId: number | null;
      createdOrderClientId: string | null;
    }
  | { status: "success_edit" }
  | { status: "no_changes" }
  | { status: "validation_error"; message: string }
  | { status: "dependency_error"; message: string }
  | { status: "error"; message: string };

export type OrderFormSubmitCommand = {
  mode: OrderFormMode;
  order: Order | null;
  orderServerId: number | null;
  formState: OrderFormState;
  selectedCostumer?: Costumer | null;
  validateForm: () => boolean;
  validateRequiredFields?: boolean;
  validatePayloadFields?: boolean;
  initialFormRef: RefObject<OrderFormState | null>;
  itemDraftController: ItemDraftControllerApi;
  itemInitialByClientId: Record<string, Item>;
  onOrderRollback?: () => void;
};

type OrderFormSubmitDeps = {
  saveOrder: (params: {
    mode: "create" | "edit";
    clientId?: string;
    fields: OrderUpdateFields;
    onRollback?: () => void;
    optimisticImmediate?: boolean;
    onCreateCommitted?: (
      createdBundles: Array<{ order?: Order | null }>,
    ) => void;
  }) => Promise<boolean>;
  createItemApi: (fields: Item[]) => Promise<{ data?: ItemCreateResponse }>;
  updateItemApi: (
    payload: Array<{ target_id: number; fields: ItemUpdateFields }>,
  ) => Promise<{ data?: ItemMutationResponse }>;
  deleteItemApi: (payload: {
    target_ids: number[];
  }) => Promise<{ data?: ItemMutationResponse }>;
  loadItemsByOrderId: (orderId: number) => Promise<unknown>;
  validateOrderFields: (payload: OrderUpdateFields) => boolean;
};

export const executeOrderFormSubmit = async (
  deps: OrderFormSubmitDeps,
  command: OrderFormSubmitCommand,
): Promise<OrderFormSubmitResult> => {
  const {
    mode,
    order,
    orderServerId,
    formState,
    selectedCostumer,
    validateForm,
    validateRequiredFields = true,
    validatePayloadFields = true,
    initialFormRef,
    itemDraftController,
    itemInitialByClientId,
    onOrderRollback,
  } = command;

  const {
    saveOrder,
    createItemApi,
    updateItemApi,
    deleteItemApi,
    loadItemsByOrderId,
    validateOrderFields,
  } = deps;

  if (validateRequiredFields) {
    const isValid = validateForm();
    if (!isValid) {
      return {
        status: "validation_error",
        message: "Please fix the highlighted fields.",
      };
    }
  }

  const initialForm = initialFormRef.current;
  if (!initialForm) {
    return {
      status: "dependency_error",
      message: "Missing initial form snapshot.",
    };
  }

  const normalizedCurrent = normalizeFormStateForSave(formState);
  const normalizedInitial = normalizeFormStateForSave(initialForm);

  const orderChanges =
    mode === "create"
      ? normalizedCurrent
      : getObjectDiff(normalizedInitial, normalizedCurrent);

  const createdItems = itemDraftController.getCreatedItems();
  const updatedItems = itemDraftController.getUpdatedItems();
  const deletedItemClientIds = itemDraftController.getDeletedItems();
  const hasItemChanges =
    createdItems.length > 0 ||
    updatedItems.length > 0 ||
    deletedItemClientIds.length > 0;

  const nextCostumerId =
    typeof selectedCostumer?.id === "number" ? selectedCostumer.id : null;
  const currentOrderCostumerId =
    typeof order?.costumer_id === "number" ? order.costumer_id : null;
  const hasCostumerAssociationChange =
    mode === "edit" &&
    nextCostumerId !== null &&
    nextCostumerId !== currentOrderCostumerId;

  if (
    mode === "edit" &&
    !Object.keys(orderChanges).length &&
    !hasItemChanges &&
    !hasCostumerAssociationChange
  ) {
    return { status: "no_changes" };
  }

  const costumerPayload =
    nextCostumerId !== null ? { costumer_id: nextCostumerId } : null;

  try {
    if (mode === "create") {
      let createdOrderId: number | null = null;
      let createdOrderClientId: string | null = null;
      const createItemsPayload = createdItems.map((item) => {
        const payloadItem = { ...item };
        const { order_id, id, ...fields } = payloadItem;
        return fields;
      });

      const createPayload = {
        ...orderChanges,
        items: createItemsPayload,
        ...(costumerPayload ? { costumer: costumerPayload } : {}),
      } as OrderUpdateFields;

      if (validatePayloadFields && !validateOrderFields(createPayload)) {
        return {
          status: "validation_error",
          message: "Please check the form inputs.",
        };
      }

      const createSucceeded = await saveOrder({
        mode,
        clientId: order?.client_id,
        fields: createPayload,
        onRollback: onOrderRollback,
        optimisticImmediate: false,
        onCreateCommitted: (createdBundles) => {
          const resolved =
            createdBundles.find(
              (bundle) =>
                bundle?.order?.client_id &&
                bundle.order.client_id === normalizedCurrent.client_id,
            ) ??
            createdBundles.find((bundle) =>
              Boolean(bundle?.order?.client_id),
            ) ??
            null;

          const resolvedOrder = resolved?.order ?? null;
          createdOrderId =
            typeof resolvedOrder?.id === "number" ? resolvedOrder.id : null;
          createdOrderClientId = resolvedOrder?.client_id ?? null;
        },
      });

      if (!createSucceeded) {
        return { status: "error", message: "Unable to save order and items." };
      }

      return {
        status: "success_create",
        createdOrderId,
        createdOrderClientId,
      };
    }

    const editPayload = hasCostumerAssociationChange
      ? ({ ...orderChanges, costumer: costumerPayload } as OrderUpdateFields)
      : orderChanges;

    if (Object.keys(editPayload).length > 0) {
      if (validatePayloadFields && !validateOrderFields(editPayload)) {
        return {
          status: "validation_error",
          message: "Please check the form inputs.",
        };
      }

      void saveOrder({
        mode,
        clientId: order?.client_id,
        fields: editPayload,
        onRollback: onOrderRollback,
        optimisticImmediate: true,
      });
    }

    if (hasItemChanges) {
      if (typeof orderServerId !== "number") {
        return {
          status: "dependency_error",
          message: "Order id is required to save item changes.",
        };
      }

      if (createdItems.length > 0) {
        const createPayload = createdItems.map((draft) => ({
          ...draft,
          order_id: orderServerId,
        }));
        const res = await createItemApi(createPayload);
        res.data?.order_totals?.forEach(
          ({ id, total_weight, total_volume, total_items }) => {
            patchOrderTotals(id, { total_weight, total_volume, total_items });
          },
        );
        res.data?.plan_totals?.forEach((p) => {
          patchRoutePlanTotals(p.id, {
            total_weight: p.total_weight,
            total_volume: p.total_volume,
            total_items: p.total_items,
            item_type_counts: p.item_type_counts,
            total_orders: p.total_orders,
          });
        });
      }

      if (updatedItems.length > 0) {
        const updatePayload = updatedItems
          .map((draft) => {
            const targetId =
              draft.id ?? itemInitialByClientId[draft.client_id]?.id;
            if (typeof targetId !== "number") {
              return null;
            }

            return {
              target_id: targetId,
              fields: stripImmutableItemFields(draft),
            };
          })
          .filter(
            (entry): entry is { target_id: number; fields: ItemUpdateFields } =>
              Boolean(entry),
          );

        if (updatePayload.length !== updatedItems.length) {
          return {
            status: "dependency_error",
            message: "Unable to resolve item id for update.",
          };
        }

        const res = await updateItemApi(updatePayload);
        res.data?.order_totals?.forEach(
          ({ id, total_weight, total_volume, total_items }) => {
            patchOrderTotals(id, { total_weight, total_volume, total_items });
          },
        );
        res.data?.plan_totals?.forEach((p) => {
          patchRoutePlanTotals(p.id, {
            total_weight: p.total_weight,
            total_volume: p.total_volume,
            total_items: p.total_items,
            item_type_counts: p.item_type_counts,
            total_orders: p.total_orders,
          });
        });
      }

      if (deletedItemClientIds.length > 0) {
        const targetIds = deletedItemClientIds
          .map((clientId) => itemInitialByClientId[clientId]?.id)
          .filter((id): id is number => typeof id === "number");

        if (targetIds.length !== deletedItemClientIds.length) {
          return {
            status: "dependency_error",
            message: "Unable to resolve item id for deletion.",
          };
        }

        const res = await deleteItemApi({ target_ids: targetIds });
        res.data?.order_totals?.forEach(
          ({ id, total_weight, total_volume, total_items }) => {
            patchOrderTotals(id, { total_weight, total_volume, total_items });
          },
        );
        res.data?.plan_totals?.forEach((p) => {
          patchRoutePlanTotals(p.id, {
            total_weight: p.total_weight,
            total_volume: p.total_volume,
            total_items: p.total_items,
            item_type_counts: p.item_type_counts,
            total_orders: p.total_orders,
          });
        });
      }

      await loadItemsByOrderId(orderServerId);
    }

    return { status: "success_edit" };
  } catch (error) {
    console.error("Failed to save order form transaction", error);
    return { status: "error", message: "Unable to save order and items." };
  }
};
