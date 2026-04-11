import { useEffect, useRef } from "react";

import type { RouteGroup } from "@/features/plan/routeGroup/types/routeGroup";
import type { RouteSolution } from "@/features/plan/routeGroup/types/routeSolution";
import type { RouteSolutionStop } from "@/features/plan/routeGroup/types/routeSolutionStop";
import { useRouteGroupDetailsFlow } from "@/features/plan/routeGroup/flows/routeGroupDetails.flow";

type ActiveRouteGroupDetailsHydrationParams = {
  planId: number | null;
  routeGroup: RouteGroup | null;
  selectedRouteSolution: RouteSolution | null;
  routeSolutionStops: RouteSolutionStop[];
};

export const useActiveRouteGroupDetailsHydrationFlow = ({
  planId,
  routeGroup,
  selectedRouteSolution,
  routeSolutionStops,
}: ActiveRouteGroupDetailsHydrationParams) => {
  const { fetchRouteGroupDetails } = useRouteGroupDetailsFlow();
  const lastRequestKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const routeGroupId = routeGroup?.id ?? null;

    const isHydratableRouteGroupId =
      typeof routeGroupId === "number" && Number.isFinite(routeGroupId) && routeGroupId > 0;

    if (planId == null || !isHydratableRouteGroupId) {
      lastRequestKeyRef.current = null;
      return;
    }

    const shouldHaveStops = Math.max(0, routeGroup?.total_orders ?? 0) > 0;
    const hasFullSelectedSolution = selectedRouteSolution?._representation === "full";
    const hasHydratedStops = !shouldHaveStops || routeSolutionStops.length > 0;
    const needsDetails =
      selectedRouteSolution == null ||
      !hasFullSelectedSolution ||
      !hasHydratedStops;

    if (!needsDetails) {
      lastRequestKeyRef.current = null;
      return;
    }

    const requestKey = `${planId}:${routeGroupId}`;
    if (lastRequestKeyRef.current === requestKey) {
      return;
    }
    lastRequestKeyRef.current = requestKey;

    void fetchRouteGroupDetails(planId, routeGroupId);
  }, [
    fetchRouteGroupDetails,
    planId,
    routeGroup,
    routeSolutionStops.length,
    selectedRouteSolution,
  ]);
};
