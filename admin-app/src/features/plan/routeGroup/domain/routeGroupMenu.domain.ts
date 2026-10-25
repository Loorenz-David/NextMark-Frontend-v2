/** A route group goes out for delivery from the "Open" state, with orders in it. */
export const canMarkRouteGroupReadyForDelivery = ({
  stateName,
  orderCount,
}: {
  stateName: string | null | undefined;
  orderCount: number;
}): boolean => (stateName ?? "").trim().toLowerCase() === "open" && orderCount > 0;

/** The route needs optimizing: it has stops and is not optimized, or it carries warnings. */
export const shouldHighlightRouteOptimization = ({
  orderCount,
  isOptimized,
  hasRouteWarnings,
}: {
  orderCount: number;
  isOptimized: string | null | undefined;
  hasRouteWarnings: boolean | null | undefined;
}): boolean =>
  orderCount > 0 && (isOptimized === "not optimize" || Boolean(hasRouteWarnings));
