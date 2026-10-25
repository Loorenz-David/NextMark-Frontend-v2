import { useNavigate } from "react-router-dom";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { SettingIcon } from "@/assets/icons";
import { AdminNotificationsTrigger } from "@/realtime/notifications";
import { ActingUserButton } from "@/features/auth/trusted-device";
import { ThemeToggle } from "@/app/theme";
import { HeaderSlotTarget, HOME_HEADER_CENTER_SLOT } from "@/shared/layout/headerSlot";

export function HomeDesktopHeader() {
  const navigate = useNavigate();

  return (
    <div className="admin-toolbar-strip relative z-30 mx-auto flex min-h-[3.25rem] w-full items-center justify-between gap-3 px-6 py-3">
      {/* Left — theme switch, then acting user */}
      <div className="flex shrink-0 items-center gap-3">
        <ThemeToggle />
        <ActingUserButton />
      </div>

      <HeaderSlotTarget name={HOME_HEADER_CENTER_SLOT} className="flex min-w-0 flex-1 justify-center" />

      {/* Right — actions */}
      <div className="flex shrink-0 items-center gap-2 rounded-2xl">
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
