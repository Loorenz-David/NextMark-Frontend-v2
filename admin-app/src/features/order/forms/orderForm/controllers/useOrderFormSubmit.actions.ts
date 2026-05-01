import type { RefObject } from "react";
import { useCallback } from "react";

import { useDownloadTemplateByEventFlow } from "@/features/templates/printDocument/flows";
import { useMessageHandler } from "@shared-message-handler";
import {
  usePopupManager,
  useSectionManager,
} from "@/shared/resource-manager/useResourceManager";

import type { useOrderItemDraftController } from "../../../item";
import type { Item } from "../../../item";
import {
  itemsForDownloading,
  startItemLabelDownload,
  useCreateItem,
  useDeleteItem,
  useItemFlow,
  useUpdateItem,
} from "../../../item";
import { useOrderController } from "../../../controllers/order.controller";
import { useOrderModel } from "../../../domain/useOrderModel";
import { useOrderValidation } from "../../../domain/useOrderValidation";
import { normalizeFormStateForSave } from "../../../api/mappers/orderForm.normalize";
import type { Order } from "../../../types/order";
import type { OrderFormMode, OrderFormState } from "../state/OrderForm.types";

import { executeOrderFormSubmit } from "./orderFormSubmit.controller";
import { presentOrderFormSubmitOutcome } from "./orderFormSubmitFeedback.presenter";
import type { Costumer } from "@/features/costumer";
import type { OrderFormSubmitResult } from "./orderFormSubmit.controller";

type ItemDraftControllerApi = Pick<
  ReturnType<typeof useOrderItemDraftController>,
  "getCreatedItems" | "getUpdatedItems" | "getDeletedItems" | "reset"
>;

const closeOrderPopup = (popupManager: ReturnType<typeof usePopupManager>) => {
  popupManager.closeByKey("order.edit");
  popupManager.closeByKey("order.create");
};

const getOrderPopupKeyByMode = (mode: OrderFormMode) =>
  mode === "create" ? "order.create" : "order.edit";

const reopenOrderFormOnRollback = ({
  popupManager,
  mode,
  order,
  formState,
}: {
  popupManager: ReturnType<typeof usePopupManager>;
  mode: OrderFormMode;
  order: Order | null;
  formState: OrderFormState;
}) => {
  closeOrderPopup(popupManager);
  popupManager.open({
    key: getOrderPopupKeyByMode(mode),
    payload: {
      mode,
      clientId: order?.client_id,
      deliveryPlanId: formState.delivery_plan_id ?? null,
      routeGroupId: formState.route_group_id ?? null,
      restoreFormState: structuredClone(formState),
      controllBodyLayout: true,
    },
  });
};

