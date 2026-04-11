import type { NotificationTarget } from "@shared-realtime";

export type AdminPushSubscriptionStatus =
  | "unsupported"
  | "permission_default"
  | "permission_denied"
  | "permission_granted_unsubscribed"
  | "subscribed"
  | "subscription_error";

export type AdminPushSubscriptionPayload = {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
  subscription: Record<string, unknown>;
  userAgent: string | null;
};

export type AdminNotificationLaunchPayload = {
  notification_id: string;
  occurred_at: string;
  target: NotificationTarget;
};

export type AdminWebPushSnapshot = {
  status: AdminPushSubscriptionStatus;
  permission: NotificationPermission | "unsupported";
  isSupported: boolean;
  isLoading: boolean;
  endpoint: string | null;
  errorMessage: string | null;
};
