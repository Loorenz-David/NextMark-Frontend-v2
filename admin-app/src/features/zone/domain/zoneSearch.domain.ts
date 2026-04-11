import type { ZoneDefinition } from "@/features/zone/types";

import { filterZonesBySearch, type ZoneSelectorItem } from "./zoneSelector.domain";

export const ZONE_QUERY_SEARCHABLE_COLUMNS = [
  "name",
  "city_key",
  "zone_type",
] as const;

export type ZoneQuerySearchColumn =
  (typeof ZONE_QUERY_SEARCHABLE_COLUMNS)[number];

export type ZoneQueryExactFilters = {
  zone_type?: "bootstrap" | "system" | "user" | null;
  is_active?: boolean;
  city_key?: string;
};

export type ZoneSearchQuery = {
  q?: string;
  s?: string;
  zone_type?: "bootstrap" | "system" | "user";
  is_active?: boolean;
  city_key?: string;
  limit?: number;
  cursor?: string;
};

export type ZoneSearchResult<TZone extends ZoneSelectorItem = ZoneDefinition> = {
  zones: TZone[];
  source: "initial" | "remote" | "fallback";
};

type BuildZoneSearchQueryParams = {
  input: string;
  limit: number;
  selectedColumns?: ZoneQuerySearchColumn[];
  filters?: ZoneQueryExactFilters;
  cursor?: string;
};

export const buildZoneSearchQuery = ({
  input,
  limit,
  selectedColumns = [],
  filters = {},
  cursor,
}: BuildZoneSearchQueryParams): ZoneSearchQuery => {
  const trimmedInput = input.trim();
  const sanitizedColumns = selectedColumns.filter((column) =>
    ZONE_QUERY_SEARCHABLE_COLUMNS.includes(column),
  );

  return {
    ...(trimmedInput ? { q: trimmedInput } : {}),
    ...(sanitizedColumns.length > 0 ? { s: sanitizedColumns.join(",") } : {}),
    ...(filters.zone_type ? { zone_type: filters.zone_type } : {}),
    ...(typeof filters.is_active === "boolean"
      ? { is_active: filters.is_active }
      : {}),
    ...(filters.city_key?.trim() ? { city_key: filters.city_key.trim() } : {}),
    limit,
    ...(cursor ? { cursor } : {}),
  };
};

export const shouldRunZoneSearch = (input: string): boolean =>
  input.trim().length > 0;

const matchesExactFilters = (
  zone: ZoneSelectorItem,
  filters: ZoneQueryExactFilters,
): boolean => {
  if (filters.zone_type && zone.zone_type !== filters.zone_type) {
    return false;
  }

  if (
    typeof filters.is_active === "boolean" &&
    (zone.is_active ?? false) !== filters.is_active
  ) {
    return false;
  }

  if (filters.city_key?.trim()) {
    const zoneCityKey =
      "city_key" in zone && typeof zone.city_key === "string"
        ? zone.city_key
        : "";

    if (!zoneCityKey.toLowerCase().includes(filters.city_key.trim().toLowerCase())) {
      return false;
    }
  }

  return true;
};

const matchesSelectedColumns = (
  zone: ZoneSelectorItem,
  input: string,
  selectedColumns: ZoneQuerySearchColumn[],
): boolean => {
  const trimmedInput = input.trim().toLowerCase();
  if (!trimmedInput) {
    return true;
  }

  if (selectedColumns.length === 0) {
    return filterZonesBySearch([zone], input).length > 0;
  }

  return selectedColumns.some((column) => {
    const value = zone[column];
    if (typeof value !== "string") {
      return false;
    }

    return value.toLowerCase().includes(trimmedInput);
  });
};

export const buildFallbackZoneSearchResult = <TZone extends ZoneSelectorItem>(
  zones: TZone[],
  input: string,
  limit: number,
  selectedColumns: ZoneQuerySearchColumn[] = [],
  filters: ZoneQueryExactFilters = {},
): ZoneSearchResult<TZone> => ({
  zones: zones
    .filter((zone) => matchesExactFilters(zone, filters))
    .filter((zone) => matchesSelectedColumns(zone, input, selectedColumns))
    .slice(0, Math.max(limit, 0)),
  source:
    input.trim().length > 0 ||
    Boolean(filters.zone_type) ||
    typeof filters.is_active === "boolean" ||
    Boolean(filters.city_key?.trim())
      ? "fallback"
      : "initial",
});
