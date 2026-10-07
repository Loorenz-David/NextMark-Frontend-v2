import { useCallback } from "react";

import { useMessageHandler } from "@shared-message-handler";

import { resolveBatchTargetOrderIds } from "@/features/order/domain/orderBatchTargetIds";
import { selectOrderByServerId, useOrderStore } from "@/features/order/store/order.store";
import { useOrderSelectionStore } from "@/features/order/store/orderSelection.store";
import {
  buildBatchSelectionPayload,
  useOrderSelectionActions,
} from "@/features/order/store/orderSelectionHooks.store";

import { useExecutePlanDndIntent } from "../controllers/useExecutePlanDndIntent";
import { usePlanObjectiveMismatchController } from "../controllers/usePlanObjectiveMismatchController";
import { resolvePlanType } from "../domain/planType";
import { selectRoutePlanByClientId, useRoutePlanStore } from "../store/routePlan.slice";

/**
 * Non-drag path for the order selection: assign everything selected to a
 * plan, or unschedule it. The phone has no screen where the order list and
 * the plan list are visible together, so this replaces the drop.
 *
 * Runs the same objective-mismatch confirmation the drop runs, then the
 * same batch intent executor, so the result is identical to a drag.
 */
export const useAssignSelectedOrdersAction = () => {
  const { execute } = useExecutePlanDndIntent();
  const objectiveMismatchController = usePlanObjectiveMismatchController();
  const { disableSelectionMode } = useOrderSelectionActions();
  const { showMessage } = useMessageHandler();

  const readSelection = useCallback(() => {
    const selectionState = useOrderSelectionStore.getState();
    const selection = buildBatchSelectionPayload(selectionState);
    const hasSelection =
      selection.manual_order_ids.length > 0 || selection.select_all_snapshots.length > 0;
    return { selectionState, selection, hasSelection };
  }, []);

  const assignToPlan = useCallback(
    async (planClientId: string): Promise<boolean> => {
      const { selectionState, selection, hasSelection } = readSelection();
      if (!hasSelection) {
        showMessage({ status: 400, message: "Select at least one order first." });
        return false;
      }

      const destinationPlan = selectRoutePlanByClientId(planClientId)(
        useRoutePlanStore.getState(),
      );
      if (!destinationPlan) {
        showMessage({ status: 400, message: "That plan is no longer available." });
        return false;
      }

      const orderState = useOrderStore.getState();
      const orders = resolveBatchTargetOrderIds(selection, selectionState).map((orderId) =>
        selectOrderByServerId(orderId)(orderState),
      );
      const confirmed = await objectiveMismatchController.confirmObjectiveChange({
        orders,
        targetPlanType: resolvePlanType(destinationPlan),
        targetPlanLabel: destinationPlan.label ?? null,
      });
      if (!confirmed) return false;

      const result = await execute({
        kind: "ASSIGN_ORDERS_TO_PLAN_BATCH",
        selection,
        planClientId,
        origin: "order_list",
      });

      if (result.success) {
        showMessage({
          status: 200,
          message: `Orders assigned to ${destinationPlan.label}.`,
        });
        disableSelectionMode();
      } else {
        showMessage({ status: 400, message: "Could not assign the selected orders." });
      }
      return result.success;
    },
    [disableSelectionMode, execute, objectiveMismatchController, readSelection, showMessage],
  );

  const unschedule = useCallback(async (): Promise<boolean> => {
    const { selection, hasSelection } = readSelection();
    if (!hasSelection) {
      showMessage({ status: 400, message: "Select at least one order first." });
      return false;
    }

    const result = await execute({
      kind: "UNSCHEDULE_ORDERS_BATCH",
      selection,
      origin: "order_list",
    });

    if (result.success) {
      showMessage({ status: 200, message: "Orders unscheduled." });
      disableSelectionMode();
    } else {
      showMessage({ status: 400, message: "Could not unschedule the selected orders." });
    }
    return result.success;
  }, [disableSelectionMode, execute, readSelection, showMessage]);

  return { assignToPlan, unschedule };
};
