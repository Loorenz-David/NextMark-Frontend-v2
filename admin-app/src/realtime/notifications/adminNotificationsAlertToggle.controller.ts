import { useCallback } from "react";

import { useMessageHandler } from "@shared-message-handler";

import { useAdminWebPush } from "./adminWebPush.controller";
import { getAdminWebPushSnapshot } from "./adminWebPush.store";

export type AdminNotificationsAlertState = "on" | "off" | "blocked";

const BLOCKED_MESSAGE =
  "Browser notifications are blocked. Re-enable notifications for this site in your browser settings.";

const isPermissionDenied = () =>
  typeof Notification !== "undefined" && Notification.permission === "denied";

/** Browser-push alerts as one on/off switch, with the outcome toasts. */
export const useAdminNotificationsAlertToggleController = () => {
  const { status, isSupported, isLoading, enable, disable } =
    useAdminWebPush();
  const { showMessage } = useMessageHandler();

  const state: AdminNotificationsAlertState =
    status === "subscribed"
      ? "on"
      : status === "permission_denied"
        ? "blocked"
        : "off";

  const toggle = useCallback(async () => {
    if (state === "blocked") {
      showMessage({ status: 403, message: BLOCKED_MESSAGE });
      return;
    }

    if (state === "on") {
      if (await disable()) {
        showMessage({
          status: 200,
          message: "Background notifications disabled.",
        });
        return;
      }
      showMessage({
        status: 500,
        message:
          getAdminWebPushSnapshot().errorMessage ??
          "Unable to disable background notifications.",
      });
      return;
    }

    if (await enable()) {
      showMessage({
        status: 200,
        message: "Background notifications enabled.",
      });
      return;
    }
    if (isPermissionDenied()) {
      showMessage({ status: 403, message: BLOCKED_MESSAGE });
      return;
    }
    showMessage({
      status: 500,
      message:
        getAdminWebPushSnapshot().errorMessage ??
        "Unable to enable background notifications.",
    });
  }, [disable, enable, showMessage, state]);

  return {
    isVisible: isSupported && status !== "unsupported",
    state,
    isLoading,
    toggle,
  };
};
