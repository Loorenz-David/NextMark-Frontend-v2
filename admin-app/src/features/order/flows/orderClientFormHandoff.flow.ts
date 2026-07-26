import type { ClientFormRecipients } from "../domain/clientFormRecipients.domain";
import { ensureOrderClientFormLink } from "../actions/ensureOrderClientFormLink.action";
import { sendClientFormLink } from "../api/clientFormLink.api";
import {
  requestOrderClientFormOnLinkedDevice,
  type LinkedDeviceOrderFormRequestResult,
} from "./requestOrderClientFormOnLinkedDevice.flow";

export type OrderClientFormHandoffCommand =
  | {
      kind: "customer";
      orderId: number;
      orderClientId: string;
      hasGeneratedLink: boolean;
      recipients: ClientFormRecipients;
    }
  | {
      kind: "linked_device";
      employeeUserId: number;
      orderId: number;
      referenceNumber: string;
    };

export type OrderClientFormHandoffResult =
  | { status: "sent"; kind: OrderClientFormHandoffCommand["kind"] }
  | {
      status: "blocked" | "error";
      kind: OrderClientFormHandoffCommand["kind"];
      message: string;
    };

type OrderClientFormHandoffDependencies = {
  ensureLink: typeof ensureOrderClientFormLink;
  sendToCustomer: typeof sendClientFormLink;
  sendToLinkedDevice: (
    command: Extract<
      OrderClientFormHandoffCommand,
      { kind: "linked_device" }
    >,
  ) => LinkedDeviceOrderFormRequestResult;
};

const defaultDependencies: OrderClientFormHandoffDependencies = {
  ensureLink: ensureOrderClientFormLink,
  sendToCustomer: sendClientFormLink,
  sendToLinkedDevice: requestOrderClientFormOnLinkedDevice,
};

export const executeOrderClientFormHandoff = async (
  command: OrderClientFormHandoffCommand,
  dependencies: OrderClientFormHandoffDependencies = defaultDependencies,
): Promise<OrderClientFormHandoffResult> => {
  if (command.kind === "linked_device") {
    const result = dependencies.sendToLinkedDevice(command);
    return result.status === "sent"
      ? { status: "sent", kind: command.kind }
      : { ...result, kind: command.kind };
  }

  try {
    await dependencies.ensureLink({
      orderId: command.orderId,
      orderClientId: command.orderClientId,
      hasGeneratedLink: command.hasGeneratedLink,
    });
    await dependencies.sendToCustomer(command.orderId, command.recipients);
    return { status: "sent", kind: command.kind };
  } catch (error) {
    return {
      status: "error",
      kind: command.kind,
      message:
        error instanceof Error
          ? error.message
          : "Unable to send the client form.",
    };
  }
};
