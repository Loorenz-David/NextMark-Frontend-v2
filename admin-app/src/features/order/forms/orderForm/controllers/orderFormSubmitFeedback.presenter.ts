import type { Item } from "../../../item";
import { downloadItemLabels } from "../../../item";
import { normalizeFormStateForSave } from "../../../api/mappers/orderForm.normalize";
import type { useDownloadTemplateByEventFlow } from "@/features/templates/printDocument";

import type { OrderFormSubmitResult } from "./orderFormSubmit.controller";

export const mapSubmitResultToFeedback = (result: OrderFormSubmitResult) => {
  if (result.status === "success_create") {
    return {
      status: 200,
      message: "Order successfully created.",
      shouldClosePopup: true,
    } as const;
  }

  if (result.status === "success_edit") {
    return {
      status: 200,
      message: "Order successfully updated.",
      shouldClosePopup: true,
    } as const;
  }

  if (result.status === "no_changes") {
    return {
      status: 400,
      message: "No changes to save.",
      shouldClosePopup: false,
    } as const;
  }

  if (
    result.status === "validation_error" ||
    result.status === "dependency_error"
  ) {
    return {
      status: 400,
      message: result.message,
      shouldClosePopup: false,
    } as const;
  }

  return {
    status: 500,
    message: result.message,
    shouldClosePopup: false,
  } as const;
};

export const presentOrderFormSubmitOutcome = ({
  result,
  createdItems,
  normalizedCurrent,
  closePopup,
  showMessage,
  downloadByEvent,
}: {
  result: OrderFormSubmitResult;
  createdItems: Item[];
  normalizedCurrent: ReturnType<typeof normalizeFormStateForSave>;
  closePopup: () => void;
  showMessage: (payload: { status: number; message: string }) => void;
  downloadByEvent: ReturnType<
    typeof useDownloadTemplateByEventFlow
  >["downloadByEvent"];
}) => {
  const feedback = mapSubmitResultToFeedback(result);

  if (
    result.status === "success_create" &&
    createdItems.length > 0 &&
    typeof result.createdOrderScalarId === "number"
  ) {
    const labelIdentifierSource = {
      order_scalar_id: result.createdOrderScalarId,
      reference_number: normalizedCurrent?.reference_number,
      external_source: normalizedCurrent?.external_source,
      help_to_carry: result.createdOrder?.help_to_carry,
      order_plan_objective:
        result.createdOrder?.order_plan_objective ??
        normalizedCurrent?.order_plan_objective,
    };

    void downloadItemLabels({
      downloadByEvent,
      event: "item_created",
      items: createdItems,
      orderIdentifier: labelIdentifierSource,
      routePlanId: normalizedCurrent?.delivery_plan_id,
      orderNotes: normalizedCurrent?.order_notes,
    });
  }

  showMessage({ status: feedback.status, message: feedback.message });
  if (feedback.shouldClosePopup) {
    closePopup();
  }
};
