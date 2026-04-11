import { useCallback } from "react";

import { buildClientId } from "@/lib/utils/clientId";
import { ApiError } from "@/lib/api/ApiClient";
import { useMessageHandler } from "@shared-message-handler";
import { planApi } from "@/features/plan/api/plan.api";
import { routeGroupApi } from "@/features/plan/routeGroup/api/routeGroup.api";
import { useOrderFlow, useOrderPlanPatchController } from "@/features/order";
import { reactivePlanVisibility } from "@/features/plan/domain/planReactiveVisibility";
import { resolvePlanTypeDefaults } from "@/features/plan/domain/planTypeDefaults/planTypeDefaults.registry";
import {
  getQueryFilters,
  getQuerySearch,
} from "@/features/order/store/orderQuery.store";
import type {
  DeliveryPlan,
  DeliveryPlanFields,
  PlanCreatePayload,
} from "@/features/plan/types/plan";
import type { RouteGroup } from "@/features/plan/routeGroup/types/routeGroup";
import {
  addVisibleRoutePlan,
  appendVisibleRoutePlans,
  insertRoutePlan,
  removeRoutePlan,
  selectRoutePlanByClientId,
  selectRoutePlanByServerId,
  updateRoutePlan,
  useRoutePlanStore,
} from "@/features/plan/store/routePlan.slice";
import {
  insertRouteGroup,
  removeRouteGroup,
  selectRouteGroupsByPlanId,
  upsertRouteGroup,
  useRouteGroupStore,
} from "@/features/plan/routeGroup/store/routeGroup.slice";
import {
  incrementRoutePlanListTotal,
  useRoutePlanListStore,
} from "@/features/plan/store/routePlanList.store";
import { resolveUserCurrentLocation } from "@/shared/utils/resolveUserCurrentLocation";

const resolveError = (error: unknown, fallback: string) => ({
  message: error instanceof ApiError ? error.message : fallback,
  status: error instanceof ApiError ? error.status : 500,
});

const canInsertCreatedPlanIntoCurrentList = (plan: DeliveryPlan) => {
  const { visibleIds } = useRoutePlanStore.getState();
  const { query } = useRoutePlanListStore.getState();

  if (!visibleIds) {
    return false;
  }

  if (!query) {
    return true;
  }

  return reactivePlanVisibility(plan, query);
};

const syncCreatedPlanIntoVisibleList = (plan: DeliveryPlan) => {
  if (!canInsertCreatedPlanIntoCurrentList(plan)) {
    return;
  }

  const currentQuery = useRoutePlanListStore.getState().query;

  if (currentQuery?.sort === "date_asc") {
    appendVisibleRoutePlans([plan.client_id]);
  } else {
    addVisibleRoutePlan(plan.client_id);
  }

  incrementRoutePlanListTotal();
};

