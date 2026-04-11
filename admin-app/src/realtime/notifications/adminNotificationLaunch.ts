import type { NotificationTarget } from "@shared-realtime";

import type { AdminNotificationLaunchPayload } from "./adminWebPush.types";

export const ADMIN_NOTIFICATION_QUERY_PARAM = "adminNotification";
export const ADMIN_NOTIFICATION_MESSAGE_TYPE = "admin-notification-click";

const isNotificationTarget = (value: unknown): value is NotificationTarget => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as NotificationTarget;
  return (
    typeof candidate.kind === "string" &&
    typeof candidate.route === "string" &&
    candidate.params != null &&
    typeof candidate.params === "object"
  );
};

export const isAdminNotificationLaunchPayload = (
  value: unknown,
): value is AdminNotificationLaunchPayload => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as AdminNotificationLaunchPayload;
  return (
    typeof candidate.notification_id === "string" &&
    typeof candidate.occurred_at === "string" &&
    isNotificationTarget(candidate.target)
  );
};

export const decodeAdminNotificationLaunchParam = (
  rawValue: string | null | undefined,
): AdminNotificationLaunchPayload | null => {
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(rawValue));
    return isAdminNotificationLaunchPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const consumeAdminNotificationLaunchParamFromLocation = () => {
  if (typeof window === "undefined") return null;

  const url = new URL(window.location.href);
  const payload = decodeAdminNotificationLaunchParam(
    url.searchParams.get(ADMIN_NOTIFICATION_QUERY_PARAM),
  );
  if (!payload) {
    return null;
  }

  url.searchParams.delete(ADMIN_NOTIFICATION_QUERY_PARAM);
  window.history.replaceState({}, "", url.toString());
  return payload;
};
