import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import type { Order } from "../types/order";
import type { OrderBatchSelectionPayload } from "../types/orderBatchSelection";
import { useOrderSelectionStore } from "./orderSelection.store";
import { useOrderStore } from "./order.store";

export const buildSelectedOrdersSummary = (
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

export const useOrderSelectionMode = () =>
  useOrderSelectionStore((state) => state.isSelectionMode);

export const useSelectedOrderClientIds = () =>
  useOrderSelectionStore((state) => state.selectedClientIds);

export const useSelectedOrderServerIds = () =>
  useOrderSelectionStore((state) => state.selectedServerIds);
export const useManualSelectedOrderServerIds = () =>
  useOrderSelectionStore((state) => state.manualSelectedServerIds);
export const useManualSelectedOrderClientIds = () =>
  useOrderSelectionStore((state) => state.manualSelectedClientIds);
export const useOrderSelectAllSnapshots = () =>
  useOrderSelectionStore((state) => state.selectAllSnapshots);
export const useExcludedOrderServerIds = () =>
  useOrderSelectionStore((state) => state.excludedServerIds);
export const useLoadedSelectionIds = () =>
  useOrderSelectionStore((state) => state.loadedSelectionIds);
export const useResolvedOrderSelection = () =>
  useOrderSelectionStore((state) => state.resolvedSelection);

export const buildBatchSelectionPayload = (
  state: ReturnType<typeof useOrderSelectionStore.getState>,
): OrderBatchSelectionPayload => {
  const manual_order_ids = state.manualSelectedServerIds.filter(
    (id) => !state.excludedServerIds.includes(id),
  );
  const select_all_snapshots = state.selectAllSnapshots.map((snapshot) => ({
    query: snapshot.query,
    client_signature: snapshot.key,
  }));

  return {
    manual_order_ids,
    select_all_snapshots,
    excluded_order_ids: state.excludedServerIds,
    source: "selection",
  };
};

export const useOrderBatchSelectionPayload = () => {
  const { manualSelectedServerIds, excludedServerIds, selectAllSnapshots } =
    useOrderSelectionStore(
      useShallow((state) => ({
        manualSelectedServerIds: state.manualSelectedServerIds,
        excludedServerIds: state.excludedServerIds,
        selectAllSnapshots: state.selectAllSnapshots,
      })),
    );

  return useMemo<OrderBatchSelectionPayload>(
    () => ({
      manual_order_ids: manualSelectedServerIds.filter(
        (id) => !excludedServerIds.includes(id),
      ),
      select_all_snapshots: selectAllSnapshots.map((snapshot) => ({
        query: snapshot.query,
        client_signature: snapshot.key,
      })),
      excluded_order_ids: excludedServerIds,
      source: "selection",
    }),
    [excludedServerIds, manualSelectedServerIds, selectAllSnapshots],
  );
};

export const useHasSelectionIntent = () =>
  useOrderSelectionStore(
    (state) =>
      state.manualSelectedServerIds.some(
        (id) => !state.excludedServerIds.includes(id),
      ) || state.selectAllSnapshots.length > 0,
  );

export const useOrderBatchSelectedCount = () =>
  useOrderSelectionStore((state) => {
    const manualCount = state.manualSelectedServerIds.filter(
      (id) => !state.excludedServerIds.includes(id),
    ).length;
    const hasSnapshots = state.selectAllSnapshots.length > 0;
    const estimatedSnapshotCount = state.selectAllSnapshots.reduce(
      (total, snapshot) => total + (snapshot.estimatedCount ?? 0),
      0,
    );

    if (hasSnapshots) {
      return state.resolvedSelection.count > 0
        ? state.resolvedSelection.count
        : manualCount + estimatedSnapshotCount;
    }
    return manualCount;
  });

export const useIsOrderSelectedInSelectionMode = (
  order: Order | null | undefined,
) =>
  useOrderSelectionStore((state) => {
    if (!order) return false;
    const serverId = order.id;
    if (typeof serverId !== "number") {
      return state.manualSelectedClientIds.includes(order.client_id);
    }
    if (state.excludedServerIds.includes(serverId)) return false;
    return (
      state.manualSelectedServerIds.includes(serverId) ||
      state.loadedSelectionIds.includes(serverId)
    );
  });

export const useOrderSelectionActions = () =>
  useOrderSelectionStore(
    useShallow((state) => ({
      enableSelectionMode: state.enableSelectionMode,
      disableSelectionMode: state.disableSelectionMode,
      setSelectedOrders: state.setSelectedOrders,
      toggleManualOrder: state.toggleManualOrder,
      addSelectAllSnapshot: state.addSelectAllSnapshot,
      removeSelectAllSnapshot: state.removeSelectAllSnapshot,
      setLoadedSelectionIds: state.setLoadedSelectionIds,
      toggleExcludedServerId: state.toggleExcludedServerId,
      setResolvedSelection: state.setResolvedSelection,
      clearResolvedSelection: state.clearResolvedSelection,
      clearSelection: state.clearSelection,
    })),
  );

export const useSelectedOrdersSummary = () => {
  const selectedClientIds = useSelectedOrderClientIds();
  const byClientId = useOrderStore((state) => state.byClientId);

  return useMemo(
    () => buildSelectedOrdersSummary(selectedClientIds, byClientId),
    [byClientId, selectedClientIds],
  );
};
