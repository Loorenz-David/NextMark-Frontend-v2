import { useCallback } from "react";

import { ApiError } from "@/lib/api/ApiClient";
import { useMessageHandler } from "@shared-message-handler";

import { routeGroupApi } from "@/features/plan/routeGroup/api/routeGroup.api";
import { normalizeRouteGroupDetailsPayload } from "@/features/plan/routeGroup/api/mappers/routeGroupDetails.mapper";
import { applyRouteGroupPayload } from "@/features/plan/routeGroup/flows/routeGroupOverview.flow";

export function useRouteGroupDetailsFlow() {
  const { showMessage } = useMessageHandler();

  const fetchRouteGroupDetails = useCallback(
    async (planId: number | string, routeGroupId: number | string) => {
      try {
        const response = await routeGroupApi.getRouteGroupDetails(
          planId,
          routeGroupId,
        );

        const normalizedPayload = normalizeRouteGroupDetailsPayload(response.data);
        applyRouteGroupPayload(normalizedPayload);
        return normalizedPayload;
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Unable to load route group details.";
        const status = error instanceof ApiError ? error.status : 500;
        console.error("Failed to fetch route group details", error);
        showMessage({ status, message });
        return null;
      }
    },
    [showMessage],
  );

  return {
    fetchRouteGroupDetails,
  };
}
