import { apiClient } from "@/lib/api/ApiClient";
import type { ApiResult } from "@/lib/api/types";
import type { Order } from "@/features/order/types/order";
import type { Phone } from "@/types/phone";

export type ClientFormLinkResponse = {
  form_url: string;
  expires_at: string;
  order?: Order | null;
};

export type SendClientFormLinkPayload = {
  email: string | null;
  phone: Phone | null;
};

export const generateClientFormLink = async (
  orderId: number,
): Promise<ClientFormLinkResponse> => {
  const result: ApiResult<ClientFormLinkResponse> =
    await apiClient.request<ClientFormLinkResponse>({
      path: `/orders/${orderId}/client-form-link`,
      method: "POST",
    });

  if (!result.data) {
    throw new Error("No data returned from server");
  }

  return result.data;
};

export const sendClientFormLink = async (
  orderId: number,
  payload: SendClientFormLinkPayload,
): Promise<void> => {
  await apiClient.request<Record<string, never>>({
    path: `/orders/${orderId}/client-form-link/send`,
    method: "POST",
    data: {
      recipients: {
        email: payload.email,
        sms: payload.phone,
      },
    },
  });
};

export const useGenerateClientFormLink = () => generateClientFormLink;
export const useSendClientFormLink = () => sendClientFormLink;
