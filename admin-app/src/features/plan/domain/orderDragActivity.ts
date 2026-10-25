/** True while the in-flight drag carries orders or route stops. */
export const isOrderDragActive = (activeDrag: unknown): boolean => {
  if (!activeDrag || typeof activeDrag !== "object") return false;
  const dragType = String((activeDrag as { type?: unknown }).type ?? "");
  return (
    dragType === "order" ||
    dragType === "order_batch" ||
    dragType === "order_group" ||
    dragType === "route_stop" ||
    dragType === "route_stop_group"
  );
};
