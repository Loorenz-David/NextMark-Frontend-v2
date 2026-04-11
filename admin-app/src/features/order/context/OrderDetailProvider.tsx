import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

import { useMobile } from "@/app/contexts/MobileContext";
import {
  usePopupManager,
  useSectionManager,
} from "@/shared/resource-manager/useResourceManager";
import { shouldRefreshForFreshness } from "@shared-utils";

import { getOrder } from "../api/orderApi";
import { useOrderDetailActions } from "../actions/orderDetails.actions";
import type { OrderDetailPayload } from "../domain/orderDetailPayload.types";
import { useOrderEventFlow } from "../flows/orderEvent.flow";
import { useOrderDetailKeyboardFlow } from "../flows/orderDetailKeyboard.flow";
import { useOrderModel } from "../domain/useOrderModel";
import {
  useOrderByClientId,
  useOrderByServerId,
} from "../store/orderHooks.store";
import {
  useOrderEventsLoaded,
  useRegisterViewedOrderEventHistory,
  useUnregisterViewedOrderEventHistory,
} from "../store/orderEventHooks.store";
import { useOrderStateByServerId } from "../store/orderStateHooks.store";
import { upsertOrders } from "../store/order.store";
import { OrderDetailContextProvider } from "./OrderDetailContext";

type OrderDetailProviderProps = PropsWithChildren<{
  payload?: OrderDetailPayload;
  onClose?: () => void;
}>;

export const OrderDetailProvider = ({
  payload,
  onClose,
  children,
}: OrderDetailProviderProps) => {
  const { isMobile } = useMobile();
  const popupManager = usePopupManager();
  const sectionManager = useSectionManager();
  const { normalizeOrderPayload } = useOrderModel();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastRefreshAttemptRef = useRef<string | null>(null);

  const orderDetailActions = useOrderDetailActions({ onClose });
  const { loadOrderEventsIfNeeded } = useOrderEventFlow();
  const registerViewedOrderEventHistory = useRegisterViewedOrderEventHistory();
  const unregisterViewedOrderEventHistory =
    useUnregisterViewedOrderEventHistory();

  const clientId = payload?.clientId ?? null;
  const serverId = payload?.serverId ?? null;
  const freshAfter = payload?.freshAfter ?? null;

  const orderByClient = useOrderByClientId(clientId);
  const orderByServer = useOrderByServerId(serverId);
  const order = orderByClient ?? orderByServer ?? null;

  const orderServerId = typeof order?.id === "number" ? order.id : null;
  const orderState =
    useOrderStateByServerId(order?.order_state_id ?? null) ?? null;
  const areOrderEventsLoaded = useOrderEventsLoaded(orderServerId);

  useEffect(() => {
    if (typeof serverId !== "number") {
      lastRefreshAttemptRef.current = null;
      return;
    }

    const needsRefresh =
      order == null ||
      shouldRefreshForFreshness(order.updated_at ?? null, freshAfter);
    if (!needsRefresh) {
      lastRefreshAttemptRef.current = null;
      return;
    }

    const refreshKey = `${serverId}:${freshAfter ?? ""}`;
    if (lastRefreshAttemptRef.current === refreshKey) {
      return;
    }
    lastRefreshAttemptRef.current = refreshKey;

    let cancelled = false;

    const refreshOrder = async () => {
      setIsRefreshing(true);
      try {
        const response = await getOrder(serverId);
        if (cancelled || !response.data?.order) {
          return;
        }

        upsertOrders(normalizeOrderPayload(response.data.order));
      } catch (error) {
        console.error("Failed to refresh order detail", error);
      } finally {
        if (!cancelled) {
          setIsRefreshing(false);
        }
      }
    };

    void refreshOrder();

    return () => {
      cancelled = true;
    };
  }, [freshAfter, normalizeOrderPayload, order, serverId]);

  useEffect(() => {
    if (typeof orderServerId !== "number") {
      return;
    }

    if (areOrderEventsLoaded) {
      return;
    }

    void loadOrderEventsIfNeeded(orderServerId);
  }, [areOrderEventsLoaded, loadOrderEventsIfNeeded, orderServerId]);

  useEffect(() => {
    if (typeof orderServerId !== "number") {
      return;
    }

    registerViewedOrderEventHistory(orderServerId);

    return () => {
      unregisterViewedOrderEventHistory(orderServerId);
    };
  }, [
    orderServerId,
    registerViewedOrderEventHistory,
    unregisterViewedOrderEventHistory,
  ]);

  useOrderDetailKeyboardFlow({
    isEnabled: !isMobile,
    clientId,
    orderId: order?.id,
    orderReference: order?.reference_number ?? "",
    isPopupOpen: () => popupManager.getOpenCount() > 0,
    isCaseOpen: () => sectionManager.hasKey("orderCase.orderCases"),
    onEdit: orderDetailActions.handleEditOrder,
    onOpenCases: orderDetailActions.handleOpenOrderCases,
  });

  const value = useMemo(
    () => ({
      order,
      orderState,
      orderServerId,
      isRefreshing,
      openOrderForm: orderDetailActions.openOrderForm,
      openOrderCases: orderDetailActions.openOrderCases,
      closeOrderDetail: orderDetailActions.closeOrderDetail,
      advanceDetailOrderState: orderDetailActions.advanceDetailOrderState,
    }),
    [isRefreshing, order, orderDetailActions, orderServerId, orderState],
  );

  return (
    <OrderDetailContextProvider value={value}>
      {children}
    </OrderDetailContextProvider>
  );
};
