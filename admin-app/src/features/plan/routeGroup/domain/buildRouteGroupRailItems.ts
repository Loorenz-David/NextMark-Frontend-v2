import type { RouteGroup } from "../types/routeGroup";
import type { RouteGroupRailItem } from "./routeGroupRailItem";
import type { OrderState, OrderStates } from "@/features/order/types/orderState";
import type { DeliveryPlanState, PlanStates } from "@/features/plan/types/planState";

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const ORDER_STATE_WEIGHTS: Record<OrderStates, number> = {
  Draft: 1,
  Confirmed: 2,
  Preparing: 3,
  Ready: 4,
  Processing: 5,
  Completed: 6,
  Fail: 0,
  Cancelled: 0,
};

const ROUTE_GROUP_STATE_THRESHOLDS: Array<{
  state: PlanStates;
  targetRatio: number;
}> = [
  { state: "Open", targetRatio: 0 },
  { state: "Ready", targetRatio: 33 },
  { state: "Processing", targetRatio: 66 },
  { state: "Completed", targetRatio: 100 },
];

const ROUTE_GROUP_STAGE_ORDER_STATES: Record<PlanStates, OrderStates[]> = {
  Open: ["Draft", "Confirmed", "Preparing"],
  Ready: ["Ready"],
  Processing: ["Processing"],
  Completed: ["Completed"],
  Fail: ["Fail"],
};

const resolveRouteGroupState = (
  routeGroup: RouteGroup,
  routeGroupStates: DeliveryPlanState[],
) =>
  routeGroupStates.find((state) => state.id === (routeGroup.state_id ?? null)) ??
  null;

const resolveRouteGroupStateMeta = (
  routeGroup: RouteGroup,
  routeGroupStates: DeliveryPlanState[],
) => {
  const resolvedState = resolveRouteGroupState(routeGroup, routeGroupStates);
  return {
    label: resolvedState?.name ?? null,
    color: resolvedState?.color ?? null,
  };
};

const resolveRouteGroupLabel = (
  routeGroup: RouteGroup,
  fallbackIndex: number,
) =>
  routeGroup.zone_snapshot?.name?.trim() ||
  (typeof routeGroup.zone_id === "number"
    ? `Zone ${routeGroup.zone_id}`
    : `Group ${fallbackIndex + 1}`);

const resolveZoneLabel = (routeGroup: RouteGroup, fallbackIndex: number) =>
  typeof routeGroup.zone_id === "number"
    ? `Zone ${routeGroup.zone_id}`
    : `Group ${fallbackIndex + 1}`;

const resolveNormalizedOrderStateCounts = (
  routeGroup: RouteGroup,
  orderStates: OrderState[],
) => {
  const availableStates = new Set<OrderStates>(
    orderStates.map((state) => state.name as OrderStates),
  );

  return (Object.keys(ORDER_STATE_WEIGHTS) as OrderStates[]).reduce<
    Record<OrderStates, number>
  >((acc, stateName) => {
    if (!availableStates.has(stateName)) {
      acc[stateName] = 0;
      return acc;
    }
    acc[stateName] = Math.max(0, routeGroup.order_state_counts?.[stateName] ?? 0);
    return acc;
  }, {} as Record<OrderStates, number>);
};

const resolveActiveOrderCount = (
  routeGroup: RouteGroup,
  counts: Record<OrderStates, number>,
) => {
  const totalOrders = Math.max(0, routeGroup.total_orders ?? 0);
  const cancelledCount = Math.max(0, counts.Cancelled ?? 0);
  return Math.max(0, totalOrders - cancelledCount);
};

const resolveEarnedPoints = (counts: Record<OrderStates, number>) =>
  (Object.entries(ORDER_STATE_WEIGHTS) as Array<[OrderStates, number]>).reduce(
    (total, [stateName, weight]) =>
      total + Math.max(0, counts[stateName] ?? 0) * weight,
    0,
  );

const resolveCompletionRatio = (
  earnedPoints: number,
  maxPoints: number,
): number => {
  if (maxPoints <= 0) return 0;
  return clampPercent((earnedPoints / maxPoints) * 100);
};

const resolveCurrentStateOrderCount = (
  currentStateLabel: PlanStates | null,
  counts: Record<OrderStates, number>,
) => {
  if (!currentStateLabel) return 0;
  const stageStates = ROUTE_GROUP_STAGE_ORDER_STATES[currentStateLabel] ?? [];
  return stageStates.reduce(
    (total, stateName) => total + Math.max(0, counts[stateName] ?? 0),
    0,
  );
};

const resolveNextMilestone = (
  currentStateLabel: PlanStates | null,
) => {
  if (!currentStateLabel || currentStateLabel === "Completed") {
    return null;
  }

  const currentIndex = ROUTE_GROUP_STATE_THRESHOLDS.findIndex(
    (entry) => entry.state === currentStateLabel,
  );
  if (currentIndex < 0) return null;
  return ROUTE_GROUP_STATE_THRESHOLDS[currentIndex + 1] ?? null;
};

export const buildRouteGroupRailItems = ({
  routeGroups,
  orderStates,
  routeGroupStates,
  activeRouteGroupId,
}: {
  routeGroups: RouteGroup[];
  orderStates: OrderState[];
  routeGroupStates: DeliveryPlanState[];
  activeRouteGroupId: number | null;
}): RouteGroupRailItem[] =>
  routeGroups
    .filter((routeGroup): routeGroup is RouteGroup & { id: number } =>
      typeof routeGroup.id === "number",
    )
    .map((routeGroup, index) => {
      const routeGroupState = resolveRouteGroupStateMeta(
        routeGroup,
        routeGroupStates,
      );
      const normalizedCounts = resolveNormalizedOrderStateCounts(
        routeGroup,
        orderStates,
      );
      const activeOrderCount = resolveActiveOrderCount(routeGroup, normalizedCounts);
      const earnedPoints = resolveEarnedPoints(normalizedCounts);
      const maxPoints = activeOrderCount * ORDER_STATE_WEIGHTS.Completed;
      const completionRatio = resolveCompletionRatio(earnedPoints, maxPoints);
      const currentStateLabel = routeGroupState.label ?? null;
      const currentStateOrderCount = resolveCurrentStateOrderCount(
        currentStateLabel,
        normalizedCounts,
      );
      const nextMilestone = resolveNextMilestone(currentStateLabel);
      const nextStateTargetPoints =
        nextMilestone == null
          ? null
          : Math.ceil((maxPoints * nextMilestone.targetRatio) / 100);
      const remainingPointsToNextState =
        nextStateTargetPoints == null
          ? null
          : Math.max(0, nextStateTargetPoints - earnedPoints);

      return {
        route_group_id: routeGroup.id,
        label: resolveRouteGroupLabel(routeGroup, index),
        completionRatio,
        orderCount: Math.max(0, routeGroup.total_orders ?? 0),
        activeOrderCount,
        itemCount: Math.max(0, routeGroup.total_item_count ?? 0),
        totalWeightGrams: Math.max(0, routeGroup.total_weight_grams ?? 0),
        totalVolumeCm3: Math.max(0, routeGroup.total_volume_cm3 ?? 0),
        currentStateOrderCount,
        earnedPoints,
        maxPoints,
        stateLabel: routeGroupState.label,
        stateColor: routeGroupState.color,
        nextStateLabel: nextMilestone?.state ?? null,
        nextStateTargetRatio: nextMilestone?.targetRatio ?? null,
        nextStateTargetPoints,
        remainingPointsToNextState,
        zoneLabel: resolveZoneLabel(routeGroup, index),
        isActive: routeGroup.id === activeRouteGroupId,
      };
    });
