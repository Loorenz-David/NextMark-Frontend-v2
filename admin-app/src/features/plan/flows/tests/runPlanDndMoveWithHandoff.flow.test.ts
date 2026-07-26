import { runPlanDndMoveWithHandoff } from "../runPlanDndMoveWithHandoff.flow";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runPlanDndMoveWithHandoffFlowTests = async () => {
  // The move is started before the handoff so the move's synchronous optimistic
  // store update lands before the handoff reads the route-plan schedule. Both
  // then run concurrently.
  const starts: string[] = [];
  const succeeded = await runPlanDndMoveWithHandoff({
    move: async () => {
      starts.push("move");
      return { success: true };
    },
    handoff: async () => {
      starts.push("handoff");
      return { status: "sent" as const };
    },
  });

  assert(
    starts.join(",") === "move,handoff",
    "the move must be started before the handoff",
  );
  assert(
    succeeded.moveResult.success === true,
    "the move result must be reported",
  );
  assert(
    succeeded.handoffResult?.status === "sent",
    "successful handoff results should be returned",
  );

  // Fire-and-forget: a failed move must NOT suppress the handoff.
  starts.length = 0;
  const moveFailed = await runPlanDndMoveWithHandoff({
    move: async () => {
      starts.push("move");
      return { success: false };
    },
    handoff: async () => {
      starts.push("handoff");
      return { status: "sent" as const };
    },
  });

  assert(
    starts.includes("handoff"),
    "the handoff must still run when the move fails (fire-and-forget)",
  );
  assert(
    moveFailed.moveResult.success === false,
    "the failed move result must be reported",
  );
  assert(
    moveFailed.handoffResult?.status === "sent",
    "the handoff result must be returned alongside a failed move",
  );

  // No handoff supplied: the move still runs and the handoff result is null.
  starts.length = 0;
  const noHandoff = await runPlanDndMoveWithHandoff({
    move: async () => {
      starts.push("move");
      return { success: true };
    },
  });

  assert(
    starts.join(",") === "move",
    "only the move runs when no handoff is supplied",
  );
  assert(
    noHandoff.handoffResult === null,
    "a missing handoff yields a null handoff result",
  );
};
