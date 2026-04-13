import { useMemo, useRef } from "react";

import { useOrderActions } from "@/features/order";
import { shouldRefreshItemsForOrder, useItemFlow } from "@/features/order/item";
import { resolveActiveTemplateByChannelAndEvent } from "@/features/templates/printDocument/domain/resolveActiveTemplate";
import { useDownloadTemplateByEventFlow } from "@/features/templates/printDocument/flows";
import { serializeRouteSolutionForTemplate } from "@/features/plan/routeGroup/domain/serializeRouteSolutionForTemplate";
import { buildRouteOptimizationPayload } from "@/features/plan/routeGroup/domain/buildRouteOptimizationPayload";
import {
  selectSelectedRouteSolutionByRouteGroupId,
  useRouteSolutionStore,
} from "@/features/plan/routeGroup/store/routeSolution.store";
import {
  selectRouteSolutionStopsBySolutionId,
  useRouteSolutionStopStore,
} from "@/features/plan/routeGroup/store/routeSolutionStop.store";
import { selectOrderByServerId, useOrderStore } from "@/features/order/store/order.store";
import {
  usePopupManager,
} from "@/shared/resource-manager/useResourceManager";
import { useRouteOptimizationMutations } from "../controllers/routeOptimization.controller";
import { useRouteSolutionMutations } from "../controllers/routeSolution.controller";
import { useRouteGroupSettingsMutations } from "@/features/plan/routeGroup/controllers/routeGroupSettings.controller";
import type { DeliveryPlan } from "@/features/plan/types/plan";
import type {
  RouteSolution,
  RouteSolutionWarning,
} from "@/features/plan/routeGroup/types/routeSolution";
import type { RouteGroup } from "@/features/plan/routeGroup/types/routeGroup";
import { createRouteWarningActionRegistry } from "./routeWarningActionRegistry";
import { useMessageHandler } from "@shared-message-handler";
import type { useLoadingController } from "../controllers/useLoadingController";
import { MIN_LOADER_VISIBLE_MS } from "../constants/optimization.constants";

