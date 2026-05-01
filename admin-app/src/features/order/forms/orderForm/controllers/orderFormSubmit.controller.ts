import type { RefObject } from "react";

import { getObjectDiff } from "@shared-utils";

import type { useOrderItemDraftController } from "../../../item";
import type { Item, ItemMap, ItemUpdateFields } from "../../../item";
import type {
  ItemCreateResponse,
  ItemMutationResponse,
} from "../../../item/api/item.api";
import { computeItemDelta } from "../../../item/domain/itemTotals";
import {
  replaceItemsForOrder,
  updateItemByClientId,
} from "../../../item/store/item.store";
import type { Order, OrderUpdateFields } from "../../../types/order";
import type { OrderFormMode, OrderFormState } from "../state/OrderForm.types";
import {
  normalizeFormStateForSave,
  stripImmutableItemFields,
} from "../../../api/mappers/orderForm.normalize";
import type { Costumer } from "@/features/costumer";
import {
  patchOrderTotals,
  selectOrderByServerId,
  useOrderStore,
} from "../../../store/order.store";
import { patchRoutePlanTotals } from "@/features/plan/store/routePlan.slice";

type ItemDraftControllerApi = Pick<
  ReturnType<typeof useOrderItemDraftController>,
  "getCreatedItems" | "getUpdatedItems" | "getDeletedItems" | "reset"
>;

type OrderTotalsSnapshot = {
  total_weight: number | null | undefined;
  total_volume: number | null | undefined;
  total_items: number | null | undefined;
};

type OrderFormItemOptimisticSnapshot = {
  items: Item[];
  orderTotals: OrderTotalsSnapshot | null;
};

const toItemMap = (items: Item[]): ItemMap => {
  const byClientId = items.reduce<Record<string, Item>>((acc, item) => {
    acc[item.client_id] = item;
    return acc;
  }, {});

  return {
    byClientId,
    allIds: items.map((item) => item.client_id),
  };
};

const createItemMutationSnapshot = (
  orderId: number,
  initialItemsByClientId: Record<string, Item>,
): OrderFormItemOptimisticSnapshot => {
  const order = selectOrderByServerId(orderId)(useOrderStore.getState());

  return {
    items: Object.values(initialItemsByClientId),
    orderTotals: order
      ? {
          total_weight: order.total_weight,
          total_volume: order.total_volume,
          total_items: order.total_items,
        }
      : null,
  };
};

const restoreItemMutationSnapshot = (
  orderId: number,
  snapshot: OrderFormItemOptimisticSnapshot,
) => {
  replaceItemsForOrder(orderId, toItemMap(snapshot.items));
  if (snapshot.orderTotals) {
    patchOrderTotals(orderId, snapshot.orderTotals);
  }
};

const buildOptimisticItems = ({
  orderId,
  initialItemsByClientId,
  createdItems,
  updatedItems,
  deletedItemClientIds,
}: {
  orderId: number;
  initialItemsByClientId: Record<string, Item>;
  createdItems: Item[];
  updatedItems: Item[];
  deletedItemClientIds: string[];
}) => {
  const nextByClientId = { ...initialItemsByClientId };

  createdItems.forEach((draft) => {
    nextByClientId[draft.client_id] = {
      ...draft,
      order_id: orderId,
    };
  });

  updatedItems.forEach((draft) => {
    const current = nextByClientId[draft.client_id] ?? draft;
    nextByClientId[draft.client_id] = {
      ...current,
      ...draft,
      order_id: orderId,
    };
  });

  deletedItemClientIds.forEach((clientId) => {
    delete nextByClientId[clientId];
  });

  return Object.values(nextByClientId);
};

