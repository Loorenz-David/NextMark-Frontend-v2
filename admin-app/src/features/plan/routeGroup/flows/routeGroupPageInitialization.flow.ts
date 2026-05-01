import { useEffect, useRef } from "react";
import { shouldRefreshForFreshness } from "@shared-utils";

import { useRouteGroupOverviewFlow } from "@/features/plan/routeGroup/flows/routeGroupOverview.flow";
import { useRouteGroupsByPlanId } from "@/features/plan/routeGroup/store/useRouteGroup.selector";
import { useRoutePlanByServerId } from "@/features/plan/store/useRoutePlan.selector";
import { isRouteOperationsFixtureModeEnabled } from "@/features/home-route-operations/dev/routeOperationsFixtureMode";
import { useActiveRouteGroupId } from "../store/useActiveRouteGroup.selector";
import {
  rememberRouteGroupForPlan,
  setActiveRouteGroupId,
} from "../store/activeRouteGroup.store";
import {
  clearRouteGroupOverviewFreshAfter,
  useRouteGroupOverviewFreshAfter,
} from "../store/routeGroupOverviewFreshness.store";

export const useRouteGroupPageInitializationFlow = (
  planId: number | null,
  freshAfter?: string | null,
  options?: { disabled?: boolean },
) => {
  const { fetchRouteGroupOverview } = useRouteGroupOverviewFlow();
  const isFixtureMode = isRouteOperationsFixtureModeEnabled();
  const plan = useRoutePlanByServerId(planId);
  const routeGroups = useRouteGroupsByPlanId(planId);
  const activeRouteGroupId = useActiveRouteGroupId();
  const invalidatedFreshAfter = useRouteGroupOverviewFreshAfter(planId);
  const lastRefreshAttemptRef = useRef<string | null>(null);
  const initialSelectionKeyRef = useRef<string | null>(null);
  const hasHydratedWorkspaceRef = useRef(false);

  useEffect(() => {
    if (plan != null || routeGroups.length > 0) {
      hasHydratedWorkspaceRef.current = true;
      return;
    }

    if (planId == null) {
      hasHydratedWorkspaceRef.current = false;
    }
  }, [plan, planId, routeGroups.length]);

  useEffect(() => {
    if (planId == null || options?.disabled || isFixtureMode) {
      initialSelectionKeyRef.current = null;
      if (planId == null) {
        hasHydratedWorkspaceRef.current = false;
      }
      return;
    }

    const selectionKey = `${planId}:default`;
    if (initialSelectionKeyRef.current === selectionKey) {
      return;
    }

    if (activeRouteGroupId != null) {
      const activeRouteGroupBelongsToPlan = routeGroups.some(
        (routeGroup) => routeGroup.id === activeRouteGroupId,
      );
      if (activeRouteGroupBelongsToPlan) {
        initialSelectionKeyRef.current = selectionKey;
      }
      return;
    }

    const firstRouteGroupId = routeGroups[0]?.id ?? null;
    if (typeof firstRouteGroupId === "number") {
      setActiveRouteGroupId(firstRouteGroupId);
      rememberRouteGroupForPlan(planId, firstRouteGroupId);
      initialSelectionKeyRef.current = selectionKey;
    }
  }, [
    activeRouteGroupId,
    isFixtureMode,
    options?.disabled,
    planId,
    routeGroups,
  ]);

  useEffect(() => {
    if (options?.disabled || isFixtureMode) {
      lastRefreshAttemptRef.current = null;
      return;
    }

    if (planId == null) {
      lastRefreshAttemptRef.current = null;
      return;
    }

    const wasDeletedAfterHydration =
      hasHydratedWorkspaceRef.current &&
      plan == null &&
      routeGroups.length === 0;
    if (wasDeletedAfterHydration) {
      lastRefreshAttemptRef.current = null;
      return;
    }

    const hasRouteGroups = routeGroups.length > 0;
    const isWorkspaceHydrated = plan != null && hasRouteGroups;
    const effectiveFreshAfter =
      [freshAfter ?? null, invalidatedFreshAfter ?? null]
        .filter((value): value is string => typeof value === "string" && value.length > 0)
        .sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? null;

    const needsRefresh =
      plan == null ||
      !isWorkspaceHydrated ||
      shouldRefreshForFreshness(plan.updated_at ?? null, effectiveFreshAfter);
    if (!needsRefresh) {
      lastRefreshAttemptRef.current = null;
      return;
    }

    const refreshKey = `${planId}:${effectiveFreshAfter ?? ""}`;
    if (lastRefreshAttemptRef.current === refreshKey) {
      return;
    }
    lastRefreshAttemptRef.current = refreshKey;

    void fetchRouteGroupOverview(planId).then((payload) => {
      if (payload) {
        clearRouteGroupOverviewFreshAfter(planId);
      }
    });
  }, [
    fetchRouteGroupOverview,
    freshAfter,
    invalidatedFreshAfter,
    plan,
    planId,
    routeGroups,
    options?.disabled,
    isFixtureMode,
  ]);
};
