import {
  LOCAL_DELIVERY_DEFAULT_END_TIME,
  LOCAL_DELIVERY_DEFAULT_ROUTE_END_STRATEGY,
  LOCAL_DELIVERY_DEFAULT_START_TIME,
  PLAN_DEFAULT_DRIVER_ID_KEY,
  PLAN_DEFAULT_ETA_MESSAGE_TOLERANCE_KEY,
  PLAN_DEFAULT_ETA_TOLERANCE_SECONDS_KEY,
  PLAN_DEFAULT_END_LOCATION_KEY,
  PLAN_DEFAULT_ROUTE_END_STRATEGY_KEY,
  PLAN_DEFAULT_SET_END_TIME_KEY,
  PLAN_DEFAULT_SET_START_TIME_KEY,
  PLAN_DEFAULT_START_LOCATION_KEY,
  PLAN_DEFAULT_STOPS_SERVICE_TIME_KEY,
  PLAN_DEFAULT_VEHICLE_ID_KEY,
} from "@/features/plan/constants/planTypeDefaults.constants";
import { sessionStorage } from "@/features/auth/login/store/sessionStorage";
import { loadRouteGroupEditFormPreferences } from "@/features/plan/routeGroup/forms/routeGroupEditForm/routeGroupEditForm.storage";
import type { PlanTypeDefaults } from "@/features/plan/types/plan";
import type { PlanTypeDefaultsContext } from "@/features/plan/domain/planTypeDefaults/planTypeDefaults.types";
import { serviceTimeMinutesToSeconds } from "@/features/plan/routeGroup/domain/serviceTimeUnits";
import { getTeamTimeZone } from "@/shared/utils/teamTimeZone";
import { formatDateOnlyInTimeZone } from "@/shared/utils/formatIsoDate";

export const buildRouteGroupPlanTypeDefaults = async (
  ctx: PlanTypeDefaultsContext,
): Promise<PlanTypeDefaults> => {
  const stored = loadRouteGroupEditFormPreferences();
  const resolvedStartTime = resolveDefaultStartTime(
    ctx.planStartDate,
    stored.set_start_time,
  );
  let startLocation = stored.start_location ?? null;

  if (!startLocation) {
    startLocation = await ctx.getCurrentLocationAddress().catch(() => null);
  }

  const resolvedStrategy = !startLocation
    ? "round_trip"
    : (stored.route_end_strategy ?? LOCAL_DELIVERY_DEFAULT_ROUTE_END_STRATEGY);

  const endLocation =
    resolvedStrategy !== "round_trip"
      ? (stored.end_location ?? startLocation)
      : null;

  return {
    route_group_defaults: {
      route_solution: {
        [PLAN_DEFAULT_SET_START_TIME_KEY]: resolvedStartTime,
        [PLAN_DEFAULT_SET_END_TIME_KEY]:
          stored.set_end_time ?? LOCAL_DELIVERY_DEFAULT_END_TIME,
        [PLAN_DEFAULT_ETA_TOLERANCE_SECONDS_KEY]:
          (stored.eta_tolerance_minutes ?? 0) * 60,
        [PLAN_DEFAULT_ETA_MESSAGE_TOLERANCE_KEY]:
          (stored.eta_message_tolerance_minutes ?? 0) * 60,
        [PLAN_DEFAULT_ROUTE_END_STRATEGY_KEY]: resolvedStrategy,
        [PLAN_DEFAULT_START_LOCATION_KEY]: startLocation,
        [PLAN_DEFAULT_END_LOCATION_KEY]: endLocation,
        [PLAN_DEFAULT_DRIVER_ID_KEY]:
          stored.driver_id ?? resolveCurrentUserId(),
        [PLAN_DEFAULT_VEHICLE_ID_KEY]: stored.vehicle_id ?? null,
        [PLAN_DEFAULT_STOPS_SERVICE_TIME_KEY]: serviceTimeMinutesToSeconds(
          stored.stops_service_time,
        ),
      },
    },
  };
};

const resolveDefaultStartTime = (
  planStartDate: string | Date | null | undefined,
  storedStartTime: string | null,
) => {
  if (
    isPlanStartToday(planStartDate) &&
    (!storedStartTime || isTimeInPastForTeamToday(storedStartTime))
  ) {
    return getTeamNowPlusFiveMinutes();
  }
  return storedStartTime ?? LOCAL_DELIVERY_DEFAULT_START_TIME;
};

const isPlanStartToday = (planStartDate: string | Date | null | undefined) => {
  if (!planStartDate) {
    return false;
  }

  const parsed =
    planStartDate instanceof Date ? planStartDate : new Date(planStartDate);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const timeZone = getTeamTimeZone();
  return (
    formatDateOnlyInTimeZone(parsed, timeZone) ===
    formatDateOnlyInTimeZone(new Date(), timeZone)
  );
};

const getTeamNowPlusFiveMinutes = () => {
  const timeZone = getTeamTimeZone();
  const futureTime = new Date(Date.now() + 5 * 60_000);
  return formatTimeInTimeZone(futureTime, timeZone);
};

const isTimeInPastForTeamToday = (value: string) => {
  const parsed = parseHHmm(value);
  if (!parsed) {
    return true;
  }

  const timeZone = getTeamTimeZone();
  const now = new Date();
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return true;
  }

  return parsed.hours * 60 + parsed.minutes < hour * 60 + minute;
};

const parseHHmm = (value: string) => {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return { hours, minutes };
};

const resolveCurrentUserId = (): number | null => {
  const id = sessionStorage.getSession()?.user?.id;

  if (typeof id === "number" && Number.isFinite(id) && id > 0) {
    return id;
  }

  if (typeof id === "string") {
    const parsed = Number(id);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  return null;
};

const formatTimeInTimeZone = (value: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(value);

  const hour = parts.find((part) => part.type === "hour")?.value;
  const minute = parts.find((part) => part.type === "minute")?.value;

  if (!hour || !minute) {
    return LOCAL_DELIVERY_DEFAULT_START_TIME;
  }

  return `${hour}:${minute}`;
};
