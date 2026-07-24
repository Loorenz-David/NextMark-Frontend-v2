import type { OrderEventActionStatus } from "../../types/orderEvent";

export type { OrderEventActionStatus };

/** Channels a message template can be stored under. */
export type MessageChannel = "sms" | "email" | "whatsapp" | "telegram";

/** The only channels the manual send endpoint accepts. */
export type SendableChannel = "email" | "sms";

export type MessageTemplateRow = {
  id: number;
  client_id: string | null;
  event: string;
  enable: boolean;
  subject: string | null;
  name: string | null;
  channel: MessageChannel;
};

export type MessageTemplateMap = {
  byClientId: Record<string, MessageTemplateRow>;
  allIds: string[];
};

export type MessageTemplateListResponse = {
  message_templates: MessageTemplateMap;
};

/** One selectable row in the picker: an event with every sendable channel configured for it. */
export type ManualMessageOption = {
  event: string;
  label: string;
  channels: SendableChannel[];
};

export type SendManualMessageRequest = {
  order_ids: number[];
  event: string;
  channels?: SendableChannel[];
  source_event_id?: number;
};

export type ManualMessageChannelResult =
  | { status: "queued"; action_id: number }
  | { status: "failed"; action_id: number; detail: string }
  | { status: "skipped"; detail: string };

export type ManualMessageAcceptedResult = {
  order_id: number;
  status: "accepted";
  event_id: number;
  source_event_id: number | null;
  channels: Partial<Record<SendableChannel, ManualMessageChannelResult>>;
};

export type ManualMessageNotFoundResult = {
  order_id: number;
  status: "not_found";
};

export type ManualMessageOrderResult =
  | ManualMessageAcceptedResult
  | ManualMessageNotFoundResult;

export type SendManualMessageResponse = {
  request_id: string;
  event: string;
  channels: SendableChannel[];
  results: ManualMessageOrderResult[];
};

/** `order_message.updated` realtime payload. */
export type OrderMessageUpdatedPayload = {
  request_id: string | null;
  order_id: number | null;
  event_id: number;
  action_id: number;
  template_event: string;
  channel: SendableChannel | null;
  status: "SUCCESS" | "FAILED" | "SKIPPED";
  last_error: string | null;
  processed_at: string | null;
};

/** `order_message.dispatched` realtime payload. */
export type OrderMessageDispatchedPayload = {
  request_id: string;
  template_event: string;
  channels: SendableChannel[];
  requested_by: number | null;
  total_actions: number;
  orders: Array<{
    order_id: number;
    event_id: number;
    actions: Array<{
      action_id: number;
      channel: SendableChannel;
      status: "PENDING";
    }>;
  }>;
  not_found_order_ids: number[];
};

/** A single message the frontend is tracking to completion. */
export type TrackedManualMessageAction = {
  actionId: number;
  channel: SendableChannel | null;
  status: OrderEventActionStatus;
  lastError: string | null;
  processedAt: string | null;
};

/** A channel the backend declined to queue because no enabled template exists for it. */
export type SkippedManualMessageChannel = {
  channel: SendableChannel;
  detail: string;
};

/** All messages produced by one manual send of one template event on one order. */
export type TrackedManualMessageSend = {
  templateEvent: string;
  requestId: string | null;
  eventId: number | null;
  /** Keyed by action_id — realtime frames arrive out of order. */
  actionsById: Record<number, TrackedManualMessageAction>;
  /** Channels with no action row at all; a configuration state, not a failure. */
  skippedChannels: SkippedManualMessageChannel[];
  notFound: boolean;
};

/** Minimal state a picker card renders. */
export type ManualMessageCardStatus =
  | "idle"
  | "sending"
  | "sent"
  | "partial"
  | "failed"
  | "skipped"
  | "not_found";
