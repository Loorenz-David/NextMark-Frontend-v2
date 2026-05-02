import { useEffect, useMemo, useRef } from "react";
import { normalizeEntityMap } from "@/lib/utils/entities/normalizeEntityMap";

import { planApi } from "../api/plan.api";

import { useRouteSolutionStopStore } from "../routeGroup/store/routeSolutionStop.store";
import { useRouteSolutionStore } from "../routeGroup/store/routeSolution.store";
import {
  selectRouteGroupByServerId,
  useRouteGroupStore,
} from "../routeGroup/store/routeGroup.slice";
import { useRoutePlanByServerId } from "../store/useRoutePlan.selector";
import {
  extractOrderDetailHeaderPlanMeta,
  type OrderDetailHeaderPlanMeta,
} from "../domain/extractOrderDetailHeaderPlanMeta";
import type { DeliveryPlan, DeliveryPlanMap } from "../types/plan";
import type { RouteSolutionStop } from "../routeGroup/types/routeSolutionStop";
import { upsertRoutePlan, upsertRoutePlans } from "../store/routePlan.slice";

type UseOrderDetailHeaderPlanMetaParams = {
  orderId?: number | null;
  routePlanId?: number | null;
  routeGroupId?: number | null;
};

const toFiniteNumberOrNull = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const rankStop = (stop: RouteSolutionStop): number =>
  typeof stop.stop_order === "number"
    ? stop.stop_order
    : Number.POSITIVE_INFINITY;

export const useOrderDetailHeaderPlanMeta = ({
  orderId,
  routePlanId,
  routeGroupId,
}: UseOrderDetailHeaderPlanMetaParams): OrderDetailHeaderPlanMeta => {
  const hydrateAttemptedForPlanIdRef = useRef<number | null>(null);
  const normalizedRouteGroupId = toFiniteNumberOrNull(routeGroupId);
  const routeGroup = useRouteGroupStore(
    selectRouteGroupByServerId(normalizedRouteGroupId),
  );
  const normalizedRoutePlanId = toFiniteNumberOrNull(routePlanId);
  const routePlanIdFromGroup = toFiniteNumberOrNull(routeGroup?.route_plan_id);
  const resolvedRoutePlanId = normalizedRoutePlanId ?? routePlanIdFromGroup;
  const routePlan = useRoutePlanByServerId(resolvedRoutePlanId) ?? null;

  useEffect(() => {
    if (typeof resolvedRoutePlanId !== "number") {
      hydrateAttemptedForPlanIdRef.current = null;
      return;
    }

    if (routePlan) {
      hydrateAttemptedForPlanIdRef.current = null;
      return;
    }

    if (hydrateAttemptedForPlanIdRef.current === resolvedRoutePlanId) {
      return;
    }

    hydrateAttemptedForPlanIdRef.current = resolvedRoutePlanId;
    let cancelled = false;

    const hydrateRoutePlan = async () => {
      try {
        const response = await planApi.getPlan(resolvedRoutePlanId);
        if (cancelled) return;

        const normalized = normalizeEntityMap<DeliveryPlan>(
          response.data?.route_plan as DeliveryPlanMap | DeliveryPlan,
        );
        if (!normalized) return;

        if (normalized.allIds.length === 1) {
          upsertRoutePlan(normalized.byClientId[normalized.allIds[0]]);
          return;
        }

        upsertRoutePlans(normalized);
      } catch {
        // Header hydration is best-effort; keep fallback label when fetch fails.
      }
    };

    void hydrateRoutePlan();

    return () => {
      cancelled = true;
    };
  }, [resolvedRoutePlanId, routePlan]);

  const routeSolutionIds = useRouteSolutionStore((state) => state.allIds);
  const routeSolutionByClientId = useRouteSolutionStore(
    (state) => state.byClientId,
  );
  const routeStopIds = useRouteSolutionStopStore((state) => state.allIds);
  const routeStopByClientId = useRouteSolutionStopStore(
    (state) => state.byClientId,
  );

  const routeStop = useMemo(() => {
    if (typeof orderId !== "number") {
      return null;
    }

    const selectedSolutionId =
      typeof normalizedRouteGroupId === "number"
        ? (routeSolutionIds
            .map((clientId) => routeSolutionByClientId[clientId])
            .find(
              (solution) =>
                solution?.route_group_id === normalizedRouteGroupId &&
                solution.is_selected,
            )?.id ?? null)
        : null;

    const matchingStops = routeStopIds
      .map((clientId) => routeStopByClientId[clientId])
      .filter(
        (stop): stop is RouteSolutionStop =>
          Boolean(stop) && stop.order_id === orderId,
      );

    if (matchingStops.length === 0) {
      return null;
    }

    if (typeof selectedSolutionId === "number") {
      const selectedStop =
        matchingStops.find(
          (stop) => stop.route_solution_id === selectedSolutionId,
        ) ?? null;
      if (selectedStop) {
        return selectedStop;
      }
    }

    return (
      [...matchingStops].sort(
        (left, right) => rankStop(left) - rankStop(right),
      )[0] ?? null
    );
  }, [
    orderId,
    normalizedRouteGroupId,
    routeSolutionByClientId,
    routeSolutionIds,
    routeStopByClientId,
    routeStopIds,
  ]);

  return useMemo(
    () =>
      extractOrderDetailHeaderPlanMeta({
        routePlan,
        routeStop,
        fallbackPlanLabel:
          typeof resolvedRoutePlanId === "number"
            ? `Plan #${resolvedRoutePlanId}`
            : null,
      }),
    [resolvedRoutePlanId, routePlan, routeStop],
  );
};
