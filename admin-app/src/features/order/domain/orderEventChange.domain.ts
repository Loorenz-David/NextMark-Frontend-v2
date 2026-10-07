import { formatPhone, isPhone } from "@/shared/data-validation/phoneValidation";
import {
  formatDateOnlyInTimeZone,
  formatIsoTime,
} from "@/shared/utils/formatIsoDate";
import { getTeamTimeZone } from "@/shared/utils/teamTimeZone";

import type { OrderEventChange } from "../types/orderEvent";

export type OrderEventChangeKind = "changed" | "added" | "removed";

export type OrderEventChangeViewModel = {
  id: number;
  label: string;
  scope: string | null;
  kind: OrderEventChangeKind;
  from: string | null;
  to: string | null;
  summary: string;
  /** False when the field was empty before — a first fill, not a correction. */
  replacesValue: boolean;
};

const EMPTY = "—";
const FIELD_CREATED = "__created__";
const FIELD_DELETED = "__deleted__";

const ORDER_FIELD_LABELS: Record<string, string> = {
  order_plan_objective: "Plan type",
  operation_type: "Operation",
  reference_number: "Reference",
  external_order_id: "External order ID",
  external_source: "External source",
  external_tracking_number: "External tracking number",
  external_tracking_link: "External tracking link",
  client_first_name: "First name",
  client_last_name: "Last name",
  client_email: "Email",
  client_primary_phone: "Primary phone",
  client_secondary_phone: "Secondary phone",
  client_address: "Address",
  help_to_carry: "Help to carry",
  marketing_messages: "Marketing messages",
  delivery_windows: "Delivery window",
  route_plan_id: "Plan",
  delivery_dates: "Delivery date",
};

const ITEM_FIELD_LABELS: Record<string, string> = {
  article_number: "Article",
  reference_number: "Reference",
  item_type: "Type",
  quantity: "Quantity",
  weight: "Weight",
  dimension_depth: "Depth",
  dimension_height: "Height",
  dimension_width: "Width",
  properties: "Properties",
  item_position: "Position",
  item_state_id: "State",
  page_link: "Page link",
};

const NOTE_TYPE_LABELS: Record<string, string> = {
  GENERAL: "General note",
  COSTUMER: "Customer note",
  FAILURE: "Failure note",
};

const FIELD_UNITS: Record<string, string> = {
  weight: "g",
  dimension_depth: "cm",
  dimension_height: "cm",
  dimension_width: "cm",
};

const PHONE_FIELDS = new Set(["client_primary_phone", "client_secondary_phone"]);
const HUMANIZED_FIELDS = new Set(["order_plan_objective", "operation_type"]);
const MAX_VALUE_LENGTH = 140;

const humanize = (value: string) => {
  const spaced = value.replace(/_/g, " ").trim().toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isBlank = (value: unknown) =>
  value === null ||
  value === undefined ||
  value === "" ||
  (Array.isArray(value) && value.length === 0) ||
  (isRecord(value) && Object.keys(value).length === 0);

const truncate = (value: string) =>
  value.length > MAX_VALUE_LENGTH
    ? `${value.slice(0, MAX_VALUE_LENGTH - 1)}…`
    : value;

const readString = (record: Record<string, unknown>, key: string) => {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
};

const formatAddress = (value: unknown) => {
  if (!isRecord(value)) return typeof value === "string" ? value : EMPTY;
  const parts = [
    readString(value, "street_address"),
    [readString(value, "postal_code"), readString(value, "city")]
      .filter(Boolean)
      .join(" "),
    readString(value, "country"),
  ].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(", ") : EMPTY;
};

const formatShortDate = (iso: string) =>
  new Intl.DateTimeFormat("en", {
    timeZone: getTeamTimeZone(),
    month: "short",
    day: "numeric",
  }).format(new Date(iso));

const formatWindow = (value: unknown) => {
  if (!isRecord(value)) return null;
  const start = readString(value, "start_at");
  const end = readString(value, "end_at");
  if (!start || !end) return null;

  if (value.window_type === "DATE_ONLY") {
    return formatShortDate(start);
  }

  const sameDay =
    formatDateOnlyInTimeZone(start) === formatDateOnlyInTimeZone(end);
  return sameDay
    ? `${formatShortDate(start)}, ${formatIsoTime(start)}–${formatIsoTime(end)}`
    : `${formatShortDate(start)} ${formatIsoTime(start)} – ${formatShortDate(end)} ${formatIsoTime(end)}`;
};

const formatWindows = (value: unknown) => {
  if (!Array.isArray(value)) return EMPTY;
  const windows = value
    .map(formatWindow)
    .filter((window): window is string => Boolean(window));
  return windows.length > 0 ? windows.join("; ") : EMPTY;
};

const planDayFormatter = new Intl.DateTimeFormat("en", {
  // Plan dates are calendar days stored at UTC midnight: read them in UTC so
  // no team time zone shifts the day.
  timeZone: "UTC",
  month: "short",
  day: "numeric",
});

const formatPlanDay = (iso: string | null) => {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : planDayFormatter.format(date);
};

/** "Oct 19" or "Oct 19 – Oct 21" for a plan's start/end. */
export const formatPlanDates = (
  start: string | null,
  end: string | null,
): string | null => {
  const startDay = formatPlanDay(start);
  if (!startDay) return null;
  const endDay = formatPlanDay(end);
  return endDay && endDay !== startDay ? `${startDay} – ${endDay}` : startDay;
};

const formatDeliveryDates = (value: unknown) => {
  if (!isRecord(value)) return EMPTY;
  return (
    formatPlanDates(readString(value, "start"), readString(value, "end")) ??
    EMPTY
  );
};

const formatScalar = (field: string, value: unknown): string => {
  if (isBlank(value)) return EMPTY;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    const unit = FIELD_UNITS[field];
    return unit ? `${value} ${unit}` : String(value);
  }
  if (typeof value === "string") {
    return truncate(HUMANIZED_FIELDS.has(field) ? humanize(value) : value);
  }
  return truncate(JSON.stringify(value));
};

