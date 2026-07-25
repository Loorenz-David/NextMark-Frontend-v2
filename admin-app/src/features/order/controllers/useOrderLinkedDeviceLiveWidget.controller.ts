import { useCallback, useEffect, useMemo } from "react";

import { useMessageHandler } from "@shared-message-handler";

import { usePopupManager } from "@/shared/resource-manager/useResourceManager";
import { useStackActionEntries } from "@/shared/stack-manager/useStackActionEntries";

import {
  LIVE_PROGRESS_STEP_COUNT,
  LIVE_PROGRESS_STEP_LABELS,
  resolveLiveProgressOrderLabel,
  resolveLiveProgressStepNumber,
  resolveLiveProgressWidgetState,
  type LinkedDeviceLiveWidgetState,
} from "../domain/orderLinkedDeviceLiveProgress.domain";
import { getLinkedDeviceEmployeeUserId } from "../flows/linkedDeviceEmployeeUser.flow";
import { selectOrderByServerId, useOrderStore } from "../store/order.store";
import {
  clearLinkedDeviceLiveProgress,
  hideLinkedDeviceLiveUntilSubmit,
  useOrderLinkedDeviceLiveProgressStore,
} from "../store/orderLinkedDeviceLiveProgress.store";

export const SUBMITTED_WIDGET_DISMISS_MS = 20_000;

const ORDER_FORM_POPUP_KEY = "order.edit";

/**
 * Drives the floating "linked device is filling a form" widget.
 *
 * Must run inside the Home subtree: the popup manager is created by
 * HomeAppManagersProvider, not app-wide, so both the "is the matching order
 * form open" check and tap-to-open need this mount point. The auto-dismiss
 * timer lives here rather than in the component so a submitted entry is
 * cleaned up even while the widget is visually hidden.
 */
export const useOrderLinkedDeviceLiveWidgetController = () => {
  const { showMessage } = useMessageHandler();
  const popupManager = usePopupManager();
  const stackEntries = useStackActionEntries(popupManager);

  const employeeUserId = getLinkedDeviceEmployeeUserId();

  const entry = useOrderLinkedDeviceLiveProgressStore(
    (state) => state.entryByEmployeeUserId[employeeUserId] ?? null,
  );

  const entryOrder = useOrderStore((state) =>
    entry?.orderId != null
      ? (selectOrderByServerId(entry.orderId)(state) ?? null)
      : null,
  );
  const entryClientId = entryOrder?.client_id ?? null;

  const openOrderFormEntries = useMemo(
    () =>
      stackEntries.filter(
        (stackEntry) =>
          stackEntry.key === ORDER_FORM_POPUP_KEY && !stackEntry.isClosing,
      ),
    [stackEntries],
  );

  const isMatchingOrderFormOpen =
    entryClientId != null &&
    openOrderFormEntries.some(
      (stackEntry) =>
        (stackEntry.payload as { clientId?: string } | undefined)?.clientId ===
        entryClientId,
    );

  // Checked at render time: every frame re-renders this hook, so an expired
  // entry stops showing on the next frame after its TTL passes.
  const widgetState: LinkedDeviceLiveWidgetState = resolveLiveProgressWidgetState({
    entry,
    now: Date.now(),
    isMatchingOrderFormOpen,
  });

  const handleOpen = useCallback(() => {
    if (!entry || entry.orderId == null || entryClientId == null) {
      return;
    }

    // Two stacked order forms would fight over unsaved changes; ask the user
    // to settle the open one instead.
    const hasOtherOrderFormOpen = openOrderFormEntries.some(
      (stackEntry) =>
        (stackEntry.payload as { clientId?: string } | undefined)?.clientId !==
        entryClientId,
    );
    if (hasOtherOrderFormOpen) {
      showMessage({
        status: "warning",
        message: "Close the current order form to view the live customer form.",
      });
      return;
    }

    if (isMatchingOrderFormOpen) {
      return;
    }

    popupManager.open({
      key: ORDER_FORM_POPUP_KEY,
      payload: {
        clientId: entryClientId,
        mode: "edit",
        controllBodyLayout: true,
      },
    });
  }, [
    entry,
    entryClientId,
    isMatchingOrderFormOpen,
    openOrderFormEntries,
    popupManager,
    showMessage,
  ]);

  const handleClose = useCallback(() => {
    if (!entry) {
      return;
    }

    if (entry.status === "submitted") {
      clearLinkedDeviceLiveProgress(employeeUserId);
      return;
    }

    hideLinkedDeviceLiveUntilSubmit(employeeUserId);
  }, [employeeUserId, entry]);

  // Auto-dismiss after submit, keyed by session so a new fill restarts cleanly.
  const submittedSession = entry?.status === "submitted" ? entry.session : null;

  useEffect(() => {
    if (!submittedSession) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => clearLinkedDeviceLiveProgress(employeeUserId),
      SUBMITTED_WIDGET_DISMISS_MS,
    );

    return () => window.clearTimeout(timeoutId);
  }, [employeeUserId, submittedSession]);

  return {
    widgetState,
    stepLabel: entry ? LIVE_PROGRESS_STEP_LABELS[entry.step] : "",
    stepNumber: entry ? resolveLiveProgressStepNumber(entry.step) : 0,
    stepCount: LIVE_PROGRESS_STEP_COUNT,
    orderLabel: resolveLiveProgressOrderLabel(entryOrder),
    sessionKey: entry?.session ?? "",
    handleOpen,
    handleClose,
  };
};
