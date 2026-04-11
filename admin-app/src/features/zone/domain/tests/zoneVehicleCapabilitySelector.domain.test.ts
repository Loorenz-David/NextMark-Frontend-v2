import {
  filterZoneVehicleCapabilitySelectorItems,
  getZoneVehicleCapabilitySelectorItems,
  parseZoneVehicleCapabilitySelection,
  serializeZoneVehicleCapabilitySelection,
} from "../zoneVehicleCapabilitySelector.domain";

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runZoneVehicleCapabilitySelectorDomainTests = () => {
  const parsed = parseZoneVehicleCapabilitySelection(
    "cold_chain, fragile, invalid, cold_chain",
  );

  assert(parsed.length === 2, "selector parsing should keep only valid unique capabilities");
  assert(parsed[0] === "cold_chain", "selector parsing should preserve valid order");
  assert(parsed[1] === "fragile", "selector parsing should preserve later valid values");

  const serialized = serializeZoneVehicleCapabilitySelection(parsed);
  assert(
    serialized === "cold_chain, fragile",
    "selector serialization should keep comma separated canonical values",
  );

  const filtered = filterZoneVehicleCapabilitySelectorItems(
    getZoneVehicleCapabilitySelectorItems(),
    "cold chain",
  );

  assert(filtered.length === 1, "selector filtering should match label terms");
  assert(filtered[0]?.id === "cold_chain", "selector filtering should return the matching capability");
};
