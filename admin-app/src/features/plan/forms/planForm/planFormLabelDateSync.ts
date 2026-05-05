import {
  formatDateOnlyInTimeZone,
  formatIsoDateFriendly,
} from "@/shared/utils/formatIsoDate";

const MONTH_INDEX_BY_NAME: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const MONTH_PATTERN =
  "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";

const MONTH_DAY_RE = new RegExp(
  `\\b(${MONTH_PATTERN})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`,
  "i",
);
const DAY_MONTH_RE = new RegExp(
  `\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTH_PATTERN})\\b`,
  "i",
);

function resolveBaseYear(referenceIso?: string | null) {
  if (referenceIso) {
    const dateOnly = formatDateOnlyInTimeZone(referenceIso);
    if (dateOnly) {
      const year = Number.parseInt(dateOnly.slice(0, 4), 10);
      if (Number.isInteger(year)) {
        return year;
      }
    }
  }

  const today = formatDateOnlyInTimeZone(new Date());
  if (today) {
    const year = Number.parseInt(today.slice(0, 4), 10);
    if (Number.isInteger(year)) {
      return year;
    }
  }

  return new Date().getFullYear();
}

function buildIsoFromMonthDay(monthToken: string, dayToken: string, baseYear: number) {
  const monthIndex = MONTH_INDEX_BY_NAME[monthToken.toLowerCase()];
  const day = Number.parseInt(dayToken, 10);

  if (monthIndex == null || !Number.isInteger(day) || day < 1 || day > 31) {
    return null;
  }

  const parsed = new Date(baseYear, monthIndex, day);
  if (
    Number.isNaN(parsed.getTime())
    || parsed.getMonth() !== monthIndex
    || parsed.getDate() !== day
  ) {
    return null;
  }

  const month = String(monthIndex + 1).padStart(2, "0");
  const normalizedDay = String(day).padStart(2, "0");

  return `${baseYear}-${month}-${normalizedDay}`;
}

function detectLabelDateToken(label: string) {
  const monthDayMatch = label.match(MONTH_DAY_RE);
  if (monthDayMatch) {
    return {
      monthToken: monthDayMatch[1],
      dayToken: monthDayMatch[2],
      rawToken: monthDayMatch[0],
    };
  }

  const dayMonthMatch = label.match(DAY_MONTH_RE);
  if (dayMonthMatch) {
    return {
      monthToken: dayMonthMatch[2],
      dayToken: dayMonthMatch[1],
      rawToken: dayMonthMatch[0],
    };
  }

  return null;
}

export function inferPlanStartDateFromLabel(
  label: string,
  referenceIso?: string | null,
) {
  const token = detectLabelDateToken(label);
  if (!token) {
    return null;
  }

  return buildIsoFromMonthDay(
    token.monthToken,
    token.dayToken,
    resolveBaseYear(referenceIso),
  );
}

export function syncPlanLabelDateToken(
  label: string,
  nextStartDate: string,
) {
  const token = detectLabelDateToken(label);
  const nextFriendlyDate = formatIsoDateFriendly(nextStartDate);

  if (!token || !nextFriendlyDate) {
    return label;
  }

  return label.replace(token.rawToken, nextFriendlyDate);
}
