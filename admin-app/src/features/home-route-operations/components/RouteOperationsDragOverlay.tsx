import type { ActiveDrag } from '@/features/plan/hooks/usePlanOrderDndController'
import { OrderCard } from '@/features/order/components/cards/OrderCard'
import { OrderBatchDragOverlayCard } from '@/features/order/components/cards/OrderBatchDragOverlayCard'
import { OrderGroupDragOverlayCard } from '@/features/order/components/cards/OrderGroupDragOverlayCard'
import { RouteStopDragOverlay } from '@/features/plan/routeGroup/components/overlays/RouteStopDragOverlay'
import { RouteStopGroupDragOverlay } from '@/features/plan/routeGroup/components/overlays/RouteStopGroupDragOverlay'

type RouteOperationsDragOverlayProps = {
  activeDrag: ActiveDrag
}

export const RouteOperationsDragOverlay = ({ activeDrag }: RouteOperationsDragOverlayProps) => {
  if (!activeDrag) {
    return null
  }

  if (activeDrag.type === 'route_stop') {
    return (
      <div className="pointer-events-none cursor-grabbing">
        <RouteStopDragOverlay
          routeStopClientId={activeDrag.routeStopClientId}
          order={activeDrag.order}
          stop={activeDrag.stop}
          planStartDate={activeDrag.planStartDate}
        />
      </div>
    )
  }

  if (activeDrag.type === 'route_stop_group') {
    return (
      <div className="pointer-events-none cursor-grabbing">
        <RouteStopGroupDragOverlay
          count={activeDrag.count}
          label={activeDrag.label}
          firstStopOrder={activeDrag.firstStopOrder}
          lastStopOrder={activeDrag.lastStopOrder}
        />
      </div>
    )
  }

  if (activeDrag.type === 'order') {
    return (
      <div className="pointer-events-none cursor-grabbing">
        <OrderCard order={activeDrag.order} />
      </div>
    )
  }

  if (activeDrag.type === 'order_batch') {
    return (
      <div className="pointer-events-none cursor-grabbing">
        <OrderBatchDragOverlayCard
          selectedCount={activeDrag.selectedCount}
          isLoading={activeDrag.isLoading}
        />
      </div>
    )
  }

  if (activeDrag.type === 'order_group') {
    return (
      <div className="pointer-events-none cursor-grabbing">
        <OrderGroupDragOverlayCard
          count={activeDrag.count}
          label={activeDrag.label}
        />
      </div>
    )
  }

  return null
}
