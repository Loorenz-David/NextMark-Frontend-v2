import type { OrderEvent } from "../../../types/orderEvent";
import type {
  MessageTemplateMap,
  MessageTemplateRow,
  TrackedManualMessageSend,
} from "../../types/manualMessage";
import {
  buildManualMessageOptions,
  deriveManualMessageCardStatus,
  filterManualMessageOptions,
  readManualTemplateEvent,
} from "../manualMessageOptions";
import {
  buildTrackedSendsFromHistory,
  mergeTrackedSends,
} from "../manualMessageHistory";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const createTemplate = (
  overrides: Partial<MessageTemplateRow> & Pick<MessageTemplateRow, "id">,
): MessageTemplateRow => ({
  client_id: null,
  event: "order_ready",
  enable: true,
  subject: null,
  name: null,
  channel: "email",
  ...overrides,
});

const createTemplateMap = (
  templates: MessageTemplateRow[],
): MessageTemplateMap => ({
  byClientId: templates.reduce<Record<string, MessageTemplateRow>>(
    (accumulator, template) => {
      accumulator[String(template.client_id ?? template.id)] = template;
      return accumulator;
    },
    {},
  ),
  allIds: templates.map((template) => String(template.client_id ?? template.id)),
});

const createTracked = (
  overrides?: Partial<TrackedManualMessageSend>,
): TrackedManualMessageSend => ({
  templateEvent: "order_ready",
  requestId: null,
  eventId: null,
  actionsById: {},
  skippedChannels: [],
  notFound: false,
  ...overrides,
});

const createOrderEvent = (overrides: Partial<OrderEvent>): OrderEvent =>
  ({
    client_id: "order:1:event:1",
    id: 1,
    event_id: "uuid-1",
    order_id: 1,
    team_id: 1,
    actor_id: null,
    event_name: "order_manual_message",
    payload: {},
    occurred_at: "2026-07-24T11:00:00+00:00",
    entity_type: "order",
    entity_id: "1",
    entity_version: null,
    dispatch_status: "DISPATCHED",
    dispatch_attempts: 0,
    claimed_at: null,
    claimed_by: null,
    next_attempt_at: null,
    last_error: null,
    relayed_at: null,
    actions: [],
    ...overrides,
  }) as OrderEvent;

