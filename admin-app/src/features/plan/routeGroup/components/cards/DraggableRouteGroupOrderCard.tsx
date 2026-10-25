import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import type { Order } from '@/features/order/types/order'
import type { RouteSolutionStop } from '@/features/plan/routeGroup/types/routeSolutionStop'

import { formatRouteTimelineTime } from '@/features/plan/routeGroup/utils/formatRouteTime'

import { RouteTimelineRow } from '../timeline'
import { RouteGroupOrderCard } from './RouteGroupOrderCard'

type DraggableRouteGroupOrderCardProps = {
  order: Order
  stop: RouteSolutionStop
  planStartDate?: string | null
  routeGroupId?: number | null
  allOrderedStopClientIds: string[]
}


export const DraggableRouteGroupOrderCard = ({
  order,
  stop,
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

  // The DragOverlay tracks the pointer. The active row takes the strategy's
  // transform, which carries it to the slot it will drop into; its card hides
  // on the same frame (see RouteTimelineRow) while its timeline slice stays,
  // so the line has no gap and the stop's time moves with it.
  const style = {
    transform: CSS.Transform.toString(transform),
    // Transition only while a sort is in flight: it animates the gap opening
    // under the drag. At drop it would animate the sibling transforms resetting
    // to zero while the store reorder has already moved the DOM — rows gliding
    // to positions they no longer own. Instant reset instead.
    transition: isSorting ? transition : undefined,
    cursor: 'grab',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="dnd-touch-source"
      data-route-timeline-source
      {...attributes}
      {...listeners}
    >
      <RouteTimelineRow
        time={formatRouteTimelineTime(stop.expected_arrival_time, planStartDate)}
        contentHidden={isDragging}
      >
        <RouteGroupOrderCard
          order={order}
          planStartDate={planStartDate}
          routeGroupId={routeGroupId}
        />
      </RouteTimelineRow>
    </div>
  )
}
