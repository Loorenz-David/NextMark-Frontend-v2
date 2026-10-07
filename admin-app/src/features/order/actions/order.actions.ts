import { useCallback } from "react";

import {
  usePopupManager,
  useSectionManager,
} from "@/shared/resource-manager/useResourceManager";
import {
  resetQuery,
  setQueryFilters,
  setQuerySearch,
  useOrderQuery,
} from "../store/orderQuery.store";
import type { OrderQueryFilters } from "../types/orderMeta";
import {
  draftFromOrderQueryFilters,
  orderQueryFiltersFromDraft,
  removeOrderFilterEntry,
  type OrderFilterDraft,
} from "../domain/orderFilterPanel.domain";
import type { OrderDetailPayload } from "../domain/orderDetailPayload.types";
import type { Order } from "../types/order";
import { useOrderController } from "../controllers/order.controller";

type parentParamsProps = {
  borderLeft?: string;
  pageClass?: string;
};

// Notification-opened details carry only a serverId, so a missing clientId on
// both sides must not count as a match.
const isSameOrderDetail = (
  open: OrderDetailPayload,
  next: OrderDetailPayload,
) => {
  if (open.clientId && next.clientId) return open.clientId === next.clientId;
  return open.serverId != null && open.serverId === next.serverId;
};

export const useOrderActions = () => {
  const popupManager = usePopupManager();
  const sectionManager = useSectionManager();
  const query = useOrderQuery();
  const { archiveOrder, unarchiveOrder } = useOrderController();

  const handleArchiveOrder = useCallback(
    (order: Order) => {
      archiveOrder(order.client_id, order.id);
    },
    [archiveOrder],
  );

  const handleUnarchiveOrder = useCallback(
    (order: Order) => {
      unarchiveOrder(order.client_id, order.id);
    },
    [unarchiveOrder],
  );
  const openOrderForm = useCallback(
    (payload?: {
      clientId?: string;
      mode?: "create" | "edit";
      deliveryPlanId?: number | null;
      routeGroupId?: number | null;
    }) => {
      console.log("Opening order form with payload:", payload);
      popupManager.open({
        key: "order.edit",
        payload: { ...payload, controllBodyLayout: true },
      });
    },
    [popupManager],
  );
  const openOrderCases = useCallback(
    (payload: { orderId?: number; orderReference: string }) => {
      sectionManager.open({
        key: "orderCase.orderCases",
        payload,
        parentParams: { borderLeft: "rgb(var(--color-turques-r),0.7)" },
      });
    },
    [sectionManager],
  );
  const openOrderDetail = useCallback(
    (payload: OrderDetailPayload, parentParams: parentParamsProps) => {
      const key = "order.details";

      const latestOpenEntry = sectionManager
        .getSnapshot()
        .filter((entry) => entry.key === key && !entry.isClosing)
        .at(-1);

      const openPayload = latestOpenEntry?.payload as OrderDetailPayload | undefined;
      // A request to focus an event re-opens the same order so it lands there.
      if (
        openPayload &&
        isSameOrderDetail(openPayload, payload) &&
        !payload.focusEventId
      ) {
        return;
      }

      if (latestOpenEntry) {
        sectionManager.atomicOpenClose(
          { key, payload, parentParams },
          latestOpenEntry.id,
        );
      } else {
        sectionManager.open({ key, payload, parentParams });
      }
    },
    [sectionManager],
  );

  const applySearch = useCallback((input: string) => {
    const trimmed = input.trim();
    setQuerySearch(trimmed);
  }, []);
  const applyFilters = useCallback((filters: OrderQueryFilters) => {
    setQueryFilters(filters);
  }, []);
  const resetFilters = useCallback(() => {
    resetQuery();
  }, []);

  const openFilterPanel = useCallback(() => {
    popupManager.open({
      key: "order.filter.panel",
      payload: {
        draft: draftFromOrderQueryFilters(query.filters),
        onApply: (draft: OrderFilterDraft) => {
          setQueryFilters(orderQueryFiltersFromDraft(draft));
        },
      },
    });
  }, [popupManager, query.filters]);

  const removeFilter = useCallback(
    (key: string, value?: unknown) => {
      setQueryFilters(removeOrderFilterEntry(query.filters, key, value));
    },
    [query.filters],
  );

  const handleOrderMarkerClick = useCallback(
    (_event: MouseEvent, order: Order) => {
      openOrderDetail(
        { clientId: order.client_id, mode: "view", openSource: "marker" },
        {
          pageClass: "bg-[var(--color-muted)]/10 ",
          borderLeft: "rgb(var(--color-light-blue-r),0.7)",
        },
      );
    },
    [openOrderDetail],
  );

  return {
    openOrderForm,
    openOrderDetail,
    applySearch,
    applyFilters,
    resetFilters,
    openFilterPanel,
    removeFilter,
    openOrderCases,
    handleArchiveOrder,
    handleUnarchiveOrder,
    handleOrderMarkerClick,
  };
};
