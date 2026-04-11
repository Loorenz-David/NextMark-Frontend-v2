import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSendClientFormLink } from "@/features/order/api/clientFormLink.api";
import type { OrderFormLayoutModel } from "../OrderForm.layout.model";
import type { OrderFormExternalFlow } from "../flows/orderFormExternalRealtime.flow";
import { useOrderValidation } from "@/features/order/domain/useOrderValidation";

export type OrderFormSendAction = "linked-device" | "customer";

export type OrderFormSendStatus = {
  action: OrderFormSendAction;
  state: "loading" | "success" | "error";
  message: string;
};

const SUCCESS_AUTOCLEAR_MS = 4000;
const ERROR_AUTOCLEAR_MS = 6500;

const normalizeEmail = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const normalizePhone = (value: { prefix: string; number: string }) => {
  const number = value.number.trim();
  if (!number) {
    return null;
  }

  return {
    prefix: value.prefix,
    number,
  };
};

export const useOrderFormSendController = ({
  model,
  externalFlow,
}: {
  model: OrderFormLayoutModel;
  externalFlow: OrderFormExternalFlow;
}) => {
  const sendClientFormLink = useSendClientFormLink();
  const { validateCustomerEmail, validatePhone } = useOrderValidation();
  const [sendStatus, setSendStatus] = useState<OrderFormSendStatus | null>(
    null,
  );
  const activeRequestIdRef = useRef(0);

  const setStatusForRequest = useCallback(
    (requestId: number, status: OrderFormSendStatus) => {
      if (activeRequestIdRef.current !== requestId) {
        return;
      }

      setSendStatus(status);
    },
    [],
  );

  const clearSendStatus = useCallback(() => {
    setSendStatus((current) => {
      if (current?.state === "loading") {
        return current;
      }

      return null;
    });
  }, []);

  const sendInProgress = sendStatus?.state === "loading";

  useEffect(() => {
    if (!sendStatus || sendStatus.state === "loading") {
      return;
    }

    const timeout = setTimeout(
      () => {
        setSendStatus((current) => {
          if (!current) {
            return null;
          }

          if (current.state === "loading") {
            return current;
          }

          if (
            current.action !== sendStatus.action ||
            current.message !== sendStatus.message ||
            current.state !== sendStatus.state
          ) {
            return current;
          }

          return null;
        });
      },
      sendStatus.state === "success"
        ? SUCCESS_AUTOCLEAR_MS
        : ERROR_AUTOCLEAR_MS,
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [sendStatus]);

  const handleSendToLinkedDevice = useCallback(async () => {
    if (sendInProgress) {
      return;
    }

    const requestId = Date.now();
    activeRequestIdRef.current = requestId;

    if (externalFlow.employeeUserId <= 0) {
      setStatusForRequest(requestId, {
        action: "linked-device",
        state: "error",
        message: "Linked device unavailable.",
      });
      return;
    }

    setStatusForRequest(requestId, {
      action: "linked-device",
      state: "loading",
      message: "Sending request to linked device...",
    });

    externalFlow.handleSendForm();

    setStatusForRequest(requestId, {
      action: "linked-device",
      state: "success",
      message: "Request sent to linked device.",
    });
  }, [externalFlow, sendInProgress, setStatusForRequest]);

  const handleSendToCustomer = useCallback(async () => {
    if (sendInProgress) {
      return;
    }

    const requestId = Date.now();
    activeRequestIdRef.current = requestId;

    setStatusForRequest(requestId, {
      action: "customer",
      state: "loading",
      message: "Sending form to customer...",
    });

    const normalizedEmail = normalizeEmail(model.formState.client_email);
    const normalizedPhone = normalizePhone(
      model.formState.client_primary_phone,
    );

    if (!normalizedEmail && !normalizedPhone) {
      setStatusForRequest(requestId, {
        action: "customer",
        state: "error",
        message: "Add an email or phone first.",
      });
      return;
    }

    if (normalizedEmail && !validateCustomerEmail(normalizedEmail)) {
      setStatusForRequest(requestId, {
        action: "customer",
        state: "error",
        message: "Customer email is invalid.",
      });
      return;
    }

    if (normalizedPhone && !validatePhone(normalizedPhone)) {
      setStatusForRequest(requestId, {
        action: "customer",
        state: "error",
        message: "Customer phone is invalid.",
      });
      return;
    }

    let orderId = model.orderServerId;

    if (typeof orderId !== "number") {
      const result = await model.handlePrepareOrderForCustomerSend();
      if (
        result.status !== "success_create" &&
        result.status !== "success_edit"
      ) {
        setStatusForRequest(requestId, {
          action: "customer",
          state: "error",
          message:
            result.status === "no_changes"
              ? "No changes to save."
              : result.message,
        });
        return;
      }

      if (result.status === "success_create") {
        orderId = result.createdOrderId;
      }

      if (typeof orderId !== "number") {
        setStatusForRequest(requestId, {
          action: "customer",
          state: "error",
          message: "Unable to resolve order id.",
        });
        return;
      }
    }

    try {
      await sendClientFormLink(orderId, {
        email: normalizedEmail,
        phone: normalizedPhone,
      });

      setStatusForRequest(requestId, {
        action: "customer",
        state: "success",
        message: "form sent to custumer!",
      });
    } catch (error) {
      setStatusForRequest(requestId, {
        action: "customer",
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to send to customer.",
      });
    }
  }, [
    model,
    sendClientFormLink,
    sendInProgress,
    setStatusForRequest,
    validateCustomerEmail,
    validatePhone,
  ]);

  const statusMeta = useMemo(
    () => ({
      isSending: sendInProgress,
    }),
    [sendInProgress],
  );

  return {
    sendStatus,
    sendStatusMeta: statusMeta,
    handleSendToLinkedDevice,
    handleSendToCustomer,
    clearSendStatus,
  };
};
