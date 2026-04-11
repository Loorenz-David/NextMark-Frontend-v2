import type { OrderMap } from "@/features/order/types/order";
import type {
  RouteGroup,
  RouteGroupMap,
} from "@/features/plan/routeGroup/types/routeGroup";
import type {
  RouteSolution,
  RouteSolutionMap,
} from "@/features/plan/routeGroup/types/routeSolution";
import type {
  RouteSolutionStop,
  RouteSolutionStopMap,
} from "@/features/plan/routeGroup/types/routeSolutionStop";
import type { RouteGroupOverviewResponse } from "@/features/plan/routeGroup/api/planOverview.api";

type RouteGroupDetailsDto = {
  route_group?: RouteGroup | null;
  route_solutions?: RouteSolution[] | RouteSolutionMap | null;
  route_solution_stops?: RouteSolutionStop[] | RouteSolutionStopMap | null;
};

const emptyOrderMap = (): OrderMap => ({
  byClientId: {},
  allIds: [],
});

const emptyRouteGroupMap = (): RouteGroupMap => ({
  byClientId: {},
  allIds: [],
});

const emptyRouteSolutionMap = (): RouteSolutionMap => ({
  byClientId: {},
  allIds: [],
});

const emptyRouteSolutionStopMap = (): RouteSolutionStopMap => ({
  byClientId: {},
  allIds: [],
});

const toRouteGroupMap = (routeGroup?: RouteGroup | null): RouteGroupMap => {
  if (!routeGroup?.client_id) {
    return emptyRouteGroupMap();
  }

  return {
    byClientId: {
      [routeGroup.client_id]: routeGroup,
    },
    allIds: [routeGroup.client_id],
  };
};

const toRouteSolutionMap = (
  routeSolutions?: RouteSolution[] | RouteSolutionMap | null,
): RouteSolutionMap => {
  if (!routeSolutions) {
    return emptyRouteSolutionMap();
  }

  if ("byClientId" in routeSolutions && "allIds" in routeSolutions) {
    return routeSolutions;
  }

  return routeSolutions.reduce<RouteSolutionMap>(
    (acc, routeSolution) => {
      if (!routeSolution?.client_id) {
        return acc;
      }

      acc.byClientId[routeSolution.client_id] = routeSolution;
      acc.allIds.push(routeSolution.client_id);
      return acc;
    },
    emptyRouteSolutionMap(),
  );
};

const toRouteSolutionStopMap = (
  routeSolutionStops?: RouteSolutionStop[] | RouteSolutionStopMap | null,
): RouteSolutionStopMap => {
  if (!routeSolutionStops) {
    return emptyRouteSolutionStopMap();
  }

  if ("byClientId" in routeSolutionStops && "allIds" in routeSolutionStops) {
    return routeSolutionStops;
  }

  return routeSolutionStops.reduce<RouteSolutionStopMap>(
    (acc, routeSolutionStop) => {
      if (!routeSolutionStop?.client_id) {
        return acc;
      }

      acc.byClientId[routeSolutionStop.client_id] = routeSolutionStop;
      acc.allIds.push(routeSolutionStop.client_id);
      return acc;
    },
    emptyRouteSolutionStopMap(),
  );
};

export const normalizeRouteGroupDetailsPayload = (
  payload?: RouteGroupDetailsDto | null,
): RouteGroupOverviewResponse | null => {
  if (!payload) {
    return null;
  }

  return {
    order: emptyOrderMap(),
    route_group: toRouteGroupMap(payload.route_group),
    route_solution: toRouteSolutionMap(payload.route_solutions),
    route_solution_stop: toRouteSolutionStopMap(payload.route_solution_stops),
  };
};