const formatFieldValue = (
  field: string,
  value: unknown,
  label: string | null,
): string => {
  if (label) return label;
  if (field === "route_plan_id") {
    return isBlank(value) ? "Unscheduled" : `Plan #${String(value)}`;
  }
  if (isBlank(value)) return EMPTY;
  if (field === "delivery_dates") return formatDeliveryDates(value);
  if (field === "client_address") return formatAddress(value);
  if (field === "delivery_windows") return formatWindows(value);
  if (PHONE_FIELDS.has(field) && (isPhone(value) || typeof value === "string")) {
    return formatPhone(value);
  }
  if (field === "item_state_id" && typeof value === "number") {
    return `#${value}`;
  }
  return formatScalar(field, value);
};

const formatItemSnapshot = (value: unknown) => {
  if (!isRecord(value)) return null;
  const quantity = value.quantity;
  return typeof quantity === "number" ? `Quantity ${quantity}` : null;
};

const resolveItemScope = (change: OrderEventChange) =>
  change.entity_label ??
  (change.entity_id ? `Item #${change.entity_id}` : "Item");

const resolveKind = (from: unknown, to: unknown): OrderEventChangeKind => {
  if (isBlank(from) && !isBlank(to)) return "added";
  if (!isBlank(from) && isBlank(to)) return "removed";
  return "changed";
};

const mapItemChange = (change: OrderEventChange): OrderEventChangeViewModel => {
  const scope = resolveItemScope(change);

  if (change.field_name === FIELD_CREATED) {
    return {
      id: change.id,
      label: "Item added",
      scope,
      kind: "added",
      from: null,
      to: formatItemSnapshot(change.to_value),
      summary: `${scope} added`,
      replacesValue: false,
    };
  }

  if (change.field_name === FIELD_DELETED) {
    return {
      id: change.id,
      label: "Item removed",
      scope,
      kind: "removed",
      from: formatItemSnapshot(change.from_value),
      to: null,
      summary: `${scope} removed`,
      replacesValue: true,
    };
  }

  const label =
    ITEM_FIELD_LABELS[change.field_name] ?? humanize(change.field_name);
  return {
    id: change.id,
    label,
    scope,
    kind: "changed",
    from: formatFieldValue(change.field_name, change.from_value, change.from_label),
    to: formatFieldValue(change.field_name, change.to_value, change.to_label),
    summary: `${scope} ${label.toLowerCase()}`,
    replacesValue: !isBlank(change.from_value),
  };
};

const mapNoteChange = (change: OrderEventChange): OrderEventChangeViewModel => {
  const noteType = change.entity_id ?? "GENERAL";
  const label = NOTE_TYPE_LABELS[noteType] ?? `${humanize(noteType)} note`;
  const kind = resolveKind(change.from_value, change.to_value);
  return {
    id: change.id,
    label,
    scope: null,
    kind,
    from: kind === "added" ? null : formatScalar("order_notes", change.from_value),
    to: kind === "removed" ? null : formatScalar("order_notes", change.to_value),
    summary: label,
    replacesValue: kind !== "added",
  };
};

export const mapOrderEventChangeToViewModel = (
  change: OrderEventChange,
): OrderEventChangeViewModel => {
  if (change.entity_type === "item") return mapItemChange(change);
  if (change.entity_type === "note") return mapNoteChange(change);

  const label =
    ORDER_FIELD_LABELS[change.field_name] ?? humanize(change.field_name);
  return {
    id: change.id,
    label,
    scope: null,
    kind: "changed",
    from: formatFieldValue(change.field_name, change.from_value, change.from_label),
    to: formatFieldValue(change.field_name, change.to_value, change.to_label),
    summary: label,
    replacesValue: !isBlank(change.from_value),
  };
};

export const summarizeOrderEventChanges = (
  changes: OrderEventChangeViewModel[],
): string | null => {
  const summaries = [...new Set(changes.map((change) => change.summary))];
  if (summaries.length === 0) return null;

  const [first, second] = summaries;
  const text =
    summaries.length === 1
      ? first
      : summaries.length === 2
        ? `${first} and ${second}`
        : `${first}, ${second} and ${summaries.length - 2} more`;
  return text.charAt(0).toUpperCase() + text.slice(1);
};
