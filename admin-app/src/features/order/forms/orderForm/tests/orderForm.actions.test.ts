import { mapSubmitResultToFeedback } from "../controllers/orderFormSubmitFeedback.presenter";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runOrderFormActionsTests = () => {
  const createFeedback = mapSubmitResultToFeedback({
    status: "success_create",
    createdOrderId: 100,
    createdOrderClientId: "order-100",
    createdOrderScalarId: 5001,
  });
  assert(
    createFeedback.status === 200,
    "success_create should return status 200",
  );
  assert(createFeedback.shouldClosePopup, "success_create should close popup");

  const editFeedback = mapSubmitResultToFeedback({ status: "success_edit" });
  assert(editFeedback.status === 200, "success_edit should return status 200");
  assert(editFeedback.shouldClosePopup, "success_edit should close popup");

  const noChangesFeedback = mapSubmitResultToFeedback({ status: "no_changes" });
  assert(
    noChangesFeedback.status === 400,
    "no_changes should return status 400",
  );
  assert(
    !noChangesFeedback.shouldClosePopup,
    "no_changes should not close popup",
  );

  const validationFeedback = mapSubmitResultToFeedback({
    status: "validation_error",
    message: "Please fix errors.",
  });
  assert(
    validationFeedback.status === 400,
    "validation_error should return status 400",
  );
  assert(
    validationFeedback.message === "Please fix errors.",
    "validation_error should keep message",
  );

  const dependencyFeedback = mapSubmitResultToFeedback({
    status: "dependency_error",
    message: "Missing id.",
  });
  assert(
    dependencyFeedback.status === 400,
    "dependency_error should return status 400",
  );

  const errorFeedback = mapSubmitResultToFeedback({
    status: "error",
    message: "Unexpected failure.",
  });
  assert(errorFeedback.status === 500, "error should return status 500");
  assert(!errorFeedback.shouldClosePopup, "error should not close popup");
};
