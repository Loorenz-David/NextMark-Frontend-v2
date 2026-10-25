import { useNavigate } from "react-router-dom";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { ChevronDownIcon, SettingIcon } from "@/assets/icons";
import {
  AdminNotificationsTrigger,
  useAdminNotificationUnreadCount,
} from "@/realtime/notifications";
import { ActingUserButton } from "@/features/auth/trusted-device";
import { ThemeToggle } from "@/app/theme";

import { useHomeTopBarStore } from "../stores/homeTopBar.store";

/**
 * The top bar holds the least used controls, so it folds away to give the
 * panels its height. Folded, a slim strip stays to bring it back. The bar
 * stays mounted either way: the notifications trigger in it also chimes.
 */
export function HomeDesktopHeader() {
  const navigate = useNavigate();
  const isHidden = useHomeTopBarStore((state) => state.isHidden);
  const setHidden = useHomeTopBarStore((state) => state.setHidden);
  const unreadCount = useAdminNotificationUnreadCount();

  return (
    <div className="relative z-30 flex shrink-0 flex-col">
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          isHidden ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden" inert={isHidden}>
          <div className="admin-toolbar-strip mx-auto flex min-h-[3.25rem] w-full items-center justify-between gap-3 px-6 py-3">
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

            <BasicButton
              params={{
                variant: "toolbarSecondary",
                ariaLabel: "Hide top bar",
                className: "border-[var(--color-muted)]/24 px-2.5",
                onClick: () => setHidden(true),
              }}
            >
              <ChevronDownIcon className="h-4 w-4 rotate-180" />
            </BasicButton>
          </div>
        </div>
      </div>

      {isHidden ? (
        <button
          type="button"
          aria-label={
            unreadCount > 0
              ? `Show top bar, ${unreadCount} unread notifications`
              : "Show top bar"
          }
          onClick={() => setHidden(false)}
          className="touch-hit-area group flex h-4 w-full items-center justify-center gap-2 border-b border-border bg-surface-subtle"
        >
          <span className="h-1 w-10 rounded-full bg-[var(--color-muted)]/45 transition-colors group-hover:bg-[var(--color-muted)]" />
          {unreadCount > 0 ? (
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-[rgb(var(--color-danger-r))]"
            />
          ) : null}
        </button>
      ) : null}
    </div>
  );
}
