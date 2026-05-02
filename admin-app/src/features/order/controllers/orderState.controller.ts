import { useCallback } from "react";

import { ApiError } from "@/lib/api/ApiClient";
import { useMessageHandler } from "@shared-message-handler";

import { applyOrderStateUpdatePayload } from "../actions/applyOrderStateUpdatePayload.action";
import { useUpdateOrderState } from "../api/orderState.api";
import type { OrderStateFields } from "../api/orderState.api";
import { useOrderStateRegistry } from "../domain/useOrderStateRegistry";
import type { Order, OrderUpdateFields } from "../types/order";
import {
  selectOrderByClientId,
  updateOrderByClientId,
  useOrderStore,
} from "../store/order.store";

const appendOrderNote = (
  currentNotes: Order["order_notes"],
  incomingNote: OrderStateFields["order_notes"],
): Order["order_notes"] => {
  if (incomingNote == null) return currentNotes ?? null;
  const existing = currentNotes ?? [];
  return [...existing, incomingNote];
};

export const useOrderStateController = () => {
  const updateOrderStateApi = useUpdateOrderState();
  const registry = useOrderStateRegistry();
  const { showMessage } = useMessageHandler();

  const setOrderState = useCallback(
    async (
      clientId: string,
      targetStateId: number,
      fields?: OrderStateFields,
    ): Promise<boolean> => {
      const order = selectOrderByClientId(clientId)(useOrderStore.getState());
      if (!order) return false;
      if (typeof order.id !== "number") return false;
      if (typeof order.order_state_id !== "number") return false;

      const currentStateId = order.order_state_id;
      if (currentStateId === targetStateId) return true;

      const targetState = registry.getById(targetStateId);
      if (!targetState) return false;

      const normalizedFields: OrderUpdateFields | undefined = fields
        ? ({
            ...fields,
            ...(Object.prototype.hasOwnProperty.call(fields, "order_notes")
              ? {
                  order_notes: appendOrderNote(
                    order.order_notes,
                    fields.order_notes,
                  ),
                }
              : {}),
          } as OrderUpdateFields)
        : undefined;

      const previousFieldSnapshot: OrderUpdateFields | null = normalizedFields
        ? Object.keys(normalizedFields).reduce<OrderUpdateFields>(
            (acc, key) => {
              const typedKey = key as keyof OrderUpdateFields;
              return {
                ...acc,
                [typedKey]: order[typedKey],
              };
            },
            {},
          )
        : null;

      updateOrderByClientId(clientId, (currentOrder) => ({
        ...currentOrder,
        ...(normalizedFields ?? {}),
        order_state_id: targetStateId,
      }));

      try {
        const response = await updateOrderStateApi(
          order.id,
          targetStateId,
          fields,
        );
        applyOrderStateUpdatePayload(response.data);
        return true;
      } catch (error) {
        updateOrderByClientId(clientId, (currentOrder) => ({
          ...currentOrder,
          ...(previousFieldSnapshot ?? {}),
          order_state_id: currentStateId,
        }));

        const message =
          error instanceof ApiError
            ? error.message
            : "Unable to update order state.";
        const status = error instanceof ApiError ? error.status : 500;
        showMessage({ status, message });
        return false;
      }
    },
    [registry, showMessage, updateOrderStateApi],
  );

  const advanceOrderState = useCallback(
    async (clientId: string): Promise<boolean> => {
      const order = selectOrderByClientId(clientId)(useOrderStore.getState());
      if (!order) return false;
      if (typeof order.order_state_id !== "number") return false;

      const nextStateId = registry.getNextStateId(order.order_state_id);
      if (nextStateId == null) return false;

      return setOrderState(clientId, nextStateId);
    },
    [registry, setOrderState],
  );

  return {
    advanceOrderState,
    setOrderState,
  };
};
