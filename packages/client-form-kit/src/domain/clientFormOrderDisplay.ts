import type { ClientFormMeta } from "./clientForm.types";

const hasValue = (value: string | null | undefined): value is string =>
  typeof value === "string" && value.trim().length > 0;

/**
 * `null` when the form is not attached to an order yet — the in-store device
 * opens it before one exists, and the host supplies its own heading then.
 */
export const getClientFormOrderTitle = (meta: ClientFormMeta): string | null => {
  if (hasValue(meta.external_source) && hasValue(meta.reference_number)) {
    return `Order ${meta.reference_number}`;
  }

  return meta.order_scalar_id ? `Order # ${meta.order_scalar_id}` : null;
};

const SCHEDULE_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
};

/**
 * Formats one ISO instant as a calendar day in the team's zone. An invalid
 * `team_timezone` falls back to the runtime zone rather than rendering nothing —
 * a slightly-off date is more useful to the customer than a blank header.
 */
const formatScheduleDay = (
  iso: string,
  timeZone: string | null | undefined,
): string | null => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      ...SCHEDULE_DATE_FORMAT,
      ...(hasValue(timeZone) ? { timeZone } : {}),
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat(undefined, SCHEDULE_DATE_FORMAT).format(date);
  }
};

/**
 * The order's route-plan schedule date, formatted for the form header, or `null`
 * when the order has no plan or no scheduled date.
 *
 * `"single"` renders one day; `"range"` renders `start → end`, but a range whose
 * ends land on the same calendar day (in the team's zone) reads as a single date.
 */
export const getClientFormScheduledDelivery = (
  meta: ClientFormMeta,
): string | null => {
  const schedule = meta.route_plan_schedule;
  if (!schedule || !hasValue(schedule.start_date)) {
    return null;
  }

  const start = formatScheduleDay(schedule.start_date, meta.team_timezone);
  if (!start) {
    return null;
  }

  if (schedule.date_strategy === "range" && hasValue(schedule.end_date)) {
    const end = formatScheduleDay(schedule.end_date, meta.team_timezone);
    if (end && end !== start) {
      return `${start} – ${end}`;
    }
  }

  return start;
};
