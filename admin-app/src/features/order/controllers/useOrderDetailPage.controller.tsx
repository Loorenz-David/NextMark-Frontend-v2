import { useCallback, useMemo, type ReactNode } from "react";

import {
  RouteStopWarnings,
  hasRouteStopTimeWindowWarning,
  useSelectedRouteSolutionStopByOrderId,
} from "@/features/plan/routeGroup";
import { copyOrderTrackingLink } from "@/features/order/actions/copyOrderTrackingLink.action";
import { useOrderDetailActions } from "@/features/order/actions/orderDetails.actions";
import { resolveOrderDetailInitialTab } from "@/features/order/domain/orderDetailInitialTabRules.domain";
import { getOrderMissingRequiredFieldLabels } from "@/features/order/domain/orderMissingRequiredInfo.domain";
import { getOrderDetailTabIndex } from "@/features/order/domain/orderDetailTabs.domain";
import { useOrderValidation } from "@/features/order/domain/useOrderValidation";

import type { OrderDetailInitialTabSelection } from "../domain/orderDetailInitialTabRules.domain";
import type { OrderDetailTabId } from "../domain/orderDetailTabs.domain";
import type { Order } from "../types/order";

type UseOrderDetailPageControllerResult = {
  selectedTabId: OrderDetailTabId;
  selectedTabReason: OrderDetailInitialTabSelection["reason"];
  initialCarouselIndex: number;
  missingRequiredFields: string[];
  timeWindowHeaderAddon: ReactNode | null;
  handleMissingOrderInfoClick: () => void;
  handleTrackingLinkCopy: () => void;
};

type UseOrderDetailPageControllerParams = {
  order: Order | null;
  routeGroupId?: number | null;
  planStartDate?: string | null;
};

export const useOrderDetailPageController = ({
  order,
  routeGroupId,
  planStartDate,
}: UseOrderDetailPageControllerParams): UseOrderDetailPageControllerResult => {
  const validators = useOrderValidation();
  const { handleClientFormLinkButtonClick } = useOrderDetailActions();

  const stop = useSelectedRouteSolutionStopByOrderId(
    order?.id ?? null,
    order?.route_group_id ?? routeGroupId ?? null,
  );

  const hasTimeWindowWarning = hasRouteStopTimeWindowWarning(stop);
  const missingRequiredFields = useMemo(() => {
    if (!order || order.archive_at) return [];
    return getOrderMissingRequiredFieldLabels(order, validators);
  }, [order, validators]);

  const selectedInitialTab = useMemo(
    () =>
      resolveOrderDetailInitialTab({
        hasMissingRequiredInfo: missingRequiredFields.length > 0,
        hasTimeWindowWarning,
      }),
    [hasTimeWindowWarning, missingRequiredFields.length],
  );

  const handleMissingOrderInfoClick = useCallback(() => {
    if (!order || typeof order.id !== "number") return;

    void handleClientFormLinkButtonClick({
      orderId: order.id,
      clientId: order.client_id,
      hasGeneratedLink: Boolean(order.client_form_token_hash),
      initialEmail: order.client_email ?? null,
      initialPhone: order.client_primary_phone ?? null,
    });
  }, [handleClientFormLinkButtonClick, order]);

  const handleTrackingLinkCopy = useCallback(() => {
    if (!order?.tracking_link) return;
    void copyOrderTrackingLink(order.tracking_link);
  }, [order?.tracking_link]);

  return useMemo(
    () => ({
      selectedTabId: selectedInitialTab.tabId,
      selectedTabReason: selectedInitialTab.reason,
      initialCarouselIndex: getOrderDetailTabIndex(selectedInitialTab.tabId),
      missingRequiredFields,
      timeWindowHeaderAddon: stop ? (
        <RouteStopWarnings stop={stop} planStartDate={planStartDate} />
      ) : null,
      handleMissingOrderInfoClick,
      handleTrackingLinkCopy,
    }),
    [
      handleMissingOrderInfoClick,
      handleTrackingLinkCopy,
      missingRequiredFields,
      planStartDate,
      selectedInitialTab.reason,
      selectedInitialTab.tabId,
      stop,
    ],
  );
};
