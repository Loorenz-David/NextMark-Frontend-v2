import { useEffect, useMemo, useRef, useState } from "react";

import { makeInitialFormCopy } from "@shared-domain";

import type { Order } from "../../../types/order";
import {
  buildOrderFormInitialState,
  buildOrderFormReinitKey,
  shouldReinitializeForm,
} from "../flows/orderFormBootstrap.flow";
import type { OrderFormMode, OrderFormState } from "../state/OrderForm.types";

export const useOrderFormBootstrapState = ({
  mode,
  order,
  payloadClientId,
  payloadDeliveryPlanId,
  payloadRouteGroupId,
  payloadRestoreFormState,
}: {
  mode: OrderFormMode;
  order: Order | null;
  payloadClientId?: string | null;
  payloadDeliveryPlanId?: number | null;
  payloadRouteGroupId?: number | null;
  payloadRestoreFormState?: OrderFormState | null;
}) => {
  const initialFormRef = useRef<OrderFormState | null>(null);
  const previousReinitKeyRef = useRef<string | null>(null);

  const [formState, setFormState] = useState<OrderFormState>(() =>
    buildOrderFormInitialState({
      mode,
      order,
      payloadDeliveryPlanId: payloadDeliveryPlanId ?? null,
      payloadRouteGroupId: payloadRouteGroupId ?? null,
      payloadRestoreFormState: payloadRestoreFormState ?? null,
    }),
  );

  const reinitKey = useMemo(
    () =>
      buildOrderFormReinitKey({
        mode,
        payloadClientId: payloadClientId ?? null,
        payloadDeliveryPlanId: payloadDeliveryPlanId ?? null,
        payloadRouteGroupId: payloadRouteGroupId ?? null,
        orderServerId: order?.id ?? null,
        orderUpdatedAt: order?.updated_at ?? null,
        orderItemsUpdatedAt: order?.items_updated_at ?? null,
        orderClientFormSubmittedAt: order?.client_form_submitted_at ?? null,
      }),
    [
      mode,
      order?.id,
      order?.updated_at,
      order?.items_updated_at,
      order?.client_form_submitted_at,
      payloadClientId,
      payloadDeliveryPlanId,
      payloadRouteGroupId,
    ],
  );

  useEffect(() => {
    if (!shouldReinitializeForm(previousReinitKeyRef.current, reinitKey)) {
      return;
    }

    const nextState = buildOrderFormInitialState({
      mode,
      order,
      payloadDeliveryPlanId: payloadDeliveryPlanId ?? null,
      payloadRouteGroupId: payloadRouteGroupId ?? null,
      payloadRestoreFormState: payloadRestoreFormState ?? null,
    });

    setFormState(nextState);
    makeInitialFormCopy(initialFormRef, nextState);
    previousReinitKeyRef.current = reinitKey;
  }, [
    mode,
    order,
    payloadDeliveryPlanId,
    payloadRouteGroupId,
    payloadRestoreFormState,
    reinitKey,
  ]);

  return {
    formState,
    setFormState,
    initialFormRef,
  };
};
