import { coerceUtcFromOffset } from "@/shared/data-validation/timeValidation";

const formatPlanDate = (value?: string | null) => {
  if (!value) return "TBD";
  const date = coerceUtcFromOffset(value);
  if (!date || Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const isSameUtcDay = (
  startDateValue?: string | null,
  endDateValue?: string | null,
) => {
  const startDate = startDateValue ? coerceUtcFromOffset(startDateValue) : null;
  const endDate = endDateValue ? coerceUtcFromOffset(endDateValue) : null;
  if (!startDate || !endDate) return false;
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return false;
  }

  return (
    startDate.getUTCFullYear() === endDate.getUTCFullYear() &&
    startDate.getUTCMonth() === endDate.getUTCMonth() &&
    startDate.getUTCDate() === endDate.getUTCDate()
  );
};

/**
 * A plan's schedule as one label — "Mon, Oct 1" for a single day, "Mon, Oct 1 -
 * Fri, Oct 5" for a range. Matches the plan card's formatting so a plan reads
 * the same in the list, on the calendar, and in its workspace header.
 */
export const formatPlanDateRangeLabel = (
  startDateValue?: string | null,
  endDateValue?: string | null,
) => {
  const startLabel = formatPlanDate(startDateValue);
  if (isSameUtcDay(startDateValue, endDateValue)) return startLabel;
  return `${startLabel} - ${formatPlanDate(endDateValue)}`;
};
