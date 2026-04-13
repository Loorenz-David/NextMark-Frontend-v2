import type { RouteGroup } from "../types/routeGroup";

export const resolveRouteGroupDisplayLabel = (
  routeGroup: RouteGroup | null | undefined,
  fallbackLabel = "Unknown route group",
) =>
  routeGroup?.zone_snapshot?.name?.trim() ||
  (typeof routeGroup?.zone_id === "number"
    ? `Zone ${routeGroup.zone_id}`
    : fallbackLabel);
