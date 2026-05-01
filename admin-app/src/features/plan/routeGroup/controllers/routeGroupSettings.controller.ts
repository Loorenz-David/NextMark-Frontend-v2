import { useCallback } from "react";
import { optimisticTransaction } from "@shared-optimistic";

import { ApiError } from "@/lib/api/ApiClient";
import { useMessageHandler } from "@shared-message-handler";

import { routeGroupSettingsApi } from "@/features/plan/routeGroup/api/routeGroupSettings.api";
import {
  saveDriverIdPreference,
  saveEtaMessageToleranceMinutesPreference,
  saveEtaToleranceMinutesPreference,
  saveEndLocationPreference,
  saveEndTimePreference,
  saveRouteEndStrategyPreference,
  saveStartLocationPreference,
  saveStartTimePreference,
  saveStopsServiceTimePreference,
} from "@/features/plan/routeGroup/forms/routeGroupEditForm/routeGroupEditForm.storage";
import { normalizeRouteGroupEditFormToSettingsPayload } from "@/features/plan/routeGroup/api/mappers/routeGroupSettings.mapper";
import { normalizeByClientIdArray } from "@/features/plan/routeGroup/api/mappers/routeSolutionPayload.mapper";
import { applyRoutePlanTargetPatch } from "@/features/plan/routeGroup/domain/applyRoutePlanTargetPatch";
import {
  serviceTimeMinutesToSeconds,
  serviceTimeSecondsToMinutes,
} from "@/features/plan/routeGroup/domain/serviceTimeUnits";
import type { DeliveryPlan } from "@/features/plan/types/plan";
import type { RouteGroup } from "@/features/plan/routeGroup/types/routeGroup";
import type { RouteSolution } from "@/features/plan/routeGroup/types/routeSolution";
import type { RouteGroupEditFormState } from "@/features/plan/routeGroup/forms/routeGroupEditForm/RouteGroupEditForm.types";

import {
  selectRoutePlanByServerId,
  updateRoutePlan,
  useRoutePlanStore,
} from "@/features/plan/store/routePlan.slice";
import { usePlanController } from "@/features/plan/controllers/plan.controller";
import {
  insertRouteGroup,
  selectRouteGroupsByPlanId,
  selectRouteGroupByServerId,
  removeRouteGroup,
  useRouteGroupStore,
} from "@/features/plan/routeGroup/store/routeGroup.slice";
import { routeGroupApi } from "@/features/plan/routeGroup/api/routeGroup.api";
import {
  selectRouteSolutionByServerId,
  setSelectedRouteSolution,
  updateRouteSolution,
  upsertRouteSolution,
  useRouteSolutionStore,
} from "@/features/plan/routeGroup/store/routeSolution.store";
import { upsertRouteSolutionStop } from "@/features/plan/routeGroup/store/routeSolutionStop.store";

const resolveError = (error: unknown, fallback: string) => ({
  message: error instanceof ApiError ? error.message : fallback,
  status: error instanceof ApiError ? error.status : 500,
});

type RouteGroupSettingsOptimisticSnapshot = {
  plan: DeliveryPlan | null;
  route: RouteSolution | null;
};

const createRouteGroupSettingsSnapshot = (
  payload: ReturnType<typeof normalizeRouteGroupEditFormToSettingsPayload>,
): RouteGroupSettingsOptimisticSnapshot => {
  const snapshot: RouteGroupSettingsOptimisticSnapshot = {
    plan: null,
    route: null,
  };

  if (payload.route_plan?.id) {
    const plan = selectRoutePlanByServerId(payload.route_plan.id)(
      useRoutePlanStore.getState(),
    );
    if (plan) {
      snapshot.plan = { ...plan };
    }
  }

  const routeSolutionId =
    payload.route_solution?.id ?? payload.route_solution?.route_solution_id;
  if (!payload.create_variant_on_save && routeSolutionId) {
    const solution = selectRouteSolutionByServerId(routeSolutionId)(
      useRouteSolutionStore.getState(),
    );
    if (solution) {
      snapshot.route = { ...solution };
    }
  }

  return snapshot;
};

const applyRouteGroupSettingsOptimisticPatch = (
  payload: ReturnType<typeof normalizeRouteGroupEditFormToSettingsPayload>,
  snapshot: RouteGroupSettingsOptimisticSnapshot,
) => {
  if (snapshot.plan?.client_id && payload.route_plan) {
    updateRoutePlan(snapshot.plan.client_id, (prev: DeliveryPlan) => ({
      ...prev,
      ...payload.route_plan,
    }));
  }

  if (snapshot.route?.client_id) {
    const { eta_tolerance_minutes, eta_message_tolerance, ...routePatchRest } =
      payload.route_solution ?? {};

    const nextRoutePatch = {
      ...routePatchRest,
      eta_tolerance_seconds:
        typeof eta_tolerance_minutes === "number"
          ? eta_tolerance_minutes * 60
          : snapshot.route.eta_tolerance_seconds,
      eta_message_tolerance:
        typeof eta_message_tolerance === "number"
          ? eta_message_tolerance
          : snapshot.route.eta_message_tolerance,
      stops_service_time:
        payload.route_solution?.stops_service_time != null
          ? payload.route_solution.stops_service_time
          : snapshot.route.stops_service_time,
    };

    updateRouteSolution(snapshot.route.client_id, (prev) => ({
      ...prev,
      ...nextRoutePatch,
    }));
  }
};

