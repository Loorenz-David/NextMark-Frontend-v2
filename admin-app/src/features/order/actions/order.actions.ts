import { useCallback } from "react";

import {
  usePopupManager,
  useSectionManager,
} from "@/shared/resource-manager/useResourceManager";
import {
  deleteQueryFilter,
  resetQuery,
  setQueryFilters,
  setQuerySearch,
  updateQueryFilters,
  useOrderQuery,
} from "../store/orderQuery.store";
import type {
  OrderQueryFilters,
  OrderQueryStringQueries,
} from "../types/orderMeta";
import {
  filterBehavior,
  orderStringFilters,
  resolveConflicts,
} from "../domain/orderFilterConfig";
import type { OrderDetailPayload } from "../domain/orderDetailPayload.types";
import type { Order } from "../types/order";
import { useOrderController } from "../controllers/order.controller";

type parentParamsProps = {
  borderLeft?: string;
  pageClass?: string;
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
      if (openPayload && openPayload.clientId === payload.clientId) {
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

  const openPopupFilter = useCallback((popupKey: string) => {
    if (popupKey === "order.filter.order-state") {
      popupManager.open({
        key: "order.filter.order-state",
        payload: {
          selectedStates: Array.isArray(query.filters.order_state)
            ? query.filters.order_state
            : [],
          onApply: (nextStates: string[]) => {
            if (nextStates.length === 0) {
              deleteQueryFilter("order_state");
              return;
            }

            updateQueryFilters({ order_state: nextStates });
          },
        },
      });
      return;
    }

    if (popupKey === "order.filter.order-schedule-range") {
      popupManager.open({
        key: "order.filter.order-schedule-range",
        payload: {
          from: typeof query.filters.order_schedule_from === "string"
            ? query.filters.order_schedule_from
            : null,
          to: typeof query.filters.order_schedule_to === "string"
            ? query.filters.order_schedule_to
            : null,
          onApply: (payload: { from: string | null; to: string | null }) => {
            const nextFilters = resolveConflicts(query.filters, "order_schedule_from");

            if (!payload.from) {
              delete nextFilters.order_schedule_from;
            } else {
              nextFilters.order_schedule_from = payload.from;
            }

            if (!payload.to) {
              delete nextFilters.order_schedule_to;
            } else {
              nextFilters.order_schedule_to = payload.to;
            }

            applyFilters(nextFilters as OrderQueryFilters);
          },
        },
      });
    }
  }, [applyFilters, popupManager, query.filters]);

  const updateFilters = useCallback(
    (key: string, value: unknown) => {
      if (key in filterBehavior) {
        const updatedFilters = resolveConflicts(query.filters, key);
        applyFilters({ ...updatedFilters, [key]: value } as OrderQueryFilters);
        return;
      }

      if (orderStringFilters.has(key as OrderQueryStringQueries)) {
        const previous = query.filters.s ?? [];
        const stringKey = key as OrderQueryStringQueries;
        const alreadySelected = previous.includes(stringKey);
        if (alreadySelected) return;

        updateQueryFilters({ s: [...(query.filters.s || []), stringKey] });
        return;
      }
      updateQueryFilters({ [key]: value } as Partial<OrderQueryFilters>);
    },
    [applyFilters, query],
  );
  const deleteFilter = useCallback(
    (key: string, value?: unknown) => {
      if (key === "s" && typeof value === "string") {
        const stringKey = value as OrderQueryStringQueries;
        const newStringFilters = (query.filters.s || []).filter(
          (filterKey) => filterKey !== stringKey,
        );

        if (newStringFilters.length === 0) {
          deleteQueryFilter("s");
          return;
        }

        updateQueryFilters({ s: newStringFilters });
        return;
      }

      if (orderStringFilters.has(key as OrderQueryStringQueries)) {
        const stringKey = key as OrderQueryStringQueries;
        const newStringFilters = (query.filters.s || []).filter(
          (filterKey) => filterKey !== stringKey,
        );

        if (newStringFilters.length === 0) {
          deleteQueryFilter("s");
          return;
        }

        updateQueryFilters({ s: newStringFilters });
        return;
      }

      const existingValue = query.filters[key as keyof OrderQueryFilters];
      if (Array.isArray(existingValue) && value !== undefined) {
        const nextValue = existingValue.filter((item) => item !== value);
        if (nextValue.length === 0) {
          deleteQueryFilter(key as keyof OrderQueryFilters);
          return;
        }
        updateQueryFilters({ [key]: nextValue } as Partial<OrderQueryFilters>);
        return;
      }

      deleteQueryFilter(key as keyof OrderQueryFilters);
    },
    [query],
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
    updateFilters,
    openPopupFilter,
    deleteFilter,
    openOrderCases,
    handleArchiveOrder,
    handleUnarchiveOrder,
    handleOrderMarkerClick,
  };
};
