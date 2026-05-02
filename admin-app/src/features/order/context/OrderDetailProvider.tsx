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

import { getOrder, getOrderRouteContext } from "../api/orderApi";
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
import { setOrderPlanId, upsertOrders } from "../store/order.store";
import { OrderDetailContextProvider } from "./OrderDetailContext";
import type { Order, OrderMap } from "../types/order";

type OrderDetailProviderProps = PropsWithChildren<{
  payload?: OrderDetailPayload;
  onClose?: () => void;
}>;

const isOrderMap = (value: unknown): value is OrderMap => {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    "byClientId" in value &&
    "allIds" in value &&
    Array.isArray((value as OrderMap).allIds)
  );
};

const resolveFetchedOrder = (value: unknown): Order | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  if (isOrderMap(value)) {
    const firstClientId = value.allIds[0];
    if (!firstClientId) {
      return null;
    }

    return value.byClientId[firstClientId] ?? null;
  }

  if ("client_id" in value) {
    return value as Order;
  }

  return null;
};

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
  const inFlightRefreshKeyRef = useRef<string | null>(null);
  const forcedHydrationDoneKeyRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const orderDetailActions = useOrderDetailActions({ onClose });
  const { loadOrderEventsIfNeeded } = useOrderEventFlow();
  const registerViewedOrderEventHistory = useRegisterViewedOrderEventHistory();
  const unregisterViewedOrderEventHistory =
    useUnregisterViewedOrderEventHistory();

  const clientId = payload?.clientId ?? null;
  const payloadServerId = payload?.serverId ?? null;
  const freshAfter = payload?.freshAfter ?? null;
  const shouldForceDetailHydration =
    payload?.headerBehavior === "order-main-context";

  const orderByClient = useOrderByClientId(clientId);
  const orderByServer = useOrderByServerId(payloadServerId);
  const order = orderByClient ?? orderByServer ?? null;
  const serverId =
    typeof payloadServerId === "number"
      ? payloadServerId
      : typeof order?.id === "number"
        ? order.id
        : null;

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
      (shouldForceDetailHydration &&
        forcedHydrationDoneKeyRef.current !==
          `${serverId}:${freshAfter ?? ""}`) ||
      order == null ||
      shouldRefreshForFreshness(order.updated_at ?? null, freshAfter);
    if (!needsRefresh) {
      lastRefreshAttemptRef.current = null;
      return;
    }

    const refreshKey = `${serverId}:${freshAfter ?? ""}:${shouldForceDetailHydration ? "forced" : "normal"}`;
    if (inFlightRefreshKeyRef.current === refreshKey) {
      return;
    }

    if (
      lastRefreshAttemptRef.current === refreshKey &&
      !shouldForceDetailHydration
    ) {
      return;
    }
    lastRefreshAttemptRef.current = refreshKey;
    inFlightRefreshKeyRef.current = refreshKey;

    const refreshOrder = async () => {
      if (mountedRef.current) {
        setIsRefreshing(true);
      }

      try {
        const response = await getOrder(serverId);

        if (
          !response.data?.order ||
          inFlightRefreshKeyRef.current !== refreshKey
        ) {
          return;
        }

        const fetchedOrder = resolveFetchedOrder(response.data.order);

        upsertOrders(normalizeOrderPayload(response.data.order));

        if (shouldForceDetailHydration) {
          forcedHydrationDoneKeyRef.current = `${serverId}:${freshAfter ?? ""}`;
        }

        if (
          fetchedOrder &&
          fetchedOrder.delivery_plan_id == null &&
          typeof fetchedOrder.id === "number"
        ) {
          try {
            const contextResponse = await getOrderRouteContext(fetchedOrder.id);
            const routePlanId = contextResponse.data?.route_plan_id;

            if (typeof routePlanId === "number") {
              setOrderPlanId(fetchedOrder.client_id, routePlanId);
            }
          } catch {}
        }
      } catch (error) {
        console.error("Failed to refresh order detail", error);
      } finally {
        if (inFlightRefreshKeyRef.current === refreshKey) {
          inFlightRefreshKeyRef.current = null;
        }

        if (mountedRef.current) {
          setIsRefreshing(false);
        }
      }
    };

    void refreshOrder();
  }, [
    clientId,
    freshAfter,
    order,
    normalizeOrderPayload,
    serverId,
    shouldForceDetailHydration,
  ]);

  useEffect(() => {
    if (!shouldForceDetailHydration || typeof serverId !== "number") {
      forcedHydrationDoneKeyRef.current = null;
    }
  }, [serverId, shouldForceDetailHydration]);

  useEffect(() => {
    if (typeof orderServerId !== "number") {
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
