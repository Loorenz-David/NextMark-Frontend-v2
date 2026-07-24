import {
  getTrackedManualMessages,
  seedTrackedManualMessage,
  upsertTrackedManualMessageAction,
  useManualMessageStore,
} from "../manualMessage.store";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const resetStore = () => {
  useManualMessageStore.setState({ trackedByOrderId: {}, sendingByOrderId: {} });
};

export const runManualMessageStoreTests = () => {
  {
    // The worker settles the email action before the HTTP response resolves.
    resetStore();
    upsertTrackedManualMessageAction(1, "order_ready", {
      actionId: 500,
      channel: "email",
      status: "SUCCESS",
      processedAt: "2026-07-24T11:02:31+00:00",
    });

    seedTrackedManualMessage(1, "order_ready", {
      requestId: "req-1",
      eventId: 900,
      actionsById: {
        500: {
          actionId: 500,
          channel: "email",
          status: "PENDING",
          lastError: null,
          processedAt: null,
        },
      },
      skippedChannels: [],
    });

    const tracked = getTrackedManualMessages(1).order_ready;
    assert(
      tracked.actionsById[500].status === "SUCCESS",
      "a settled action is not regressed to PENDING by the send response",
    );
    assert(
      tracked.eventId === 900 && tracked.requestId === "req-1",
      "the send response still fills in the request and event ids",
    );
  }

  {
    // A resend must not inherit the previous send's outcome.
    resetStore();
    seedTrackedManualMessage(1, "order_ready", {
      requestId: "req-1",
      eventId: 900,
      actionsById: {
        500: {
          actionId: 500,
          channel: "email",
          status: "FAILED",
          lastError: "Order has no client email",
          processedAt: null,
        },
      },
      skippedChannels: [],
    });

    seedTrackedManualMessage(1, "order_ready", {
      requestId: "req-2",
      eventId: 901,
      actionsById: {
        600: {
          actionId: 600,
          channel: "email",
          status: "PENDING",
          lastError: null,
          processedAt: null,
        },
      },
      skippedChannels: [],
    });

    const tracked = getTrackedManualMessages(1).order_ready;
    assert(
      Object.keys(tracked.actionsById).join(",") === "600",
      "a resend replaces the previous send rather than merging into it",
    );
  }

  {
    // §9.2 guarantees dispatched precedes updated, but ordering is defensive here.
    resetStore();
    upsertTrackedManualMessageAction(1, "order_ready", {
      actionId: 500,
      channel: "email",
      status: "FAILED",
      lastError: "Order has no client email",
    });
    upsertTrackedManualMessageAction(1, "order_ready", {
      actionId: 500,
      channel: "email",
      status: "PENDING",
    });

    assert(
      getTrackedManualMessages(1).order_ready.actionsById[500].status ===
        "FAILED",
      "a late PENDING frame does not undo a terminal status",
    );
  }

  {
    resetStore();
    upsertTrackedManualMessageAction(1, "order_ready", {
      actionId: 500,
      channel: "email",
      status: "PENDING",
    });
    upsertTrackedManualMessageAction(1, "order_ready", {
      actionId: 500,
      channel: "email",
      status: "SUCCESS",
      processedAt: "2026-07-24T11:02:31+00:00",
    });

    assert(
      getTrackedManualMessages(1).order_ready.actionsById[500].status ===
        "SUCCESS",
      "a PENDING action still settles normally",
    );
  }

  resetStore();
};
