import { useCallback } from "react";

import { ApiError } from "@/lib/api/ApiClient";
import { useMessageHandler } from "@shared-message-handler";

import { useDeleteOrderNote, useUpdateOrderNote } from "../api/orderApi";
import type { Order } from "../types/order";
import { selectOrderByClientId, updateOrderByClientId, upsertOrder, useOrderStore } from "../store/order.store";
import {
  removeOrderNoteAtIndex,
  replaceOrderNoteAtIndex,
  toOrderNotePayload,
  type NormalizedOrderNote,
} from "../domain/orderNotes";

type OrderNoteMutationInput = {
  clientId: string;
  note: NormalizedOrderNote;
};

type UpdateOrderNoteInput = OrderNoteMutationInput & {
  content: string;
};

const resolveError = (error: unknown, fallback: string) => ({
  message: error instanceof ApiError ? error.message : fallback,
  status: error instanceof ApiError ? error.status : 500,
});

const resolveCommittedOrder = ({
  clientId,
  responseOrder,
  responseNotes,
}: {
  clientId: string;
  responseOrder?: Order | null;
  responseNotes?: Order["order_notes"];
}): Order | null => {
  const currentOrder = selectOrderByClientId(clientId)(useOrderStore.getState());
  if (!currentOrder) return null;

  const mergedOrder = responseOrder
    ? ({
        ...currentOrder,
        ...responseOrder,
      } as Order)
    : currentOrder;

  return {
    ...mergedOrder,
    order_notes:
      responseNotes !== undefined
        ? responseNotes
        : responseOrder && responseOrder.order_notes !== undefined
        ? responseOrder.order_notes
        : currentOrder.order_notes,
    __optimistic: undefined,
  };
};

export const useOrderNotesController = () => {
  const updateOrderNoteApi = useUpdateOrderNote();
  const deleteOrderNoteApi = useDeleteOrderNote();
  const { showMessage } = useMessageHandler();

  const updateOrderNote = useCallback(
    async ({ clientId, note, content }: UpdateOrderNoteInput): Promise<boolean> => {
      const trimmedContent = content.trim();
      if (!trimmedContent) {
        showMessage({ status: 400, message: "Note content cannot be empty." });
        return false;
      }

      const order = selectOrderByClientId(clientId)(useOrderStore.getState());
      if (!order?.id) {
        showMessage({ status: 404, message: "Order not found for note update." });
        return false;
      }

      const previousNotes = order.order_notes ?? null;
      const optimisticNote = toOrderNotePayload(note, trimmedContent);

      updateOrderByClientId(clientId, (currentOrder) => ({
        ...currentOrder,
        order_notes: replaceOrderNoteAtIndex(currentOrder.order_notes, note.index, optimisticNote),
        __optimistic: true,
      }));

      try {
        const response = await updateOrderNoteApi({
          target_id: order.id,
          order_notes: toOrderNotePayload(note, trimmedContent),
        });

        const responseOrder = response.data?.order;
        const responseNotes = response.data?.order_notes;
        const committedOrder = resolveCommittedOrder({
          clientId,
          responseOrder: responseOrder ?? null,
          responseNotes,
        });

        if (committedOrder?.client_id) {
          upsertOrder(committedOrder);
          return true;
        }

        updateOrderByClientId(clientId, (currentOrder) => ({
          ...currentOrder,
          __optimistic: undefined,
        }));
        return true;
      } catch (error) {
        updateOrderByClientId(clientId, (currentOrder) => ({
          ...currentOrder,
          order_notes: previousNotes,
          __optimistic: undefined,
        }));
        const resolved = resolveError(error, "Unable to update order note.");
        showMessage({ status: resolved.status, message: resolved.message });
        return false;
      }
    },
    [showMessage, updateOrderNoteApi],
  );

  const deleteOrderNote = useCallback(
    async ({ clientId, note }: OrderNoteMutationInput): Promise<boolean> => {
      const order = selectOrderByClientId(clientId)(useOrderStore.getState());
      if (!order?.id) {
        showMessage({ status: 404, message: "Order not found for note deletion." });
        return false;
      }

      const previousNotes = order.order_notes ?? null;

      updateOrderByClientId(clientId, (currentOrder) => ({
        ...currentOrder,
        order_notes: removeOrderNoteAtIndex(currentOrder.order_notes, note.index),
        __optimistic: true,
      }));

      try {
        const response = await deleteOrderNoteApi({
          target_id: order.id,
          order_notes: toOrderNotePayload(note),
        });

        const responseOrder = response.data?.order;
        if (responseOrder?.client_id) {
          const currentOrder = selectOrderByClientId(clientId)(useOrderStore.getState());
          upsertOrder({
            ...(currentOrder ?? {}),
            ...responseOrder,
            order_notes:
              responseOrder.order_notes !== undefined
                ? responseOrder.order_notes
                : currentOrder?.order_notes ?? null,
            __optimistic: undefined,
          } as Order);
          return true;
        }

        updateOrderByClientId(clientId, (currentOrder) => ({
          ...currentOrder,
          __optimistic: undefined,
        }));
        return true;
      } catch (error) {
        updateOrderByClientId(clientId, (currentOrder) => ({
          ...currentOrder,
          order_notes: previousNotes,
          __optimistic: undefined,
        }));
        const resolved = resolveError(error, "Unable to delete order note.");
        showMessage({ status: resolved.status, message: resolved.message });
        return false;
      }
    },
    [deleteOrderNoteApi, showMessage],
  );

  return {
    updateOrderNote,
    deleteOrderNote,
  };
};
