type RecordValue = Record<string, unknown>;

const asRecord = (value: unknown): RecordValue =>
  value && typeof value === "object" ? (value as RecordValue) : {};

const toPositiveInt = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const toPositiveIntArray = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .map(toPositiveInt)
        .filter((item): item is number => item !== null),
    ),
  );
};

type ResolveCreatePlanOrderIdsParams = {
  activeData: unknown;
  selectedServerIds?: unknown;
  selectionModeEnabled?: boolean;
  isActiveOrderSelected?: boolean;
};

export const resolveCreatePlanOrderIds = ({
  activeData,
  selectedServerIds,
  selectionModeEnabled = false,
  isActiveOrderSelected = false,
}: ResolveCreatePlanOrderIdsParams): number[] => {
  const data = asRecord(activeData);
  const activeType = String(data.type ?? "");

  if (
    activeType === "order_batch" ||
    (activeType === "order" &&
      selectionModeEnabled &&
      isActiveOrderSelected)
  ) {
    return toPositiveIntArray(selectedServerIds);
  }

  if (activeType === "order_group" || activeType === "route_stop_group") {
    return toPositiveIntArray(data.orderIds);
  }

  if (activeType === "order" || activeType === "route_stop") {
    const order = asRecord(data.order);
    const orderId = toPositiveInt(order.id);
    return orderId ? [orderId] : [];
  }

  return [];
};
