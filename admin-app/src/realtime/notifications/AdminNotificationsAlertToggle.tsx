import { BellIcon, BellOffIcon } from "@/assets/icons";
import { BasicButton } from "@/shared/buttons/BasicButton";

import {
  type AdminNotificationsAlertState,
  useAdminNotificationsAlertToggleController,
} from "./adminNotificationsAlertToggle.controller";

const LABEL: Record<AdminNotificationsAlertState, string> = {
  on: "Turn alerts off",
  off: "Turn alerts on",
  blocked: "Alerts blocked in browser",
};

const TONE_CLASS: Record<AdminNotificationsAlertState, string> = {
  on: "border-[rgb(var(--color-light-blue-r),0.34)] bg-[rgba(var(--color-light-blue-r),0.1)] text-[rgb(var(--color-light-blue-r))]",
  off: "border-[var(--color-muted)]/30 text-[var(--color-muted)]",
  blocked: "border-[var(--color-muted)]/30 text-warning",
};

export function AdminNotificationsAlertToggle() {
  const { isVisible, state, isLoading, toggle } =
    useAdminNotificationsAlertToggleController();

  if (!isVisible) {
    return null;
  }

  const Icon = state === "on" ? BellIcon : BellOffIcon;

  return (
    <span title={LABEL[state]} className="inline-flex">
      <BasicButton
        params={{
          variant: "toolbarSecondary",
          ariaLabel: LABEL[state],
          className: `px-2.5 ${TONE_CLASS[state]}`,
          disabled: isLoading,
          onClick: () => {
            void toggle();
          },
        }}
      >
        <Icon className="h-4.5 w-4.5" />
      </BasicButton>
    </span>
  );
}
