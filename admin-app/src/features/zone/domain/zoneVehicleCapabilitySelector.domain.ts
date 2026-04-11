import type { ObjectLinkSelectorItem } from "@/shared/inputs/ObjectLinkSelector";

import {
  zoneVehicleCapabilityOptions,
  zoneVehicleCapabilityValueSet,
  type ZoneVehicleCapability,
} from "./zoneEnums";

const normalizeSearchValue = (value: string) => value.trim().toLowerCase();

const splitSearchTerms = (value: string) =>
  value
    .split(/\s+/)
    .map(normalizeSearchValue)
    .filter(Boolean);

export const parseZoneVehicleCapabilitySelection = (
  value: string,
): ZoneVehicleCapability[] => {
  const parsed = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(
      (entry): entry is ZoneVehicleCapability =>
        zoneVehicleCapabilityValueSet.has(entry as ZoneVehicleCapability),
    );

  return Array.from(new Set(parsed));
};

export const serializeZoneVehicleCapabilitySelection = (
  capabilities: readonly ZoneVehicleCapability[],
): string => capabilities.join(", ");

export const getZoneVehicleCapabilitySelectorItems = (): ObjectLinkSelectorItem[] =>
  zoneVehicleCapabilityOptions.map((option) => ({
    id: option.value,
    label: option.label,
    details: option.value,
  }));

export const filterZoneVehicleCapabilitySelectorItems = (
  items: readonly ObjectLinkSelectorItem[],
  searchValue: string,
): ObjectLinkSelectorItem[] => {
  const terms = splitSearchTerms(searchValue);

  if (terms.length === 0) {
    return [...items];
  }

  return items.filter((item) => {
    const searchableValue = [item.label, item.details ?? ""].join(" ").toLowerCase();
    return terms.every((term) => searchableValue.includes(term));
  });
};
