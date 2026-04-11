import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import type { Order } from "@/features/order/types/order";
import { useOrderStore } from "@/features/order/store/order.store";

import { useRouteGroupSelectionStore } from "./routeGroupSelection.store";

export const buildSelectedRouteGroupOrdersSummary = (
  selectedIds: string[],
  byClientId: Record<string, Order>,
) => {
  const orders = selectedIds.reduce<Order[]>((acc, clientId) => {
    const order = byClientId[clientId];
    if (order) {
      acc.push(order);
    }
    return acc;
  }, []);

  const totalWeight = orders.reduce(
    (acc, order) => acc + (order.total_weight ?? 0),
    0,
  );
  const totalItems = orders.reduce(
    (acc, order) => acc + (order.total_items ?? 0),
    0,
  );
  const totalVolume = orders.reduce(
    (acc, order) => acc + (order.total_volume ?? 0),
    0,
  );
  const itemTypeCounts = orders.reduce<Record<string, number>>((acc, order) => {
    const entry = order.item_type_counts ?? {};
    Object.entries(entry).forEach(([itemType, count]) => {
      if (itemType.trim().length === 0) return;
      const safeCount = Number.isFinite(count) ? count : 0;
      if (safeCount <= 0) return;
      acc[itemType] = (acc[itemType] ?? 0) + safeCount;
    });
    return acc;
  }, {});

  return {
    count: orders.length,
    orders,
    totalWeight,
    totalItems,
    totalVolume,
    itemTypeCounts,
  };
};

export const useRouteGroupSelectionMode = () =>
  useRouteGroupSelectionStore((state) => state.isSelectionMode);

export const useSelectedRouteGroupClientIds = () =>
  useRouteGroupSelectionStore((state) => state.selectedClientIds);

export const useSelectedRouteGroupServerIds = () =>
  useRouteGroupSelectionStore((state) => state.selectedServerIds);

export const useRouteGroupSelectionActions = () =>
  useRouteGroupSelectionStore(
    useShallow((state) => ({
      enableSelectionMode: state.enableSelectionMode,
      disableSelectionMode: state.disableSelectionMode,
      setSelectedOrders: state.setSelectedOrders,
      clearSelection: state.clearSelection,
    })),
  );

export const useSelectedRouteGroupOrdersSummary = () => {
  const selectedClientIds = useSelectedRouteGroupClientIds();
  const byClientId = useOrderStore((state) => state.byClientId);

  return useMemo(
    () => buildSelectedRouteGroupOrdersSummary(selectedClientIds, byClientId),
    [byClientId, selectedClientIds],
  );
};
