import type { AdminPushSubscriptionPayload } from "./adminWebPush.types";

export const ADMIN_NOTIFICATIONS_SERVICE_WORKER_PATH =
  "/admin-notifications-sw.js";

const WEB_PUSH_PUBLIC_KEY = (
  import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY as string | undefined
)?.trim();

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const raw = window.atob(padded);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
};

const encodePushKey = (key: ArrayBuffer | null) => {
  if (!key) return "";

  const bytes = new Uint8Array(key);
  let binary = "";
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });

  return window.btoa(binary);
};

export const isAdminWebPushSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

export const getAdminWebPushPermission = () => {
  if (!isAdminWebPushSupported()) {
    return "unsupported" as const;
  }

  return Notification.permission;
};

export const hasAdminWebPushPublicKey = () => Boolean(WEB_PUSH_PUBLIC_KEY);

export const registerAdminNotificationsServiceWorker = async () => {
  if (!isAdminWebPushSupported()) return null;

  return navigator.serviceWorker.register(
    ADMIN_NOTIFICATIONS_SERVICE_WORKER_PATH,
  );
};

export const getAdminNotificationsServiceWorkerRegistration = async () => {
  if (!isAdminWebPushSupported()) return null;

  const existing = await navigator.serviceWorker.getRegistration(
    ADMIN_NOTIFICATIONS_SERVICE_WORKER_PATH,
  );
  if (existing) {
    return existing;
  }

  return registerAdminNotificationsServiceWorker();
};

export const getExistingAdminPushSubscription = async () => {
  const registration = await getAdminNotificationsServiceWorkerRegistration();
  if (!registration) return null;

  return registration.pushManager.getSubscription();
};

export const requestAdminWebPushPermission = async () => {
  if (!isAdminWebPushSupported()) {
    return "unsupported" as const;
  }

  return Notification.requestPermission();
};

export const subscribeAdminWebPush = async () => {
  if (!isAdminWebPushSupported()) {
    throw new Error("Web push is not supported in this browser.");
  }

  if (!WEB_PUSH_PUBLIC_KEY) {
    throw new Error("Missing VITE_WEB_PUSH_PUBLIC_KEY.");
  }

  const registration = await getAdminNotificationsServiceWorkerRegistration();
  if (!registration) {
    throw new Error("Unable to register the notifications service worker.");
  }

  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    return existing;
  }

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: decodeBase64Url(WEB_PUSH_PUBLIC_KEY),
  });
};

export const unsubscribeAdminWebPush = async () => {
  const existing = await getExistingAdminPushSubscription();
  if (!existing) {
    return null;
  }

  await existing.unsubscribe();
  return existing;
};

export const serializeAdminPushSubscription = (
  subscription: PushSubscription,
): AdminPushSubscriptionPayload => {
  const json = subscription.toJSON() as Record<string, unknown>;
  const p256dh = encodePushKey(subscription.getKey("p256dh"));
  const auth = encodePushKey(subscription.getKey("auth"));

  return {
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime ?? null,
    keys: {
      p256dh,
      auth,
    },
    subscription: json,
    userAgent:
      typeof navigator !== "undefined" ? navigator.userAgent ?? null : null,
  };
};
