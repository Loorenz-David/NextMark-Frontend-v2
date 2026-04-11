import { useCallback, useMemo } from "react";
import { useDriverBootstrapState } from "@/app/bootstrap";
import { useMessageHandler } from "@shared-message-handler";
import { useDriverServices } from "@/app/providers/driverServices.context";
import { useDriverOrderStateRegistry } from "@/features/order-states";
import { adjustRouteDatesToTodayAction } from "../actions/adjustRouteDatesToToday.action";
import {
  selectActiveOrderCasesByOrderId,
  selectOrderCaseListScope,
  useOrderCaseListStore,
  useOrderCasesStore,
} from "@/features/order-case";
import { useDriverAppShell } from "@/app/shell/providers/driverAppShell.context";
import { handleCallPhoneFlow } from "../flows/handleCallPhone.flow";
import { handleNavigateStopFlow } from "../flows/handleNavigateStop.flow";
import { useOpenRouteStopDetail } from "./useOpenRouteStopDetail.controller";
import { useRouteExecutionShell } from "../providers/routeExecutionShell.context";
import { mapStopDetailToPageDisplay } from "../domain/mapStopDetailToPageDisplay";
import { resolveRouteDateGuard } from "../domain/resolveRouteDateGuard";
import { resolveNextPendingStopClientId } from "../domain/resolveNextPendingStopClientId";
import { useSelectedAssignedRoute } from "./useSelectedAssignedRoute.controller";

const detectTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

