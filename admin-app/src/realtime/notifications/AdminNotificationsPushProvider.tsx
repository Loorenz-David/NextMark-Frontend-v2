import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useSyncExternalStore } from "react";

import { sessionStorage } from "@/features/auth/login/store/sessionStorage";

import {
  consumeAdminNotificationLaunchParamFromLocation,
  isAdminNotificationLaunchPayload,
  ADMIN_NOTIFICATION_MESSAGE_TYPE,
} from "./adminNotificationLaunch";
import {
  deleteAdminPushSubscription,
  upsertAdminPushSubscription,
} from "./adminWebPush.api";
import {
  getExistingAdminPushSubscription,
  getAdminWebPushPermission,
  hasAdminWebPushPublicKey,
  isAdminWebPushSupported,
  registerAdminNotificationsServiceWorker,
  serializeAdminPushSubscription,
} from "./adminWebPush.runtime";
import {
  resetAdminWebPushSnapshot,
  setAdminWebPushSnapshot,
  setPendingAdminNotificationLaunchPayload,
} from "./adminWebPush.store";

const syncAdminWebPushSnapshot = async (sessionPresent: boolean) => {
  const supported = isAdminWebPushSupported();
  if (!supported) {
    setAdminWebPushSnapshot({
      status: "unsupported",
      permission: "unsupported",
      isSupported: false,
      isLoading: false,
      endpoint: null,
      errorMessage: null,
    });
    return;
  }

  const permission = getAdminWebPushPermission();
  if (permission === "denied") {
    setAdminWebPushSnapshot({
      status: "permission_denied",
      permission,
      isSupported: true,
      isLoading: false,
      endpoint: null,
      errorMessage: null,
    });
    return;
  }

  if (permission === "default") {
    setAdminWebPushSnapshot({
      status: "permission_default",
      permission,
      isSupported: true,
      isLoading: false,
      endpoint: null,
      errorMessage: null,
    });
    return;
  }

  if (!hasAdminWebPushPublicKey()) {
    setAdminWebPushSnapshot({
      status: "subscription_error",
      permission,
      isSupported: true,
      isLoading: false,
      endpoint: null,
      errorMessage: "Missing VITE_WEB_PUSH_PUBLIC_KEY.",
    });
    return;
  }

  const existing = await getExistingAdminPushSubscription();
  if (!existing) {
    setAdminWebPushSnapshot({
      status: "permission_granted_unsubscribed",
      permission,
      isSupported: true,
      isLoading: false,
      endpoint: null,
      errorMessage: null,
    });
    return;
  }

  if (sessionPresent) {
    await upsertAdminPushSubscription(serializeAdminPushSubscription(existing));
  }

  setAdminWebPushSnapshot({
    status: "subscribed",
    permission,
    isSupported: true,
    isLoading: false,
    endpoint: existing.endpoint,
    errorMessage: null,
  });
};

export function AdminNotificationsPushProvider({
  children,
}: PropsWithChildren) {
  const session = useSyncExternalStore(
    sessionStorage.subscribe.bind(sessionStorage),
    () => sessionStorage.getSession(),
    () => sessionStorage.getSession(),
  );

  const syncSnapshot = useCallback(async () => {
    try {
      await syncAdminWebPushSnapshot(Boolean(session?.accessToken));
    } catch (error) {
      setAdminWebPushSnapshot({
        status: "subscription_error",
        permission: getAdminWebPushPermission(),
        isSupported: isAdminWebPushSupported(),
        isLoading: false,
        endpoint: null,
        errorMessage:
          error instanceof Error
            ? error.message
            : "Unable to sync background notifications.",
      });
    }
  }, [session?.accessToken]);

  useEffect(() => {
    void registerAdminNotificationsServiceWorker();
    void syncSnapshot();
  }, [syncSnapshot]);

  useEffect(() => {
    const launchPayload = consumeAdminNotificationLaunchParamFromLocation();
    if (launchPayload) {
      setPendingAdminNotificationLaunchPayload(launchPayload);
    }
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      const payload = event.data;
      if (
        payload?.type !== ADMIN_NOTIFICATION_MESSAGE_TYPE ||
        !isAdminNotificationLaunchPayload(payload.payload)
      ) {
        return;
      }

      setPendingAdminNotificationLaunchPayload(payload.payload);
    };

    navigator.serviceWorker.addEventListener(
      "message",
      handleServiceWorkerMessage,
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "message",
        handleServiceWorkerMessage,
      );
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const handleSessionChange = async () => {
      if (session?.accessToken) {
        return;
      }

      const existing = await getExistingAdminPushSubscription();
      if (!existing) {
        if (!cancelled) {
          resetAdminWebPushSnapshot();
        }
        return;
      }

      try {
        await deleteAdminPushSubscription(existing.endpoint);
      } catch {
        // Best effort cleanup when logging out.
      }

      await existing.unsubscribe();
      if (!cancelled) {
        resetAdminWebPushSnapshot();
      }
    };

    void handleSessionChange();
    return () => {
      cancelled = true;
    };
  }, [session?.accessToken]);

  return <>{children}</>;
}