const buildOptimisticOrderTotals = ({
  snapshot,
  initialItemsByClientId,
  createdItems,
  updatedItems,
  deletedItemClientIds,
  orderId,
}: {
  snapshot: OrderFormItemOptimisticSnapshot;
  initialItemsByClientId: Record<string, Item>;
  createdItems: Item[];
  updatedItems: Item[];
  deletedItemClientIds: string[];
  orderId: number;
}): OrderTotalsSnapshot | null => {
  if (!snapshot.orderTotals) {
    return null;
  }

  const nextTotals = {
    total_weight: snapshot.orderTotals.total_weight ?? 0,
    total_volume: snapshot.orderTotals.total_volume ?? 0,
    total_items: snapshot.orderTotals.total_items ?? 0,
  };

  createdItems.forEach((draft) => {
    const delta = computeItemDelta({ ...draft, order_id: orderId });
    nextTotals.total_weight += delta.weight;
    nextTotals.total_volume += delta.volume;
    nextTotals.total_items += delta.count;
  });

  updatedItems.forEach((draft) => {
    const previous = initialItemsByClientId[draft.client_id];
    if (!previous) {
      return;
    }

    const oldDelta = computeItemDelta(previous);
    const newDelta = computeItemDelta({
      ...previous,
      ...draft,
      order_id: orderId,
    });

    nextTotals.total_weight += newDelta.weight - oldDelta.weight;
    nextTotals.total_volume += newDelta.volume - oldDelta.volume;
    nextTotals.total_items += newDelta.count - oldDelta.count;
  });

  deletedItemClientIds.forEach((clientId) => {
    const previous = initialItemsByClientId[clientId];
    if (!previous) {
      return;
    }

    const delta = computeItemDelta(previous);
    nextTotals.total_weight = Math.max(
      0,
      nextTotals.total_weight - delta.weight,
    );
    nextTotals.total_volume = Math.max(
      0,
      nextTotals.total_volume - delta.volume,
    );
    nextTotals.total_items = Math.max(0, nextTotals.total_items - delta.count);
  });

  return nextTotals;
};

const applyOptimisticItemMutations = ({
  orderId,
  snapshot,
  initialItemsByClientId,
  createdItems,
  updatedItems,
  deletedItemClientIds,
}: {
  orderId: number;
  snapshot: OrderFormItemOptimisticSnapshot;
  initialItemsByClientId: Record<string, Item>;
  createdItems: Item[];
  updatedItems: Item[];
  deletedItemClientIds: string[];
}) => {
  const nextItems = buildOptimisticItems({
    orderId,
    initialItemsByClientId,
    createdItems,
    updatedItems,
    deletedItemClientIds,
  });

  replaceItemsForOrder(orderId, toItemMap(nextItems));

  const nextTotals = buildOptimisticOrderTotals({
    snapshot,
    initialItemsByClientId,
    createdItems,
    updatedItems,
    deletedItemClientIds,
    orderId,
  });

  if (nextTotals) {
    patchOrderTotals(orderId, nextTotals);
  }
};

const buildTotalsFromItems = (items: Item[]): OrderTotalsSnapshot =>
  items.reduce<OrderTotalsSnapshot>(
    (acc, item) => {
      const delta = computeItemDelta(item);
      return {
        total_weight: (acc.total_weight ?? 0) + delta.weight,
        total_volume: (acc.total_volume ?? 0) + delta.volume,
        total_items: (acc.total_items ?? 0) + delta.count,
      };
    },
    {
      total_weight: 0,
      total_volume: 0,
      total_items: 0,
    },
  );