export function usePlanController() {
  const { showMessage } = useMessageHandler();
  const {
    patchOrdersPlanByServerIds,
    clearOrdersPlanByPlanId,
    restoreOrdersPlanLinks,
  } = useOrderPlanPatchController();
  const { loadOrders } = useOrderFlow();

  const createPlan = useCallback(
    async (
      payload: DeliveryPlanFields,
      options?: { newOrderLinks?: number[]; zoneIds?: number[] },
    ) => {
      const sanitizedNewOrderLinks = Array.isArray(options?.newOrderLinks)
        ? options.newOrderLinks.filter((id) => Number.isFinite(id))
        : [];
      const sanitizedZoneIds = Array.isArray(options?.zoneIds)
        ? Array.from(
            new Set(
              options.zoneIds.filter(
                (id): id is number => Number.isInteger(id) && id > 0,
              ),
            ),
          )
        : [];

      const planClientId = payload.client_id || buildClientId("delivery_plan");

      const normalizedPlanFields: DeliveryPlan = {
        ...payload,
        client_id: planClientId,
      };

      insertRoutePlan(normalizedPlanFields);

      try {
        const normalizedStartDate = normalizedPlanFields.start_date;
        if (!normalizedStartDate) {
          throw new Error("start_date is required to create a plan.");
        }

        const planTypeDefaults = await resolvePlanTypeDefaults({
          planStartDate: normalizedPlanFields.start_date ?? null,
          getCurrentLocationAddress: resolveUserCurrentLocation,
        }).catch(() => undefined);
        const routeGroupDefaults =
          sanitizedZoneIds.length === 0
            ? planTypeDefaults?.route_group_defaults
            : undefined;

        const planPayloadApi: PlanCreatePayload = {
          client_id: planClientId,
          label: normalizedPlanFields.label,
          start_date: normalizedStartDate,
          date_strategy: normalizedPlanFields.date_strategy ?? "single",
          ...(normalizedPlanFields.date_strategy === "range" &&
          typeof normalizedPlanFields.end_date !== "undefined"
            ? { end_date: normalizedPlanFields.end_date }
            : {}),
          ...(sanitizedNewOrderLinks.length > 0
            ? { order_ids: sanitizedNewOrderLinks }
            : {}),
          ...(sanitizedZoneIds.length > 0
            ? { zone_ids: sanitizedZoneIds }
            : {}),
          ...(routeGroupDefaults ? { route_group_defaults: routeGroupDefaults } : {}),
        };

        const response = await planApi.createPlan(planPayloadApi);
        const created = response.data?.created?.[0];

        if (!created?.delivery_plan) {
          throw new Error(
            "Plan create response is missing created delivery_plan.",
          );
        }

        const createdPlan = created.delivery_plan;
        const createdPlanId = createdPlan.id;

        if (createdPlan.client_id === planClientId) {
          updateRoutePlan(planClientId, (plan: DeliveryPlan) => ({
            ...plan,
            ...createdPlan,
          }));
        } else {
          removeRoutePlan(planClientId);
          insertRoutePlan(createdPlan);
        }

        syncCreatedPlanIntoVisibleList(createdPlan);

        const createdRouteGroups = Array.isArray(created.route_groups)
          ? created.route_groups
          : [];
        createdRouteGroups.forEach((routeGroup) => {
          upsertRouteGroup(routeGroup);
        });

        if (
          typeof createdPlanId === "number" &&
          sanitizedNewOrderLinks.length > 0
        ) {
          patchOrdersPlanByServerIds({
            orderServerIds: sanitizedNewOrderLinks,
            planId: createdPlanId,
            planType: "local_delivery",
          });
        }

        return response.data;
      } catch (error) {
        const resolved = resolveError(error, "Unable to create route plan.");
        console.error("Failed to create plan", error);
        removeRoutePlan(planClientId);
        showMessage({ status: resolved.status, message: resolved.message });
        return null;
      }
    },
    [patchOrdersPlanByServerIds, showMessage],
  );

  const materializeRouteGroups = useCallback(
    async (planId: number, zoneIds: number[]) => {
      const sanitizedZoneIds = Array.from(
        new Set(zoneIds.filter((id) => Number.isInteger(id) && id > 0)),
      );
      if (sanitizedZoneIds.length === 0) {
        showMessage({
          status: 400,
          message: "Select at least one zone to materialize route groups.",
        });
        return null;
      }

      try {
        const response = await routeGroupApi.materializeRouteGroups(planId, {
          zone_ids: sanitizedZoneIds,
        });

        const routeGroups = Array.isArray(response.data) ? response.data : [];
        routeGroups.forEach((routeGroup) => {
          upsertRouteGroup(routeGroup as RouteGroup);
        });

        return routeGroups;
      } catch (error) {
        const resolved = resolveError(
          error,
          "Unable to materialize route groups.",
        );
        console.error("Failed to materialize route groups", error);
        showMessage({ status: resolved.status, message: resolved.message });
        return null;
      }
    },
    [showMessage],
  );

  const deletePlanInstance = useCallback(
    async (idOrClientId: number | string) => {
      const plan =
        typeof idOrClientId === "number"
          ? selectRoutePlanByServerId(idOrClientId)(
              useRoutePlanStore.getState(),
            )
          : selectRoutePlanByClientId(idOrClientId)(
              useRoutePlanStore.getState(),
            );

      if (!plan) {
        showMessage({ status: 404, message: "Plan not found for deletion." });
        return null;
      }

      if (!plan.id) {
        showMessage({
          status: 400,
          message: "Plan must be synced before deletion.",
        });
        return null;
      }

      const routeGroupInstances = selectRouteGroupsByPlanId(plan.id)(
        useRouteGroupStore.getState(),
      );
      const previousPlan = { ...plan };
      const previousRouteGroups = routeGroupInstances.map(
        (routeGroupInstance) => ({ ...routeGroupInstance }),
      );

      removeRoutePlan(plan.client_id);
      routeGroupInstances.forEach((routeGroupInstance) => {
        removeRouteGroup(routeGroupInstance.client_id);
      });
      const clearedOrderLinks = clearOrdersPlanByPlanId(plan.id);

      try {
        await planApi.deletePlan({ target_id: plan.id });
        void loadOrders(
          {
            q: getQuerySearch(),
            filters: getQueryFilters(),
          },
          false,
        );
        return true;
      } catch (error) {
        const resolved = resolveError(error, "Unable to delete delivery plan.");
        console.error("Failed to delete plan", error);
        insertRoutePlan(previousPlan);
        previousRouteGroups.forEach((previousRouteGroup) => {
          insertRouteGroup(previousRouteGroup);
        });
        restoreOrdersPlanLinks(clearedOrderLinks.previousByClientId);
        showMessage({ status: resolved.status, message: resolved.message });
        return null;
      }
    },
    [clearOrdersPlanByPlanId, loadOrders, restoreOrdersPlanLinks, showMessage],
  );

  return {
    createPlan,
    materializeRouteGroups,
    deletePlan: deletePlanInstance,
  };
}
