import type { ActiveDrag } from "@/features/plan/hooks/usePlanOrderDndController";
import { useViewport } from "@/app/viewport";
import { OrderDragOverlayCard } from "@/features/order";
import { OrderBatchDragOverlayCard } from "@/features/order/components/cards/OrderBatchDragOverlayCard";
import { OrderGroupDragOverlayCard } from "@/features/order/components/cards/OrderGroupDragOverlayCard";
import { RouteStopDragOverlay } from "@/features/plan/routeGroup/components/overlays/RouteStopDragOverlay";
import { RouteStopGroupDragOverlay } from "@/features/plan/routeGroup/components/overlays/RouteStopGroupDragOverlay";

type RouteOperationsDragOverlayProps = {
  activeDrag: ActiveDrag;
};

export const RouteOperationsDragOverlay = ({
  activeDrag,
}: RouteOperationsDragOverlayProps) => {
  const { isCoarsePointer } = useViewport();
  const previewClassName = `pointer-events-none cursor-grabbing ${isCoarsePointer ? "-translate-x-6 -translate-y-12" : ""}`;
  if (!activeDrag) {
    return null;
  }

  if (activeDrag.type === "route_stop") {
    return (
      <div className={`${previewClassName} w-fit`}>
        <RouteStopDragOverlay
          routeStopClientId={activeDrag.routeStopClientId}
          order={activeDrag.order}
          stop={activeDrag.stop}
          planStartDate={activeDrag.planStartDate}
        />
      </div>
    );
  }

  if (activeDrag.type === "route_stop_group") {
    return (
      <div className={previewClassName}>
        <RouteStopGroupDragOverlay
          count={activeDrag.count}
          label={activeDrag.label}
          firstStopOrder={activeDrag.firstStopOrder}
          lastStopOrder={activeDrag.lastStopOrder}
        />
      </div>
    );
  }

  if (activeDrag.type === "order") {
    return (
      <div className={`${previewClassName} w-fit`}>
        <OrderDragOverlayCard order={activeDrag.order} />
      </div>
    );
  }

  if (activeDrag.type === "order_batch") {
    return (
      <div className={previewClassName}>
        <OrderBatchDragOverlayCard
          selectedCount={activeDrag.selectedCount}
          isLoading={activeDrag.isLoading}
        />
      </div>
    );
  }

  if (activeDrag.type === "order_group") {
    return (
      <div className={previewClassName}>
        <OrderGroupDragOverlayCard
          count={activeDrag.count}
          label={activeDrag.label}
        />
      </div>
    );
  }

  return null;
};