export const runManualMessageOptionsDomainTests = () => {
  {
    const options = buildManualMessageOptions(
      createTemplateMap([
        createTemplate({ id: 1, event: "order_ready", channel: "email" }),
        createTemplate({ id: 2, event: "order_ready", channel: "sms" }),
      ]),
    );

    assert(options.length === 1, "templates group into one option per event");
    assert(
      options[0].channels.join(",") === "email,sms",
      "both sendable channels are collected on the event",
    );
  }

  {
    const options = buildManualMessageOptions(
      createTemplateMap([
        createTemplate({ id: 1, event: "order_ready", enable: false }),
        createTemplate({ id: 2, event: "order_failed", channel: "whatsapp" }),
        createTemplate({ id: 3, event: "order_manual_message" }),
        createTemplate({ id: 4, event: "order_completed" }),
      ]),
    );

    assert(
      options.length === 1 && options[0].event === "order_completed",
      "disabled, unsendable-channel and reserved-event templates are dropped",
    );
  }

  {
    const options = buildManualMessageOptions(
      createTemplateMap([
        createTemplate({ id: 3, event: "order_completed" }),
        createTemplate({ id: 1, event: "order_ready" }),
      ]),
    );

    assert(
      options[0].event === "order_completed" && options[1].event === "order_ready",
      "allIds ordering is preserved rather than map insertion order",
    );
  }

  {
    const options = buildManualMessageOptions(
      createTemplateMap([
        createTemplate({ id: 1, event: "order_ready", name: "  " }),
        createTemplate({
          id: 2,
          event: "order_status_changed",
          name: "Status update",
        }),
      ]),
    );

    assert(
      options[0].label === "Order ready",
      "a blank template name falls back to the shared event label",
    );
    assert(
      options[1].label === "Status update",
      "the template name wins when present, even for events with no shared label",
    );
  }

  {
    const options = buildManualMessageOptions(
      createTemplateMap([
        createTemplate({ id: 1, event: "order_ready" }),
        createTemplate({ id: 2, event: "order_cancelled", channel: "sms" }),
      ]),
    );

    assert(
      filterManualMessageOptions(options, "  ").length === 2,
      "a blank query keeps every option",
    );
    assert(
      filterManualMessageOptions(options, "cancel")[0].event ===
        "order_cancelled",
      "the search matches on the label",
    );
    assert(
      filterManualMessageOptions(options, "sms")[0].event === "order_cancelled",
      "the search matches on the channel",
    );
  }

  {
    assert(
      deriveManualMessageCardStatus(null) === "idle",
      "an untracked event is idle",
    );
    assert(
      deriveManualMessageCardStatus(createTracked({ notFound: true })) ===
        "not_found",
      "a not_found result short-circuits the verdict",
    );
    assert(
      deriveManualMessageCardStatus(createTracked()) === "sending",
      "a tracked send with no actions yet is still sending",
    );
    assert(
      deriveManualMessageCardStatus(
        createTracked({
          skippedChannels: [{ channel: "sms", detail: "no template" }],
        }),
      ) === "skipped",
      "a send whose only outcome was a skipped channel is skipped",
    );
  }

  {
    const pending = createTracked({
      actionsById: {
        1: {
          actionId: 1,
          channel: "email",
          status: "PENDING",
          lastError: null,
          processedAt: null,
        },
        2: {
          actionId: 2,
          channel: "sms",
          status: "SUCCESS",
          lastError: null,
          processedAt: null,
        },
      },
    });

    assert(
      deriveManualMessageCardStatus(pending) === "sending",
      "any PENDING action keeps the card sending",
    );
  }

  {
    const succeededWithSkippedChannel = createTracked({
      actionsById: {
        1: {
          actionId: 1,
          channel: "email",
          status: "SUCCESS",
          lastError: null,
          processedAt: null,
        },
      },
      skippedChannels: [{ channel: "sms", detail: "no template" }],
    });

    assert(
      deriveManualMessageCardStatus(succeededWithSkippedChannel) === "sent",
      "an unconfigured channel does not downgrade a successful send to partial",
    );
  }

  {
    const mixed = createTracked({
      actionsById: {
        1: {
          actionId: 1,
          channel: "email",
          status: "SUCCESS",
          lastError: null,
          processedAt: null,
        },
        2: {
          actionId: 2,
          channel: "sms",
          status: "FAILED",
          lastError: "no phone",
          processedAt: null,
        },
      },
    });

    assert(
      deriveManualMessageCardStatus(mixed) === "partial",
      "one success beside one failure is partial",
    );
  }

  {
    const allFailed = createTracked({
      actionsById: {
        1: {
          actionId: 1,
          channel: "email",
          status: "FAILED",
          lastError: "no email",
          processedAt: null,
        },
      },
    });

    assert(
      deriveManualMessageCardStatus(allFailed) === "failed",
      "no successes with a failure present is failed",
    );
  }

  {
    const event = createOrderEvent({
      payload: {
        old_expected_arrival: "copied from the source event",
        manual: { template_event: "order_rescheduled" },
      },
    });

    assert(
      readManualTemplateEvent(event) === "order_rescheduled",
      "the template event is read from payload.manual, not event_name",
    );
    assert(
      readManualTemplateEvent(createOrderEvent({ payload: {} })) === null,
      "a manual event with no metadata yields no template event",
    );
  }

  {
    const tracked = buildTrackedSendsFromHistory([
      createOrderEvent({
        id: 20,
        payload: { manual: { template_event: "order_ready" } },
        actions: [
          {
            id: 200,
            event_id: 20,
            team_id: 1,
            action_name: "manual_order_ready_email",
            status: "SUCCESS",
            attempts: 1,
            last_error: null,
            scheduled_for: null,
            enqueued_at: null,
            processed_at: "2026-07-24T11:02:31+00:00",
            schedule_anchor_type: null,
            schedule_anchor_at: null,
            created_at: "2026-07-24T11:02:00+00:00",
            updated_at: "2026-07-24T11:02:31+00:00",
          },
        ],
      }),
      createOrderEvent({
        id: 10,
        payload: { manual: { template_event: "order_ready" } },
        actions: [],
      }),
      createOrderEvent({
        id: 5,
        event_name: "order_ready",
        payload: {},
        actions: [],
      }),
    ]);

    assert(
      Object.keys(tracked).length === 1,
      "only manual events produce tracked sends",
    );
    assert(
      tracked.order_ready.eventId === 20,
      "the newest manual event for a template wins",
    );
    assert(
      tracked.order_ready.actionsById[200]?.channel === "email",
      "the channel is derived from the action name suffix",
    );
  }

  {
    const existing = {
      order_ready: createTracked({
        eventId: null,
        actionsById: {
          200: {
            actionId: 200,
            channel: "email",
            status: "PENDING",
            lastError: null,
            processedAt: null,
          },
        },
        skippedChannels: [{ channel: "sms", detail: "no template" }],
      }),
      order_cancelled: createTracked({
        templateEvent: "order_cancelled",
        actionsById: {
          300: {
            actionId: 300,
            channel: "sms",
            status: "PENDING",
            lastError: null,
            processedAt: null,
          },
        },
      }),
    };

    const merged = mergeTrackedSends(existing, {
      order_ready: createTracked({
        eventId: 20,
        actionsById: {
          200: {
            actionId: 200,
            channel: "email",
            status: "SUCCESS",
            lastError: null,
            processedAt: "2026-07-24T11:02:31+00:00",
          },
        },
      }),
    });

    assert(
      merged.order_ready.actionsById[200].status === "SUCCESS",
      "history wins per action id",
    );
    assert(
      merged.order_ready.eventId === 20,
      "history fills in the event id the optimistic seed lacked",
    );
    assert(
      merged.order_ready.skippedChannels.length === 1,
      "skipped channels are carried over — they never appear in the history",
    );
    assert(
      merged.order_cancelled.actionsById[300].status === "PENDING",
      "a template the history has not caught up on keeps its optimistic entry",
    );
  }

  {
    const historyWithActionlessEvent = buildTrackedSendsFromHistory([
      createOrderEvent({
        id: 30,
        payload: { manual: { template_event: "order_ready" } },
        actions: [],
      }),
    ]);

    assert(
      Object.keys(historyWithActionlessEvent).length === 0,
      "a manual event with no actions is not tracked — nothing would ever settle it",
    );
  }
};
