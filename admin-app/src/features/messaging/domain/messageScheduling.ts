export type MessageScheduleUnit = 'minutes' | 'hours' | 'days'

export type MessageScheduleMode =
  | 'immediate'
  | 'after_anchor'
  | 'at_anchor'
  | 'before_anchor'

export type MessageScheduleDraft = {
  mode: MessageScheduleMode
  unit: MessageScheduleUnit
  value: number
}

export type MessageSchedulePayloadFields = {
  schedule_offset_value: number | null
  schedule_offset_unit: MessageScheduleUnit | null
}

export const MESSAGE_SCHEDULE_UNIT_LIMITS: Record<MessageScheduleUnit, number> = {
  minutes: 525600,
  hours: 8760,
  days: 365,
}

export const MESSAGE_SCHEDULE_UNITS: MessageScheduleUnit[] = ['minutes', 'hours', 'days']

export const FUTURE_ANCHOR_EVENT_KEYS = [
  'order_rescheduled',
  'order_delivery_plan_changed',
  'order_delivery_window_changed_by_user',
  'plan_delivery_rescheduled',
] as const

const FUTURE_ANCHOR_EVENT_KEY_SET = new Set<string>(FUTURE_ANCHOR_EVENT_KEYS)

const DEFAULT_SCHEDULE_UNIT: MessageScheduleUnit = 'hours'

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export const createImmediateMessageScheduleDraft = (): MessageScheduleDraft => ({
  mode: 'immediate',
  unit: DEFAULT_SCHEDULE_UNIT,
  value: 1,
})

export const supportsFutureAnchorScheduling = (eventKey: string | null | undefined) =>
  Boolean(eventKey && FUTURE_ANCHOR_EVENT_KEY_SET.has(eventKey))

export const getMessageScheduleValueBounds = (
  unit: MessageScheduleUnit,
  mode: MessageScheduleMode,
  eventKey: string | null | undefined,
) => {
  const max = MESSAGE_SCHEDULE_UNIT_LIMITS[unit]

  if (mode === 'at_anchor') {
    return { min: 0, max: 0 }
  }

  if (mode === 'immediate') {
    return { min: 1, max }
  }

  if (mode === 'before_anchor' && supportsFutureAnchorScheduling(eventKey)) {
    return { min: 1, max }
  }

  return { min: 1, max }
}

export const sanitizeMessageScheduleDraft = (
  draft: MessageScheduleDraft | null | undefined,
  eventKey: string | null | undefined,
): MessageScheduleDraft => {
  if (!draft) {
    return createImmediateMessageScheduleDraft()
  }

  const supportsFutureAnchor = supportsFutureAnchorScheduling(eventKey)
  const nextMode =
    !supportsFutureAnchor && (draft.mode === 'before_anchor' || draft.mode === 'at_anchor')
      ? 'after_anchor'
      : draft.mode

  const nextUnit = MESSAGE_SCHEDULE_UNITS.includes(draft.unit) ? draft.unit : DEFAULT_SCHEDULE_UNIT
  const bounds = getMessageScheduleValueBounds(nextUnit, nextMode, eventKey)
  const safeValue = isFiniteNumber(draft.value) ? Math.trunc(draft.value) : bounds.min

  return {
    mode: nextMode,
    unit: nextUnit,
    value: clamp(safeValue, bounds.min, bounds.max),
  }
}

export const mapMessageScheduleFieldsToDraft = (
  fields: Partial<MessageSchedulePayloadFields> | null | undefined,
  eventKey: string | null | undefined,
): MessageScheduleDraft => {
  const value = fields?.schedule_offset_value
  const unit = fields?.schedule_offset_unit

  if (value == null || unit == null) {
    return createImmediateMessageScheduleDraft()
  }

  if (!MESSAGE_SCHEDULE_UNITS.includes(unit)) {
    return createImmediateMessageScheduleDraft()
  }

  if (!supportsFutureAnchorScheduling(eventKey)) {
    return sanitizeMessageScheduleDraft(
      {
        mode: 'after_anchor',
        unit,
        value: Math.abs(Math.trunc(value)),
      },
      eventKey,
    )
  }

  if (value === 0) {
    return sanitizeMessageScheduleDraft(
      {
        mode: 'at_anchor',
        unit,
        value: 0,
      },
      eventKey,
    )
  }

  return sanitizeMessageScheduleDraft(
    {
      mode: value < 0 ? 'before_anchor' : 'after_anchor',
      unit,
      value: Math.abs(Math.trunc(value)),
    },
    eventKey,
  )
}

export const mapMessageScheduleDraftToFields = (
  draft: MessageScheduleDraft,
  eventKey: string | null | undefined,
): MessageSchedulePayloadFields => {
  const safeDraft = sanitizeMessageScheduleDraft(draft, eventKey)

  if (safeDraft.mode === 'immediate') {
    return {
      schedule_offset_value: null,
      schedule_offset_unit: null,
    }
  }

  if (safeDraft.mode === 'at_anchor') {
    return {
      schedule_offset_value: 0,
      schedule_offset_unit: DEFAULT_SCHEDULE_UNIT,
    }
  }

  return {
    schedule_offset_value: safeDraft.mode === 'before_anchor' ? -safeDraft.value : safeDraft.value,
    schedule_offset_unit: safeDraft.unit,
  }
}

const formatUnitLabel = (value: number, unit: MessageScheduleUnit) => {
  const singularUnit = unit.endsWith('s') ? unit.slice(0, -1) : unit
  return `${value} ${value === 1 ? singularUnit : unit}`
}

export const formatMessageScheduleSummary = (
  draft: MessageScheduleDraft | null | undefined,
  eventKey: string | null | undefined,
) => {
  const safeDraft = sanitizeMessageScheduleDraft(draft, eventKey)

  if (safeDraft.mode === 'immediate') {
    return 'Immediately'
  }

  if (safeDraft.mode === 'at_anchor') {
    return supportsFutureAnchorScheduling(eventKey)
      ? 'At delivery window start'
      : 'Immediately'
  }

  const amount = formatUnitLabel(safeDraft.value, safeDraft.unit)

  if (!supportsFutureAnchorScheduling(eventKey)) {
    return `${amount} after event`
  }

  if (safeDraft.mode === 'before_anchor') {
    return `${amount} before window`
  }

  return `${amount} after window`
}

export const getMessageScheduleAnchorCopy = (eventKey: string | null | undefined) =>
  supportsFutureAnchorScheduling(eventKey)
    ? 'Future-anchor event. Schedule relative to the delivery window start.'
    : 'Standard event. Schedule only after the event fires.'
