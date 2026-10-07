import {
  type AdminNotificationsAlertState,
  useAdminNotificationsAlertToggleController,
} from "./adminNotificationsAlertToggle.controller";

const STATE_LABEL: Record<AdminNotificationsAlertState, string> = {
  on: "On",
  off: "Off",
  blocked: "Blocked",
};

const ACTION_LABEL: Record<AdminNotificationsAlertState, string> = {
  on: "Turn browser alerts off",
  off: "Turn browser alerts on",
  blocked: "Browser alerts are blocked — see how to allow them",
};

const PILL_CLASS: Record<AdminNotificationsAlertState, string> = {
  on: "border-info-border bg-info-bg text-info",
  off: "border-border text-muted hover:text-text",
  blocked: "border-border text-warning",
};

const DOT_CLASS: Record<AdminNotificationsAlertState, string> = {
  on: "bg-info",
  off: "bg-border-accent",
  blocked: "bg-warning",
};

/** Browser-push alerts switch, shown beside the notifications title. */
export function AdminNotificationsAlertToggle() {
  const { isVisible, state, isLoading, toggle } =
    useAdminNotificationsAlertToggleController();

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={state === "on"}
      aria-label={ACTION_LABEL[state]}
      title={ACTION_LABEL[state]}
      disabled={isLoading}
      onClick={() => {
        void toggle();
      }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.68rem] font-medium transition-colors disabled:cursor-wait disabled:opacity-60 ${PILL_CLASS[state]}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${DOT_CLASS[state]}`}
      />
      {STATE_LABEL[state]}
    </button>
  );
}