export function useStopDetailController(stopClientId?: string) {
  const bootstrapState = useDriverBootstrapState();
  const {
    browserLocationService,
    mapAppPreferenceService,
    mapNavigationService,
    phoneCallService,
  } = useDriverServices();
  const { showMessage } = useMessageHandler();
  const orderStateRegistry = useDriverOrderStateRegistry();
  const { initializeRouteWorkspace, submitRouteAction } =
    useRouteExecutionShell();
  const openRouteStopDetail = useOpenRouteStopDetail();
  const {
    closeOverlay,
    openBottomSheet,
    openOverlay,
    openSlidingPage,
    snapBottomSheetTo,
  } = useDriverAppShell();
  const route = useSelectedAssignedRoute();
  const orderCaseListState = useOrderCaseListStore((state) => state);
  const orderCasesState = useOrderCasesStore((state) => state);
  const stop = useMemo(
    () =>
      route?.stops.find(
        (candidate) => candidate.stopClientId === stopClientId,
      ) ?? null,
    [route, stopClientId],
  );
  const activeOrderCases = useMemo(
    () => selectActiveOrderCasesByOrderId(orderCasesState, stop?.order?.id),
    [orderCasesState, stop?.order?.id],
  );
  const orderCaseListScope = useMemo(
    () => selectOrderCaseListScope(orderCaseListState, stop?.order?.id),
    [orderCaseListState, stop?.order?.id],
  );
  const activeCasesCount = useMemo(() => {
    if (!stop?.order) {
      return 0;
    }

    if (orderCaseListScope) {
      return activeOrderCases.length;
    }

    return typeof stop.order.open_order_cases === "number"
      ? stop.order.open_order_cases
      : 0;
  }, [activeOrderCases.length, orderCaseListScope, stop]);

  const nextStopClientId = useMemo(() => {
    if (!stop) {
      return null;
    }

    return resolveNextPendingStopClientId(route, stop.stopClientId);
  }, [route, stop]);

  const sendAction = useCallback(
    async (
      type:
        | "arrive-stop"
        | "complete-stop"
        | "skip-stop"
        | "fail-stop"
        | "undo-stop-terminal",
      note?: string,
    ) => {
      if (!route || !stop || !stop.order?.id) {
        return;
      }

      const result = await submitRouteAction({
        type,
        routeClientId: route.routeClientId,
        stopClientId: stop.stopClientId,
        orderId: stop.order.id,
        note,
      });

      if (result.syncState === "synced") {
        if (type === "fail-stop") {
          showMessage({ status: 200, message: "Order marked as failed." });
        }
        return result;
      }

      showMessage({
        status: 500,
        message: result.message ?? "Unable to send route action.",
      });
      return result;
    },
    [route, showMessage, stop, submitRouteAction],
  );

  const transitionToNextStopPreview = useCallback(() => {
    if (nextStopClientId) {
      openRouteStopDetail(nextStopClientId, { snap: "workspace" });
      return;
    }

    openBottomSheet("route-workspace", undefined);
    snapBottomSheetTo("workspace");
  }, [
    nextStopClientId,
    openBottomSheet,
    openRouteStopDetail,
    snapBottomSheetTo,
  ]);

  const runGuardedStopAction = useCallback(
    async (resumeAction: () => void | Promise<void>) => {
      const routeId = route?.route?.id;
      if (!routeId) {
        return;
      }

      const guard = resolveRouteDateGuard(route);
      if (guard.kind === "allowed") {
        await resumeAction();
        return;
      }

      openOverlay("route-date-adjust-warning", {
        title: guard.title,
        message: guard.message,
        confirmLabel: "Adjust to today",
        onConfirm: async () => {
          try {
            await adjustRouteDatesToTodayAction(routeId, detectTimeZone());
            await initializeRouteWorkspace();
            closeOverlay();
            await resumeAction();
            return true;
          } catch (error) {
            console.error("Failed to adjust route dates to today", error);
            const message =
              error instanceof Error && error.message
                ? error.message
                : "Unable to adjust route dates to today.";
            showMessage({ status: 500, message });
            return false;
          }
        },
      });
    },
    [closeOverlay, initializeRouteWorkspace, openOverlay, route, showMessage],
  );

  const navigateToStop = useCallback(async () => {
    if (!route || !stop) {
      return;
    }

    const result = handleNavigateStopFlow({
      route,
      stop,
      arrivalRangeMeters:
        bootstrapState.routeTiming?.arrivalRangeMeters ?? null,
      services: {
        browserLocationService,
        mapAppPreferenceService,
        mapNavigationService,
      },
      openMapAppChooser: (destination) => {
        openSlidingPage("map-app-chooser", { destination });
      },
    });

    if (result.status === "missing-destination") {
      showMessage({
        status: "warning",
        message: "This stop has no usable destination for navigation.",
      });
    }
  }, [
    bootstrapState.routeTiming?.arrivalRangeMeters,
    browserLocationService,
    mapAppPreferenceService,
    mapNavigationService,
    openSlidingPage,
    route,
    showMessage,
    stop,
  ]);

  const callOrderPhone = useCallback(() => {
    const result = handleCallPhoneFlow({
      stop,
      services: { phoneCallService },
      openPhoneCallChooser: (options) => {
        openSlidingPage("phone-call-chooser", { options });
      },
    });

    if (result.status === "missing-phone") {
      showMessage({
        status: "warning",
        message: "This stop has no usable phone number.",
      });
    }
  }, [openSlidingPage, phoneCallService, showMessage, stop]);

  const pageDisplay = useMemo(() => {
    if (!route || !stop) {
      return null;
    }

    return mapStopDetailToPageDisplay(route, stop, {
      openTestSlidingPage: (title) =>
        openSlidingPage("test-sliding-page", { title }),
      openStopOrderItems: () => {
        openSlidingPage("route-stop-order-items", {
          stopClientId: stop.stopClientId,
        });
      },
      openStopCustomer: () => {
        openSlidingPage("route-stop-customer", {
          stopClientId: stop.stopClientId,
        });
      },
      openOrderCases: () => {
        if (!stop.order?.id || !stop.order.client_id) {
          return;
        }

        openOverlay("order-case-main", {
          orderId: stop.order.id,
          orderClientId: stop.order.client_id,
          stopClientId: stop.stopClientId,
        });
      },
      openFailureForm: () => {
        const orderId = stop.order?.id;
        if (!orderId) {
          return;
        }

        void runGuardedStopAction(async () => {
          openSlidingPage("route-stop-failure-form", {
            stopClientId: stop.stopClientId,
            orderId,
          });
        });
      },
      navigateToStop: () => {
        void runGuardedStopAction(async () => {
          await navigateToStop();
        });
      },
      callOrderPhone,
      completeStop: () => {
        void runGuardedStopAction(async () => {
          const result = await sendAction("complete-stop");
          if (result?.syncState === "synced") {
            transitionToNextStopPreview();
          }
        });
      },
      undoTerminal: () => void sendAction("undo-stop-terminal"),
      activeCasesCount,
      orderStateIds: {
        processingId: orderStateRegistry.getStateIdByName("Processing"),
        completedId: orderStateRegistry.getStateIdByName("Completed"),
        failId: orderStateRegistry.getStateIdByName("Fail"),
      },
    });
  }, [
    activeCasesCount,
    callOrderPhone,
    navigateToStop,
    openOverlay,
    openSlidingPage,
    orderStateRegistry,
    route,
    runGuardedStopAction,
    sendAction,
    stop,
    transitionToNextStopPreview,
  ]);

  return useMemo(
    () => ({
      route,
      stop,
      sendAction,
      pageDisplay,
    }),
    [pageDisplay, route, sendAction, stop],
  );
}
