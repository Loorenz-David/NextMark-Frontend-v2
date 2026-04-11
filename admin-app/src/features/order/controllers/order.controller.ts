import { useCallback } from "react";

import { useMessageHandler } from "@shared-message-handler";
import { optimisticTransaction } from "@shared-optimistic";
import { handlePlanOrderCreation } from "@/features/plan/bridges/orderCreation.bridge";
import { handlePlanOrderUpdate } from "@/features/plan/bridges/orderUpdate.bridge";
import { handlePlanOrderDelete } from "@/features/plan/bridges/orderDelete.bridge";

import {
  useCreateOrder,
  useDeleteOrder,
  useUpdateOrder as useUpdateOrderApi,
  useArchiveOrder as useArchiveOrderApi,
  useUnarchiveOrder as useUnarchiveOrderApi,
} from "../api/orderApi";

import {
  addVisibleOrder,
  removeOrderByClientId,
  setOrder,
  selectOrderByClientId,
  updateOrderByClientId,
  useOrderStore,
} from "../store/order.store";
import type { Order, OrderUpdateFields } from "../types/order";
import {
  createOrderOptimisticSnapshot,
  restoreOrderOptimisticSnapshot,
} from "../utils/orderOptimisticSnapshot";
import { patchRoutePlanTotals } from "@/features/plan/store/routePlan.slice";

export type SaveOrderParams = {
  mode: "create" | "edit";
  action?: boolean;
  clientId?: string;
  fields: OrderUpdateFields;
  onRollback?: () => void;
  optimisticImmediate?: boolean;
  onCreateCommitted?: (createdBundles: Array<{ order?: Order | null }>) => void;
};

const normalizeOrderNotesForOptimistic = (
  notes: unknown,
): Order["order_notes"] => {
  if (!Array.isArray(notes)) return notes != null ? [String(notes)] : null;
  return notes.filter((n): n is string => typeof n === "string");
};

