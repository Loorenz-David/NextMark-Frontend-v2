import { useMemo, type ReactNode } from "react";

import {
  RouteStopWarnings,
  hasRouteStopTimeWindowWarning,
  useSelectedRouteSolutionStopByOrderId,
} from "@/features/plan/routeGroup";
import { getOrderDetailTabIndex } from "@/features/order/domain/orderDetailTabs.domain";
import { resolveOrderDetailInitialTab } from "@/features/order/domain/orderDetailInitialTabRules.domain";
import { getOrderMissingRequiredFieldLabels } from "@/features/order/domain/orderMissingRequiredInfo.domain";
import { useOrderValidation } from "@/features/order/domain/useOrderValidation";

import type { Order } from "../types/order";
import type { OrderDetailInitialTabSelection } from "../domain/orderDetailInitialTabRules.domain";
import type { OrderDetailTabId } from "../domain/orderDetailTabs.domain";

type UseOrderDetailStopWarningControllerResult = {
  selectedTabId: OrderDetailTabId;
  selectedTabReason: OrderDetailInitialTabSelection["reason"];
  initialCarouselIndex: number;
  trackingMissingRequiredFields: string[];
  timeWindowHeaderAddon: ReactNode | null;
};

type UseOrderDetailStopWarningControllerParams = {
  order: Order | null;
  routeGroupId?: number | null;
  planStartDate?: string | null;
};

export const useOrderDetailStopWarningController = ({
  order,
  routeGroupId,
  planStartDate,
}: UseOrderDetailStopWarningControllerParams): UseOrderDetailStopWarningControllerResult => {
  const validators = useOrderValidation();

  const stop = useSelectedRouteSolutionStopByOrderId(
    order?.id ?? null,
    order?.route_group_id ?? routeGroupId ?? null,
  );

  const hasTimeWindowWarning = hasRouteStopTimeWindowWarning(stop);
  const trackingMissingRequiredFields = useMemo(() => {
    if (!order || order.archive_at) return [];
    return getOrderMissingRequiredFieldLabels(order, validators);
  }, [order, validators]);

  const selectedInitialTab = useMemo(
    () =>
      resolveOrderDetailInitialTab({
        hasMissingRequiredInfo: trackingMissingRequiredFields.length > 0,
        hasTimeWindowWarning,
      }),
    [hasTimeWindowWarning, trackingMissingRequiredFields.length],
  );

  return useMemo(
    () => ({
      selectedTabId: selectedInitialTab.tabId,
      selectedTabReason: selectedInitialTab.reason,
      initialCarouselIndex: getOrderDetailTabIndex(selectedInitialTab.tabId),
      trackingMissingRequiredFields,
      timeWindowHeaderAddon: stop ? (
        <RouteStopWarnings stop={stop} planStartDate={planStartDate} />
      ) : null,
    }),
    [
      planStartDate,
      selectedInitialTab.reason,
      selectedInitialTab.tabId,
      stop,
      trackingMissingRequiredFields,
    ],
  );
};
