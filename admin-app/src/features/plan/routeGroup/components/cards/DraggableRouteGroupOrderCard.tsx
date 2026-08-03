import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import type { Order } from '@/features/order/types/order'
import type { RouteSolutionStop } from '@/features/plan/routeGroup/types/routeSolutionStop'

import { RouteGroupOrderCard } from './RouteGroupOrderCard'

type DraggableRouteGroupOrderCardProps = {
  order: Order
  stop: RouteSolutionStop
  displayStopOrder?: number | null
  planStartDate?: string | null
  routeGroupId?: number | null
  allOrderedStopClientIds: string[]
}


export const DraggableRouteGroupOrderCard = ({
  order,
  stop,
  displayStopOrder,
  planStartDate,
  routeGroupId,
  allOrderedStopClientIds,
}: DraggableRouteGroupOrderCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
  } = useSortable({
    id: stop.client_id,
    // The drop commits the new order to the store instantly; animating rows
    // from their old rects on top of that reads as a jump, not a settle.
    animateLayoutChanges: () => false,
    data: {
      type: 'route_stop',
      id:stop.client_id,
      order,
      stop,
      planStartDate,
      routeStopId: stop.id,
      routeStopClientId: stop.client_id,
      routeSolutionId: stop.route_solution_id,
      allOrderedStopClientIds,
    },
  })

  // The DragOverlay tracks the pointer. Sibling rows keep their transform so
  // the list reflows around the drag; the active row hides in place — its card
  // body transitions the inherited `visibility` flip, so applying the pointer
  // transform here would paint a full-size mirror for the transition's duration.
  const style = {
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
    // Transition only while a sort is in flight: it animates the gap opening
    // under the drag. At drop it would animate the sibling transforms resetting
    // to zero while the store reorder has already moved the DOM — rows gliding
    // to positions they no longer own. Instant reset instead.
    transition: isSorting ? transition : undefined,
    // Wrapper `opacity` hides on the same frame; `visibility` alone would be
    // animated by the card body's `transition-all` (see DraggableOrderCard).
    opacity: isDragging ? 0 : 1,
    visibility: isDragging ? 'hidden' as const : 'visible' as const,
    pointerEvents: isDragging ? ('none' as const) : undefined,
    cursor: 'grab',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <RouteGroupOrderCard
        order={order}
        stop={stop}
        displayStopOrder={displayStopOrder}
        planStartDate={planStartDate}
        routeGroupId={routeGroupId}
      />
    </div>
  )
}