export const useOrderController = () => {
  const createOrder = useCreateOrder();
  const deleteOrderApi = useDeleteOrder();
  const updateOrderApi = useUpdateOrderApi();
  const archiveOrderApi = useArchiveOrderApi();
  const unarchiveOrderApi = useUnarchiveOrderApi();

  const { showMessage } = useMessageHandler();

  const saveOrder = useCallback(
    async ({
      mode,
      clientId,
      fields,
      onRollback,
      optimisticImmediate,
      onCreateCommitted,
    }: SaveOrderParams) => {
      if (mode === "create") {
        const baseOrder = fields as Order;
        if (!baseOrder.client_id) {
          showMessage({ status: 400, message: "Order client id is missing." });
          return false;
        }
        const runCreate = optimisticTransaction({
          snapshot: createOrderOptimisticSnapshot,
          mutate: () => {
            setOrder({
              ...baseOrder,
              order_notes: normalizeOrderNotesForOptimistic(
                baseOrder.order_notes,
              ),
              __optimistic: true,
            });
            addVisibleOrder(baseOrder.client_id);
          },
          request: () => createOrder(baseOrder),
          commit: (response) => {
            const createdBundles = response.data?.created ?? [];
            if (!createdBundles.length) {
              throw new Error(
                "Create order response is missing created items.",
              );
            }

            removeOrderByClientId(baseOrder.client_id);

            createdBundles.forEach((bundle) => {
              if (!bundle?.order?.client_id) return;

              handlePlanOrderCreation(bundle);

              setOrder({
                ...bundle.order,
                order_notes: normalizeOrderNotesForOptimistic(
                  bundle.order.order_notes,
                ),
              });
              addVisibleOrder(bundle.order.client_id);
            });

            const hasBaseOrder = createdBundles.some(
              (bundle) => bundle?.order?.client_id === baseOrder.client_id,
            );
            if (!hasBaseOrder) {
              const fallback = createdBundles[0]?.order;
              if (fallback?.client_id) {
                setOrder({
                  ...baseOrder,
                  ...fallback,
                  order_notes: normalizeOrderNotesForOptimistic(
                    (fallback.order_notes ??
                      baseOrder.order_notes) as Order["order_notes"],
                  ),
                });
                addVisibleOrder(fallback.client_id);
              }
            }

            onCreateCommitted?.(
              createdBundles as Array<{ order?: Order | null }>,
            );

            // Server-authoritative plan totals after order creation
            response.data?.plan_totals?.forEach((p) => {
              patchRoutePlanTotals(p.id, {
                total_weight: p.total_weight,
                total_volume: p.total_volume,
                total_items: p.total_items,
                item_type_counts: p.item_type_counts,
                total_orders: p.total_orders,
              });
            });
          },
          rollback: restoreOrderOptimisticSnapshot,
          onError: (error) => {
            console.error("Failed to save order", error);
            onRollback?.();
            showMessage({ status: 500, message: "Unable to save order." });
          },
        });
        if (optimisticImmediate) {
          void runCreate;
          return true;
        }
        return runCreate;
      }

      if (!clientId) {
        showMessage({ status: 400, message: "Order client id is missing." });
        return false;
      }

      const existing = selectOrderByClientId(clientId)(
        useOrderStore.getState(),
      );
      if (!existing || !existing.id) {
        showMessage({ status: 404, message: "Order not found for update." });
        return false;
      }

      const runEdit = optimisticTransaction({
        snapshot: createOrderOptimisticSnapshot,
        mutate: () => {
          updateOrderByClientId(clientId, (order) => ({
            ...order,
            ...fields,
            order_notes: normalizeOrderNotesForOptimistic(
              (fields.order_notes ?? order.order_notes) as Order["order_notes"],
            ),
            __optimistic: true,
          }));
        },
        request: () =>
          updateOrderApi({
            target_id: existing.id as number,
            fields,
          }),
        commit: (response) => {
          const updatedBundles = response?.data?.updated ?? [];
          if (updatedBundles.length > 0) {
            updatedBundles.forEach((bundle) => {
              if (bundle?.order?.client_id) {
                setOrder({
                  ...bundle.order,
                  order_notes: normalizeOrderNotesForOptimistic(
                    bundle.order.order_notes,
                  ),
                  __optimistic: undefined,
                });
              }
              handlePlanOrderUpdate(bundle);
            });
            return;
          }

          updateOrderByClientId(clientId, (order) => ({
            ...order,
            __optimistic: undefined,
          }));
        },
        rollback: restoreOrderOptimisticSnapshot,
        onError: (error) => {
          console.error("Failed to save order", error);
          onRollback?.();
          showMessage({ status: 500, message: "Unable to save order." });
        },
      });
      if (optimisticImmediate) {
        void runEdit;
        return true;
      }
      return runEdit;
    },
    [createOrder, showMessage, updateOrderApi],
  );

  const deleteOrderByServerId = useCallback(
    async (serverId: number, clientId: string) => {
      if (!serverId) {
        showMessage({ status: 400, message: "Order server id is missing." });
        return false;
      }

      try {
        const response = await deleteOrderApi({ target_id: serverId });
        const deletedClientIds =
          response?.data?.deleted?.order_client_ids ?? [];
        const resolvedClientIds = deletedClientIds.filter(
          (value): value is string =>
            typeof value === "string" && value.length > 0,
        );

        if (resolvedClientIds.length > 0) {
          resolvedClientIds.forEach((deletedClientId) => {
            removeOrderByClientId(deletedClientId);
          });
        } else {
          removeOrderByClientId(clientId);
        }

        const updatedBundles = response?.data?.updated ?? [];
        updatedBundles.forEach((bundle) => {
          handlePlanOrderDelete(bundle);
        });

        showMessage({ status: 200, message: "Order deleted successfully." });
        return true;
      } catch (error) {
        console.error("Failed to delete order", error);
        showMessage({ status: 500, message: "Unable to delete order." });
        return false;
      }
    },
    [deleteOrderApi, showMessage],
  );

  const archiveOrder = useCallback(
    async (clientId: string, orderId?: number) => {
      if (!orderId) {
        showMessage({
          status: "warning",
          message: "Order can't be archive yet",
        });
        return false;
      }

      const optimisticArchiveAt = new Date().toISOString();
      return optimisticTransaction({
        snapshot: createOrderOptimisticSnapshot,
        mutate: () => {
          updateOrderByClientId(clientId, (order) => ({
            ...order,
            archive_at: optimisticArchiveAt,
            __optimistic: true,
          }));
        },
        request: () => archiveOrderApi({ target_id: orderId }),
        commit: (response) => {
          const archiveResponse = response?.data as
            | {
                archive_at?: string | null;
                order?: { archive_at?: string | null };
              }
            | undefined;
          const archiveAt =
            archiveResponse?.archive_at ??
            archiveResponse?.order?.archive_at ??
            optimisticArchiveAt;
          updateOrderByClientId(clientId, (order) => ({
            ...order,
            archive_at: archiveAt,
            __optimistic: undefined,
          }));
          showMessage({ status: 200, message: "Order archived successfully." });
        },
        rollback: restoreOrderOptimisticSnapshot,
        onError: (error) => {
          console.error("Failed to archive order", error);
          showMessage({ status: 500, message: "Unable to archive order." });
        },
      });
    },
    [archiveOrderApi, showMessage],
  );

  const unarchiveOrder = useCallback(
    async (clientId: string, orderId?: number) => {
      if (!orderId) {
        showMessage({
          status: "warning",
          message: "Order can't be unarchived yet",
        });
        return false;
      }

      return optimisticTransaction({
        snapshot: createOrderOptimisticSnapshot,
        mutate: () => {
          updateOrderByClientId(clientId, (order) => ({
            ...order,
            archive_at: null,
            __optimistic: true,
          }));
        },
        request: () => unarchiveOrderApi({ target_id: orderId }),
        commit: () => {
          updateOrderByClientId(clientId, (order) => ({
            ...order,
            archive_at: null,
            __optimistic: undefined,
          }));
          showMessage({
            status: 200,
            message: "Order unarchived successfully.",
          });
        },
        rollback: restoreOrderOptimisticSnapshot,
        onError: (error) => {
          console.error("Failed to unarchive order", error);
          showMessage({ status: 500, message: "Unable to unarchive order." });
        },
      });
    },
    [unarchiveOrderApi, showMessage],
  );

  return {
    archiveOrder,
    unarchiveOrder,
    saveOrder,
    deleteOrderByServerId,
  };
};
