import { BellIcon } from "@/assets/icons";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { useMessageHandler } from "@shared-message-handler";

import { useAdminWebPush } from "./adminWebPush.controller";

type AdminNotificationsPushCtaProps = {
  visibility?: "auto" | "enable-only" | "disable-only";
  className?: string;
};

export function AdminNotificationsPushCta({
  visibility = "auto",
  className,
}: AdminNotificationsPushCtaProps) {
  const { status, isSupported, isLoading, errorMessage, enable, disable } =
    useAdminWebPush();
  const { showMessage } = useMessageHandler();

  if (!isSupported || status === "unsupported") {
    return null;
  }

  const shouldRenderSubscribed =
    visibility === "auto" || visibility === "disable-only";
  const shouldRenderUnsubscribed =
    visibility === "auto" || visibility === "enable-only";

  const showBlockedInstructions = () => {
    showMessage({
      status: 403,
      message:
        "Browser notifications are blocked. Re-enable notifications for this site in your browser settings.",
    });
  };

  if (status === "subscribed") {
    if (!shouldRenderSubscribed) {
      return null;
    }

    return (
      <BasicButton
        params={{
          variant: "toolbarSecondary",
          ariaLabel: "Disable background notifications",
          className:
            `border-[rgb(var(--color-light-blue-r),0.34)] bg-[rgba(var(--color-light-blue-r),0.1)] px-4 py-[5px] text-[rgb(var(--color-light-blue-r))] ${
              className ?? ""
            }`.trim(),
          disabled: isLoading,
          onClick: async () => {
            const success = await disable();
            if (!success) {
              showMessage({
                status: 500,
                message:
                  errorMessage ?? "Unable to disable background notifications.",
              });
              return;
            }

            showMessage({
              status: 200,
              message: "Background notifications disabled.",
            });
          },
        }}
      >
        <BellIcon className="mr-2 h-4 w-4" />
        Turn alerts off
      </BasicButton>
    );
  }

  if (!shouldRenderUnsubscribed) {
    return null;
  }

  const handleEnable = async () => {
    if (status === "permission_denied") {
      showBlockedInstructions();
      return;
    }

    const success = await enable();
    if (success) {
      showMessage({
        status: 200,
        message: "Background notifications enabled.",
      });
      return;
    }

    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "denied"
    ) {
      showBlockedInstructions();
      return;
    }

    showMessage({
      status: 500,
      message: errorMessage ?? "Unable to enable background notifications.",
    });
  };

  return (
    <BasicButton
      params={{
        variant: "toolbarSecondary",
        ariaLabel:
          status === "permission_denied"
            ? "Browser notifications blocked"
            : "Enable background notifications",
        className: `border-[var(--color-muted)]/24 px-4 py-[5px] ${
          className ?? ""
        }`.trim(),
        disabled: isLoading,
        onClick: () => {
          void handleEnable();
        },
      }}
    >
      <BellIcon className="mr-2 h-4 w-4" />
      {status === "permission_denied" ? "Alerts Blocked" : "Enable Alerts"}
    </BasicButton>
  );
}
