import { apiClient } from "@/lib/api/ApiClient";
import type { ApiResult } from "@/lib/api/types";

import type {
  MessageTemplateListResponse,
  SendManualMessageRequest,
  SendManualMessageResponse,
} from "../types/manualMessage";

/** Upper bound the picker needs; the endpoint defaults to 50. */
const TEMPLATE_PAGE_LIMIT = 100;

/**
 * Lists every enabled template across all channels. The messaging feature's
 * email/sms clients pin `channel`, so the picker needs its own unfiltered read.
 */
export const listManualMessageTemplates = (): Promise<
  ApiResult<MessageTemplateListResponse>
> =>
  apiClient.request<MessageTemplateListResponse>({
    path: "/message_templates/",
    method: "GET",
    query: { enable: true, limit: TEMPLATE_PAGE_LIMIT },
  });

export const sendManualOrderMessage = (
  payload: SendManualMessageRequest,
): Promise<ApiResult<SendManualMessageResponse>> =>
  apiClient.request<SendManualMessageResponse>({
    path: "/order_messages/send",
    method: "POST",
    data: payload,
  });

export const useListManualMessageTemplates = () => listManualMessageTemplates;
export const useSendManualOrderMessage = () => sendManualOrderMessage;
