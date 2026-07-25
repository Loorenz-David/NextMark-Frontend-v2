import { useEffect, useMemo, useRef, useState } from "react";

import { makeInitialFormCopy } from "@shared-domain";

import { shouldMergeLiveProgressIntoOrderForm } from "../../../domain/orderLinkedDeviceLiveProgress.domain";
import { getLinkedDeviceEmployeeUserId } from "../../../flows/linkedDeviceEmployeeUser.flow";
import { getLinkedDeviceLiveProgress } from "../../../store/orderLinkedDeviceLiveProgress.store";
import type { Order } from "../../../types/order";
import {
  buildOrderFormInitialState,
  buildOrderFormReinitKey,
  shouldReinitializeForm,
} from "../flows/orderFormBootstrap.flow";
import { mergeExternalClientDataIntoFormState } from "../state/orderForm.setters";
import type { OrderFormMode, OrderFormState } from "../state/OrderForm.types";

/**
 * Overlays an in-flight linked-device fill onto a freshly built form state.
 *
 * Applied here — not only from the realtime merge effect — because the reset
 * below runs after child effects on mount and again whenever the order
 * refreshes, so any merge done purely from effects gets wiped and the staff
 * opening the form mid-fill would see only what the customer types afterwards.
 * The overlay is left out of the initial-form baseline on purpose: live
 * customer data is unsaved until the order is saved or the device submits.
 */
const overlayLinkedDeviceLiveFill = (
  state: OrderFormState,
  order: Order | null,
): OrderFormState => {
  const entry = getLinkedDeviceLiveProgress(getLinkedDeviceEmployeeUserId());
  if (
    !entry ||
    !shouldMergeLiveProgressIntoOrderForm({
      entry,
      formOrderServerId: order?.id ?? null,
      isAwaitingDraft: false,
    })
  ) {
    return state;
  }

  return mergeExternalClientDataIntoFormState(state, entry.formData);
};

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
    overlayLinkedDeviceLiveFill(
      buildOrderFormInitialState({
        mode,
        order,
        payloadDeliveryPlanId: payloadDeliveryPlanId ?? null,
        payloadRouteGroupId: payloadRouteGroupId ?? null,
        payloadRestoreFormState: payloadRestoreFormState ?? null,
      }),
      order,
    ),
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

    setFormState(overlayLinkedDeviceLiveFill(nextState, order));
    // The baseline stays the pure order state: live fill data counts as
    // unsaved changes until the order is saved or the device submits.
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
