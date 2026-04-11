import {
  buildZoneTemplatePayload,
  validateZoneTemplatePayload,
} from "../zoneTemplateForm.domain";
import type { ZoneVehicleCapability } from "../../types";

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runZoneTemplateFormDomainTests = () => {
  const payload = buildZoneTemplatePayload({
    template_name: "Chelsea Standard",
    default_facility_id: "5",
    max_orders_per_route: "15",
    max_vehicles: "3",
    operating_window_start: "08:00",
    operating_window_end: "18:00",
    eta_tolerance_seconds: "300",
    vehicle_capabilities_required: "cold_chain, fragile",
    preferred_vehicle_ids: "10, 11",
    default_route_end_strategy: "last_stop",
  });

  assert(payload, "payload should be created when values are present");
  assert(payload?.default_route_end_strategy === "end_at_last_stop", "last_stop should normalize");
  assert(payload?.preferred_vehicle_ids?.length === 2, "preferred vehicle ids should parse");

  const emptyVehiclePayload = buildZoneTemplatePayload({
    template_name: "No Preferred Vehicles",
    default_facility_id: "",
    max_orders_per_route: "",
    max_vehicles: "",
    operating_window_start: "",
    operating_window_end: "",
    eta_tolerance_seconds: "",
    vehicle_capabilities_required: "",
    preferred_vehicle_ids: "",
    default_route_end_strategy: "",
  });
  assert(emptyVehiclePayload, "payload should still be created with template name only");
  assert(
    emptyVehiclePayload?.preferred_vehicle_ids == null,
    "preferred vehicle ids should normalize to null when empty",
  );

  const invalidTimeWindow = validateZoneTemplatePayload({
    name: "Invalid",
    operating_window_start: "18:00",
    operating_window_end: "08:00",
  });
  assert(!invalidTimeWindow.valid, "end time before start should be invalid");

  const invalidCapability = validateZoneTemplatePayload({
    name: "Invalid",
    vehicle_capabilities_required: ["unknown_capability" as ZoneVehicleCapability],
  });
  assert(!invalidCapability.valid, "unknown capability should be invalid");
};
