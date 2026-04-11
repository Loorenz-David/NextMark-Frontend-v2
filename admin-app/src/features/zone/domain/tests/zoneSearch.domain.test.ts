import {
  buildFallbackZoneSearchResult,
  buildZoneSearchQuery,
} from "../zoneSearch.domain";

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runZoneSearchDomainTests = () => {
  const query = buildZoneSearchQuery({
    input: " chicago ",
    limit: 8,
    selectedColumns: ["name", "city_key"],
    filters: {
      zone_type: "user",
      is_active: true,
    },
  });

  assert(query.q === "chicago", "zone query should trim q");
  assert(query.s === "name,city_key", "zone query should serialize selected columns");
  assert(query.zone_type === "user", "zone query should keep exact zone type filter");
  assert(query.is_active === true, "zone query should keep is_active filter");

  const fallback = buildFallbackZoneSearchResult(
    [
      {
        id: 1,
        version_id: 5,
        city_key: "chicago",
        name: "East Chicago",
        zone_type: "user",
        is_active: true,
        centroid: null,
        bbox: { north: 1, south: 0, east: 1, west: 0 },
        geometry_resolution: "none",
      },
      {
        id: 2,
        version_id: 5,
        city_key: "miami",
        name: "South Beach",
        zone_type: "system",
        is_active: true,
        centroid: null,
        bbox: { north: 1, south: 0, east: 1, west: 0 },
        geometry_resolution: "none",
      },
    ],
    "chicago",
    10,
    ["city_key"],
    { zone_type: "user", is_active: true },
  );

  assert(fallback.zones.length === 1, "fallback search should honor q and exact filters");
  assert(fallback.zones[0]?.id === 1, "fallback search should keep only matching zone");
};
