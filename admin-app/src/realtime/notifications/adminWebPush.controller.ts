import { useSyncExternalStore } from "react";

import { sessionStorage } from "@/features/auth/login/store/sessionStorage";

import {
  deleteAdminPushSubscription,
  upsertAdminPushSubscription,
} from "./adminWebPush.api";
import {
  getAdminWebPushPermission,
  isAdminWebPushSupported,
  requestAdminWebPushPermission,
  serializeAdminPushSubscription,
  subscribeAdminWebPush,
  unsubscribeAdminWebPush,
} from "./adminWebPush.runtime";
import {
  getAdminWebPushSnapshot,
  setAdminWebPushSnapshot,
  subscribeAdminWebPush as subscribeAdminWebPushStore,
} from "./adminWebPush.store";

const setPushFailure = (error: unknown, fallbackMessage: string) => {
  setAdminWebPushSnapshot({
    status: "subscription_error",
    permission: getAdminWebPushPermission(),
    isSupported: isAdminWebPushSupported(),
    isLoading: false,
    endpoint: null,
    errorMessage:
      error instanceof Error ? error.message : fallbackMessage,
  });
};

export const enableAdminWebPush = async () => {
  if (!sessionStorage.getSession()?.accessToken) {
    return false;
  }

  setAdminWebPushSnapshot({ isLoading: true, errorMessage: null });

  try {
    const permission = await requestAdminWebPushPermission();
    if (permission !== "granted") {
      setAdminWebPushSnapshot({
        isLoading: false,
        permission,
        status:
          permission === "denied"
            ? "permission_denied"
            : "permission_default",
        isSupported: isAdminWebPushSupported(),
      });
      return false;
    }

    const subscription = await subscribeAdminWebPush();
    await upsertAdminPushSubscription(
      serializeAdminPushSubscription(subscription),
    );

    setAdminWebPushSnapshot({
      status: "subscribed",
      permission,
      isSupported: true,
      isLoading: false,
      endpoint: subscription.endpoint,
      errorMessage: null,
    });
    return true;
  } catch (error) {
    setPushFailure(error, "Unable to enable background notifications.");
    return false;
  }
};

export const disableAdminWebPush = async () => {
  setAdminWebPushSnapshot({ isLoading: true, errorMessage: null });

  try {
    const existing = await unsubscribeAdminWebPush();
    if (existing) {
      await deleteAdminPushSubscription(existing.endpoint);
    }

    setAdminWebPushSnapshot({
      status: "permission_granted_unsubscribed",
      permission: getAdminWebPushPermission(),
      isSupported: isAdminWebPushSupported(),
      isLoading: false,
      endpoint: null,
      errorMessage: null,
    });
    return true;
  } catch (error) {
    setPushFailure(error, "Unable to disable background notifications.");
    return false;
  }
};

export const useAdminWebPush = () => {
  const snapshot = useSyncExternalStore(
    subscribeAdminWebPushStore,
    getAdminWebPushSnapshot,
    getAdminWebPushSnapshot,
  );

  return {
    ...snapshot,
    enable: enableAdminWebPush,
    disable: disableAdminWebPush,
  };
};
