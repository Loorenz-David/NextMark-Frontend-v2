import { useCallback } from "react";

import { useMessageHandler } from "@shared-message-handler";

import { getLinkedDeviceEmployeeUserId } from "../flows/linkedDeviceEmployeeUser.flow";
import {
  executeOrderClientFormHandoff,
  type OrderClientFormHandoffCommand,
  type OrderClientFormHandoffResult,
} from "../flows/orderClientFormHandoff.flow";
import {
  getLinkedDeviceOrderFormAvailability,
  type LinkedDeviceOrderFormAvailability,
} from "../flows/requestOrderClientFormOnLinkedDevice.flow";

export const useOrderClientFormHandoffController = () => {
  const { showMessage } = useMessageHandler();
  const employeeUserId = getLinkedDeviceEmployeeUserId();

  const getLinkedDeviceAvailability = useCallback(
    (orderId: number): LinkedDeviceOrderFormAvailability =>
      getLinkedDeviceOrderFormAvailability({
        employeeUserId,
        orderId,
      }),
    [employeeUserId],
  );

  const executeHandoff = useCallback(
    async (
      command: Omit<
        Extract<OrderClientFormHandoffCommand, { kind: "linked_device" }>,
        "employeeUserId"
      > | Extract<OrderClientFormHandoffCommand, { kind: "customer" }>,
    ): Promise<OrderClientFormHandoffResult> => {
      const resolvedCommand: OrderClientFormHandoffCommand =
        command.kind === "linked_device"
          ? { ...command, employeeUserId }
          : command;
      const result = await executeOrderClientFormHandoff(resolvedCommand);

      // The move runs concurrently with this handoff, so the copy speaks only to
      // the form — the move reports its own success/failure feedback separately.
      if (result.status === "sent") {
        showMessage({
          status: "success",
          message:
            result.kind === "linked_device"
              ? "Form sent to the linked device."
              : "Client form sent.",
        });
        return result;
      }

      showMessage({
        status: result.status === "blocked" ? "warning" : "error",
        message: `The form was not sent. ${result.message}`,
      });
      return result;
    },
    [employeeUserId, showMessage],
  );

  return {
    employeeUserId,
    getLinkedDeviceAvailability,
    executeHandoff,
  };
};