export type OrderFormSubmitResult =
  | {
      status: "success_create";
      createdOrderId: number | null;
      createdOrderClientId: string | null;
      createdOrderScalarId: number | null;
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
  createCommitMode?: "await" | "defer";
  itemCommitMode?: "await" | "defer";
  onCreateCommitted?: (payload: {
    createdBundles: Array<{ order?: Order | null }>;
    resolvedOrder: Order | null;
  }) => void;
  onItemMutationCommitted?: (payload: {
    createdItems: Item[];
    updatedItems: Item[];
    deletedItemClientIds: string[];
  }) => void;
  onItemMutationFailure?: (message: string) => void;
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
  loadItemsByOrderId: (orderId: number) => Promise<ItemMap | null>;
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
    createCommitMode = "await",
    itemCommitMode = "await",
    onCreateCommitted,
    onItemMutationCommitted,
    onItemMutationFailure,
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
      let createdOrderScalarId: number | null = null;

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

      const handleCreateCommitted = (
        createdBundles: Array<{ order?: Order | null }>,
      ) => {
        const resolved =
          createdBundles.find(
            (bundle) =>
              bundle?.order?.client_id &&
              bundle.order.client_id === normalizedCurrent.client_id,
          ) ??
          createdBundles.find((bundle) => Boolean(bundle?.order?.client_id)) ??
          null;

        const resolvedOrder = resolved?.order ?? null;
        createdOrderId =
          typeof resolvedOrder?.id === "number" ? resolvedOrder.id : null;
        createdOrderClientId = resolvedOrder?.client_id ?? null;
        createdOrderScalarId =
          typeof resolvedOrder?.order_scalar_id === "number"
            ? resolvedOrder.order_scalar_id
            : null;

        onCreateCommitted?.({ createdBundles, resolvedOrder });
      };

      if (createCommitMode === "defer") {
        void saveOrder({
          mode,
          clientId: order?.client_id,
          fields: createPayload,
          onRollback: onOrderRollback,
          optimisticImmediate: true,
          onCreateCommitted: handleCreateCommitted,
        });

        return {
          status: "success_create",
          createdOrderId,
          createdOrderClientId,
          createdOrderScalarId,
        };
      }

      const createSucceeded = await saveOrder({
        mode,
        clientId: order?.client_id,
        fields: createPayload,
        onRollback: onOrderRollback,
        optimisticImmediate: false,
        onCreateCommitted: handleCreateCommitted,
      });

      if (!createSucceeded) {
        return { status: "error", message: "Unable to save order and items." };
      }

      return {
        status: "success_create",
        createdOrderId,
        createdOrderClientId,
        createdOrderScalarId,
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

      const itemSnapshot = createItemMutationSnapshot(
        orderServerId,
        itemInitialByClientId,
      );

      applyOptimisticItemMutations({
        orderId: orderServerId,
        snapshot: itemSnapshot,
        initialItemsByClientId: itemInitialByClientId,
        createdItems,
        updatedItems,
        deletedItemClientIds,
      });

      const runItemMutations = (async () => {
        try {
          if (createdItems.length > 0) {
            const createPayload = createdItems.map((draft) => ({
              ...draft,
              order_id: orderServerId,
            }));
            const res = await createItemApi(createPayload);

            createdItems.forEach((draft) => {
              const serverId = res.data?.item?.[draft.client_id];
              if (typeof serverId === "number") {
                updateItemByClientId(draft.client_id, (current) => ({
                  ...current,
                  id: serverId,
                }));
              }
            });

            res.data?.order_totals?.forEach(
              ({ id, total_weight, total_volume, total_items }) => {
                patchOrderTotals(id, {
                  total_weight,
                  total_volume,
                  total_items,
                });
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
                (
                  entry,
                ): entry is { target_id: number; fields: ItemUpdateFields } =>
                  Boolean(entry),
              );

            if (updatePayload.length !== updatedItems.length) {
              return false;
            }

            const res = await updateItemApi(updatePayload);
            res.data?.order_totals?.forEach(
              ({ id, total_weight, total_volume, total_items }) => {
                patchOrderTotals(id, {
                  total_weight,
                  total_volume,
                  total_items,
                });
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
              return false;
            }

            const res = await deleteItemApi({ target_ids: targetIds });
            res.data?.order_totals?.forEach(
              ({ id, total_weight, total_volume, total_items }) => {
                patchOrderTotals(id, {
                  total_weight,
                  total_volume,
                  total_items,
                });
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
          onItemMutationCommitted?.({
            createdItems,
            updatedItems,
            deletedItemClientIds,
          });
          return true;
        } catch (error) {
          console.error("Failed to save order form items", error);

          try {
            const reloaded = await loadItemsByOrderId(orderServerId);
            if (reloaded) {
              const reloadedItems = reloaded.allIds
                .map((clientId) => reloaded.byClientId[clientId])
                .filter(Boolean);
              patchOrderTotals(
                orderServerId,
                buildTotalsFromItems(reloadedItems),
              );
            } else {
              restoreItemMutationSnapshot(orderServerId, itemSnapshot);
            }
          } catch {
            restoreItemMutationSnapshot(orderServerId, itemSnapshot);
          }

          return false;
        }
      })();

      if (itemCommitMode === "defer") {
        void runItemMutations.then((succeeded) => {
          if (!succeeded) {
            onItemMutationFailure?.("Unable to save item changes.");
          }
        });

        return { status: "success_edit" };
      }

      const itemsSucceeded = await runItemMutations;
      if (!itemsSucceeded) {
        return { status: "error", message: "Unable to save order and items." };
      }
    }

    return { status: "success_edit" };
  } catch (error) {
    console.error("Failed to save order form transaction", error);
    return { status: "error", message: "Unable to save order and items." };
  }
};
