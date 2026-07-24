import { useNavigate } from "react-router-dom";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { SettingIcon } from "@/assets/icons";
import {
  AdminNotificationsPushCta,
  AdminNotificationsTrigger,
} from "@/realtime/notifications";
import { ActingUserButton } from "@/features/auth/trusted-device";

export function HomeDesktopHeader() {
  const navigate = useNavigate();

  return (
    <div className="admin-toolbar-strip relative z-30 mx-auto flex min-h-[3.25rem] w-full items-center justify-between gap-3 px-6 py-3">
      {/* Left — acting user */}
      <div className="flex shrink-0 items-center">
        <ActingUserButton />
      </div>

      {/* Right — actions */}
      <div className="flex shrink-0 items-center gap-2 rounded-2xl">
        <AdminNotificationsPushCta visibility="enable-only" />
        <div className="pr-2">
          <AdminNotificationsTrigger />
        </div>
        <BasicButton
          params={{
            variant: "toolbarSecondary",
            ariaLabel: "Settings",
            className: "border-[var(--color-muted)]/24 px-4 py-[5px]",
            onClick: () => navigate("/settings"),
          }}
        >
          <SettingIcon className="mr-2 h-4 w-4" />
          Settings
        </BasicButton>
      </div>
    </div>
  );
}
