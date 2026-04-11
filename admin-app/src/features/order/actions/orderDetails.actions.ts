import { useCallback } from "react";

import {
  usePopupManager,
  useSectionManager,
} from "@/shared/resource-manager/useResourceManager";
import { useMessageHandler } from "@shared-message-handler";
import type { Phone } from "@/types/phone";
import { generateClientFormLink } from "../api/clientFormLink.api";
import { useOrderStateController } from "../controllers/orderState.controller";
import {
  getClientFormLinkPreview,
  setClientFormLinkPreview,
} from "../store/clientFormLinkPreview.store";
import { upsertOrder, updateOrderByClientId } from "../store/order.store";

export type OrderDetailOpenOrderFormPayload = {
  clientId?: string;
  mode?: "create" | "edit";
  deliveryPlanId?: number | null;
  routeGroupId?: number | null;
};

export type OrderDetailOpenCasesPayload = {
  orderId?: number;
  orderReference: string;
};

const GENERATED_CLIENT_FORM_TOKEN_PLACEHOLDER = "__generated_client_form_link__";

export const useOrderDetailActions = ({
  onClose,
}: { onClose?: () => void } = {}) => {
  const popupManager = usePopupManager();
  const sectionManager = useSectionManager();
  const { showMessage } = useMessageHandler();
  const { advanceOrderState } = useOrderStateController();

  const openOrderForm = useCallback(
    (payload?: OrderDetailOpenOrderFormPayload) => {
      popupManager.open({
        key: "order.edit",
        payload: { ...payload, controllBodyLayout: true },
      });
    },
    [popupManager],
  );

  const openOrderCases = useCallback(
    (payload: OrderDetailOpenCasesPayload) => {
      sectionManager.open({
        key: "orderCase.orderCases",
        payload,
        parentParams: { borderLeft: "rgb(var(--color-turques-r),0.7)" },
      });
    },
    [sectionManager],
  );

  const handleEditOrder = useCallback(
    (clientId: string) => {
      openOrderForm({ mode: "edit", clientId });
    },
    [openOrderForm],
  );

  const handleOpenOrderCases = useCallback(
    (payload: OrderDetailOpenCasesPayload) => {
      openOrderCases(payload);
    },
    [openOrderCases],
  );

  const openSendClientFormLinkPopup = useCallback(
    (payload: {
      orderId: number;
      hasGeneratedLink: boolean;
      initialEmail?: string | null;
      initialPhone?: Phone | null;
      formUrl?: string | null;
      expiresAt?: string | null;
    }) => {
      popupManager.open({
        key: "order.client-form-link.send",
        payload,
      });
    },
    [popupManager],
  );

  const handleClientFormLinkButtonClick = useCallback(
    async ({
      orderId,
      clientId,
      hasGeneratedLink,
      initialEmail,
      initialPhone,
    }: {
      orderId: number;
      clientId?: string | null;
      hasGeneratedLink: boolean;
      initialEmail?: string | null;
      initialPhone?: Phone | null;
    }) => {
      let nextHasGeneratedLink = hasGeneratedLink;
      const cachedPreview = getClientFormLinkPreview(orderId);
      let formUrl: string | null = cachedPreview?.formUrl ?? null;
      let expiresAt: string | null = cachedPreview?.expiresAt ?? null;

      if (!hasGeneratedLink) {
        try {
          const response = await generateClientFormLink(orderId);
          formUrl = response.form_url ?? null;
          expiresAt = response.expires_at ?? null;
          if (formUrl || expiresAt) {
            setClientFormLinkPreview(orderId, {
              formUrl,
              expiresAt,
            });
          }

          if (response.order) {
            upsertOrder(response.order);
          }

          if (clientId) {
            updateOrderByClientId(clientId, (order) => ({
              ...order,
              client_form_token_hash:
                order.client_form_token_hash ??
                GENERATED_CLIENT_FORM_TOKEN_PLACEHOLDER,
            }));
          }

          nextHasGeneratedLink = true;
        } catch (error) {
          showMessage({
            status: 500,
            message:
              error instanceof Error
                ? error.message
                : "Unable to generate client form link.",
          });
          return;
        }
      }

      openSendClientFormLinkPopup({
        orderId,
        hasGeneratedLink: nextHasGeneratedLink,
        initialEmail,
        initialPhone,
        formUrl,
        expiresAt,
      });
    },
    [openSendClientFormLinkPopup, showMessage],
  );

  const closeOrderDetail = useCallback(() => {
    if (onClose) {
      onClose();
      return;
    }
    sectionManager.close();
  }, [onClose, sectionManager]);

  const advanceDetailOrderState = useCallback(
    async (clientId: string) => {
      await advanceOrderState(clientId);
    },
    [advanceOrderState],
  );

  return {
    openOrderForm,
    openOrderCases,
    handleClientFormLinkButtonClick,
    handleEditOrder,
    handleOpenOrderCases,
    closeOrderDetail,
    advanceDetailOrderState,
  };
};
