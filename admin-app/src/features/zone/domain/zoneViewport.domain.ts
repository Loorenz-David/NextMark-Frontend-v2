import type { ZoneBBox } from "@/features/zone/types";
import type { MapBounds } from "@/shared/map/domain/types";

export const doesZoneBBoxIntersectViewport = (
  bbox: ZoneBBox,
  viewport: MapBounds | null,
) => {
  if (!viewport) {
    return true;
  }

  return !(
    bbox.west > viewport.east ||
    bbox.east < viewport.west ||
    bbox.south > viewport.north ||
    bbox.north < viewport.south
  );
};
