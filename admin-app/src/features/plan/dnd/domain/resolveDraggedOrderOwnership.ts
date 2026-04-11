type DragSourceOwnership = {
  planId: number | null;
  routeGroupId: number | null;
};

type ResolveDraggedOrderOwnershipParams = {
  activeData: unknown;
  resolveRouteGroupIdByRouteSolutionId: (
    routeSolutionId: number | null | undefined,
  ) => number | null;
  resolvePlanIdByRouteGroupId: (
    routeGroupId: number | null | undefined,
  ) => number | null;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const toPositiveInt = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const resolveDraggedOrderOwnership = ({
  activeData,
  resolveRouteGroupIdByRouteSolutionId,
  resolvePlanIdByRouteGroupId,
}: ResolveDraggedOrderOwnershipParams): DragSourceOwnership | null => {
  const data = asRecord(activeData);
  const activeType = String(data.type ?? "").trim();

  if (!activeType) return null;

  if (activeType === "order" || activeType === "order_group") {
    const order = asRecord(data.order);
    return {
      planId: toPositiveInt(order.route_plan_id),
      routeGroupId: toPositiveInt(order.route_group_id),
    };
  }

  if (activeType === "route_stop" || activeType === "route_stop_group") {
    const stop = asRecord(data.stop);
    const routeSolutionId =
      toPositiveInt(data.routeSolutionId) ??
      toPositiveInt(stop.route_solution_id);
    const routeGroupId = resolveRouteGroupIdByRouteSolutionId(routeSolutionId);

    return {
      routeGroupId,
      planId: resolvePlanIdByRouteGroupId(routeGroupId),
    };
  }

  return null;
};
