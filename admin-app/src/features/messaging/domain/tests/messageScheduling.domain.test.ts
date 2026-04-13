import {
  createImmediateMessageScheduleDraft,
  formatMessageScheduleSummary,
  mapMessageScheduleDraftToFields,
  mapMessageScheduleFieldsToDraft,
  supportsFutureAnchorScheduling,
  type MessageScheduleDraft,
} from '../messageScheduling'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const assertDraft = (
  draft: MessageScheduleDraft,
  expected: MessageScheduleDraft,
  message: string,
) => {
  assert(
    draft.mode === expected.mode &&
      draft.unit === expected.unit &&
      draft.value === expected.value,
    message,
  )
}

export const runMessageSchedulingDomainTests = () => {
  {
    const payload = mapMessageScheduleDraftToFields(
      createImmediateMessageScheduleDraft(),
      'order_created',
    )

    assert(
      payload.schedule_offset_value === null && payload.schedule_offset_unit === null,
      'immediate mode should map to paired null backend fields',
    )
  }

  {
    const payload = mapMessageScheduleDraftToFields(
      {
        mode: 'before_anchor',
        unit: 'hours',
        value: 1,
      },
      'order_rescheduled',
    )

    assert(
      payload.schedule_offset_value === -1 && payload.schedule_offset_unit === 'hours',
      'future anchor before mode should map to a negative offset',
    )
  }

  {
    const payload = mapMessageScheduleDraftToFields(
      {
        mode: 'before_anchor',
        unit: 'days',
        value: 2,
      },
      'order_created',
    )

    assert(
      payload.schedule_offset_value === 2 && payload.schedule_offset_unit === 'days',
      'standard events should reject negative scheduling semantics and coerce to after-event timing',
    )
  }

  {
    const draft = mapMessageScheduleFieldsToDraft(
      {
        schedule_offset_value: -2,
        schedule_offset_unit: 'days',
      },
      'order_rescheduled',
    )

    assertDraft(
      draft,
      {
        mode: 'before_anchor',
        unit: 'days',
        value: 2,
      },
      'future anchor payload should hydrate into before-anchor draft state',
    )
  }

  {
    const draft = mapMessageScheduleFieldsToDraft(
      {
        schedule_offset_value: null,
        schedule_offset_unit: null,
      },
      'order_created',
    )

    assertDraft(
      draft,
      createImmediateMessageScheduleDraft(),
      'missing backend scheduling should hydrate to immediate mode',
    )
  }

  {
    const summary = formatMessageScheduleSummary(
      {
        mode: 'at_anchor',
        unit: 'hours',
        value: 0,
      },
      'order_rescheduled',
    )

    assert(summary === 'At delivery window start', 'future anchor zero offset should summarize the exact anchor timing')
  }

  {
    const summary = formatMessageScheduleSummary(
      {
        mode: 'after_anchor',
        unit: 'minutes',
        value: 20,
      },
      'order_created',
    )

    assert(summary === '20 minutes after event', 'standard events should summarize relative to the event firing time')
  }

  {
    assert(
      supportsFutureAnchorScheduling('order_delivery_window_changed_by_user') &&
        supportsFutureAnchorScheduling('plan_delivery_rescheduled'),
      'future anchor allowlist should include backend-supported event keys even if not yet rendered in the UI',
    )
  }
}
