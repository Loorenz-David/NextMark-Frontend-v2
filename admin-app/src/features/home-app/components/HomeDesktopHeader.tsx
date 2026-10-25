import { useNavigate } from "react-router-dom";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { SettingIcon } from "@/assets/icons";
import { AdminNotificationsTrigger } from "@/realtime/notifications";
import { ActingUserButton } from "@/features/auth/trusted-device";
import { ThemeToggle } from "@/app/theme";
import { HeaderSlotTarget, HOME_HEADER_END_SLOT } from "@/shared/layout/headerSlot";

export function HomeDesktopHeader() {
  const navigate = useNavigate();

  return (
    <div className="admin-toolbar-strip relative z-30 mx-auto flex min-h-[3.25rem] w-full items-center justify-between gap-3 px-6 py-3">
      {/* Left — theme switch, acting user, notifications, settings */}
      <div className="flex shrink-0 items-center gap-3">
        <ThemeToggle />
        <ActingUserButton />
        <AdminNotificationsTrigger />
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

      {/* Right — workspace content (the order search); reaches the screen
          edge so it can line up with the order panel below it. */}
      <HeaderSlotTarget name={HOME_HEADER_END_SLOT} className="-mr-6 flex min-w-0 shrink-0 justify-end" />
    </div>
  );
}
