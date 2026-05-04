import { useMemo, useState } from "react";
import { useMessageHandler } from "@shared-message-handler";
import { CloseIcon } from "@/assets/icons";
import { useDriverAppShell } from "@/app/shell/providers/driverAppShell.context";
import { useOpenRouteStopDetail } from "../controllers/useOpenRouteStopDetail.controller";
import { FailureReasonComposer } from "../components/FailureReasonComposer";
import { useRouteExecutionShell } from "../providers/routeExecutionShell.context";
import { useSelectedAssignedRoute } from "../controllers/useSelectedAssignedRoute.controller";
import { resolveNextPendingStopClientId } from "../domain/resolveNextPendingStopClientId";

type StopFailureFormPageProps = {
  stopClientId: string;
  orderId: number;
  onClose: () => void;
};

export function StopFailureFormPage({
  stopClientId,
  orderId,
  onClose,
}: StopFailureFormPageProps) {
  const { showMessage } = useMessageHandler();
  const { submitRouteAction } = useRouteExecutionShell();
  const openRouteStopDetail = useOpenRouteStopDetail();
  const { closeSlidingPage, openBottomSheet, snapBottomSheetTo } =
    useDriverAppShell();
  const route = useSelectedAssignedRoute();
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stop = useMemo(
    () =>
      route?.stops.find(
        (candidate) => candidate.stopClientId === stopClientId,
      ) ?? null,
    [route, stopClientId],
  );
  const nextStopClientId = useMemo(() => {
    return resolveNextPendingStopClientId(route, stopClientId);
  }, [route, stopClientId]);

  async function handleSubmit() {
    if (!route) {
      setError("No active route.");
      return;
    }

    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await submitRouteAction({
      type: "fail-stop",
      routeClientId: route.routeClientId,
      stopClientId,
      orderId,
      note: description.trim(),
    });

    setIsSubmitting(false);

    if (result.syncState === "synced") {
      showMessage({ status: 200, message: "Order marked as failed." });
      closeSlidingPage();
      if (nextStopClientId) {
        openRouteStopDetail(nextStopClientId, { snap: "workspace" });
      } else {
        openBottomSheet("route-workspace", undefined);
        snapBottomSheetTo("workspace");
      }
      return;
    }

    showMessage({
      status: 500,
      message: result.message ?? "Unable to mark order as failed.",
    });
    setError(result.message ?? "Unable to mark order as failed.");
  }

  return (
    <section className="flex h-full min-h-[40vh] max-h-full flex-1 flex-col overflow-hidden bg-[rgb(var(--bg-app-color))] text-white">
      <header className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">
            {stop?.title ?? "Failure reason"}
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Choose a failure reason or write a custom note.
          </p>
        </div>

        <button
          aria-label="Close failure form"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white"
          onClick={onClose}
          type="button"
        >
          <CloseIcon aria-hidden="true" className="h-4 w-4" />
        </button>
      </header>

      <div
        className="min-h-0 flex-1 overflow-y-auto px-5 py-5"
        data-bottom-sheet-gesture-lock="true"
      >
        <div className="flex flex-col gap-2 pb-4">
          <span className="text-sm font-medium text-white/80">
            Failure description
          </span>
          <FailureReasonComposer
            value={description}
            onValueChange={setDescription}
          />
        </div>
      </div>

      <footer className="border-t border-white/8 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        <div className="mt-3">
          <button
            className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            disabled={isSubmitting}
            onClick={() => {
              void handleSubmit();
            }}
            type="button"
          >
            {isSubmitting ? "Submitting..." : "Confirm failure"}
          </button>
        </div>
      </footer>
    </section>
  );
}
