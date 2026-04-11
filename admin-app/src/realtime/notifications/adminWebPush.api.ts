import { apiClient } from "@/lib/api/ApiClient";

import type { AdminPushSubscriptionPayload } from "./adminWebPush.types";

type AdminPushSubscriptionResponse = {
  status?: string | null;
};

const BASE_PATH = "/notifications/push-subscriptions";

export const upsertAdminPushSubscription = async (
  payload: AdminPushSubscriptionPayload,
) => {
  return apiClient.request<AdminPushSubscriptionResponse>({
    path: BASE_PATH,
    method: "POST",
    data: payload,
  });
};

export const deleteAdminPushSubscription = async (endpoint: string) => {
  return apiClient.request<AdminPushSubscriptionResponse>({
    path: BASE_PATH,
    method: "DELETE",
    data: { endpoint },
  });
};