export const useOrderFormActions = ({
  mode,
  order,
  orderServerId,
  formState,
  validateForm,
  initialFormRef,
  itemDraftController,
  itemInitialByClientId,
  selectedCostumer,
  onPromoteCreatedOrderToEdit,
}: {
  mode: OrderFormMode;
  order: Order | null;
  orderServerId: number | null;
  formState: OrderFormState;
  validateForm: () => boolean;
  initialFormRef: RefObject<OrderFormState | null>;
  itemDraftController: ItemDraftControllerApi;
  itemInitialByClientId: Record<string, Item>;
  selectedCostumer: Costumer | null;
  onPromoteCreatedOrderToEdit?: (clientId: string) => void;
}) => {
  const { showMessage } = useMessageHandler();
  const { deleteOrderByServerId, saveOrder } = useOrderController();
  const { normalizeOrderPayload } = useOrderModel();
  const createItemApi = useCreateItem();
  const updateItemApi = useUpdateItem();
  const deleteItemApi = useDeleteItem();
  const { loadItemsByOrderId } = useItemFlow();
  const validation = useOrderValidation();
  const { downloadByEvent } = useDownloadTemplateByEventFlow();
  const popupManager = usePopupManager();
  const sectionManager = useSectionManager();

  const handleSave = useCallback(() => {
    const createdItems = itemDraftController.getCreatedItems();
    const normalizedCurrent = normalizeFormStateForSave(formState);

    void executeOrderFormSubmit(
      {
        saveOrder,
        createItemApi,
        updateItemApi,
        deleteItemApi,
        loadItemsByOrderId,
        validateOrderFields: validation.validateOrderFields,
      },
      {
        mode,
        order,
        orderServerId,
        formState,
        validateForm,
        initialFormRef,
        itemDraftController,
        itemInitialByClientId,
        selectedCostumer,
        createCommitMode: "defer",
        itemCommitMode: "defer",
        onCreateCommitted: ({ resolvedOrder }) => {
          if (
            createdItems.length === 0 ||
            typeof resolvedOrder?.order_scalar_id !== "number"
          ) {
            return;
          }

          downloadByEvent({
            channel: "item",
            event: "item_created",
            data: itemsForDownloading(
              createdItems,
              resolvedOrder.order_scalar_id,
              normalizedCurrent?.delivery_plan_id,
              normalizedCurrent?.order_notes,
            ),
            fileName: "first test",
          });
        },
        onItemMutationCommitted: ({ updatedItems: committedUpdatedItems }) => {
          if (committedUpdatedItems.length === 0 || typeof orderServerId !== "number") {
            return;
          }

          startItemLabelDownload({
            downloadByEvent,
            event: "item_edited",
            items: committedUpdatedItems,
            normalizeOrderPayload,
            order,
            orderId: orderServerId,
          });
        },
        onItemMutationFailure: (message) =>
          showMessage({ status: 500, message }),
        onOrderRollback: () =>
          reopenOrderFormOnRollback({
            popupManager,
            mode,
            order,
            formState,
          }),
      },
    ).then((result) => {
      presentOrderFormSubmitOutcome({
        result,
        createdItems,
        normalizedCurrent,
        closePopup: () => closeOrderPopup(popupManager),
        showMessage,
        downloadByEvent,
      });
    });
  }, [
    createItemApi,
    deleteItemApi,
    downloadByEvent,
    formState,
    initialFormRef,
    itemDraftController,
    itemInitialByClientId,
    loadItemsByOrderId,
    mode,
    normalizeOrderPayload,
    order,
    orderServerId,
    popupManager,
    saveOrder,
    selectedCostumer,
    showMessage,
    updateItemApi,
    validateForm,
    validation.validateOrderFields,
  ]);

  const handleDelete = useCallback(async () => {
    if (mode !== "edit") return;
    if (!order?.id || !order?.client_id) return;

    const success = await deleteOrderByServerId(order.id, order.client_id);
    if (!success) return;

    closeOrderPopup(popupManager);
    sectionManager.closeByKey("order.details");
  }, [
    deleteOrderByServerId,
    mode,
    order?.client_id,
    order?.id,
    popupManager,
    sectionManager,
  ]);

  return {
    handleSave,
    handleDelete,
    handlePrepareOrderForCustomerSend:
      async (): Promise<OrderFormSubmitResult> => {
        const result = await executeOrderFormSubmit(
          {
            saveOrder,
            createItemApi,
            updateItemApi,
            deleteItemApi,
            loadItemsByOrderId,
            validateOrderFields: validation.validateOrderFields,
          },
          {
            mode,
            order,
            orderServerId,
            formState,
            validateForm,
            validateRequiredFields: false,
            validatePayloadFields: false,
            initialFormRef,
            itemDraftController,
            itemInitialByClientId,
            selectedCostumer,
            onOrderRollback: () =>
              reopenOrderFormOnRollback({
                popupManager,
                mode,
                order,
                formState,
              }),
          },
        );

        if (
          result.status === "success_create" &&
          typeof result.createdOrderClientId === "string"
        ) {
          onPromoteCreatedOrderToEdit?.(result.createdOrderClientId);
        }

        return result;
      },
  };
};
