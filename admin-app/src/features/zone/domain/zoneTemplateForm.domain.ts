import {
  zoneRouteEndStrategyValueSet,
  zoneVehicleCapabilityOptions,
  zoneVehicleCapabilityValueSet,
  type ZoneRouteEndStrategy,
  type ZoneVehicleCapability,
} from "./zoneEnums";
import type { ZoneTemplate, ZoneTemplateConfig } from "@/features/zone/types";

export type ZoneTemplateUpsertPayload = {
  name: string;
} & ZoneTemplateConfig;

export const ALLOWED_ZONE_TEMPLATE_CAPABILITIES = [
  ...zoneVehicleCapabilityOptions.map((option) => option.value),
] as const satisfies ReadonlyArray<ZoneVehicleCapability>;

export const ALLOWED_ZONE_ROUTE_END_STRATEGIES = [
  "round_trip",
  "custom_end_address",
  "end_at_last_stop",
  "last_stop",
] as const satisfies ReadonlyArray<ZoneRouteEndStrategy>;

export type ZoneTemplateValidationResult = {
  valid: boolean;
  issues: string[];
};

export type ZoneTemplateFormFields = {
  template_name: string;
  default_facility_id: string;
  max_orders_per_route: string;
  max_vehicles: string;
  operating_window_start: string;
  operating_window_end: string;
  eta_tolerance_seconds: string;
  vehicle_capabilities_required: string;
  preferred_vehicle_ids: string;
  default_route_end_strategy: string;
};

const parseOptionalNumber = (value: string): number | null => {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseCapabilityList = (value: string): ZoneVehicleCapability[] | null => {
  const parsed = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(
      (entry): entry is ZoneVehicleCapability =>
        zoneVehicleCapabilityValueSet.has(entry as ZoneVehicleCapability),
    );

  return parsed.length > 0 ? parsed : null;
};

const parseNumberList = (value: string): number[] | null => {
  const parsed = value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => Number(entry))
    .filter((entry) => Number.isFinite(entry));

  return parsed.length > 0 ? parsed : null;
};

const normalizeRouteEndStrategy = (
  value: string,
): ZoneTemplateConfig["default_route_end_strategy"] => {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (normalized === "last_stop") {
    return "end_at_last_stop";
  }

  if (
    normalized === "round_trip" ||
    normalized === "custom_end_address" ||
    normalized === "end_at_last_stop"
  ) {
    return normalized;
  }

  return null;
};

export const getInitialZoneTemplateFormFields = (
  template: ZoneTemplate | null | undefined,
): ZoneTemplateFormFields => ({
  template_name: template?.name ?? "",
  default_facility_id:
    template?.default_facility_id != null ? String(template.default_facility_id) : "",
  max_orders_per_route:
    template?.max_orders_per_route != null ? String(template.max_orders_per_route) : "",
  max_vehicles:
    template?.max_vehicles != null ? String(template.max_vehicles) : "",
  operating_window_start: template?.operating_window_start ?? "",
  operating_window_end: template?.operating_window_end ?? "",
  eta_tolerance_seconds:
    template?.eta_tolerance_seconds != null ? String(template.eta_tolerance_seconds) : "0",
  vehicle_capabilities_required:
    template?.vehicle_capabilities_required?.join(", ") ?? "",
  preferred_vehicle_ids:
    template?.preferred_vehicle_ids?.join(", ") ?? "",
  default_route_end_strategy: template?.default_route_end_strategy ?? "",
});

export const buildZoneTemplatePayload = (
  fields: ZoneTemplateFormFields,
): ZoneTemplateUpsertPayload | null => {
  const name = fields.template_name.trim();

  const payload: ZoneTemplateConfig = {
    default_facility_id: parseOptionalNumber(fields.default_facility_id),
    max_orders_per_route: parseOptionalNumber(fields.max_orders_per_route),
    max_vehicles: parseOptionalNumber(fields.max_vehicles),
    operating_window_start: fields.operating_window_start.trim() || null,
    operating_window_end: fields.operating_window_end.trim() || null,
    eta_tolerance_seconds: parseOptionalNumber(fields.eta_tolerance_seconds),
    vehicle_capabilities_required: parseCapabilityList(
      fields.vehicle_capabilities_required,
    ),
    preferred_vehicle_ids: parseNumberList(fields.preferred_vehicle_ids),
    default_route_end_strategy: normalizeRouteEndStrategy(
      fields.default_route_end_strategy,
    ),
    meta: null,
  };

  const hasAnyValue = Object.values(payload).some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value != null && value !== "";
  });

  if (!name && !hasAnyValue) {
    return null;
  }

  if (!name) {
    return null;
  }

  return {
    name,
    ...payload,
    meta: payload.meta ?? null,
  };
};

export const hasZoneTemplateValue = (template: ZoneTemplate | null | undefined): boolean =>
  Boolean(
    template?.name ||
      template?.default_facility_id != null ||
      template?.max_orders_per_route != null ||
      template?.max_vehicles != null ||
      template?.operating_window_start ||
      template?.operating_window_end ||
      template?.eta_tolerance_seconds != null ||
      (template?.vehicle_capabilities_required?.length ?? 0) > 0 ||
      (template?.preferred_vehicle_ids?.length ?? 0) > 0 ||
      template?.default_route_end_strategy,
  );

export const validateZoneTemplatePayload = (
  payload: ZoneTemplateUpsertPayload | null,
): ZoneTemplateValidationResult => {
  if (!payload) {
    return { valid: true, issues: [] };
  }

  const issues: string[] = [];

  if (!payload.name.trim()) {
    issues.push("Template name is required.");
  }

  if (payload.name.trim().length > 255) {
    issues.push("Template name must be 255 characters or fewer.");
  }

  if (
    payload.max_orders_per_route != null &&
    payload.max_orders_per_route < 1
  ) {
    issues.push("Max orders per route must be at least 1.");
  }

  if (payload.max_vehicles != null && payload.max_vehicles < 1) {
    issues.push("Max vehicles must be at least 1.");
  }

  if (
    payload.eta_tolerance_seconds != null &&
    (payload.eta_tolerance_seconds < 0 || payload.eta_tolerance_seconds > 7200)
  ) {
    issues.push("ETA tolerance must be between 0 and 7200 seconds.");
  }

  if (
    payload.default_route_end_strategy != null &&
    !zoneRouteEndStrategyValueSet.has(payload.default_route_end_strategy)
  ) {
    issues.push("Route end strategy is invalid.");
  }

  const invalidCapabilities = (payload.vehicle_capabilities_required ?? []).filter(
    (capability) =>
      !ALLOWED_ZONE_TEMPLATE_CAPABILITIES.includes(capability),
  );

  if (invalidCapabilities.length > 0) {
    issues.push(
      `Invalid vehicle capabilities: ${invalidCapabilities.join(", ")}.`,
    );
  }

  const invalidVehicleIds = (payload.preferred_vehicle_ids ?? []).filter(
    (vehicleId) => !Number.isInteger(vehicleId) || vehicleId < 1,
  );

  if (invalidVehicleIds.length > 0) {
    issues.push("Preferred vehicle ids must be positive integers.");
  }

  const start = payload.operating_window_start?.trim() ?? "";
  const end = payload.operating_window_end?.trim() ?? "";
  if ((start && !end) || (!start && end)) {
    issues.push("Operating window start and end must both be provided.");
  }

  if (start && end && end <= start) {
    issues.push("Operating window end must be after operating window start.");
  }

  return {
    valid: issues.length === 0,
    issues,
  };
};