type Props = {
  routeGroupId?: number | null;
  planId?: number | null;
  plan?: DeliveryPlan | null;
  routeGroup?: RouteGroup | null;
  selectedRouteSolution?: RouteSolution | null;
  isSelectedSolutionOptimized?: boolean;
  loadingController: ReturnType<typeof useLoadingController>;
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

export const useRouteGroupPageActions = ({
  routeGroupId,
  planId,
  plan,
  routeGroup,
  selectedRouteSolution,
  isSelectedSolutionOptimized = false,
  loadingController,
}: Props) => {
  const popupManager = usePopupManager();
  const { openOrderForm } = useOrderActions();
  const {
    routeReadyForDelivery,
    selectRouteSolution: selectRouteSolutionMutation,
    previewRouteSolution: previewRouteSolutionMutation,
    confirmSelectRouteSolution: confirmSelectRouteSolutionMutation,
  } = useRouteSolutionMutations();
  const { createOptimization, updateOptimization } =
    useRouteOptimizationMutations();
  const { updateRouteGroupSettings } = useRouteGroupSettingsMutations();
  const { showMessage } = useMessageHandler();
  const { downloadByEvent } = useDownloadTemplateByEventFlow();
  const { loadItemsByOrderId } = useItemFlow();
  const optimizationInFlightRef = useRef(0);
  const routeWarningActionRegistry = useMemo(
    () => createRouteWarningActionRegistry(),
    [],
  );

  const withOptimizationLoader = async (
    task: () => Promise<boolean>,
  ): Promise<boolean> => {
    const startedAt = Date.now();
    let keepMinimumVisibleTime = false;
    optimizationInFlightRef.current += 1;
    if (optimizationInFlightRef.current === 1) {
      loadingController.handleOptimizationLoader(true);
    }

    try {
      const succeeded = await task();
      keepMinimumVisibleTime = succeeded;
      return succeeded;
    } finally {
      if (keepMinimumVisibleTime) {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(MIN_LOADER_VISIBLE_MS - elapsed, 0);
        if (remaining > 0) {
          await wait(remaining);
        }
      }

      optimizationInFlightRef.current = Math.max(
        optimizationInFlightRef.current - 1,
        0,
      );
      if (optimizationInFlightRef.current === 0) {
        loadingController.handleOptimizationLoader(false);
      }
    }
  };

  const handleCreateOrder = () => {
    openOrderForm({
      mode: "create",
      deliveryPlanId: planId,
      routeGroupId: routeGroupId ?? null,
    });
  };
  const handleEditLocalPlan = () => {
    popupManager.open({
      key: "RouteGroupEditForm",
      payload: { routeGroupId: routeGroupId },
    });
  };

  const handlePrintRouteSolution = async () => {
    const selectedSolution = routeGroupId
      ? selectSelectedRouteSolutionByRouteGroupId(routeGroupId)(
          useRouteSolutionStore.getState(),
        )
      : null;

    const stops = selectedSolution?.id
      ? selectRouteSolutionStopsBySolutionId(selectedSolution.id)(
          useRouteSolutionStopStore.getState(),
        )
      : [];

    const orderIds = Array.from(
      new Set(
        stops
          .map((stop) => stop.order_id)
          .filter((orderId): orderId is number => typeof orderId === "number"),
      ),
    );

    await Promise.all(
      orderIds.map(async (orderId) => {
        const order = selectOrderByServerId(orderId)(useOrderStore.getState());
        if (
          !shouldRefreshItemsForOrder({
            orderId,
            itemsUpdatedAt: order?.items_updated_at ?? null,
            expectedItemCount: order?.total_items ?? null,
          })
        ) {
          return;
        }

        await loadItemsByOrderId(orderId, {
          itemsUpdatedAt: order?.items_updated_at ?? null,
        });
      }),
    );

    const payload = serializeRouteSolutionForTemplate(planId, routeGroupId);
    if (!payload) return;

    await downloadByEvent({
      channel: "route",
      event: "route_solution_for_printing",
      data: payload,
      fileName: `route-${payload.plan_date ?? "plan"}.pdf`,
    });
  };
  const routeReadyForDeliveryAction = async () => {
    if (!planId) return;
    const succeeded = await routeReadyForDelivery(planId);
    if (!succeeded) return;

    const activeTemplate = resolveActiveTemplateByChannelAndEvent(
      "route",
      "route_solution_for_printing",
    );

    if (!activeTemplate) return;

    await handlePrintRouteSolution();
  };

  const optimizeRoute = async () => {
    const payload = buildRouteOptimizationPayload({
      plan,
      routeGroup: routeGroup,
      selectedRouteSolution: selectedRouteSolution ?? null,
    });
    if (!payload) return;

    await withOptimizationLoader(async () => {
      if (isSelectedSolutionOptimized) {
        const response = await updateOptimization(payload);
        return response != null;
      }
      const response = await createOptimization(payload);
      return response != null;
    });
  };

  const reOptimizeRoute = async () => {
    const payload = buildRouteOptimizationPayload({
      plan,
      routeGroup: routeGroup,
      selectedRouteSolution: selectedRouteSolution ?? null,
    });
    if (!payload) return;

    await withOptimizationLoader(async () => {
      const response = await createOptimization(payload);
      return response != null;
    });
  };

  const selectRouteSolution = (solutionId: number) => {
    if (!routeGroupId) return;
    void selectRouteSolutionMutation(solutionId, routeGroupId);
  };

  const previewRouteSolution = (solutionId: number) => {
    if (!routeGroupId || !planId) return;
    void previewRouteSolutionMutation(solutionId, planId, routeGroupId);
  };

  const confirmSelectRouteSolution = () => {
    if (!routeGroupId || !planId || !selectedRouteSolution?.id) return;
    void confirmSelectRouteSolutionMutation(
      selectedRouteSolution.id,
      planId,
      routeGroupId,
    );
  };

  const resolveRouteWarnings = async (warnings: RouteSolutionWarning[]) => {
    const warningList = Array.isArray(warnings) ? warnings : [];
    if (warningList.length === 0) return false;

    let hasSuccess = false;
    for (const warning of warningList) {
      const warningType = warning?.type;
      if (typeof warningType !== "string") continue;
      const handler = routeWarningActionRegistry[warningType];
      if (!handler) continue;

      const didResolve = await handler(warning, {
        routeGroupId: routeGroupId,
        plan,
        selectedRouteSolution,
        updateRouteGroupSettings,
      });
      if (didResolve) {
        hasSuccess = true;
      }
    }

    if (!hasSuccess) {
      showMessage({
        status: "warning",
        message: "No route warnings could be resolved with this action.",
      });
    }
    return hasSuccess;
  };

  return {
    handleCreateOrder,
    handleEditLocalPlan,
    handlePrintRouteSolution,
    routeReadyForDelivery: routeReadyForDeliveryAction,
    optimizeRoute,
    reOptimizeRoute,
    selectRouteSolution,
    previewRouteSolution,
    confirmSelectRouteSolution,
    resolveRouteWarnings,
  };
};