const restoreRouteGroupSettingsSnapshot = (
  snapshot: RouteGroupSettingsOptimisticSnapshot,
) => {
  if (snapshot.plan?.client_id) {
    updateRoutePlan(
      snapshot.plan.client_id,
      () => snapshot.plan as DeliveryPlan,
    );
  }

  if (snapshot.route?.client_id) {
    updateRouteSolution(
      snapshot.route.client_id,
      () => snapshot.route as RouteSolution,
    );
  }
};

const applyResponsePayload = (
  payload?:
    | Awaited<
        ReturnType<typeof routeGroupSettingsApi.updateRouteGroupSettings>
      >["data"]
    | null,
) => {
  if (!payload) return;

  const solutions = normalizeByClientIdArray(payload.route_solution);
  solutions.forEach((solution) => {
    if (solution?.client_id) {
      upsertRouteSolution(solution);
    }
  });

  const selected = solutions.find(
    (solution) => solution.is_selected && solution.id,
  );
  if (selected?.id) {
    setSelectedRouteSolution(selected.id, selected.route_group_id ?? null);
  }

  const persistedSource = selected ?? solutions[0];
  if (persistedSource) {
    saveStartTimePreference(persistedSource.set_start_time ?? null);
    saveEndTimePreference(persistedSource.set_end_time ?? null);
    if (persistedSource.route_end_strategy) {
      saveRouteEndStrategyPreference(persistedSource.route_end_strategy);
    }
    saveStartLocationPreference(persistedSource.start_location ?? null);
    saveEndLocationPreference(persistedSource.end_location ?? null);
    saveDriverIdPreference(persistedSource.driver_id ?? null);
    saveEtaToleranceMinutesPreference(
      Math.max(
        0,
        Math.trunc((persistedSource.eta_tolerance_seconds ?? 0) / 60),
      ),
    );
    saveEtaMessageToleranceMinutesPreference(
      Math.max(
        0,
        Math.trunc((persistedSource.eta_message_tolerance ?? 0) / 60),
      ),
    );
    saveStopsServiceTimePreference(
      serviceTimeSecondsToMinutes(persistedSource.stops_service_time ?? null),
    );
  }

  const stops = normalizeByClientIdArray(payload.route_solution_stops);
  stops.forEach((stop) => {
    if (stop?.client_id) {
      upsertRouteSolutionStop(stop);
    }
  });
};

export function useRouteGroupSettingsMutations() {
  const { showMessage } = useMessageHandler();

  const updateRouteGroupSettings = useCallback(
    async (formState: RouteGroupEditFormState) => {
      const payload = normalizeRouteGroupEditFormToSettingsPayload(formState);

      let responseData:
        | Awaited<
            ReturnType<typeof routeGroupSettingsApi.updateRouteGroupSettings>
          >["data"]
        | null = null;

      let optimisticSnapshot: RouteGroupSettingsOptimisticSnapshot | null =
        null;

      const succeeded = await optimisticTransaction({
        snapshot: () => {
          optimisticSnapshot = createRouteGroupSettingsSnapshot(payload);
          return optimisticSnapshot;
        },
        mutate: () => {
          if (!optimisticSnapshot) return;
          applyRouteGroupSettingsOptimisticPatch(payload, optimisticSnapshot);
        },
        request: () => routeGroupSettingsApi.updateRouteGroupSettings(payload),
        commit: (response) => {
          responseData = response?.data ?? {};
          applyResponsePayload(response?.data);
        },
        rollback: (snapshot) => {
          restoreRouteGroupSettingsSnapshot(
            snapshot as RouteGroupSettingsOptimisticSnapshot,
          );
        },
        onError: (error) => {
          const resolved = resolveError(
            error,
            "Unable to update route group settings.",
          );
          console.error("Failed to update route group settings", error);
          showMessage({ status: resolved.status, message: resolved.message });
        },
      });

      if (!succeeded) {
        return null;
      }

      return responseData ?? {};
    },
    [showMessage],
  );

  return {
    updateRouteGroupSettings,
  };
}

export function useRouteGroupDeleteMutations() {
  const { showMessage } = useMessageHandler();
  const { deletePlan } = usePlanController();

  const deleteRouteGroup = useCallback(
    async (params: { planId: number; routeGroupId: number }) => {
      const routeGroup = selectRouteGroupByServerId(params.routeGroupId)(
        useRouteGroupStore.getState(),
      );

      if (!routeGroup?.client_id) {
        showMessage({
          status: 404,
          message: "Route group not found for deletion.",
        });
        return { success: false, deletedPlan: false };
      }

      const routeGroupsInPlan = selectRouteGroupsByPlanId(params.planId)(
        useRouteGroupStore.getState(),
      );
      const shouldDeleteParentPlan = routeGroupsInPlan.length === 1;

      if (shouldDeleteParentPlan) {
        const deletedPlan = await deletePlan(params.planId);
        return {
          success: Boolean(deletedPlan),
          deletedPlan: Boolean(deletedPlan),
        };
      }

      const snapshot = { ...routeGroup };
      removeRouteGroup(routeGroup.client_id);

      try {
        const response = await routeGroupApi.deleteRouteGroup(
          params.planId,
          params.routeGroupId,
        );
        applyRoutePlanTargetPatch(response.data?.route_plan);

        return { success: true, deletedPlan: false };
      } catch (error) {
        const resolved = resolveError(error, "Unable to delete route group.");
        console.error("Failed to delete route group", error);
        insertRouteGroup(snapshot);
        showMessage({ status: resolved.status, message: resolved.message });
        return { success: false, deletedPlan: false };
      }
    },
    [deletePlan, showMessage],
  );

  return {
    deleteRouteGroup,
  };
}
