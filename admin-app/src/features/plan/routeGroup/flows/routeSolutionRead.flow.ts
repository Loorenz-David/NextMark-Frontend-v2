import { useCallback } from "react";

import { ApiError } from "@/lib/api/ApiClient";
import { useMessageHandler } from "@shared-message-handler";

import {
  routeSolutionApi,
  type RouteSolutionGetResponse,
} from "@/features/plan/routeGroup/api/routeSolution.api";
import { normalizeByClientIdArray } from "@/features/plan/routeGroup/api/mappers/routeSolutionPayload.mapper";
import {
  upsertRouteSolution,
  upsertRouteSolutions,
} from "@/features/plan/routeGroup/store/routeSolution.store";
import {
  replaceRouteSolutionStopsForSolution,
  upsertRouteSolutionStop,
  upsertRouteSolutionStops,
} from "@/features/plan/routeGroup/store/routeSolutionStop.store";

export const applyRouteSolutionGetPayload = (
  payload?: RouteSolutionGetResponse | null,
) => {
  if (!payload?.route_solution) return;

  let selectedSolutionId: number | null = null;

  if ("byClientId" in payload.route_solution && "allIds" in payload.route_solution) {
    const solutionMap = payload.route_solution;
    upsertRouteSolutions(solutionMap);
    const selectedSolution =
      solutionMap.allIds
        .map((clientId) => solutionMap.byClientId[clientId])
        .find((solution) => solution?.is_selected)
      ?? solutionMap.allIds
        .map((clientId) => solutionMap.byClientId[clientId])
        .find(Boolean)
      ?? null;
    selectedSolutionId = selectedSolution?.id ?? null;
  } else {
    const solutions = normalizeByClientIdArray(payload.route_solution);
    solutions.forEach((solution) => {
      if (solution?.client_id) {
        upsertRouteSolution(solution);
      }
    });
    selectedSolutionId = solutions[0]?.id ?? null;
  }

  if (!payload.route_solution_stop) return;

  if ("byClientId" in payload.route_solution_stop && "allIds" in payload.route_solution_stop) {
    if (selectedSolutionId != null) {
      replaceRouteSolutionStopsForSolution(
        selectedSolutionId,
        payload.route_solution_stop,
      );
      return;
    }

    upsertRouteSolutionStops(payload.route_solution_stop);
    return;
  }

  const stops = normalizeByClientIdArray(payload.route_solution_stop);
  if (selectedSolutionId != null) {
    const normalizedStops = {
      byClientId: Object.fromEntries(
        stops
          .filter((stop) => stop?.client_id)
          .map((stop) => [stop.client_id, stop]),
      ),
      allIds: stops
        .map((stop) => stop?.client_id)
        .filter((clientId): clientId is string => typeof clientId === "string"),
    };

    replaceRouteSolutionStopsForSolution(selectedSolutionId, normalizedStops);
    return;
  }

  stops.forEach((stop) => {
    if (stop?.client_id) {
      upsertRouteSolutionStop(stop);
    }
  });
};

export function useRouteSolutionReadFlow() {
  const { showMessage } = useMessageHandler();

  const fetchRouteSolution = useCallback(
    async (routeSolutionId: number, options?: { returnStops?: boolean }) => {
      try {
        const response = await routeSolutionApi.getRouteSolution(
          routeSolutionId,
          options?.returnStops ?? false,
        );
        applyRouteSolutionGetPayload(response.data);
        return response.data;
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Unable to load route solution.";
        const status = error instanceof ApiError ? error.status : 500;
        console.error("Failed to fetch route solution", error);
        showMessage({ status, message });
        return null;
      }
    },
    [showMessage],
  );

  return {
    fetchRouteSolution,
  };
}
